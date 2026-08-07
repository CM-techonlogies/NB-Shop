import api from './api';

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/users/addresses/${id}/default`),
  // Admin
  getAllUsers: (params) => api.get('/users/admin/all', { params }),
  getUserById: (id) => api.get(`/users/admin/${id}`),
  toggleUserActive: (id) => api.patch(`/users/admin/${id}/toggle`),
};
