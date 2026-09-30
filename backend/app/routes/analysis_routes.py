import json
from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.medical_file import MedicalFile, MedicalReport
from ..models.analysis import Analysis, AgentResult
from ..models.audit_log import AuditLog
from ..agents.coordinator_agent import CoordinatorAgent
from ..utils.decorators import token_required

analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')


@analysis_bp.route('/start', methods=['POST'])
@token_required
def start_analysis(current_user):
    """Trigger the multi-agent multimodal analysis workflow."""
    data = request.get_json() or {}
    report_file_id = data.get('report_file_id')
    image_file_id = data.get('image_file_id')
    custom_text = data.get('custom_text', '').strip()

    report_text = ""
    image_path = None

    # Load report text if report_file_id provided
    if report_file_id:
        report_file = MedicalFile.query.get(report_file_id)
        if not report_file:
            return jsonify({'success': False, 'message': 'Specified report file does not exist.'}), 404
        if report_file.user_id != current_user.id and current_user.role != 'admin':
            return jsonify({'success': False, 'message': 'Access to specified report file denied.'}), 403

        if report_file.report_data:
            report_text = report_file.report_data.extracted_text

    # Override or supplement with custom text if provided
    if custom_text:
        report_text = custom_text

    # Load image path if image_file_id provided
    if image_file_id:
        image_file = MedicalFile.query.get(image_file_id)
        if not image_file:
            return jsonify({'success': False, 'message': 'Specified medical image does not exist.'}), 404
        if image_file.user_id != current_user.id and current_user.role != 'admin':
            return jsonify({'success': False, 'message': 'Access to specified image file denied.'}), 403

        image_path = image_file.file_path

    if not report_text and not image_path:
        return jsonify({
            'success': False,
            'message': 'At least one input modality (medical report text or medical image) is required.'
        }), 400

    try:
        # Instantiate Coordinator Agent and execute workflow
        coordinator = CoordinatorAgent()
        analysis_output = coordinator.run({
            'report_text': report_text,
            'image_path': image_path
        })

        if analysis_output['status'] == 'unable_to_process':
            return jsonify({
                'success': False,
                'message': f"Analysis failed: {analysis_output.get('error', 'Unknown agent error')}"
            }), 500

        res_data = analysis_output['data']

        # Persist Analysis in DB
        analysis = Analysis(
            user_id=current_user.id,
            report_file_id=report_file_id,
            image_file_id=image_file_id,
            analysis_type=res_data.get('analysis_type', 'multimodal'),
            status='completed',
            overall_summary=res_data.get('overall_summary'),
            triage_level=res_data.get('triage_level'),
            triage_color=res_data.get('triage_color'),
            confidence_score=res_data.get('confidence_score', 0.85),
            limitation_notes=res_data.get('limitation_notes'),
            ai_provider=res_data.get('ai_provider', 'Clinical Expert Engine')
        )
        db.session.add(analysis)
        db.session.flush()

        # Persist Agent step traces
        for step in res_data.get('agent_workflow_steps', []):
            agent_record = AgentResult(
                analysis_id=analysis.id,
                agent_name=step['agent_name'],
                status=step.get('status', 'completed'),
                execution_time_ms=step.get('execution_time_ms', 0),
                output_data_json=json.dumps(step.get('output_data', {})),
                error_message=step.get('error')
            )
            db.session.add(agent_record)

        db.session.commit()

        AuditLog.log(
            current_user.id,
            'ANALYSIS_RUN',
            {'analysis_id': analysis.id, 'type': analysis.analysis_type, 'triage': analysis.triage_level},
            request.remote_addr
        )

        return jsonify({
            'success': True,
            'message': 'Multimodal analysis completed successfully.',
            'analysis': analysis.to_dict(include_details=True),
            'synthesized_output': res_data
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Analysis pipeline execution error: {str(e)}'}), 500


@analysis_bp.route('/<int:analysis_id>', methods=['GET'])
@token_required
def get_analysis(current_user, analysis_id):
    """Retrieve full analysis result by ID."""
    analysis = Analysis.query.get_or_404(analysis_id)

    # Authorization: Owner, Doctor, or Admin
    if analysis.user_id != current_user.id and current_user.role not in ['doctor', 'admin']:
        return jsonify({'success': False, 'message': 'Unauthorized to view this analysis.'}), 403

    return jsonify({
        'success': True,
        'analysis': analysis.to_dict(include_details=True)
    }), 200


@analysis_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    """Get list of previous analyses for current user."""
    analyses = Analysis.query.filter_by(user_id=current_user.id)\
                             .order_by(Analysis.created_at.desc())\
                             .all()

    return jsonify({
        'success': True,
        'count': len(analyses),
        'analyses': [a.to_dict(include_details=False) for a in analyses]
    }), 200


@analysis_bp.route('/<int:analysis_id>', methods=['DELETE'])
@token_required
def delete_analysis(current_user, analysis_id):
    """Delete an analysis record."""
    analysis = Analysis.query.get_or_404(analysis_id)

    if analysis.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized to delete this record.'}), 403

    try:
        db.session.delete(analysis)
        db.session.commit()
        AuditLog.log(current_user.id, 'DELETE_ANALYSIS', {'analysis_id': analysis_id}, request.remote_addr)
        return jsonify({'success': True, 'message': 'Analysis record deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to delete analysis: {str(e)}'}), 500

