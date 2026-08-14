import { create } from 'zustand';
import { DELIVERY_CHARGE, FREE_DELIVERY_ABOVE } from '../constants';

const getStorageKey = (userId) => `kirana_cart_${userId || 'guest'}`;

const loadSavedCart = (userId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Failed to load user cart:', e);
  }
  return [];
};

const saveUserCart = (userId, items) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(items || []));
  } catch (e) {
    console.error('Failed to save user cart:', e);
  }
};

const matchId = (item, targetId) => {
  if (!item || targetId === undefined || targetId === null) return false;
  return String(item.id || item._id) === String(targetId);
};

const initialUserId = 'guest';

const useCartStore = create((set, get) => ({
  items: loadSavedCart(initialUserId),
  currentUserId: initialUserId,
  deliveryCharge: DELIVERY_CHARGE,

  // Load user-specific cart when user logs in or switches (merges guest cart into user cart)
  loadUserCart: (userId) => {
    const activeUserId = userId || 'guest';
    if (activeUserId === 'guest') {
      const guestItems = loadSavedCart('guest');
      set({ currentUserId: 'guest', items: guestItems });
      return;
    }

    const savedUserItems = loadSavedCart(activeUserId);
    const guestItems = loadSavedCart('guest');

    if (Array.isArray(guestItems) && guestItems.length > 0) {
      // Seamlessly merge guest items into the user's saved cart
      const merged = [...savedUserItems];
      guestItems.forEach((gItem) => {
        const key = gItem.id || gItem._id;
        const existingIdx = merged.findIndex((i) => matchId(i, key));
        if (existingIdx >= 0) {
          if (gItem.customQty !== undefined) {
            merged[existingIdx] = { ...merged[existingIdx], customQty: gItem.customQty };
          } else {
            merged[existingIdx] = {
              ...merged[existingIdx],
              qty: (merged[existingIdx].qty || 1) + (gItem.qty || 1),
            };
          }
        } else {
          merged.push(gItem);
        }
      });

      // Clear guest cart so it doesn't duplicate on next login
      saveUserCart('guest', []);
      // Save the merged cart under current user ID
      saveUserCart(activeUserId, merged);
      set({ currentUserId: activeUserId, items: merged });
    } else {
      set({ currentUserId: activeUserId, items: savedUserItems });
    }
  },

  // Clear current UI cart items (e.g. after order placed), and update storage
  clearCart: () => {
    const { currentUserId } = get();
    saveUserCart(currentUserId, []);
    set({ items: [] });
  },

  // Logout reset: reset active screen state to guest, preserving user's saved cart in localStorage
  logoutReset: () => {
    const guestItems = loadSavedCart('guest');
    set({ currentUserId: 'guest', items: guestItems });
  },

  addItem: (product) => set((state) => {
    const key = product.id || product._id;
    if (key === undefined || key === null) return state;

    const currentItems = Array.isArray(state.items) ? state.items : [];
    const existing = currentItems.find(i => matchId(i, key));

    let updated;
    if (existing) {
      if (product.customQty !== undefined) {
        // Loose item: replace customQty (re-selected from dialog)
        updated = currentItems.map(i =>
          matchId(i, key) ? { ...i, customQty: product.customQty } : i
        );
      } else {
        updated = currentItems.map(i =>
          matchId(i, key) ? { ...i, qty: (i.qty || 1) + 1 } : i
        );
      }
    } else {
      updated = [...currentItems, { ...product, id: key, qty: 1 }];
    }
    saveUserCart(state.currentUserId, updated);
    return { items: updated };
  }),

  getItem: (id) => {
    const { items } = useCartStore.getState();
    return (Array.isArray(items) ? items : []).find(i => matchId(i, id)) || null;
  },

  removeItem: (id) => set((state) => {
    const currentItems = Array.isArray(state.items) ? state.items : [];
    const updated = currentItems.filter(i => !matchId(i, id));
    saveUserCart(state.currentUserId, updated);
    return { items: updated };
  }),

  updateQty: (id, qty) => set((state) => {
    const currentItems = Array.isArray(state.items) ? state.items : [];
    const targetQty = parseInt(qty, 10);
    let updated;
    if (isNaN(targetQty) || targetQty <= 0) {
      updated = currentItems.filter(i => !matchId(i, id));
    } else {
      updated = currentItems.map(i => matchId(i, id) ? { ...i, qty: targetQty } : i);
    }
    saveUserCart(state.currentUserId, updated);
    return { items: updated };
  }),
}));

export default useCartStore;
