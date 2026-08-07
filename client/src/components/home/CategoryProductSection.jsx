import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProductsByCategory } from '../../hooks/useProducts';
import ProductCard from '../product/ProductCard';
import { SkeletonProductCard } from '../ui/Skeleton';

const CATEGORY_EMOJIS = {
  'Rice & Atta': '🌾', 'Oil & Ghee': '🫙', 'Spices': '🌶️',
  'Pulses': '🫘', 'Tea & Coffee': '☕', 'Cold Drinks': '🥤',
  'Snacks': '🍿', 'Cleaning': '🧹', 'Personal Care': '🧴', 'Dairy': '🥛',
};

const SECTION_GRADIENTS = [
  'from-orange-50 to-amber-50 border-orange-100',
  'from-green-50 to-teal-50 border-green-100',
  'from-purple-50 to-violet-50 border-purple-100',
  'from-blue-50 to-cyan-50 border-blue-100',
  'from-rose-50 to-pink-50 border-rose-100',
  'from-yellow-50 to-lime-50 border-yellow-100',
];

const HEADER_COLORS = [
  'text-orange-600', 'text-green-700', 'text-purple-700',
  'text-blue-700',  'text-rose-700',  'text-yellow-700',
];

const VIEW_MORE_COLORS = [
  'bg-orange-500 hover:bg-orange-600',
  'bg-green-600  hover:bg-green-700',
  'bg-purple-600 hover:bg-purple-700',
  'bg-blue-600   hover:bg-blue-700',
  'bg-rose-600   hover:bg-rose-700',
  'bg-yellow-500 hover:bg-yellow-600',
];

/**
 * A single horizontal-scroll section for one category, showing up to `limit` products
 */
export default function CategoryProductSection({ category, index, limit = 5 }) {
  const colorIdx = index % SECTION_GRADIENTS.length;
  const { data: products = [], isLoading } = useProductsByCategory(
    category.id || category._id,
    limit
  );

  // Don't render section if no products and not loading
  if (!isLoading && products.length === 0) return null;

  const catImg = category.image_url || category.image?.url || (typeof category.image === 'string' ? category.image : null);
  const emoji   = CATEGORY_EMOJIS[category.name] || '🛍️';
  const slug    = category.slug;
  const catLink = `/category/${slug}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className={`rounded-2xl border bg-gradient-to-r ${SECTION_GRADIENTS[colorIdx]} p-5 mb-8`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl overflow-hidden border border-gray-100 flex-shrink-0">
            {catImg ? (
              <img src={catImg} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <span>{emoji}</span>
            )}
          </div>
          <div>
            <h2 className={`text-lg md:text-xl font-black font-heading ${HEADER_COLORS[colorIdx]}`}>
              {category.name}
            </h2>
            {category.description && (
              <p className="text-xs text-gray-500 mt-0.5 hidden md:block">{category.description}</p>
            )}
          </div>
        </div>
        <Link
          to={catLink}
          className="text-sm font-semibold text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Horizontal Scroll Product Strip */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {isLoading
          ? Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40 md:w-48">
                <SkeletonProductCard />
              </div>
            ))
          : products.map(product => (
              <div key={product.id || product._id} className="flex-shrink-0 w-40 md:w-48">
                <ProductCard product={product} />
              </div>
            ))
        }

        {/* View More Tile */}
        {!isLoading && products.length >= limit && (
          <Link
            to={catLink}
            className="flex-shrink-0 w-40 md:w-48 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-white/70 hover:bg-white transition-all group min-h-[200px]"
          >
            {catImg ? (
              <img src={catImg} alt={category.name} className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:scale-110 transition-transform p-0.5 border" />
            ) : (
              <span className="text-4xl group-hover:scale-110 transition-transform">{emoji}</span>
            )}
            <div className="text-center px-2">
              <p className="text-sm font-bold text-gray-700">View More</p>
              <p className="text-xs text-gray-400 mt-0.5">{category.name}</p>
            </div>
            <div className={`text-white text-xs font-bold px-4 py-1.5 rounded-full shadow ${VIEW_MORE_COLORS[colorIdx]}`}>
              See All →
            </div>
          </Link>
        )}
      </div>
    </motion.section>
  );
}
