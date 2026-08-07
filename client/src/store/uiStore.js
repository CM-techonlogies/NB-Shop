import { create } from 'zustand';

const useUiStore = create((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  searchQuery: '',
  recentSearches: [],
  
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addRecentSearch: (term) => set((state) => ({
    recentSearches: [term, ...state.recentSearches.filter(t => t !== term)].slice(0, 5)
  })),
}));

export default useUiStore;
