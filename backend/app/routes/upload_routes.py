import os
from flask import Blueprint, request, jsonify, send_file
from ..extensions import db
from ..models.medical_file import MedicalFile, MedicalReport
from ..models.audit_log import AuditLog
from ..services.file_service import FileService
from ..services.ocr_service import OCRService
from ..utils.decorators import token_required

upload_bp = Blueprint('upload', __name__, url_prefix='/api')


@upload_bp.route('/upload/report', methods=['POST'])
@token_required
def upload_report(current_user):
    """Upload a medical report file (PDF, PNG, JPG, TXT) and run OCR text extraction."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part in request.'}), 400

    file = request.files['file']
    try:
        saved_info = FileService.save_uploaded_file(file, current_user.id, file_type='report')
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'File save failed: {str(e)}'}), 500

    try:
        # Create MedicalFile record
        med_file = MedicalFile(
            user_id=current_user.id,
            file_type='report',
            filename=saved_info['filename'],
            original_name=saved_info['original_name'],
            file_path=saved_info['file_path'],
            file_size=saved_info['file_size'],
            mime_type=saved_info['mime_type']
        )
        db.session.add(med_file)
        db.session.flush()

        # Run OCR extraction
        ocr_result = OCRService.extract_text(saved_info['file_path'], saved_info['mime_type'])

        # Check for optional user-provided manual text override
        custom_text = request.form.get('custom_text', '').strip()
        final_text = custom_text if custom_text else ocr_result.get('text', '')

        # Save MedicalReport
        report_record = MedicalReport(
            file_id=med_file.id,
            user_id=current_user.id,
            extracted_text=final_text,
            ocr_engine=ocr_result.get('engine', 'default'),
            extraction_status=ocr_result.get('status', 'completed'),
            confidence_score=ocr_result.get('confidence', 1.0)
        )
        db.session.add(report_record)
        db.session.commit()

        AuditLog.log(current_user.id, 'UPLOAD_REPORT', {'filename': med_file.original_name, 'file_id': med_file.id}, request.remote_addr)

        return jsonify({
            'success': True,
            'message': 'Report uploaded and processed successfully.',
            'file': med_file.to_dict(),
            'extracted_text': final_text,
            'ocr_engine': ocr_result.get('engine'),
            'confidence': ocr_result.get('confidence')
        }), 201
    except Exception as e:
        db.session.rollback()
        FileService.delete_file(saved_info['file_path'])
        return jsonify({'success': False, 'message': f'Failed to process report: {str(e)}'}), 500


@upload_bp.route('/upload/image', methods=['POST'])
@token_required
def upload_image(current_user):
    """Upload a medical image (JPG, JPEG, PNG)."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part in request.'}), 400

    file = request.files['file']
    try:
        saved_info = FileService.save_uploaded_file(file, current_user.id, file_type='image')
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Image save failed: {str(e)}'}), 500

    try:
        med_file = MedicalFile(
            user_id=current_user.id,
            file_type='image',
            filename=saved_info['filename'],
            original_name=saved_info['original_name'],
            file_path=saved_info['file_path'],
            file_size=saved_info['file_size'],
            mime_type=saved_info['mime_type']
        )
        db.session.add(med_file)
        db.session.commit()

        AuditLog.log(current_user.id, 'UPLOAD_IMAGE', {'filename': med_file.original_name, 'file_id': med_file.id}, request.remote_addr)

        return jsonify({
            'success': True,
            'message': 'Medical image uploaded successfully.',
            'file': med_file.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        FileService.delete_file(saved_info['file_path'])
        return jsonify({'success': False, 'message': f'Failed to store image record: {str(e)}'}), 500


@upload_bp.route('/files/<int:file_id>', methods=['GET'])
@token_required
def get_file(current_user, file_id):
    """Securely serve an uploaded file verifying authorization."""
    med_file = MedicalFile.query.get_or_404(file_id)

    # Access control: user must own file OR user is doctor OR user is admin
    if med_file.user_id != current_user.id and current_user.role not in ['doctor', 'admin']:
        return jsonify({'success': False, 'message': 'Unauthorized access to this medical record.'}), 403

    if not os.path.exists(med_file.file_path):
        return jsonify({'success': False, 'message': 'File not found on disk.'}), 404

    return send_file(
        med_file.file_path,
        mimetype=med_file.mime_type,
        as_attachment=False,
        download_name=med_file.original_name
    )


@upload_bp.route('/files', methods=['GET'])
@token_required
def list_files(current_user):
    """List uploaded files for current user."""
    file_type = request.args.get('type')
    query = MedicalFile.query.filter_by(user_id=current_user.id)
    if file_type:
        query = query.filter_by(file_type=file_type)

    files = query.order_by(MedicalFile.uploaded_at.desc()).all()
    return jsonify({
        'success': True,
        'files': [f.to_dict() for f in files]
    }), 200


@upload_bp.route('/files/<int:file_id>', methods=['DELETE'])
@token_required
def delete_file(current_user, file_id):
    """Delete an uploaded file and linked records."""
    med_file = MedicalFile.query.get_or_404(file_id)

    if med_file.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized to delete this file.'}), 403

    try:
        # Delete file from filesystem
        FileService.delete_file(med_file.file_path)
        # Delete database record
        db.session.delete(med_file)
        db.session.commit()

        AuditLog.log(current_user.id, 'DELETE_FILE', {'file_id': file_id, 'filename': med_file.original_name}, request.remote_addr)

        return jsonify({'success': True, 'message': 'File deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Deletion failed: {str(e)}'}), 500

