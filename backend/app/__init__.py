import os
from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .extensions import db


def create_app(config_class=Config):
    """Application factory for the Healthcare Multimodal Assistant backend."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable Cross-Origin Resource Sharing
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize extensions
    db.init_app(app)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    from .routes import (
        auth_bp,
        upload_bp,
        analysis_bp,
        chat_bp,
        doctor_bp,
        admin_bp
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(admin_bp)

    # Global error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'success': False, 'message': 'Bad request.', 'error': str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Resource not found.', 'error': str(error)}), 404

    @app.errorhandler(413)
    def file_too_large(error):
        return jsonify({
            'success': False,
            'message': f'File exceeds maximum permitted size of {app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)}MB.'
        }), 413

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'message': 'An internal server error occurred.', 'error': str(error)}), 500

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Agentic AI Multimodal Healthcare Assistant API',
            'version': '1.0.0'
        }), 200

    return app
