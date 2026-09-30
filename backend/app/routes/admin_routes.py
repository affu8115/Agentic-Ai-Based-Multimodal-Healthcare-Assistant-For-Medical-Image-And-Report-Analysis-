import os
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app
from ..extensions import db
from ..models.user import User
from ..models.medical_file import MedicalFile
from ..models.analysis import Analysis
from ..models.doctor_review import DoctorReview
from ..models.audit_log import AuditLog
from ..services.ai_service import AIService
from ..services.ocr_service import PYTESSERACT_AVAILABLE, PYPDF_AVAILABLE
from ..utils.decorators import token_required, role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/stats', methods=['GET'])
@token_required
@role_required(['admin'])
def get_admin_stats(current_user):
    """Retrieve platform-wide operational and analytics statistics."""
    total_users = User.query.count()
    patient_count = User.query.filter_by(role='patient').count()
    doctor_count = User.query.filter_by(role='doctor').count()
    admin_count = User.query.filter_by(role='admin').count()

    total_reports = MedicalFile.query.filter_by(file_type='report').count()
    total_images = MedicalFile.query.filter_by(file_type='image').count()
    total_analyses = Analysis.query.count()
    total_reviews = DoctorReview.query.count()

    # Triage distribution breakdown
    triage_counts = {
        'Tier 1: General Information': Analysis.query.filter(Analysis.triage_level.like('%Tier 1%')).count(),
        'Tier 2: Discuss with Doctor': Analysis.query.filter(Analysis.triage_level.like('%Tier 2%')).count(),
        'Tier 3: Prompt Medical Attention': Analysis.query.filter(Analysis.triage_level.like('%Tier 3%')).count(),
        'Tier 4: Emergency Warning': Analysis.query.filter(Analysis.triage_level.like('%Tier 4%')).count(),
    }

    return jsonify({
        'success': True,
        'statistics': {
            'users': {
                'total': total_users,
                'patients': patient_count,
                'doctors': doctor_count,
                'admins': admin_count
            },
            'files': {
                'total_files': total_reports + total_images,
                'reports': total_reports,
                'images': total_images
            },
            'analyses': {
                'total': total_analyses,
                'reviewed_by_doctor': total_reviews,
                'review_rate_percent': round((total_reviews / total_analyses * 100), 1) if total_analyses > 0 else 0,
                'triage_distribution': triage_counts
            }
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@token_required
@role_required(['admin'])
def list_users(current_user):
    """List registered users with role and status."""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({
        'success': True,
        'count': len(users),
        'users': [u.to_dict() for u in users]
    }), 200


@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@token_required
@role_required(['admin'])
def toggle_user_status(current_user, user_id):
    """Activate or deactivate a user account."""
    if user_id == current_user.id:
        return jsonify({'success': False, 'message': 'Cannot modify your own administrative status.'}), 400

    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    is_active = data.get('is_active', not user.is_active)

    user.is_active = is_active
    db.session.commit()

    AuditLog.log(
        current_user.id,
        'USER_STATUS_CHANGE',
        {'target_user_id': user_id, 'is_active': is_active},
        request.remote_addr
    )

    return jsonify({
        'success': True,
        'message': f"User '{user.username}' status updated to {'Active' if is_active else 'Deactivated'}.",
        'user': user.to_dict()
    }), 200


@admin_bp.route('/audit-logs', methods=['GET'])
@token_required
@role_required(['admin'])
def get_audit_logs(current_user):
    """Retrieve system audit activity logs."""
    limit = request.args.get('limit', default=100, type=int)
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return jsonify({
        'success': True,
        'count': len(logs),
        'logs': [log.to_dict() for log in logs]
    }), 200


@admin_bp.route('/system-health', methods=['GET'])
@token_required
@role_required(['admin'])
def get_system_health(current_user):
    """Check AI API, OCR subsystems, and storage status."""
    ai_status = AIService.get_provider_status()

    # Check upload directory size
    upload_path = Path(current_app.config['UPLOAD_FOLDER'])
    total_size_bytes = 0
    if upload_path.exists():
        for dirpath, _, filenames in os.walk(upload_path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                total_size_bytes += os.path.getsize(fp)

    return jsonify({
        'success': True,
        'health': {
            'database': 'Connected (SQLite)',
            'ai_service': ai_status,
            'ocr_engine': {
                'tesseract_library_present': PYTESSERACT_AVAILABLE,
                'pypdf_library_present': PYPDF_AVAILABLE,
                'tesseract_cmd_configured': bool(current_app.config.get('TESSERACT_CMD'))
            },
            'storage': {
                'upload_folder': str(upload_path),
                'used_megabytes': round(total_size_bytes / (1024 * 1024), 2),
                'max_file_size_mb': current_app.config.get('MAX_CONTENT_LENGTH', 0) // (1024 * 1024)
            }
        }
    }), 200

