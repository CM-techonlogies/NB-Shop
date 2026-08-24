import api from './api';

const SB_URL = 'https://piygryklvabdalutgkoj.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWdyeWtsdmFiZGFsdXRna29qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2MDc3MSwiZXhwIjoyMTAwNTM2NzcxfQ.oMDow1PoBG1YHVSrPYIovh2fHcArZWxJTHw8QAkp9e8';
const SB_HDRS = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
};
const slugify = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const categoryService = {
  // Get all visible categories for customer
  getCategories: async () => {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/categories?select=*&visible=eq.true&order=sort_order.asc`, { headers: SB_HDRS });
      if (res.ok) {
        const data = await res.json();
        return { data: Array.isArray(data) ? data : [] };
      }
    } catch (e) {
      console.warn('Supabase categories fetch fallback:', e);
    }
    return api.get('/categories');
  },

  // Get single category by slug
  getCategoryBySlug: async (slug) => {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/categories?slug=eq.${slug}&select=*`, { headers: SB_HDRS });
      if (res.ok) {
        const data = await res.json();
        const cat = Array.isArray(data) ? data[0] : data;
        if (cat) {
          const prodRes = await fetch(`${SB_URL}/rest/v1/products?category_id=eq.${cat.id}&available=eq.true&select=*,product_images(url)`, { headers: SB_HDRS });
          const products = prodRes.ok ? await prodRes.json() : [];
          return { data: { category: cat, products: Array.isArray(products) ? products : [] } };
        }
      }
    } catch (e) {
      console.warn('Supabase categoryBySlug fallback:', e);
    }
    return api.get(`/categories/${slug}`);
  },

  // Admin: Get all categories (including hidden)
  getAllAdmin: async () => {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/categories?select=*&order=sort_order.asc`, { headers: SB_HDRS });
      if (res.ok) {
        const data = await res.json();
        return { data: Array.isArray(data) ? data : [] };
      }
    } catch (e) {
      console.warn('Supabase getAllAdmin fallback:', e);
    }
    return api.get('/categories/admin');
  },

  // Admin: Create category
  createCategory: async (data) => {
    const slug = slugify(data.name || '');
    const payload = {
      name: data.name.trim(),
      slug,
      description: data.description || null,
      image_url: data.image_url || null,
      sort_order: parseInt(data.sort_order) || 0,
      visible: data.visible !== false && data.visible !== 'false',
    };
    const res = await fetch(`${SB_URL}/rest/v1/categories`, {
      method: 'POST',
      headers: SB_HDRS,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create category (${res.status})`);
    }
    const created = await res.json();
    return { data: Array.isArray(created) ? created[0] : created };
  },

  // Admin: Update category
  updateCategory: async (id, data) => {
    const updates = { ...data };
    if (data.name) updates.slug = slugify(data.name);
    updates.updated_at = new Date().toISOString();
    const res = await fetch(`${SB_URL}/rest/v1/categories?id=eq.${id}`, {
      method: 'PATCH',
      headers: SB_HDRS,
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to update category (${res.status})`);
    }
    const updated = await res.json();
    return { data: Array.isArray(updated) ? updated[0] : updated };
  },

  // Admin: Delete category (safely unlinks products first so foreign key doesn't block deletion)
  deleteCategory: async (id) => {
    // 1. Unlink any products currently in this category
    try {
      await fetch(`${SB_URL}/rest/v1/products?category_id=eq.${id}`, {
        method: 'PATCH',
        headers: SB_HDRS,
        body: JSON.stringify({ category_id: null }),
      });
    } catch (e) {
      console.warn('Could not unlink products prior to category deletion:', e);
    }

    // 2. Delete the category
    const res = await fetch(`${SB_URL}/rest/v1/categories?id=eq.${id}`, {
      method: 'DELETE',
      headers: SB_HDRS,
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to delete category (${res.status})`);
    }
    return { data: {} };
  },
};
