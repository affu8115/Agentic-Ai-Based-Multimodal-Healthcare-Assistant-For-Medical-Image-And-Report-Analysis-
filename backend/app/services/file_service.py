import os
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename
from flask import current_app


class FileService:
    @staticmethod
    def get_upload_dir(user_id: int) -> Path:
        """Get or create user-specific upload directory."""
        base_dir = Path(current_app.config['UPLOAD_FOLDER'])
        user_dir = base_dir / str(user_id)
        user_dir.mkdir(parents=True, exist_ok=True)
        return user_dir

    @staticmethod
    def is_allowed_file(filename: str, file_type: str) -> bool:
        """Check if file has an allowed extension for its type."""
        if not filename or '.' not in filename:
            return False
        ext = filename.rsplit('.', 1)[1].lower()
        if file_type == 'report':
            return ext in current_app.config['ALLOWED_REPORT_EXTENSIONS']
        elif file_type == 'image':
            return ext in current_app.config['ALLOWED_IMAGE_EXTENSIONS']
        return False

    @staticmethod
    def save_uploaded_file(file, user_id: int, file_type: str) -> dict:
        """Validate and securely save an uploaded file."""
        if not file or file.filename == '':
            raise ValueError("No file provided for upload.")

        original_name = file.filename
        if not FileService.is_allowed_file(original_name, file_type):
            allowed = (current_app.config['ALLOWED_REPORT_EXTENSIONS'] 
                       if file_type == 'report' 
                       else current_app.config['ALLOWED_IMAGE_EXTENSIONS'])
            raise ValueError(f"Invalid file format for {file_type}. Allowed extensions: {', '.join(sorted(allowed))}")

        # Sanitize and create unique filename
        safe_name = secure_filename(original_name)
        ext = safe_name.rsplit('.', 1)[1].lower() if '.' in safe_name else 'bin'
        unique_name = f"{uuid.uuid4().hex[:12]}_{safe_name}"

        user_dir = FileService.get_upload_dir(user_id)
        destination_path = user_dir / unique_name

        # Save to disk
        file.save(str(destination_path))
        file_size = os.path.getsize(destination_path)

        # Mime type
        mime_type = file.content_type or 'application/octet-stream'

        return {
            'filename': unique_name,
            'original_name': original_name,
            'file_path': str(destination_path),
            'file_size': file_size,
            'mime_type': mime_type
        }

    @staticmethod
    def delete_file(file_path: str) -> bool:
        """Safely delete file from disk."""
        try:
            p = Path(file_path)
            if p.exists() and p.is_file():
                p.unlink()
                return True
        except Exception:
            pass
        return False

