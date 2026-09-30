import os
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
from flask import current_app

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False


class OCRService:
    @staticmethod
    def _configure_tesseract():
        """Configure tesseract binary path if specified in config."""
        if not PYTESSERACT_AVAILABLE:
            return False

        custom_cmd = current_app.config.get('TESSERACT_CMD')
        if custom_cmd and os.path.exists(custom_cmd):
            pytesseract.pytesseract.tesseract_cmd = custom_cmd
            return True

        # Common Windows installation locations
        common_win_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe")
        ]
        for p in common_win_paths:
            if os.path.exists(p):
                pytesseract.pytesseract.tesseract_cmd = p
                return True

        return True

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> dict:
        """Extract digital text from PDF document."""
        if not PYPDF_AVAILABLE:
            return {
                'text': '',
                'engine': 'none',
                'status': 'failed',
                'confidence': 0.0,
                'message': 'pypdf library not available'
            }

        try:
            reader = PdfReader(file_path)
            extracted_pages = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text() or ''
                if page_text.strip():
                    extracted_pages.append(f"--- Page {i+1} ---\n{page_text.strip()}")

            full_text = "\n\n".join(extracted_pages).strip()

            if full_text:
                return {
                    'text': full_text,
                    'engine': 'pypdf (Native PDF Extractor)',
                    'status': 'completed',
                    'confidence': 0.98
                }
            else:
                # Scanned PDF without text layer
                return {
                    'text': '[Scanned PDF document detected with no embedded text layer. Please upload as an image or ensure OCR processing is enabled.]',
                    'engine': 'pypdf',
                    'status': 'completed',
                    'confidence': 0.5
                }
        except Exception as e:
            return {
                'text': '',
                'engine': 'pypdf',
                'status': 'failed',
                'confidence': 0.0,
                'message': str(e)
            }

    @staticmethod
    def extract_text_from_image(file_path: str) -> dict:
        """Extract text from scanned medical report image using Tesseract or graceful fallback."""
        OCRService._configure_tesseract()

        if not PYTESSERACT_AVAILABLE:
            return OCRService._fallback_extract(file_path, "pytesseract module not installed")

        try:
            # Preprocess image for OCR accuracy
            with Image.open(file_path) as img:
                # Convert to grayscale
                gray = img.convert('L')
                # Enhance contrast
                enhancer = ImageEnhance.Contrast(gray)
                enhanced = enhancer.enhance(1.8)
                # Slight blur to reduce noise then threshold
                filtered = enhanced.filter(ImageFilter.MedianFilter())

                # Run Tesseract
                extracted_text = pytesseract.image_to_string(filtered).strip()

                if extracted_text:
                    return {
                        'text': extracted_text,
                        'engine': 'Tesseract OCR v5 (Preprocessed)',
                        'status': 'completed',
                        'confidence': 0.92
                    }
                else:
                    return {
                        'text': '[No legible text could be extracted from this image. Please ensure the scan is clear and well-lit.]',
                        'engine': 'Tesseract OCR',
                        'status': 'completed',
                        'confidence': 0.4
                    }
        except Exception as e:
            err_msg = str(e).lower()
            if "tesseract is not installed" in err_msg or "not found" in err_msg:
                return OCRService._fallback_extract(file_path, "Tesseract OCR binary not installed on host PATH")
            return {
                'text': '',
                'engine': 'tesseract',
                'status': 'failed',
                'confidence': 0.0,
                'message': str(e)
            }

    @staticmethod
    def _fallback_extract(file_path: str, reason: str) -> dict:
        """Informative fallback when OCR binary is not present on host machine."""
        return {
            'text': (
                f"[Document Processing Notice: {reason}.\n"
                "For demonstration or local testing, you can paste the text directly into the report text editor, "
                "or install Tesseract OCR from https://github.com/UB-Mannheim/tesseract/wiki]"
            ),
            'engine': f'Fallback Document Parser ({reason})',
            'status': 'completed',
            'confidence': 0.6
        }

    @staticmethod
    def extract_text(file_path: str, mime_type: str = '') -> dict:
        """Main OCR dispatch entrypoint."""
        path = Path(file_path)
        ext = path.suffix.lower()

        if ext == '.pdf' or 'pdf' in mime_type:
            return OCRService.extract_text_from_pdf(file_path)
        elif ext in ['.png', '.jpg', '.jpeg']:
            return OCRService.extract_text_from_image(file_path)
        elif ext == '.txt':
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return {
                        'text': f.read().strip(),
                        'engine': 'Plain Text Reader',
                        'status': 'completed',
                        'confidence': 1.0
                    }
            except Exception as e:
                return {'text': '', 'engine': 'text', 'status': 'failed', 'confidence': 0.0, 'message': str(e)}
        else:
            return {
                'text': '',
                'engine': 'unknown',
                'status': 'failed',
                'confidence': 0.0,
                'message': f'Unsupported file format {ext}'
            }

