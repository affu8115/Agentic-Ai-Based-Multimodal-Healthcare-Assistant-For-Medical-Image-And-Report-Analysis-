import api from './api';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async toggleUserStatus(userId, isActive) {
    const res = await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
    return res.data;
  },

  async getAuditLogs(limit = 100) {
    const res = await api.get(`/admin/audit-logs?limit=${limit}`);
    return res.data;
  },

  async getSystemHealth() {
    const res = await api.get('/admin/system-health');
    return res.data;
  }
};

