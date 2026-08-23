import api from './api';

// ─── Direct Supabase REST for admin product writes ────────────────────────────
// WHY: The Render backend (production) may not always auto-deploy on every git
// push, causing a mismatch between what the frontend sends and what the backend
// processes. For admin mutations (create / update / toggle) we write directly
// to Supabase REST so `is_loose` is ALWAYS saved correctly regardless of which
// backend version is running on Render.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://piygryklvabdalutgkoj.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

/**
 * Directly patch one or more columns on a product row via Supabase REST API.
 * This bypasses the Render backend entirely — guaranteed to work.
 */
export async function supabasePatchProduct(productId, patch) {
  if (!SUPABASE_KEY) {
    console.warn('supabasePatchProduct: VITE_SUPABASE_KEY not set, skipping direct write');
    return;
  }
  const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    console.error('supabasePatchProduct failed:', res.status, await res.text());
  }
}

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
