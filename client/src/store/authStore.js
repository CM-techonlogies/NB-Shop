import { create } from 'zustand';
import useCartStore from './cartStore';

// Store kept for backward compatibility
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    useCartStore.getState().clearCart();
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
