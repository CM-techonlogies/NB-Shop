import api from './api';

const SB_URL  = 'https://piygryklvabdalutgkoj.supabase.co';
const SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWdyeWtsdmFiZGFsdXRna29qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2MDc3MSwiZXhwIjoyMTAwNTM2NzcxfQ.oMDow1PoBG1YHVSrPYIovh2fHcArZWxJTHw8QAkp9e8';
const SB_HDRS = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const slugify  = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function supabasePatchProduct(productId, patch) {
  try {
    const url = `${SB_URL}/rest/v1/products?id=eq.${productId}`;
    await fetch(url, {
      method: 'PATCH',
      headers: SB_HDRS,
      body: JSON.stringify(patch),
    });
  } catch (e) {
    console.error('supabasePatchProduct error:', e);
  }
}

export const productService = {
  // Get products with filters, search, pagination
  getProducts: async (params = {}) => {
    try {
      let url = `${SB_URL}/rest/v1/products?select=*,categories(id,name,slug),product_images(id,url,public_id)&order=created_at.desc`;
      if (params.category) {
        url += `&category_id=eq.${params.category}`;
      }
      if (params.available !== undefined) {
        url += `&available=eq.${params.available}`;
      }
      if (params.featured) {
        url += `&featured=eq.true`;
      }
      if (params.trending) {
        url += `&trending=eq.true`;
      }
      if (params.search && params.search.trim()) {
        url += `&name=ilike.*${encodeURIComponent(params.search.trim())}*`;
      }
      if (params.limit) {
        url += `&limit=${params.limit}`;
      }
      const res = await fetch(url, { headers: SB_HDRS });
      if (res.ok) {
        const data = await res.json();
        return { data: { data: Array.isArray(data) ? data : [], total: Array.isArray(data) ? data.length : 0 } };
      }
    } catch (e) {
      console.warn('Supabase getProducts fallback to API:', e);
    }
    return api.get('/products', { params });
  },

  getProductById: async (id) => {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}&select=*,categories(id,name,slug),product_images(id,url,public_id)`, { headers: SB_HDRS });
      if (res.ok) {
        const data = await res.json();
        const prod = Array.isArray(data) ? data[0] : data;
        if (prod) return { data: { data: prod } };
      }
    } catch (e) {
      console.warn('Supabase getProductById fallback:', e);
    }
    return api.get(`/products/${id}`);
  },

  getFeatured: async () => {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/products?featured=eq.true&available=eq.true&select=*,categories(id,name,slug),product_images(id,url,public_id)&limit=12`, { headers: SB_HDRS });
      if (res.ok) {
        const data = await res.json();
        return { data: Array.isArray(data) ? data : [] };
      }
    } catch (e) {
      console.warn('Supabase getFeatured fallback:', e);
    }
    return api.get('/products/featured');
  },

  getTrending: async () => {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/products?trending=eq.true&available=eq.true&select=*,categories(id,name,slug),product_images(id,url,public_id)&limit=12`, { headers: SB_HDRS });
      if (res.ok) {
        const data = await res.json();
        return { data: Array.isArray(data) ? data : [] };
      }
    } catch (e) {
      console.warn('Supabase getTrending fallback:', e);
    }
    return api.get('/products/trending');
  },

  getNewArrivals: async () => {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/products?available=eq.true&order=created_at.desc&select=*,categories(id,name,slug),product_images(id,url,public_id)&limit=12`, { headers: SB_HDRS });
      if (res.ok) {
        const data = await res.json();
        return { data: Array.isArray(data) ? data : [] };
      }
    } catch (e) {
      console.warn('Supabase getNewArrivals fallback:', e);
    }
    return api.get('/products/new-arrivals');
  },

  // Admin — Create product
  createProduct: async (data) => {
    const slug = slugify(data.name || '');
    const discount = data.mrp > 0
      ? Math.round(((parseFloat(data.mrp) - parseFloat(data.price)) / parseFloat(data.mrp)) * 100)
      : 0;

    const payload = {
      name: data.name.trim(),
      slug,
      description: data.description || null,
      category_id: data.category_id || null,
      brand: data.brand || null,
      mrp: parseFloat(data.mrp),
      price: parseFloat(data.price),
      discount,
      stock: parseInt(data.stock) || 0,
      weight: data.weight ? String(data.weight) : null,
      unit: data.unit || 'kg',
      is_loose: Boolean(data.is_loose),
      min_quantity: data.is_loose && data.min_quantity ? parseFloat(data.min_quantity) : null,
      available: data.available !== false,
      featured: Boolean(data.featured),
      trending: Boolean(data.trending),
      tags: Array.isArray(data.tags) ? data.tags : [],
    };

    const res = await fetch(`${SB_URL}/rest/v1/products`, {
      method: 'POST',
      headers: SB_HDRS,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create product (${res.status})`);
    }
    const created = await res.json();
    const newProd = Array.isArray(created) ? created[0] : created;

    // Handle images
    const imageUrls = Array.isArray(data.images) ? data.images.filter(u => u && u.trim()) : [];
    if (newProd?.id && imageUrls.length > 0) {
      const imgPayload = imageUrls.map(url => ({ product_id: newProd.id, url, public_id: null }));
      await fetch(`${SB_URL}/rest/v1/product_images`, {
        method: 'POST',
        headers: SB_HDRS,
        body: JSON.stringify(imgPayload),
      });
    }

    return { data: newProd };
  },

  // Admin — Update product
  updateProduct: async (id, data) => {
    const updates = {};
    if (data.name) {
      updates.name = data.name.trim();
      updates.slug = slugify(data.name);
    }
    if (data.description !== undefined) updates.description = data.description || null;
    if (data.category_id !== undefined) updates.category_id = data.category_id || null;
    if (data.brand !== undefined) updates.brand = data.brand || null;
    if (data.mrp !== undefined) updates.mrp = parseFloat(data.mrp);
    if (data.price !== undefined) updates.price = parseFloat(data.price);
    if (data.stock !== undefined) updates.stock = parseInt(data.stock) || 0;
    if (data.weight !== undefined) updates.weight = data.weight ? String(data.weight) : null;
    if (data.unit !== undefined) updates.unit = data.unit || 'kg';
    if (data.is_loose !== undefined) updates.is_loose = Boolean(data.is_loose);
    if (data.min_quantity !== undefined) updates.min_quantity = data.min_quantity ? parseFloat(data.min_quantity) : null;
    if (data.available !== undefined) updates.available = Boolean(data.available);
    if (data.featured !== undefined) updates.featured = Boolean(data.featured);
    if (data.trending !== undefined) updates.trending = Boolean(data.trending);
    if (data.tags !== undefined) updates.tags = Array.isArray(data.tags) ? data.tags : [];

    if (updates.mrp && updates.price) {
      updates.discount = Math.round(((updates.mrp - updates.price) / updates.mrp) * 100);
    }
    updates.updated_at = new Date().toISOString();

    const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: SB_HDRS,
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to update product (${res.status})`);
    }

    // Handle images if supplied
    if (Array.isArray(data.images)) {
      const validUrls = data.images.filter(u => u && u.trim());
      await fetch(`${SB_URL}/rest/v1/product_images?product_id=eq.${id}`, {
        method: 'DELETE',
        headers: SB_HDRS,
      });
      if (validUrls.length > 0) {
        const imgPayload = validUrls.map(url => ({ product_id: id, url, public_id: null }));
        await fetch(`${SB_URL}/rest/v1/product_images`, {
          method: 'POST',
          headers: SB_HDRS,
          body: JSON.stringify(imgPayload),
        });
      }
    }

    const updated = await res.json().catch(() => ({}));
    return { data: Array.isArray(updated) ? updated[0] : updated };
  },

  // Admin — Delete product
  deleteProduct: async (id) => {
    await fetch(`${SB_URL}/rest/v1/product_images?product_id=eq.${id}`, {
      method: 'DELETE',
      headers: SB_HDRS,
    });
    const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'DELETE',
      headers: SB_HDRS,
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete product (${res.status})`);
    }
    return { data: {} };
  },

  toggleAvailability: async (id, currentAvailable) => {
    const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: SB_HDRS,
      body: JSON.stringify({ available: !currentAvailable }),
    });
    if (!res.ok) throw new Error('Failed to toggle availability');
    return { data: {} };
  },

  toggleLoose: async (id, currentIsLoose) => {
    const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: SB_HDRS,
      body: JSON.stringify({ is_loose: !currentIsLoose }),
    });
    if (!res.ok) throw new Error('Failed to toggle product type');
    return { data: {} };
  },

  updateStock: async (id, stock) => {
    const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: SB_HDRS,
      body: JSON.stringify({ stock: parseInt(stock) || 0 }),
    });
    if (!res.ok) throw new Error('Failed to update stock');
    return { data: {} };
  },
};

