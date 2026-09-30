import pytest
from app.agents.report_analysis_agent import ReportAnalysisAgent
from app.agents.image_analysis_agent import ImageAnalysisAgent
from app.agents.medical_info_agent import MedicalInfoAgent
from app.agents.risk_triage_agent import RiskTriageAgent
from app.agents.coordinator_agent import CoordinatorAgent


def test_report_analysis_agent_extraction():
    """Test biomarker extraction from simulated report text."""
    sample_text = """
    Diagnostic Lab Report
    Hemoglobin: 10.5 g/dL
    White Blood Cells (WBC): 14,200 /mcL
    Fasting Blood Glucose: 135 mg/dL
    Serum Creatinine: 0.9 mg/dL
    """
    agent = ReportAnalysisAgent()
    result = agent.run({'report_text': sample_text})

    assert result['status'] == 'completed'
    assert result['data'] is not None
    data = result['data']
    assert len(data['findings']) >= 4
    # Hemoglobin is low (10.5 < 12.0)
    # WBC is high (14200 > 11000)
    # Fasting glucose is high (135 > 99)
    assert len(data['abnormal_values']) >= 3
    assert any(a['parameter'] == 'Hemoglobin' for a in data['abnormal_values'])
    assert any('White Blood Cells' in a['parameter'] for a in data['abnormal_values'])


def test_medical_info_agent_explanations():
    """Test medical terminology translation and doctor questions."""
    agent = MedicalInfoAgent()
    payload = {
        'report_findings': [{'parameter': 'Hemoglobin', 'value': '10.5 g/dL'}],
        'abnormal_values': [{'parameter': 'Hemoglobin', 'value': '10.5 g/dL', 'status': 'Low'}],
        'image_modality': 'Chest X-Ray'
    }
    result = agent.run(payload)

    assert result['status'] == 'completed'
    data = result['data']
    assert len(data['terminology_explanations']) >= 1
    assert len(data['questions_for_doctor']) >= 3
    assert any('Hemoglobin' in q for q in data['questions_for_doctor'])


def test_risk_triage_agent_classification():
    """Test that multiple abnormal values trigger Tier 3 triage."""
    agent = RiskTriageAgent()
    payload = {
        'abnormal_values': [
            {'parameter': 'Hemoglobin', 'value': '10.5 g/dL'},
            {'parameter': 'White Blood Cells (WBC)', 'value': '14,200 /mcL'}
        ],
        'clinical_impressions': [{'keyword': 'pneumonia', 'impression': 'Pneumonic consolidation'}],
        'report_findings': []
    }
    result = agent.run(payload)

    assert result['status'] == 'completed'
    data = result['data']
    assert 'Tier 3' in data['triage_level']
    assert data['triage_color'] == 'orange'
    assert 'DISCLAIMER' in data['emergency_disclaimer']


def test_coordinator_agent_pipeline():
    """Test coordinator agent orchestrating report-only workflow."""
    coordinator = CoordinatorAgent()
    report_text = "Hemoglobin: 14.0 g/dL\nFasting Blood Glucose: 85 mg/dL\nNormal scan."
    result = coordinator.run({'report_text': report_text, 'image_path': None})

    assert result['status'] == 'completed'
    data = result['data']
    assert data['analysis_type'] == 'report'
    assert 'overall_summary' in data
    assert 'agent_workflow_steps' in data
    assert len(data['agent_workflow_steps']) >= 4

