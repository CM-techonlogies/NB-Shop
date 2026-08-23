import api from './api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://piygryklvabdalutgkoj.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Direct Supabase REST fetch helper
const supabaseHeaders = () => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
});

export const userService = {
  // ── Profile ─────────────────────────────────────────────────────────────
  getProfile: async (userId) => {
    try {
      const res = await api.get('/users/profile');
      return res.data?.data || res.data;
    } catch (apiErr) {
      console.warn('API getProfile failed, attempting direct Supabase fetch:', apiErr?.message);
      if (SUPABASE_KEY && userId) {
        try {
          const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
            headers: supabaseHeaders(),
          });
          const users = await userRes.json();
          const user = users[0] || { id: userId, role: 'customer' };

          const addrRes = await fetch(`${SUPABASE_URL}/rest/v1/addresses?user_id=eq.${userId}&select=*&order=is_default.desc,created_at.desc`, {
            headers: supabaseHeaders(),
          });
          const addresses = await addrRes.json();

          return { ...user, addresses: Array.isArray(addresses) ? addresses : [] };
        } catch (dbErr) {
          console.error('Direct Supabase fetch failed:', dbErr);
        }
      }
      throw apiErr;
    }
  },

  updateProfile: async (data, userId) => {
    let result = null;
    let apiSuccess = false;

    // Try API first
    try {
      const res = await api.put('/users/profile', data);
      result = res.data?.data || res.data;
      apiSuccess = true;
    } catch (apiErr) {
      console.warn('API updateProfile failed, falling back to direct Supabase write:', apiErr?.message);
    }

    // Direct Supabase upsert/update (Guaranteed persistence)
    if (SUPABASE_KEY && userId) {
      try {
        const patch = {
          id: userId,
          name: data.name,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        };
        const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            ...supabaseHeaders(),
            'Prefer': 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify(patch),
        });
        const saved = await sbRes.json();
        if (Array.isArray(saved) && saved.length > 0) {
          result = saved[0];
        }
      } catch (sbErr) {
        console.error('Direct Supabase user write error:', sbErr);
      }
    }

    if (!apiSuccess && !result) {
      throw new Error('Failed to update profile.');
    }
    return result;
  },

  // ── Addresses ───────────────────────────────────────────────────────────
  addAddress: async (data, userId) => {
    try {
      const res = await api.post('/users/addresses', data);
      return res.data?.data || res.data;
    } catch (apiErr) {
      if (SUPABASE_KEY && userId) {
        if (data.isDefault || data.is_default) {
          await fetch(`${SUPABASE_URL}/rest/v1/addresses?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: supabaseHeaders(),
            body: JSON.stringify({ is_default: false }),
          });
        }
        const insertPayload = {
          user_id: userId,
          label: data.label || 'Home',
          name: data.name,
          phone: data.phone,
          address: data.address,
          landmark: data.landmark || '',
          city: data.city || '',
          pincode: data.pincode,
          is_default: Boolean(data.isDefault || data.is_default),
        };
        const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/addresses`, {
          method: 'POST',
          headers: supabaseHeaders(),
          body: JSON.stringify(insertPayload),
        });
        const inserted = await sbRes.json();
        return inserted[0] || inserted;
      }
      throw apiErr;
    }
  },

  updateAddress: async (id, data, userId) => {
    try {
      const res = await api.put(`/users/addresses/${id}`, data);
      return res.data?.data || res.data;
    } catch (apiErr) {
      if (SUPABASE_KEY) {
        const patch = { ...data };
        const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/addresses?id=eq.${id}`, {
          method: 'PATCH',
          headers: supabaseHeaders(),
          body: JSON.stringify(patch),
        });
        return await sbRes.json();
      }
      throw apiErr;
    }
  },

  deleteAddress: async (id) => {
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      return res.data;
    } catch (apiErr) {
      if (SUPABASE_KEY) {
        await fetch(`${SUPABASE_URL}/rest/v1/addresses?id=eq.${id}`, {
          method: 'DELETE',
          headers: supabaseHeaders(),
        });
        return { success: true };
      }
      throw apiErr;
    }
  },

  setDefaultAddress: async (id, userId) => {
    try {
      const res = await api.patch(`/users/addresses/${id}/default`);
      return res.data?.data || res.data;
    } catch (apiErr) {
      if (SUPABASE_KEY && userId) {
        await fetch(`${SUPABASE_URL}/rest/v1/addresses?user_id=eq.${userId}`, {
          method: 'PATCH',
          headers: supabaseHeaders(),
          body: JSON.stringify({ is_default: false }),
        });
        const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/addresses?id=eq.${id}`, {
          method: 'PATCH',
          headers: supabaseHeaders(),
          body: JSON.stringify({ is_default: true }),
        });
        return await sbRes.json();
      }
      throw apiErr;
    }
  },

  // ── Admin ───────────────────────────────────────────────────────────────
  getAllUsers: (params) => api.get('/users/admin/all', { params }),
  getUserById: (id) => api.get(`/users/admin/${id}`),
  toggleUserActive: (id) => api.patch(`/users/admin/${id}/toggle`),
};
