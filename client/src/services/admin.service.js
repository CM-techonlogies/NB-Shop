import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getBanners: () => api.get('/banners/admin'),
  createBanner: (data) => api.post('/banners', data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
  getOffers: () => api.get('/offers'),
  createOffer: (data) => api.post('/offers', data),
  updateOffer: (id, data) => api.put(`/offers/${id}`, data),
  deleteOffer: (id) => api.delete(`/offers/${id}`),
  getSettings: () => api.get('/settings/full'),
  updateSettings: (data) => api.put('/settings', data),
  updateUpiQr: (data) => api.post('/settings/upi-qr', data),
  sendWhatsApp: (data) => api.post('/admin/send-whatsapp', data),
};
