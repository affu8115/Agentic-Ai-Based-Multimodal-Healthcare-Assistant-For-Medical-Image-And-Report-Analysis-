import io
import pytest
from app import create_app, db
from app.config import Config


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret-key'
    JWT_SECRET_KEY = 'test-jwt-secret-key'


@pytest.fixture
def auth_client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        client = app.test_client()

        p_resp = client.post('/api/auth/register', json={
            'username': 'uploader_user',
            'email': 'upload@test.local',
            'password': 'Password123!',
            'role': 'patient'
        })
        token = p_resp.get_json()['token']
        yield client, token
        db.session.remove()
        db.drop_all()


def test_upload_report_txt(auth_client):
    """Test uploading a text-based medical report."""
    client, token = auth_client
    report_content = b"Patient: Test\nHemoglobin: 14.2 g/dL\nWBC: 6,500 /mcL\nPlatelets: 200,000 /mcL"
    data = {
        'file': (io.BytesIO(report_content), 'test_report.txt')
    }

    resp = client.post('/api/upload/report', data=data, content_type='multipart/form-data', headers={
        'Authorization': f'Bearer {token}'
    })

    assert resp.status_code == 201
    res = resp.get_json()
    assert res['success'] is True
    assert 'Hemoglobin: 14.2' in res['extracted_text']


def test_reject_invalid_file_extension(auth_client):
    """Test rejection of unsupported file extensions (e.g. .exe)."""
    client, token = auth_client
    data = {
        'file': (io.BytesIO(b"executable payload"), 'malicious.exe')
    }

    resp = client.post('/api/upload/report', data=data, content_type='multipart/form-data', headers={
        'Authorization': f'Bearer {token}'
    })

    assert resp.status_code == 400
    assert 'Invalid file format' in resp.get_json()['message']

