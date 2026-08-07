import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (idToken, userData) => api.post('/auth/verify-otp', { idToken, ...userData }),
  adminLogin: (phone, password) => api.post('/auth/login', { phone, password }),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};
