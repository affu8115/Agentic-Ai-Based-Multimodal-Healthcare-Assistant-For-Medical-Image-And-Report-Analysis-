import api from './api';

export const chatService = {
  async sendMessage(message, analysisId = null) {
    const res = await api.post('/chat/message', {
      message,
      analysis_id: analysisId
    });
    return res.data;
  },

  async getHistory(analysisId = null) {
    const url = analysisId ? `/chat/history?analysis_id=${analysisId}` : '/chat/history';
    const res = await api.get(url);
    return res.data;
  }
};

