import json
from datetime import datetime
from ..extensions import db


class Analysis(db.Model):
    __tablename__ = 'analyses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    report_file_id = db.Column(db.Integer, db.ForeignKey('medical_files.id', ondelete='SET NULL'), nullable=True)
    image_file_id = db.Column(db.Integer, db.ForeignKey('medical_files.id', ondelete='SET NULL'), nullable=True)

    analysis_type = db.Column(db.String(30), nullable=False)  # 'multimodal', 'report', 'image'
    status = db.Column(db.String(30), default='processing', nullable=False)  # 'processing', 'completed', 'failed'

    overall_summary = db.Column(db.Text, nullable=True)
    triage_level = db.Column(db.String(100), default='Tier 1: General Information', nullable=False)
    triage_color = db.Column(db.String(30), default='emerald', nullable=False)
    confidence_score = db.Column(db.Float, default=0.85, nullable=False)
    limitation_notes = db.Column(db.Text, nullable=True)
    ai_provider = db.Column(db.String(80), default='Clinical Expert Engine', nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Foreign key references for files
    report_file = db.relationship('MedicalFile', foreign_keys=[report_file_id])
    image_file = db.relationship('MedicalFile', foreign_keys=[image_file_id])

    # Agent steps execution
    agent_results = db.relationship('AgentResult', backref='analysis', lazy='select', cascade='all, delete-orphan')
    doctor_review = db.relationship('DoctorReview', backref='analysis', uselist=False, cascade='all, delete-orphan')
    chat_messages = db.relationship('ChatMessage', backref='analysis', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_details=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'report_file_id': self.report_file_id,
            'image_file_id': self.image_file_id,
            'analysis_type': self.analysis_type,
            'status': self.status,
            'overall_summary': self.overall_summary,
            'triage_level': self.triage_level,
            'triage_color': self.triage_color,
            'confidence_score': self.confidence_score,
            'limitation_notes': self.limitation_notes,
            'ai_provider': self.ai_provider,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'report_file': self.report_file.to_dict() if self.report_file else None,
            'image_file': self.image_file.to_dict() if self.image_file else None,
            'doctor_review': self.doctor_review.to_dict() if self.doctor_review else None,
        }
        if include_details:
            data['agent_results'] = [ar.to_dict() for ar in self.agent_results]
        return data


class AgentResult(db.Model):
    __tablename__ = 'agent_results'

    id = db.Column(db.Integer, primary_key=True)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analyses.id', ondelete='CASCADE'), nullable=False, index=True)
    agent_name = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(30), default='completed', nullable=False)  # waiting, processing, completed, unable_to_process, requires_review
    execution_time_ms = db.Column(db.Integer, default=0, nullable=False)
    output_data_json = db.Column(db.Text, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        parsed_output = {}
        if self.output_data_json:
            try:
                parsed_output = json.loads(self.output_data_json)
            except Exception:
                parsed_output = {'raw': self.output_data_json}

        return {
            'id': self.id,
            'analysis_id': self.analysis_id,
            'agent_name': self.agent_name,
            'status': self.status,
            'execution_time_ms': self.execution_time_ms,
            'output_data': parsed_output,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

