/**
 * supabaseAdmin.js
 * Direct Supabase REST calls for admin data fetching.
 * Uses the service-role key (bypasses RLS) – same key already
 * used in user.service.js for profile/address reads.
 *
 * WHY: Render backend's @clerk/express middleware requires matching
 * CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY (both must be live or both dev).
 * If they're mismatched, every protected route returns 401.
 * Bypassing Render for admin reads is more reliable and faster.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[supabaseAdmin] Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY');
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function supaFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: { ...headers, ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Supabase error ${res.status}`);
  }
  // DELETE returns 204 with empty body
  if (res.status === 204) return null;
  return res.json();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a name to a URL-safe slug, e.g. "Dairy & Eggs" → "dairy-eggs" */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const supaCategories = {
  getAll: () =>
    supaFetch('/categories?select=*&order=sort_order.asc'),

  create: ({ name, description, image_url, sort_order = 0, visible = true }) => {
    const slug = slugify(name);
    return supaFetch('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, slug, description, image_url, sort_order, visible }),
    });
  },

  update: (id, data) => {
    // If name is being updated, also regenerate the slug
    const patch = { ...data };
    if (data.name) patch.slug = slugify(data.name);
    return supaFetch(`/categories?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  delete: (id) =>
    supaFetch(`/categories?id=eq.${id}`, { method: 'DELETE' }),
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const supaOrders = {
  /**
   * Get all orders with user info and items.
   * @param {string} [status] - Filter by status (optional)
   */
  getAll: (status) => {
    let query = '/orders?select=*,users(id,name,email,phone)&order=created_at.desc';
    if (status === 'confirmed') {
      query += `&status=in.(confirmed,pending_payment,payment_received)`;
    } else if (status) {
      query += `&status=eq.${status}`;
    }
    return supaFetch(query);
  },

  getById: (id) =>
    supaFetch(`/orders?select=*,users(id,name,email,phone),order_items(id,product_id,name,qty,price,image)&id=eq.${id}`).then(
      (d) => (Array.isArray(d) ? d[0] : d)
    ),

  /** Update order status */
  updateStatus: (id, status) =>
    supaFetch(`/orders?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    }),

  /** Get count/stats for dashboard */
  getStats: async () => {
    const [all, pending, confirmed, delivered, cancelled] = await Promise.all([
      supaFetch('/orders?select=id,total,status'),
      supaFetch('/orders?select=id&status=eq.pending_payment'),
      supaFetch('/orders?select=id&status=eq.confirmed'),
      supaFetch('/orders?select=id&status=eq.delivered'),
      supaFetch('/orders?select=id&status=eq.cancelled'),
    ]);
    const revenue = all.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    return {
      totalOrders: all.length,
      pendingOrders: pending.length,
      confirmedOrders: confirmed.length,
      deliveredOrders: delivered.length,
      cancelledOrders: cancelled.length,
      totalRevenue: revenue,
    };
  },
};

// ─── CUSTOMERS / USERS ───────────────────────────────────────────────────────

export const supaCustomers = {
  getAll: () =>
    supaFetch('/users?select=*&order=created_at.desc'),
};

// ─── BANNERS ─────────────────────────────────────────────────────────────────

export const supaBanners = {
  getAll: () =>
    supaFetch('/banners?select=*&order=sort_order.asc'),

  create: (data) =>
    supaFetch('/banners', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    supaFetch(`/banners?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id) =>
    supaFetch(`/banners?id=eq.${id}`, { method: 'DELETE' }),
};

// ─── PRODUCTS (admin) ────────────────────────────────────────────────────────

export const supaProducts = {
  getAll: () =>
    supaFetch('/products?select=*,categories(id,name),product_images(id,url,public_id)&order=created_at.desc'),

  create: (data) => {
    // Auto-generate slug from product name if not provided
    const payload = { ...data };
    if (!payload.slug && payload.name) payload.slug = slugify(payload.name);
    return supaFetch('/products', { method: 'POST', body: JSON.stringify(payload) });
  },

  update: (id, data) => {
    const patch = { ...data };
    // Regenerate slug if name changes
    if (data.name && !data.slug) patch.slug = slugify(data.name);
    return supaFetch(`/products?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  },

  delete: (id) =>
    supaFetch(`/products?id=eq.${id}`, { method: 'DELETE' }),
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export const supaSettings = {
  get: () =>
    supaFetch('/settings?select=*&limit=1').then((d) => (Array.isArray(d) ? d[0] : d)),

  update: (data) =>
    supaFetch('/settings?id=eq.1', { method: 'PATCH', body: JSON.stringify(data) }),
};
