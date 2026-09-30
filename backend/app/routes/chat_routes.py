from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.analysis import Analysis
from ..models.chat import ChatMessage
from ..services.ai_service import AIService
from ..utils.decorators import token_required

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')


@chat_bp.route('/message', methods=['POST'])
@token_required
def send_message(current_user):
    """Send a chat message with report/image context grounding."""
    data = request.get_json() or {}
    message_text = data.get('message', '').strip()
    analysis_id = data.get('analysis_id')

    if not message_text:
        return jsonify({'success': False, 'message': 'Message cannot be empty.'}), 400

    context_text = ""
    if analysis_id:
        analysis = Analysis.query.get(analysis_id)
        if analysis and (analysis.user_id == current_user.id or current_user.role in ['doctor', 'admin']):
            context_parts = []
            if analysis.overall_summary:
                context_parts.append(f"Overall Analysis Summary: {analysis.overall_summary}")
            if analysis.report_file and analysis.report_file.report_data:
                context_parts.append(f"Report Text: {analysis.report_file.report_data.extracted_text[:1500]}")
            if analysis.triage_level:
                context_parts.append(f"Triage Urgency: {analysis.triage_level}")
            context_text = "\n\n".join(context_parts)

    try:
        # Save user message
        user_msg = ChatMessage(
            user_id=current_user.id,
            analysis_id=analysis_id,
            role='user',
            message=message_text
        )
        db.session.add(user_msg)

        # Generate response
        reply_text = AIService.answer_chat_query(message_text, context_text=context_text)

        # Save assistant message
        assistant_msg = ChatMessage(
            user_id=current_user.id,
            analysis_id=analysis_id,
            role='assistant',
            message=reply_text
        )
        db.session.add(assistant_msg)
        db.session.commit()

        return jsonify({
            'success': True,
            'user_message': user_msg.to_dict(),
            'assistant_message': assistant_msg.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Chat processing failed: {str(e)}'}), 500


@chat_bp.route('/history', methods=['GET'])
@token_required
def get_chat_history(current_user):
    """Get chat history, optionally filtered by analysis_id."""
    analysis_id = request.args.get('analysis_id', type=int)

    query = ChatMessage.query.filter_by(user_id=current_user.id)
    if analysis_id:
        query = query.filter_by(analysis_id=analysis_id)

    messages = query.order_by(ChatMessage.created_at.asc()).all()
    return jsonify({
        'success': True,
        'messages': [m.to_dict() for m in messages]
    }), 200

