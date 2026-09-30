import api from './api';

export const analysisService = {
  async startAnalysis(payload) {
    const res = await api.post('/analysis/start', payload);
    return res.data;
  },

  async getAnalysis(id) {
    const res = await api.get(`/analysis/${id}`);
    return res.data;
  },

  async getHistory() {
    const res = await api.get('/analysis/history');
    return res.data;
  },

  async deleteAnalysis(id) {
    const res = await api.delete(`/analysis/${id}`);
    return res.data;
  }
};

