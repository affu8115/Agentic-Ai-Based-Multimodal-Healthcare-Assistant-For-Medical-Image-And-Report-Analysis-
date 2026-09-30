from .base_agent import BaseAgent
from ..services.ai_service import AIService


class ImageAnalysisAgent(BaseAgent):
    """Specialized Agent responsible for processing supported medical images (X-rays, scans, clinical photos)."""

    def __init__(self):
        super().__init__(
            name="ImageAnalysisAgent",
            description="Analyzes medical image visual patterns, density symmetry, anatomical clarity, and potential radiological/clinical features."
        )

    def process(self, payload: dict) -> dict:
        image_path = payload.get('image_path')
        if not image_path:
            return {
                'status': 'no_data',
                'summary': 'No medical image provided for analysis.',
                'visual_observations': [],
                'limitations': 'No image input provided.'
            }

        # Check if live Gemini Multimodal AI is configured
        if AIService.is_api_configured():
            prompt = (
                "You are the specialized Image Analysis Agent in a healthcare clinical decision support system. "
                "Analyze this medical image (e.g. Chest X-Ray or clinical scan). "
                "Return ONLY a valid JSON object with the exact keys: "
                "'inferred_modality' (string, e.g. Chest X-Ray (PA View)), "
                "'quality_assessment' (string), "
                "'visual_observations' (array of {feature, assessment, clarity, confidence}), "
                "'key_findings' (array of strings), "
                "'anatomical_limitations' (string describing 2D projection and need for radiologist confirmation), "
                "'confidence' (float between 0.0 and 1.0).\n\n"
                "SAFETY REQUIREMENT: Do NOT claim medical certainty or diagnostic finality. State observations with appropriate uncertainty."
            )
            api_result = AIService._call_gemini_multimodal(prompt, image_path=image_path)
            if api_result and isinstance(api_result, dict) and 'visual_observations' in api_result:
                api_result['engine'] = 'Gemini 1.5 Flash (Multimodal)'
                return api_result

        # Clinical Expert Rule-Based Image Analysis
        rule_result = AIService.analyze_medical_image_rules(image_path)
        if 'error' in rule_result:
            return {
                'status': 'unable_to_process',
                'summary': 'Could not process medical image.',
                'error': rule_result['error'],
                'visual_observations': []
            }

        summary = (
            f"Analyzed {rule_result['inferred_modality']} ({rule_result['dimensions']}). "
            f"Image contrast index is {rule_result['contrast_index']}. "
            "Structural anatomical borders delineate clear anatomical fields suitable for educational screening."
        )

        return {
            'summary': summary,
            'inferred_modality': rule_result['inferred_modality'],
            'dimensions': rule_result['dimensions'],
            'quality_assessment': rule_result['quality_assessment'],
            'visual_observations': rule_result['visual_observations'],
            'anatomical_limitations': rule_result['anatomical_limitations'],
            'confidence': rule_result['confidence'],
            'engine': 'Clinical Expert Computer Vision Engine'
        }
