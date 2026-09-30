from ..extensions import db
from ..models.user import User, PatientProfile, DoctorProfile
from ..models.medical_file import MedicalFile, MedicalReport
from ..models.analysis import Analysis, AgentResult
from ..models.doctor_review import DoctorReview
from ..models.audit_log import AuditLog
import json
from datetime import datetime, timedelta


def seed_database():
    """Seed default demonstration accounts and a sample case if database is empty."""
    # Check if admin already exists
    if User.query.filter_by(username='admin').first():
        return

    print("--- Seeding initial demo accounts and clinical sample data ---")

    # 1. Admin Account
    admin = User(username='admin', email='admin@healthcare.local', role='admin')
    admin.set_password('Admin@123')
    db.session.add(admin)

    # 2. Doctor Account
    doctor = User(username='dr.smith', email='dr.smith@healthcare.local', role='doctor')
    doctor.set_password('Doctor@123')
    db.session.add(doctor)
    db.session.flush()

    doc_profile = DoctorProfile(
        user_id=doctor.id,
        full_name='Dr. Sarah Smith, MD',
        specialization='Pulmonology & Internal Medicine',
        license_number='MD-98421-PULM',
        hospital_affiliation='Metro University Hospital',
        contact_number='+1 (555) 234-5678'
    )
    db.session.add(doc_profile)

    # 3. Patient Account
    patient = User(username='john_doe', email='patient.john@healthcare.local', role='patient')
    patient.set_password('Patient@123')
    db.session.add(patient)
    db.session.flush()

    pat_profile = PatientProfile(
        user_id=patient.id,
        full_name='John Doe',
        age=48,
        gender='Male',
        contact_number='+1 (555) 876-5432',
        emergency_contact='+1 (555) 999-0000 (Spouse)',
        medical_notes='History of mild hypertension, non-smoker. Complaining of seasonal dry cough.'
    )
    db.session.add(pat_profile)

    # 4. Sample Medical Report Record
    sample_report_text = """
METRO CLINICAL DIAGNOSTIC LABORATORIES
PATIENT: John Doe | AGE: 48 | GENDER: Male | REF BY: Dr. S. Smith
DATE: 2026-08-15 | SPECIMEN: Whole Blood / Serum

COMPLETE BLOOD COUNT (CBC):
- Hemoglobin: 13.8 g/dL (Reference: 12.0 - 17.5 g/dL) [NORMAL]
- White Blood Cells (WBC): 12,400 /mcL (Reference: 4,000 - 11,000 /mcL) [ELEVATED]
- Platelets: 245,000 /mcL (Reference: 150,000 - 450,000 /mcL) [NORMAL]

METABOLIC & RENAL PROFILE:
- Fasting Blood Glucose: 112 mg/dL (Reference: 70 - 99 mg/dL) [ELEVATED]
- Serum Creatinine: 1.05 mg/dL (Reference: 0.6 - 1.3 mg/dL) [NORMAL]
- Blood Urea Nitrogen (BUN): 16 mg/dL (Reference: 7 - 20 mg/dL) [NORMAL]

RADIOLOGY IMPRESSION (CHEST PA VIEW):
- Clear costophrenic angles bilaterally.
- Mild retrocardiac infiltrate noted in left lower zone; minimal inflammatory consolidation suspected.
- Cardiothoracic ratio within physiological limits (no cardiomegaly).
"""

    med_file = MedicalFile(
        user_id=patient.id,
        file_type='report',
        filename='sample_cbc_chest_report.txt',
        original_name='Routine_CBC_Chest_Report.txt',
        file_path='uploads/sample_report.txt',
        file_size=len(sample_report_text),
        mime_type='text/plain',
        uploaded_at=datetime.utcnow() - timedelta(days=2)
    )
    db.session.add(med_file)
    db.session.flush()

    med_report = MedicalReport(
        file_id=med_file.id,
        user_id=patient.id,
        extracted_text=sample_report_text.strip(),
        ocr_engine='Native Text Processor',
        extraction_status='completed',
        confidence_score=0.98,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    db.session.add(med_report)

    # 5. Sample Completed Analysis Record
    sample_analysis = Analysis(
        user_id=patient.id,
        report_file_id=med_file.id,
        analysis_type='report',
        status='completed',
        overall_summary=(
            "Multimodal clinical evaluation completed on the submitted medical documentation. "
            "Report findings identify mild leukocytosis (WBC 12,400 /mcL) and mildly elevated fasting glucose (112 mg/dL). "
            "Radiological impression notes mild left lower zone infiltrate. "
            "Triage status: Mild-to-moderate inflammatory findings warranting physician consultation within 24-48 hours."
        ),
        triage_level='Tier 3: Prompt Medical Attention',
        triage_color='orange',
        confidence_score=0.89,
        limitation_notes="Educational prototype decision support. Findings must be correlated with clinical symptoms by a licensed physician.",
        ai_provider='Clinical Expert Multi-Agent System',
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    db.session.add(sample_analysis)
    db.session.flush()

    # Agent steps
    steps = [
        ('CoordinatorAgent', 'completed', 45, {'mode': 'REPORT_ONLY', 'status': 'Coordinated 4 specialized agents successfully'}),
        ('ReportAnalysisAgent', 'completed', 120, {
            'summary': 'Identified 5 biomarkers. WBC is elevated (12,400 /mcL) and Fasting Glucose is elevated (112 mg/dL).',
            'findings': [
                {'parameter': 'Hemoglobin', 'value': '13.8 g/dL', 'reference_range': '12.0 - 17.5 g/dL', 'status': 'Normal'},
                {'parameter': 'White Blood Cells (WBC)', 'value': '12400.0 /mcL', 'reference_range': '4000 - 11000 /mcL', 'status': 'High'},
                {'parameter': 'Fasting Blood Glucose', 'value': '112.0 mg/dL', 'reference_range': '70 - 99 mg/dL', 'status': 'High'}
            ],
            'abnormal_values': [
                {'parameter': 'White Blood Cells (WBC)', 'value': '12400.0 /mcL', 'status': 'High', 'clinical_significance': 'Elevated count (leukocytosis, potential infection or inflammation)'},
                {'parameter': 'Fasting Blood Glucose', 'value': '112.0 mg/dL', 'status': 'High', 'clinical_significance': 'Elevated fasting glucose (impaired fasting glucose or prediabetes risk)'}
            ]
        }),
        ('MedicalInfoAgent', 'completed', 85, {
            'terminology_explanations': [
                {'term': 'White Blood Cells (WBC)', 'layperson_explanation': 'Defensive cells of the immune system that elevate when combating infection or inflammation.'},
                {'term': 'Fasting Blood Glucose', 'layperson_explanation': 'Concentration of sugar in the blood after an overnight fast.'}
            ],
            'questions_for_doctor': [
                'What might be contributing to my elevated WBC and Fasting Glucose levels?',
                'Should we repeat the complete blood count in a couple of weeks to check if the elevation has cleared?'
            ]
        }),
        ('RiskTriageAgent', 'completed', 60, {
            'triage_level': 'Tier 3: Prompt Medical Attention',
            'triage_color': 'orange',
            'urgency_rationale': 'Moderate flags detected: Leukocytosis combined with suspected lower respiratory infiltration.',
            'action_recommended': 'Consult with your physician within 24 to 48 hours.'
        })
    ]

    for name, status, ms, out_data in steps:
        ar = AgentResult(
            analysis_id=sample_analysis.id,
            agent_name=name,
            status=status,
            execution_time_ms=ms,
            output_data_json=json.dumps(out_data)
        )
        db.session.add(ar)

    # 6. Sample Doctor Review
    sample_review = DoctorReview(
        analysis_id=sample_analysis.id,
        doctor_id=doc_profile.id,
        clinical_notes=(
            "Patient's elevated WBC count is consistent with mild early bronchitis or localized respiratory inflammation. "
            "Fasting blood glucose indicates borderline pre-diabetes. Recommend oral hydration, rest, and follow-up "
            "repeat fasting glucose + HbA1c in 3 months. No acute antibiotic therapy needed at this stage unless fever develops."
        ),
        review_status='reviewed',
        reviewed_at=datetime.utcnow() - timedelta(days=1)
    )
    db.session.add(sample_review)

    # Audit log
    AuditLog.log(admin.id, 'SYSTEM_INIT', {'message': 'Database seeded with default demonstration accounts.'})

    db.session.commit()
    print("--- Database seeding complete! Demo credentials created. ---")

