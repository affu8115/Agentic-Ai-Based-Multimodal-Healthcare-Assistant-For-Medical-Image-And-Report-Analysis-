from datetime import datetime
from ..extensions import db


class MedicalFile(db.Model):
    __tablename__ = 'medical_files'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    file_type = db.Column(db.String(20), nullable=False)  # 'report' or 'image'
    filename = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # 1-to-1 relationship with MedicalReport (when file_type is 'report')
    report_data = db.relationship('MedicalReport', backref='file', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'file_type': self.file_type,
            'filename': self.filename,
            'original_name': self.original_name,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'download_url': f'/api/files/{self.id}'
        }
        if self.report_data:
            data['report'] = self.report_data.to_dict()
        return data


class MedicalReport(db.Model):
    __tablename__ = 'medical_reports'

    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('medical_files.id', ondelete='CASCADE'), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    extracted_text = db.Column(db.Text, nullable=False)
    ocr_engine = db.Column(db.String(50), default='tesseract', nullable=False)
    extraction_status = db.Column(db.String(30), default='completed', nullable=False)  # completed, failed, empty
    confidence_score = db.Column(db.Float, default=1.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'file_id': self.file_id,
            'user_id': self.user_id,
            'extracted_text': self.extracted_text,
            'ocr_engine': self.ocr_engine,
            'extraction_status': self.extraction_status,
            'confidence_score': self.confidence_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

