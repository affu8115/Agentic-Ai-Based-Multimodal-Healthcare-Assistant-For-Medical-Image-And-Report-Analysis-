import json
from datetime import datetime
from ..extensions import db


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    action = db.Column(db.String(100), nullable=False, index=True)  # LOGIN, UPLOAD, ANALYSIS_RUN, REVIEW, etc.
    ip_address = db.Column(db.String(50), nullable=True)
    details_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        parsed = {}
        if self.details_json:
            try:
                parsed = json.loads(self.details_json)
            except Exception:
                parsed = {'raw': self.details_json}

        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'System/Anonymous',
            'action': self.action,
            'ip_address': self.ip_address,
            'details': parsed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    @staticmethod
    def log(user_id, action, details=None, ip_address=None):
        """Helper method to append an audit log entry."""
        try:
            log_entry = AuditLog(
                user_id=user_id,
                action=action,
                ip_address=ip_address,
                details_json=json.dumps(details or {})
            )
            db.session.add(log_entry)
            db.session.commit()
        except Exception as e:
            db.session.rollback()

