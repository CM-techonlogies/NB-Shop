import api from './api';

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  // Admin — plain JSON, no file upload
  getAllAdmin: () => api.get('/categories/admin'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};
