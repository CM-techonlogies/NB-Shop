import api from './api';

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  uploadPaymentScreenshot: (id, payload) => api.post(`/orders/${id}/payment-screenshot`, payload),
  // Admin
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),
  updateOrderStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  getOrderStats: () => api.get('/orders/admin/stats'),
};
