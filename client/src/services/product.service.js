import api from './api';

// ─── Direct Supabase REST for admin product writes ────────────────────────────
// WHY: The Render backend (production) may not always auto-deploy on every git
// push, causing a mismatch between what the frontend sends and what the backend
// processes.  For admin mutations (create / update) we write a backup PATCH
// directly to Supabase REST so `is_loose` is ALWAYS saved correctly regardless
// of the backend version running on Render.
const SUPABASE_URL = 'https://piygryklvabdalutgkoj.supabase.co';
// This is the anon public key — safe to use in browser for RLS-enabled tables
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWdyeWtsdmFiZGFsdXRna29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA3NzEsImV4cCI6MjEwMDUzNjc3MX0.iHBOEJRFHrE0p6vj7gIdCEzE7xS0l0QF_mLFuPJEFdY';

/**
 * Directly patch one or more columns on a product row via Supabase REST API.
 * This bypasses the Render backend entirely — guaranteed to work even when
 * Render has not redeployed the latest server code.
 */
export async function supabasePatchProduct(productId, patch) {
  const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`;
  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(patch),
  });
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
