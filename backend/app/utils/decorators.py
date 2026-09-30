from functools import wraps
from flask import request, jsonify, g
from .security import decode_jwt_token
from ..models.user import User


def token_required(f):
    """Decorator to require a valid JWT bearer token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header:
            return jsonify({'success': False, 'message': 'Authorization header missing.'}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'success': False, 'message': 'Invalid token format. Expected Bearer <token>'}), 401

        token = parts[1]
        try:
            payload = decode_jwt_token(token)
            user_id = payload.get('sub')
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'success': False, 'message': 'User account not found or deactivated.'}), 401
            g.current_user = user
        except ValueError as e:
            return jsonify({'success': False, 'message': str(e)}), 401
        except Exception as e:
            return jsonify({'success': False, 'message': 'Authentication failed.'}), 401

        return f(user, *args, **kwargs)

    return decorated


def role_required(allowed_roles):
    """Decorator to restrict route access to specific roles."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = getattr(g, 'current_user', None)
            # If current_user passed as first arg
            if not user and len(args) > 0 and isinstance(args[0], User):
                user = args[0]

            if not user:
                return jsonify({'success': False, 'message': 'User authentication required.'}), 401

            if user.role not in allowed_roles:
                return jsonify({
                    'success': False,
                    'message': f'Access denied. Required role: {", ".join(allowed_roles)}. Your role: {user.role}'
                }), 403

            return f(*args, **kwargs)

        return decorated_function

    return decorator

