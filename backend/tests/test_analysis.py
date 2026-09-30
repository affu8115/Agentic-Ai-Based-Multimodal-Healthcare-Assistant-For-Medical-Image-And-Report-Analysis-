import pytest
from app import create_app, db
from app.config import Config


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret-key'
    JWT_SECRET_KEY = 'test-jwt-secret-key'


@pytest.fixture
def app_client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        client = app.test_client()

        # Create patient
        p_resp = client.post('/api/auth/register', json={
            'username': 'patient_user',
            'email': 'pat@test.local',
            'password': 'Password123!',
            'role': 'patient',
            'full_name': 'Patient User'
        })
        patient_token = p_resp.get_json()['token']

        # Create doctor
        d_resp = client.post('/api/auth/register', json={
            'username': 'dr_tester',
            'email': 'doc@test.local',
            'password': 'Password123!',
            'role': 'doctor',
            'full_name': 'Dr. Tester, MD'
        })
        doctor_token = d_resp.get_json()['token']

        yield client, patient_token, doctor_token
        db.session.remove()
        db.drop_all()


def test_end_to_end_analysis_and_doctor_review(app_client):
    """Test full analysis flow from patient trigger to doctor review sign-off."""
    client, p_token, d_token = app_client

    # 1. Patient starts analysis with custom report text
    analysis_resp = client.post('/api/analysis/start', json={
        'custom_text': 'Hemoglobin: 11.2 g/dL\nFasting Blood Glucose: 140 mg/dL\nSerum Creatinine: 1.1 mg/dL'
    }, headers={'Authorization': f'Bearer {p_token}'})

    assert analysis_resp.status_code == 201
    res = analysis_resp.get_json()
    assert res['success'] is True
    analysis_id = res['analysis']['id']
    assert res['analysis']['status'] == 'completed'
    assert len(res['analysis']['agent_results']) >= 4

    # 2. Patient views their history
    history_resp = client.get('/api/analysis/history', headers={'Authorization': f'Bearer {p_token}'})
    assert history_resp.status_code == 200
    assert history_resp.get_json()['count'] == 1

    # 3. Doctor views patient analysis queue
    doc_queue = client.get('/api/doctor/patients', headers={'Authorization': f'Bearer {d_token}'})
    assert doc_queue.status_code == 200
    patients = doc_queue.get_json()['patients']
    assert len(patients) == 1
    assert patients[0]['analysis_id'] == analysis_id
    assert patients[0]['review_status'] == 'pending_review'

    # 4. Doctor submits clinical review
    review_resp = client.post(f'/api/doctor/review/{analysis_id}', json={
        'clinical_notes': 'Confirmed mild anemia and impaired fasting glucose. Advised lifestyle management and repeat in 8 weeks.',
        'review_status': 'reviewed'
    }, headers={'Authorization': f'Bearer {d_token}'})

    assert review_resp.status_code == 200
    assert review_resp.get_json()['success'] is True

    # 5. Verify analysis now has review attached
    updated_analysis = client.get(f'/api/analysis/{analysis_id}', headers={'Authorization': f'Bearer {p_token}'})
    assert updated_analysis.status_code == 200
    a_data = updated_analysis.get_json()['analysis']
    assert a_data['doctor_review'] is not None
    assert 'Confirmed mild anemia' in a_data['doctor_review']['clinical_notes']

