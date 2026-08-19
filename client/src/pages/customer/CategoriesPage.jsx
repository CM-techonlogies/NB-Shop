import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCategories } from '../../hooks/useProducts';
import { STORE_NAME } from '../../constants';
import { motion } from 'framer-motion';

const baseUrl = import.meta.env.VITE_CLIENT_URL || '';
const gradients = [
  'from-pink-500 to-rose-400',
  'from-purple-500 to-indigo-500',
  'from-blue-400 to-cyan-400',
  'from-teal-400 to-emerald-400',
  'from-green-500 to-lime-400',
  'from-orange-400 to-amber-400',
  'from-red-400 to-orange-500',
  'from-violet-500 to-fuchsia-500'
];

const CATEGORY_EMOJIS = { 'Rice & Atta': '🌾', 'Oil & Ghee': '🫙', 'Spices': '🌶️', 'Pulses': '🫘', 'Tea & Coffee': '☕', 'Cold Drinks': '🥤', 'Snacks': '🍿', 'Cleaning': '🧹', 'Personal Care': '🧴', 'Dairy': '🥛' };

export default function CategoriesPage() {
  const { data: categoriesRaw, isLoading } = useCategories();
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : (categoriesRaw?.data || []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Helmet>
        <title>All Categories - {STORE_NAME}</title>
      </Helmet>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-5xl font-black font-heading text-gray-900 mb-3">Shop by Category</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-base">Find everything you need for your home, carefully organized for your convenience.</p>
      </div>

      {/* ── Browse All Products Banner ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <Link
          to="/products"
          className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white px-5 py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛍️</span>
            <div className="text-left">
              <p className="font-black text-base leading-tight">Browse All Products</p>
              <p className="text-white/80 text-xs font-medium mt-0.5">
                {isLoading ? 'Loading...' : `${categories.length > 0 ? `${categories.length} categories` : 'All items'} available`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl group-hover:bg-white/30 transition-colors whitespace-nowrap">
              See All →
            </span>
          </div>
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 md:h-56 bg-gray-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
        >
          {categories.map((cat, idx) => {
            const bgClass = gradients[idx % gradients.length];
            const catImg = cat.image_url || cat.image?.url || (typeof cat.image === 'string' ? cat.image : null);
            return (
              <motion.div key={cat.id || cat._id} variants={item}>
                <Link 
                  to={`/category/${cat.slug}`} 
                  className={`group relative flex flex-col items-center justify-center h-48 md:h-64 rounded-[2rem] bg-gradient-to-br ${bgClass} p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
                >
                  {/* Decorative background circle */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative z-10 w-20 h-20 md:w-28 md:h-28 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl md:text-5xl mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                    {catImg ? (
                      <img src={catImg.startsWith('http') || catImg.startsWith('/') || catImg.startsWith('data:') ? catImg : `${baseUrl}/${catImg}`} alt={cat.name} className="w-full h-full rounded-full object-cover p-1" />
                    ) : (
                      <span>{CATEGORY_EMOJIS[cat.name] || '🛍️'}</span>
                    )}
                  </div>
                  
                  <h3 className="relative z-10 text-white font-bold font-heading text-lg md:text-xl text-center leading-tight drop-shadow-md">
                    {cat.name}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
