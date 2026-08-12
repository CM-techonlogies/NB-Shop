import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductGrid from '../../components/product/ProductGrid';
import ProductCard from '../../components/product/ProductCard';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { STORE_NAME } from '../../constants';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

const SORT_OPTIONS = [
  { id: '-createdAt', label: '↓↑ Newest First', icon: '↓↑' },
  { id: 'trending', label: 'Popularity', icon: '🍵' },
  { id: 'featured', label: 'Best Selling', icon: '🏆' },
  { id: 'price_asc', label: 'Price: Low to High', icon: '↑' },
  { id: 'price_desc', label: 'Price: High to Low', icon: '↓' },
  { id: 'rating', label: 'Highest Rated', icon: '⭐' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search params state
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || '-createdAt';
  const initialDiscountOnly = searchParams.get('discount') === 'true';

  // State management
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [subCategory, setSubCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState(initialSort);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [discountOnly, setDiscountOnly] = useState(initialDiscountOnly); // filter: mrp > price
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState([]);
  const [selectedSpecialOffers, setSelectedSpecialOffers] = useState([]);
  const [selectedOthers, setSelectedOthers] = useState([]);

  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // ── Sync state when URL params change (e.g. navigating from Navbar search) ──
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlSort = searchParams.get('sort') || '-createdAt';
    setSearch(urlSearch);
    setCategory(urlCategory);
    setSort(urlSort);
    setPage(1);
  }, [searchParams]);

  // Fetch categories
  const { data: categoriesRaw } = useCategories();
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : (categoriesRaw?.data || []);

  // Fetch products
  const { data: productsData, isLoading } = useProducts({
    search: search || undefined,
    category: category || undefined,
    sort: sort === 'trending' || sort === 'featured' || sort === 'rating' ? undefined : sort,
    trending: sort === 'trending' ? 'true' : undefined,
    featured: sort === 'featured' ? 'true' : undefined,
    page,
  });

  const rawProducts = productsData?.data || [];
  const totalCount = productsData?.total || rawProducts.length;

  // Dynamically extract unique brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set();
    rawProducts.forEach(p => { if (p.brand) brands.add(p.brand); });
    return Array.from(brands);
  }, [rawProducts]);

  // Client-side filtering for sub-filters (Price, Discount, Rating, Stock, Delivery)
  const filteredProducts = useMemo(() => {
    return rawProducts.filter(p => {
      // Price filter
      if (p.price > maxPrice) return false;

      // Brand filter
      if (brand && p.brand !== brand) return false;

      // Availability filter
      if (selectedAvailability.includes('inStock') && p.stock <= 0) return false;
      if (selectedAvailability.includes('outOfStock') && p.stock > 0) return false;

      // Best Offers / Discount-only filter (products where MRP > selling price)
      if (discountOnly) {
        const hasDiscount = parseFloat(p.mrp) > parseFloat(p.price);
        if (!hasDiscount) return false;
      }

      // Discount % filter
      if (selectedDiscounts.length > 0) {
        const discountPct = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
        const matchesDiscount = selectedDiscounts.some(d => discountPct >= parseInt(d));
        if (!matchesDiscount) return false;
      }

      // Delivery filter
      if (selectedDelivery.includes('freeDelivery') && p.price < 499) return false;

      return true;
    });
  }, [rawProducts, maxPrice, brand, selectedAvailability, selectedDiscounts, selectedDelivery, discountOnly]);

  // Active filters list for chips rendering
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (discountOnly) {
      chips.push({ id: 'discountOnly', label: '🏷️ Best Offers (Discounted)', clear: () => setDiscountOnly(false) });
    }
    if (category) {
      const catObj = categories.find(c => (c.id || c._id) === category);
      chips.push({ id: 'category', label: `Cat: ${catObj?.name || 'Selected'}`, clear: () => setCategory('') });
    }
    if (brand) {
      chips.push({ id: 'brand', label: `Brand: ${brand}`, clear: () => setBrand('') });
    }
    if (selectedAvailability.includes('inStock')) {
      chips.push({ id: 'inStock', label: 'In Stock', clear: () => setSelectedAvailability(prev => prev.filter(x => x !== 'inStock')) });
    }
    if (selectedDelivery.includes('freeDelivery')) {
      chips.push({ id: 'freeDelivery', label: 'Free Delivery', clear: () => setSelectedDelivery(prev => prev.filter(x => x !== 'freeDelivery')) });
    }
    if (maxPrice < 5000) {
      chips.push({ id: 'price', label: `Price: ₹0 - \u20b9${maxPrice}`, clear: () => setMaxPrice(5000) });
    }
    if (selectedRatings.length > 0) {
      chips.push({ id: 'rating', label: `Rating: ${selectedRatings.join(', ')} & above`, clear: () => setSelectedRatings([]) });
    }
    return chips;
  }, [category, brand, selectedAvailability, selectedDelivery, maxPrice, selectedRatings, categories, discountOnly]);

  // Toggle helper for multi-checkbox options
  const toggleArrayItem = (setter, item) => {
    setter(prev => (prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]));
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    setSearchParams(params);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleResetAll = () => {
    setSearch('');
    setCategory('');
    setSubCategory('');
    setBrand('');
    setSort('-createdAt');
    setMaxPrice(5000);
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setSelectedAvailability([]);
    setSelectedDelivery([]);
    setSelectedPayment([]);
    setSelectedSpecialOffers([]);
    setSelectedOthers([]);
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Helmet>
        <title>All Products - {STORE_NAME}</title>
      </Helmet>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Mobile Filter Drawer Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden w-full bg-white border border-gray-200 p-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-800 shadow-sm"
        >
          <FunnelIcon className="w-5 h-5 text-primary-500" />
          {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* ── LEFT SIDEBAR FILTERS ─────────────────────────────────── */}
        <aside className={`lg:w-72 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-5 rounded-2xl shadow-card border border-gray-100 sticky top-20 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Header: Filters + Reset All */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold font-heading text-gray-900">Filters</h3>
              </div>
              <button
                onClick={handleResetAll}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Reset All
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-5">
              
              {/* Search */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Sub Category</label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Sub Categories</option>
                  <option value="groceries">Groceries & Staples</option>
                  <option value="beverages">Beverages & Soft Drinks</option>
                  <option value="personal">Personal Care & Hygiene</option>
                  <option value="snacks">Snacks & Packaged Foods</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Brands</option>
                  {availableBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="Milton">Milton</option>
                  <option value="Classmate">Classmate</option>
                  <option value="Cello">Cello</option>
                  <option value="Safari">Safari</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                  <span>Price Range</span>
                  <span className="text-primary-600 font-extrabold">₹{maxPrice}+</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1">
                  <span>₹0</span>
                  <span>₹5000+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              {/* Discount */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">Discount</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-medium">
                  {['10', '20', '30', '50'].map(d => (
                    <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(d)}
                        onChange={() => toggleArrayItem(setSelectedDiscounts, d)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                      />
                      <span>{d}% and above</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">Rating</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-medium">
                  {['5', '4', '3'].map(r => (
                    <label key={r} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(r)}
                        onChange={() => toggleArrayItem(setSelectedRatings, r)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                      />
                      <span className="text-amber-500">{'★'.repeat(Number(r))}</span>
                      <span className="text-[11px] text-gray-400">&amp; above</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">Availability</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-medium">
                  {[
                    { id: 'inStock', label: 'In Stock' },
                    { id: 'outOfStock', label: 'Out of Stock' },
                    { id: 'availableToday', label: 'Available Today' },
                    { id: 'preOrder', label: 'Pre Order' },
                  ].map(item => (
                    <label key={item.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(item.id)}
                        onChange={() => toggleArrayItem(setSelectedAvailability, item.id)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Apply Filters & Clear */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all text-xs"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ───────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          
          {/* Header Title + View Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-heading text-gray-900">
                {initialSearch ? `Search: "${initialSearch}"` : 'All Products'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Showing {filteredProducts.length} of {totalCount} products
              </p>
            </div>

            {/* Grid vs List View Mode Buttons */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Grid View"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                title="List View"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sort By Pills Strip */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-3 mb-4">
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap mr-1">Sort By</span>
            {SORT_OPTIONS.map(opt => {
              const isActive = sort === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => { setSort(opt.id); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-orange-50 border-primary-500 text-primary-600 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Filters Chips Bar */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 p-3 rounded-2xl mb-6">
              <span className="text-xs font-bold text-gray-700 mr-1">Active Filters:</span>
              {activeFilterChips.map(chip => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1 rounded-xl text-xs font-semibold text-gray-800 shadow-2xs"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.clear}
                    className="text-gray-400 hover:text-red-500 transition-colors font-bold text-sm leading-none ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={handleResetAll}
                className="text-xs font-bold text-primary-600 hover:underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products View (Grid or List) */}
          {viewMode === 'grid' ? (
            <ProductGrid products={filteredProducts} isLoading={isLoading} skeletonCount={8} />
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(p => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 mt-4">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                We couldn't find any products matching your active filters or search term.
              </p>
              <button
                onClick={handleResetAll}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all text-xs"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* ── BOTTOM VALUE PROPOSITION BANNER ──────────────────────── */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-orange-50/70 rounded-3xl border border-orange-100/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary-600 flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
                🛡️
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Secure Payment</h4>
                <p className="text-[11px] text-gray-500">100% secure payment</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary-600 flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
                🏷️
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Easy Returns</h4>
                <p className="text-[11px] text-gray-500">7 days return policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary-600 flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
                🚚
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Fast Delivery</h4>
                <p className="text-[11px] text-gray-500">On orders above ₹499</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary-600 flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
                📄
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">GST Invoice</h4>
                <p className="text-[11px] text-gray-500">Available for all orders</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
