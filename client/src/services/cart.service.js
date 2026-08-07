import api from './api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, qty) => api.post('/cart', { productId, qty }),
  updateItem: (itemId, qty) => api.put(`/cart/${itemId}`, { qty }),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};
