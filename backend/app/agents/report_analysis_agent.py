from .base_agent import BaseAgent
from ..services.ai_service import AIService


class ReportAnalysisAgent(BaseAgent):
    """Specialized Agent responsible for clinical analysis of extracted medical report text."""

    def __init__(self):
        super().__init__(
            name="ReportAnalysisAgent",
            description="Analyzes medical report text, extracts biomarkers, flags out-of-range values, and identifies diagnostic impressions."
        )

    def process(self, payload: dict) -> dict:
        report_text = payload.get('report_text', '').strip()
        if not report_text:
            return {
                'status': 'no_data',
                'summary': 'No medical report text provided for analysis.',
                'findings': [],
                'abnormal_values': [],
                'clinical_impressions': [],
                'categories': []
            }

        # Check if live Gemini AI API is configured
        if AIService.is_api_configured():
            prompt = (
                "You are the specialized Report Analysis Agent in a clinical decision support system. "
                "Analyze the following medical report text and return ONLY a valid JSON object with the exact keys: "
                "'summary' (string), 'findings' (array of {parameter, value, reference_range, status, category, clinical_note}), "
                "'abnormal_values' (array of {parameter, value, reference_range, status, clinical_significance}), "
                "'clinical_impressions' (array of {impression, description, category}), "
                "'confidence' (float between 0.0 and 1.0).\n\n"
                f"REPORT TEXT:\n{report_text}"
            )
            api_result = AIService._call_gemini_multimodal(prompt)
            if api_result and isinstance(api_result, dict) and 'findings' in api_result:
                api_result['engine'] = 'Gemini 1.5 Flash'
                return api_result

        # Clinical Expert Rule-Based Analysis
        rule_result = AIService.analyze_report_text_rules(report_text)
        total_bio = rule_result['total_biomarkers_identified']
        abnormal_count = len(rule_result['abnormal_values'])

        summary = (
            f"Successfully processed medical report text. Identified {total_bio} biomarker parameter(s) across "
            f"{', '.join(rule_result['categories'])}. "
        )
        if abnormal_count > 0:
            summary += f"{abnormal_count} value(s) deviate from standard reference intervals and warrant physician review."
        else:
            summary += "All evaluated biomarker values are currently within standard physiological limits."

        return {
            'summary': summary,
            'findings': rule_result['findings'],
            'abnormal_values': rule_result['abnormal_values'],
            'clinical_impressions': rule_result['clinical_impressions'],
            'categories': rule_result['categories'],
            'has_abnormalities': rule_result['has_abnormalities'],
            'confidence': 0.90 if total_bio > 0 else 0.75,
            'engine': 'Clinical Expert Rule Engine'
        }
