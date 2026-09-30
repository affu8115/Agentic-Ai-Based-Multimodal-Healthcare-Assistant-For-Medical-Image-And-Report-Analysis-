from datetime import datetime
from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.analysis import Analysis
from ..models.doctor_review import DoctorReview
from ..models.user import User, DoctorProfile
from ..models.audit_log import AuditLog
from ..utils.decorators import token_required, role_required

doctor_bp = Blueprint('doctor', __name__, url_prefix='/api/doctor')


@doctor_bp.route('/patients', methods=['GET'])
@token_required
@role_required(['doctor', 'admin'])
def get_patient_analyses(current_user):
    """List all patient analyses for clinical review queue."""
    analyses = Analysis.query.order_by(Analysis.created_at.desc()).all()

    items = []
    for a in analyses:
        patient_user = a.user
        patient_profile = patient_user.patient_profile if patient_user else None
        
        items.append({
            'analysis_id': a.id,
            'patient_id': a.user_id,
            'patient_name': patient_profile.full_name if patient_profile else (patient_user.username if patient_user else 'Unknown'),
            'patient_age': patient_profile.age if patient_profile else None,
            'patient_gender': patient_profile.gender if patient_profile else None,
            'analysis_type': a.analysis_type,
            'triage_level': a.triage_level,
            'triage_color': a.triage_color,
            'created_at': a.created_at.isoformat() if a.created_at else None,
            'review_status': 'reviewed' if a.doctor_review else 'pending_review',
            'doctor_review': a.doctor_review.to_dict() if a.doctor_review else None
        })

    return jsonify({
        'success': True,
        'count': len(items),
        'patients': items
    }), 200


@doctor_bp.route('/analysis/<int:analysis_id>', methods=['GET'])
@token_required
@role_required(['doctor', 'admin'])
def get_patient_analysis_detail(current_user, analysis_id):
    """Get full patient record and analysis for doctor evaluation."""
    analysis = Analysis.query.get_or_404(analysis_id)
    patient_user = analysis.user
    patient_profile = patient_user.patient_profile if patient_user else None

    return jsonify({
        'success': True,
        'analysis': analysis.to_dict(include_details=True),
        'patient': {
            'id': patient_user.id,
            'username': patient_user.username,
            'email': patient_user.email,
            'full_name': patient_profile.full_name if patient_profile else patient_user.username,
            'age': patient_profile.age if patient_profile else None,
            'gender': patient_profile.gender if patient_profile else None,
            'contact_number': patient_profile.contact_number if patient_profile else None,
            'emergency_contact': patient_profile.emergency_contact if patient_profile else None,
            'medical_notes': patient_profile.medical_notes if patient_profile else None,
        }
    }), 200


@doctor_bp.route('/review/<int:analysis_id>', methods=['POST'])
@token_required
@role_required(['doctor', 'admin'])
def submit_review(current_user, analysis_id):
    """Submit professional medical notes and mark an AI analysis as clinically reviewed."""
    analysis = Analysis.query.get_or_404(analysis_id)
    data = request.get_json() or {}

    clinical_notes = data.get('clinical_notes', '').strip()
    review_status = data.get('review_status', 'reviewed')

    if not clinical_notes:
        return jsonify({'success': False, 'message': 'Clinical review notes cannot be empty.'}), 400

    # Ensure doctor profile exists
    doctor_profile = current_user.doctor_profile
    if not doctor_profile:
        # Create a fallback profile if doctor profile was missing
        doctor_profile = DoctorProfile(
            user_id=current_user.id,
            full_name=f"Dr. {current_user.username}",
            specialization="General Medicine",
            license_number="MED-REV-001"
        )
        db.session.add(doctor_profile)
        db.session.flush()

    try:
        review = DoctorReview.query.filter_by(analysis_id=analysis_id).first()
        if review:
            review.clinical_notes = clinical_notes
            review.review_status = review_status
            review.reviewed_at = datetime.utcnow()
            review.doctor_id = doctor_profile.id
        else:
            review = DoctorReview(
                analysis_id=analysis_id,
                doctor_id=doctor_profile.id,
                clinical_notes=clinical_notes,
                review_status=review_status,
                reviewed_at=datetime.utcnow()
            )
            db.session.add(review)

        db.session.commit()

        AuditLog.log(
            current_user.id,
            'DOCTOR_REVIEW',
            {'analysis_id': analysis_id, 'status': review_status},
            request.remote_addr
        )

        return jsonify({
            'success': True,
            'message': 'Clinical review saved and marked successfully.',
            'review': review.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to save doctor review: {str(e)}'}), 500

