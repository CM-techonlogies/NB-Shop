import api from './api';

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getTrending: () => api.get('/products/trending'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  // Admin — plain JSON, images is an array of URL strings
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  toggleAvailability: (id) => api.patch(`/products/${id}/toggle`),
  toggleLoose: (id, currentIsLoose) => api.put(`/products/${id}`, { is_loose: !currentIsLoose }),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
};
