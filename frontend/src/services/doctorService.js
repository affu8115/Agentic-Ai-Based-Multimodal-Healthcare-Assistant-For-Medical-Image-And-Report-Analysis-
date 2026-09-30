import api from './api';

export const doctorService = {
  async getPatients() {
    const res = await api.get('/doctor/patients');
    return res.data;
  },

  async getPatientAnalysis(analysisId) {
    const res = await api.get(`/doctor/analysis/${analysisId}`);
    return res.data;
  },

  async submitReview(analysisId, clinicalNotes, reviewStatus = 'reviewed') {
    const res = await api.post(`/doctor/review/${analysisId}`, {
      clinical_notes: clinicalNotes,
      review_status: reviewStatus
    });
    return res.data;
  }
};

