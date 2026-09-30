from datetime import datetime
from ..extensions import db


class DoctorReview(db.Model):
    __tablename__ = 'doctor_reviews'

    id = db.Column(db.Integer, primary_key=True)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analyses.id', ondelete='CASCADE'), nullable=False, unique=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id', ondelete='CASCADE'), nullable=False, index=True)

    clinical_notes = db.Column(db.Text, nullable=False)
    review_status = db.Column(db.String(30), default='reviewed', nullable=False)  # 'reviewed', 'amended'
    reviewed_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        doctor_info = None
        if self.doctor:
            doctor_info = {
                'id': self.doctor.id,
                'full_name': self.doctor.full_name,
                'specialization': self.doctor.specialization,
                'license_number': self.doctor.license_number,
                'hospital_affiliation': self.doctor.hospital_affiliation,
            }

        return {
            'id': self.id,
            'analysis_id': self.analysis_id,
            'doctor_id': self.doctor_id,
            'doctor': doctor_info,
            'clinical_notes': self.clinical_notes,
            'review_status': self.review_status,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
        }

