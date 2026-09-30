import pytest
from app import create_app, db
from app.config import Config
from app.models.user import User


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret-key'
    JWT_SECRET_KEY = 'test-jwt-secret-key'


@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def test_register_patient(client):
    """Test patient registration endpoint."""
    resp = client.post('/api/auth/register', json={
        'username': 'testpatient',
        'email': 'patient@test.local',
        'password': 'Password123!',
        'role': 'patient',
        'full_name': 'Test Patient',
        'age': 32,
        'gender': 'Female'
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['success'] is True
    assert 'token' in data
    assert data['user']['username'] == 'testpatient'
    assert data['user']['role'] == 'patient'
    assert data['user']['profile']['full_name'] == 'Test Patient'


def test_register_duplicate_username(client):
    """Test that duplicate usernames are rejected."""
    payload = {
        'username': 'uniqueuser',
        'email': 'user1@test.local',
        'password': 'Password123!',
        'role': 'patient'
    }
    resp1 = client.post('/api/auth/register', json=payload)
    assert resp1.status_code == 201

    payload['email'] = 'user2@test.local'
    resp2 = client.post('/api/auth/register', json=payload)
    assert resp2.status_code == 409
    assert 'already taken' in resp2.get_json()['message']


def test_login_success_and_failure(client):
    """Test login with valid and invalid credentials."""
    client.post('/api/auth/register', json={
        'username': 'loginuser',
        'email': 'login@test.local',
        'password': 'CorrectPassword123',
        'role': 'patient'
    })

    # Successful login
    login_resp = client.post('/api/auth/login', json={
        'identifier': 'loginuser',
        'password': 'CorrectPassword123'
    })
    assert login_resp.status_code == 200
    assert 'token' in login_resp.get_json()

    # Invalid password
    bad_resp = client.post('/api/auth/login', json={
        'identifier': 'loginuser',
        'password': 'WrongPassword'
    })
    assert bad_resp.status_code == 401


def test_role_based_access_control(client):
    """Test that patient role cannot access doctor queue."""
    reg = client.post('/api/auth/register', json={
        'username': 'patient_regular',
        'email': 'regular@test.local',
        'password': 'Password123!',
        'role': 'patient'
    })
    token = reg.get_json()['token']

    # Attempt doctor access
    doc_resp = client.get('/api/doctor/patients', headers={
        'Authorization': f'Bearer {token}'
    })
    assert doc_resp.status_code == 403

