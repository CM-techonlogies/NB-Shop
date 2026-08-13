import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { SkeletonCategoryCard } from '../../components/ui/Skeleton';
import { useCategories, useBanners } from '../../hooks/useProducts';
import { useLanguageStore } from '../../store/languageStore';
import CategoryProductSection from '../../components/home/CategoryProductSection';
import { STORE_NAME, SAMPLE_CATEGORIES } from '../../constants';

const heroSlides = [
  {
    title: 'Fresh Groceries\nDelivered Fast',
    subtitle: 'Shop from 500+ products at best prices',
    bg: 'from-orange-600 via-primary-500 to-yellow-400',
    emoji: '🛒',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    title: 'Daily Essentials\nat Your Door',
    subtitle: 'Rice, Atta, Oil, Spices & more',
    bg: 'from-green-700 via-green-500 to-teal-400',
    emoji: '🌾',
    cta: 'Browse Categories',
    link: '/categories',
  },
  {
    title: 'Big Savings\nEvery Day',
    subtitle: 'Upto 30% off on selected items',
    bg: 'from-purple-700 via-purple-500 to-pink-400',
    emoji: '🎉',
    cta: 'See Deals',
    link: '/products?featured=true',
  },
];

const CATEGORY_EMOJIS = {
  'Rice & Atta': '🌾', 'Oil & Ghee': '🫙', 'Spices': '🌶️',
  'Pulses': '🫘', 'Tea & Coffee': '☕', 'Cold Drinks': '🥤',
  'Snacks': '🍿', 'Cleaning': '🧹', 'Personal Care': '🧴', 'Dairy': '🥛',
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguageStore();

  const { data: dbBanners } = useBanners();
  const activeBanners = Array.isArray(dbBanners) ? dbBanners : [];

  const allSlides = [
    ...activeBanners.map(b => ({ isDb: true, ...b })),
    ...heroSlides.map(s => ({ isDb: false, ...s })),
  ];

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.data || SAMPLE_CATEGORIES);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="animate-fadeIn">
      <Helmet>
        <title>NB Shop - Your Nearby Grocery Store</title>
        <meta name="description" content='M/s NAVARAM BHUBAJI - "सभी प्रकार की किराना & प्रोविजनल आइटम्स उपलब्ध..."' />
        <meta property="og:title" content="NB Shop - Your Nearby Grocery Store" />
        <meta property="og:description" content='M/s NAVARAM BHUBAJI - "सभी प्रकार की किराना & प्रोविजनल आइटम्स उपलब्ध..."' />
      </Helmet>

      {/* ── Hero Swiper ─────────────────────────────────────── */}
      <div className="-mx-3 md:-mx-6 mb-6 rounded-2xl overflow-hidden shadow-lg">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-56 md:h-80"
        >
          {allSlides.map((slide, i) => (
            <SwiperSlide key={slide.id || slide._id || i}>
              {slide.isDb ? (
                <Link to={slide.link || '/products'} className="block h-full w-full relative group">
                  <img
                    src={slide.image_url}
                    alt={slide.title || 'Promo Banner'}
                    className="w-full h-full object-cover"
                  />
                  {slide.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 text-white">
                      <h2 className="text-xl md:text-3xl font-black font-heading drop-shadow-md">
                        {slide.title}
                      </h2>
                    </div>
                  )}
                </Link>
              ) : (
                <div className={`h-full bg-gradient-to-r ${slide.bg} flex items-center px-6 md:px-16 relative overflow-hidden`}>
                  <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 text-8xl md:text-9xl opacity-20 select-none animate-pulse-slow">
                    {slide.emoji}
                  </div>
                  <div className="relative z-10">
                    <h1
                      className="text-3xl md:text-5xl font-heading font-black text-white leading-tight mb-3 md:mb-4 drop-shadow-md"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {slide.title}
                    </h1>
                    <p className="text-white/90 text-sm md:text-lg mb-5 font-medium">{slide.subtitle}</p>
                    <Link
                      to={slide.link}
                      className="inline-block bg-white text-primary-600 font-bold text-sm md:text-lg py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 transform hover:-translate-y-1"
                    >
                      {slide.cta} →
                    </Link>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Search Bar ──────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`🔍 ${t('search_placeholder')}`}
            className="flex-1 bg-white border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 rounded-2xl px-5 py-4 text-gray-800 text-sm outline-none transition-all shadow-sm"
          />
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
          >
            {t('search_btn')}
          </button>
        </div>
      </form>

      {/* ── Category Pills (horizontal scroll) ──────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold font-heading text-gray-800">{t('shop_by_category')}</h2>
          <Link to="/categories" className="text-primary-500 text-sm font-semibold hover:underline">
            {t('see_all')} →
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3 pt-1 px-1">
          {categoriesLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCategoryCard key={i} />)
            : categories.slice(0, 12).map(cat => {
                const catImg = cat.image_url || cat.image?.url || (typeof cat.image === 'string' ? cat.image : null);
                return (
                  <Link
                    key={cat.id || cat._id}
                    to={`/category/${cat.slug}`}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-white to-primary-50 border border-primary-100 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-all group-hover:scale-110 group-hover:border-primary-300 overflow-hidden">
                      {catImg ? (
                        <img src={catImg} alt={cat.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{CATEGORY_EMOJIS[cat.name] || '🛍️'}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 text-center max-w-[68px] leading-tight group-hover:text-primary-600 transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                );
              })
          }
        </div>
      </motion.section>

      {/* ── Quick Links Banner ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">

        {/* Express Delivery */}
        <Link to="/products" className="group bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#FFF0E6' }}>
            <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
              <path d="M6 31h26v-8l-6-8H6V31z" fill="#FFD0B0" />
              <path d="M32 31h8l-3-10h-5v10z" fill="#FFBA8A" />
              <path d="M6 23h22" stroke="#FF7A3D" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="14" cy="35" r="4" fill="#FF7A3D" />
              <circle cx="14" cy="35" r="1.8" fill="#fff" />
              <circle cx="35" cy="35" r="4" fill="#FF7A3D" />
              <circle cx="35" cy="35" r="1.8" fill="#fff" />
              <path d="M6 15v16M38 31V24" stroke="#FF7A3D" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="40" cy="15" r="5" fill="#FF7A3D" opacity="0.3" />
              <circle cx="40" cy="15" r="3" fill="#FF7A3D" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">{t('express_delivery')}</h3>
            <p className="text-gray-400 text-xs leading-snug">{t('express_desc')}</p>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center self-start group-hover:scale-110 transition-transform" style={{ background: '#FFF0E6' }}>
            <svg className="w-3.5 h-3.5" style={{ color: '#FF7A3D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>

        {/* Best Offers */}
        <Link to="/products?discount=true" className="group bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#EDFBF3' }}>
            <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
              <circle cx="24" cy="24" r="16" fill="#BBF7D0" />
              <circle cx="24" cy="24" r="11" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="4 2.5" />
              <text x="24" y="29" textAnchor="middle" fontSize="15" fontWeight="900" fill="#16A34A" fontFamily="Arial">%</text>
              <circle cx="35" cy="13" r="5" fill="#4ADE80" />
              <path d="M33 13h4M35 11v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">{t('best_offers')}</h3>
            <p className="text-gray-400 text-xs leading-snug">{t('offers_desc')}</p>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center self-start group-hover:scale-110 transition-transform" style={{ background: '#EDFBF3' }}>
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>

        {/* Repeat Order */}
        <Link to="/orders" className="group bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#F0EDFF' }}>
            <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
              <rect x="10" y="22" width="28" height="18" rx="3" fill="#DDD6FE" />
              <rect x="10" y="22" width="28" height="7" rx="3" fill="#7C3AED" />
              <path d="M19 22v7M29 22v7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M19 26h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M24 16c-4.5 0-8 2.5-9 6" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
              <path d="M28 13l4 2-3 3" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">{t('repeat_order')}</h3>
            <p className="text-gray-400 text-xs leading-snug">{t('repeat_desc')}</p>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center self-start group-hover:scale-110 transition-transform" style={{ background: '#F0EDFF' }}>
            <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>

        {/* New Arrivals */}
        <Link to="/products?sort=-createdAt" className="group bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#FFF0F5' }}>
            <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
              <path d="M11 22h26l-3 16H14L11 22z" fill="#FECDD3" />
              <path d="M11 22h26l-3 16H14L11 22z" stroke="#F43F5E" strokeWidth="1.5" />
              <path d="M17 22l4-9M31 22l-4-9" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="30" r="2" fill="#F43F5E" />
              <circle cx="28" cy="30" r="2" fill="#F43F5E" />
              <circle cx="24" cy="34" r="2" fill="#F43F5E" />
              <circle cx="37" cy="12" r="5" fill="#FB7185" />
              <path d="M37 10v2.5l1.5 1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">{t('new_arrivals')}</h3>
            <p className="text-gray-400 text-xs leading-snug">{t('arrivals_desc')}</p>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center self-start group-hover:scale-110 transition-transform" style={{ background: '#FFF0F5' }}>
            <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>

      </div>

      {/* ── Per-Category Product Sections ───────────────────── */}
      {categoriesLoading
        ? // Skeleton placeholders for sections while categories load
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 mb-8 animate-pulse">
              <div className="h-6 w-40 bg-gray-200 rounded mb-5" />
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="flex-shrink-0 w-40 h-52 bg-gray-200 rounded-2xl" />
                ))}
              </div>
            </div>
          ))
        : categories.map((cat, idx) => (
            <CategoryProductSection
              key={cat.id || cat._id}
              category={cat}
              index={idx}
              limit={5}
            />
          ))
      }

      {/* ── Browse All Products CTA ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center py-10 mb-6"
      >
        <p className="text-gray-500 text-sm mb-4">{t('cant_find')}</p>
        <Link
          to="/products"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-base"
        >
          {t('browse_all_products')}
        </Link>
      </motion.div>
    </div>
  );
}
