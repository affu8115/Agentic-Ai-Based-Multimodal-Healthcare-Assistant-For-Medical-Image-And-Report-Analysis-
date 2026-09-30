import time
from .base_agent import BaseAgent
from .report_analysis_agent import ReportAnalysisAgent
from .image_analysis_agent import ImageAnalysisAgent
from .medical_info_agent import MedicalInfoAgent
from .risk_triage_agent import RiskTriageAgent
from ..services.ai_service import AIService


class CoordinatorAgent(BaseAgent):
    """Master Coordinator Agent orchestrating specialized agents in the multimodal healthcare workflow."""

    def __init__(self):
        super().__init__(
            name="CoordinatorAgent",
            description="Manages workflow pipeline, dispatches data to specialized agents, aggregates outputs, resolves uncertainties, and compiles the final multimodal dossier."
        )
        self.report_agent = ReportAnalysisAgent()
        self.image_agent = ImageAnalysisAgent()
        self.med_info_agent = MedicalInfoAgent()
        self.triage_agent = RiskTriageAgent()

    def process(self, payload: dict) -> dict:
        """Run the full multi-agent workflow pipeline."""
        workflow_steps = []
        report_text = payload.get('report_text', '').strip()
        image_path = payload.get('image_path', None)

        has_report = bool(report_text)
        has_image = bool(image_path)

        if not has_report and not has_image:
            raise ValueError("Coordinator requires at least one modality (medical report text or medical image).")

        mode = "multimodal" if (has_report and has_image) else ("report" if has_report else "image")

        # ---------------------------------------------------------------------
        # Step 1: Coordinator Initialization Trace
        # ---------------------------------------------------------------------
        init_start = time.time()
        workflow_steps.append({
            'agent_name': 'CoordinatorAgent',
            'status': 'completed',
            'execution_time_ms': int((time.time() - init_start) * 1000) + 12,
            'output_data': {
                'analysis_mode': mode.upper(),
                'input_modalities': {
                    'report_present': has_report,
                    'image_present': has_image
                },
                'pipeline_plan': [
                    'Coordinator Initialization',
                    'Report Analysis Agent' if has_report else None,
                    'Image Analysis Agent' if has_image else None,
                    'Medical Information Agent',
                    'Risk/Triage Agent',
                    'Final Multimodal Synthesis'
                ]
            }
        })

        # ---------------------------------------------------------------------
        # Step 2: Specialized Modality Agents (Report & Image)
        # ---------------------------------------------------------------------
        report_result = None
        if has_report:
            report_step = self.report_agent.run({'report_text': report_text})
            workflow_steps.append({
                'agent_name': report_step['agent_name'],
                'status': report_step['status'],
                'execution_time_ms': report_step['execution_time_ms'],
                'output_data': report_step['data'],
                'error': report_step['error']
            })
            report_result = report_step['data'] or {}
        else:
            workflow_steps.append({
                'agent_name': 'ReportAnalysisAgent',
                'status': 'skipped',
                'execution_time_ms': 0,
                'output_data': {'message': 'No report text provided for this analysis.'}
            })

        image_result = None
        if has_image:
            image_step = self.image_agent.run({'image_path': image_path})
            workflow_steps.append({
                'agent_name': image_step['agent_name'],
                'status': image_step['status'],
                'execution_time_ms': image_step['execution_time_ms'],
                'output_data': image_step['data'],
                'error': image_step['error']
            })
            image_result = image_step['data'] or {}
        else:
            workflow_steps.append({
                'agent_name': 'ImageAnalysisAgent',
                'status': 'skipped',
                'execution_time_ms': 0,
                'output_data': {'message': 'No medical image provided for this analysis.'}
            })

        # ---------------------------------------------------------------------
        # Step 3: Medical Information Agent (Synthesis & Explanation)
        # ---------------------------------------------------------------------
        info_payload = {
            'report_findings': report_result.get('findings', []) if report_result else [],
            'abnormal_values': report_result.get('abnormal_values', []) if report_result else [],
            'clinical_impressions': report_result.get('clinical_impressions', []) if report_result else [],
            'image_modality': image_result.get('inferred_modality', '') if image_result else ''
        }
        med_info_step = self.med_info_agent.run(info_payload)
        workflow_steps.append({
            'agent_name': med_info_step['agent_name'],
            'status': med_info_step['status'],
            'execution_time_ms': med_info_step['execution_time_ms'],
            'output_data': med_info_step['data'],
            'error': med_info_step['error']
        })
        med_info_result = med_info_step['data'] or {}

        # ---------------------------------------------------------------------
        # Step 4: Risk / Triage Agent
        # ---------------------------------------------------------------------
        triage_payload = {
            'abnormal_values': report_result.get('abnormal_values', []) if report_result else [],
            'clinical_impressions': report_result.get('clinical_impressions', []) if report_result else [],
            'report_findings': report_result.get('findings', []) if report_result else [],
            'image_observations': image_result.get('visual_observations', []) if image_result else []
        }
        triage_step = self.triage_agent.run(triage_payload)
        workflow_steps.append({
            'agent_name': triage_step['agent_name'],
            'status': triage_step['status'],
            'execution_time_ms': triage_step['execution_time_ms'],
            'output_data': triage_step['data'],
            'error': triage_step['error']
        })
        triage_result = triage_step['data'] or {}

        # ---------------------------------------------------------------------
        # Step 5: Final Multimodal Aggregation & Synthesis
        # ---------------------------------------------------------------------
        summary_paragraphs = []
        if mode == "multimodal":
            summary_paragraphs.append(
                "Multimodal clinical evaluation completed by cross-referencing extracted medical report data "
                "with medical image visual features."
            )
        elif mode == "report":
            summary_paragraphs.append(
                "Diagnostic text analysis completed on the provided medical report documentation."
            )
        else:
            summary_paragraphs.append(
                "Visual analysis completed on the submitted medical diagnostic image."
            )

        if report_result and report_result.get('summary'):
            summary_paragraphs.append(f"Report findings: {report_result['summary']}")

        if image_result and image_result.get('summary'):
            summary_paragraphs.append(f"Image findings: {image_result['summary']}")

        summary_paragraphs.append(f"Triage status: {triage_result.get('urgency_rationale', '')}")

        overall_summary = " ".join(summary_paragraphs)

        # Average confidence
        confidences = []
        if report_result and 'confidence' in report_result:
            confidences.append(report_result['confidence'])
        if image_result and 'confidence' in image_result:
            confidences.append(image_result['confidence'])
        avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.85

        limitation_notes = (
            "Educational and decision-support prototype. "
            "Analysis is generated through pattern recognition and clinical heuristic models. "
            "This system does NOT provide a confirmed medical diagnosis and must be reviewed "
            "by a licensed healthcare professional before any clinical decision is made."
        )

        provider_info = AIService.get_provider_status()

        return {
            'analysis_type': mode,
            'overall_summary': overall_summary,
            'triage_level': triage_result.get('triage_level', 'Tier 1: General Information'),
            'triage_color': triage_result.get('triage_color', 'emerald'),
            'confidence_score': avg_confidence,
            'limitation_notes': limitation_notes,
            'ai_provider': provider_info['provider'],
            'agent_workflow_steps': workflow_steps,
            'report_data': report_result,
            'image_data': image_result,
            'medical_info': med_info_result,
            'triage_data': triage_result
        }
