import api from './api';

export const uploadService = {
  async uploadReport(file, customText = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (customText) {
      formData.append('custom_text', customText);
    }
    const res = await api.post('/upload/report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async getFiles(type = '') {
    const url = type ? `/files?type=${type}` : '/files';
    const res = await api.get(url);
    return res.data;
  },

  async deleteFile(fileId) {
    const res = await api.delete(`/files/${fileId}`);
    return res.data;
  }
};

