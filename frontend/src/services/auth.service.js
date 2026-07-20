import api from './api.client';
export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', {
      email,
      password
    });
    return res.data;
  },
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async refresh() {
    const res = await api.post('/auth/refresh');
    return res.data;
  },
  async getMe(token) {
    const res = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  },
  async verifyEmail(token) {
    const res = await api.post('/auth/verify-email', {
      token
    });
    return res.data;
  },
  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', {
      email
    });
    return res.data;
  },
  async resetPassword(token, password) {
    const res = await api.post('/auth/reset-password', {
      token,
      password
    });
    return res.data;
  }
};