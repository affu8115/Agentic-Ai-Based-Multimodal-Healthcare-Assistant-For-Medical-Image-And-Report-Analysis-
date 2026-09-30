from .auth_routes import auth_bp
from .upload_routes import upload_bp
from .analysis_routes import analysis_bp
from .chat_routes import chat_bp
from .doctor_routes import doctor_bp
from .admin_routes import admin_bp

__all__ = [
    'auth_bp',
    'upload_bp',
    'analysis_bp',
    'chat_bp',
    'doctor_bp',
    'admin_bp'
]

