from flask import Blueprint, request, jsonify, g
from ..extensions import db
from ..models.user import User, PatientProfile, DoctorProfile
from ..models.audit_log import AuditLog
from ..utils.security import generate_jwt_token
from ..utils.decorators import token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user (Patient or Doctor)."""
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'patient').lower()

    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Username, email, and password are required.'}), 400

    if role not in ['patient', 'doctor']:
        return jsonify({'success': False, 'message': 'Role must be either "patient" or "doctor".'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': f'Username "{username}" is already taken.'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': f'Email "{email}" is already registered.'}), 409

    try:
        user = User(username=username, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        # Create corresponding profile
        if role == 'patient':
            profile = PatientProfile(
                user_id=user.id,
                full_name=data.get('full_name', username),
                age=data.get('age'),
                gender=data.get('gender'),
                contact_number=data.get('contact_number'),
                emergency_contact=data.get('emergency_contact'),
                medical_notes=data.get('medical_notes')
            )
            db.session.add(profile)
        elif role == 'doctor':
            profile = DoctorProfile(
                user_id=user.id,
                full_name=data.get('full_name', f"Dr. {username}"),
                specialization=data.get('specialization', 'General Medicine'),
                license_number=data.get('license_number', 'MED-PENDING-001'),
                hospital_affiliation=data.get('hospital_affiliation', 'General Hospital'),
                contact_number=data.get('contact_number')
            )
            db.session.add(profile)

        db.session.commit()

        AuditLog.log(user.id, 'USER_REGISTER', {'username': username, 'role': role}, request.remote_addr)

        token = generate_jwt_token(user.id, user.role)
        return jsonify({
            'success': True,
            'message': 'Registration successful.',
            'token': token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user with username/email and password."""
    data = request.get_json() or {}
    identifier = data.get('identifier', '').strip()  # username or email
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'success': False, 'message': 'Username/email and password are required.'}), 400

    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier.lower())
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid username or password.'}), 401

    if not user.is_active:
        return jsonify({'success': False, 'message': 'Account is deactivated. Contact an administrator.'}), 403

    token = generate_jwt_token(user.id, user.role)
    AuditLog.log(user.id, 'USER_LOGIN', {'role': user.role}, request.remote_addr)

    return jsonify({
        'success': True,
        'message': 'Login successful.',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Retrieve details of currently logged in user."""
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    }), 200


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update profile details for current user."""
    data = request.get_json() or {}

    try:
        if current_user.role == 'patient' and current_user.patient_profile:
            prof = current_user.patient_profile
            prof.full_name = data.get('full_name', prof.full_name)
            prof.age = data.get('age', prof.age)
            prof.gender = data.get('gender', prof.gender)
            prof.contact_number = data.get('contact_number', prof.contact_number)
            prof.emergency_contact = data.get('emergency_contact', prof.emergency_contact)
            prof.medical_notes = data.get('medical_notes', prof.medical_notes)
        elif current_user.role == 'doctor' and current_user.doctor_profile:
            prof = current_user.doctor_profile
            prof.full_name = data.get('full_name', prof.full_name)
            prof.specialization = data.get('specialization', prof.specialization)
            prof.license_number = data.get('license_number', prof.license_number)
            prof.hospital_affiliation = data.get('hospital_affiliation', prof.hospital_affiliation)
            prof.contact_number = data.get('contact_number', prof.contact_number)

        db.session.commit()
        AuditLog.log(current_user.id, 'PROFILE_UPDATE', {}, request.remote_addr)

        return jsonify({
            'success': True,
            'message': 'Profile updated successfully.',
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Profile update failed: {str(e)}'}), 500


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """Log out current user."""
    AuditLog.log(current_user.id, 'USER_LOGOUT', {}, request.remote_addr)
    return jsonify({'success': True, 'message': 'Logged out successfully.'}), 200

