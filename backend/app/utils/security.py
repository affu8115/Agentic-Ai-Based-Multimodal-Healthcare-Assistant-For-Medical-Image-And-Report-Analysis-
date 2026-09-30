import jwt
from datetime import datetime, timedelta
from flask import current_app


def generate_jwt_token(user_id: int, role: str, expires_in_hours: int = 24) -> str:
    """Generate a signed JWT token containing user identity and role."""
    payload = {
        'sub': user_id,
        'role': role,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=expires_in_hours)
    }
    secret = current_app.config.get('JWT_SECRET_KEY', current_app.config['SECRET_KEY'])
    return jwt.encode(payload, secret, algorithm='HS256')


def decode_jwt_token(token: str) -> dict:
    """Decode and validate a signed JWT token."""
    secret = current_app.config.get('JWT_SECRET_KEY', current_app.config['SECRET_KEY'])
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid authentication token.")

