import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useLanguageStore } from '../../store/languageStore';
import { formatPrice, formatDiscount } from '../../utils/formatPrice';

export default function ProductCard({ product }) {
  const { addToCart, updateQuantity, removeFromCart, getQty } = useCart();
  const { t } = useLanguageStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productId = product.id || product._id;
  const qty = getQty(productId);
  const isOutOfStock = product.stock <= 0;
  const discount = formatDiscount(product.mrp, product.price);

  const rawImageUrl =
    product.product_images?.[0]?.url ||
    product.images?.[0]?.url ||
    product.image ||
    null;

  // Mock rating & review count for display if not present
  const rating = product.rating || (4.5 + ((productId.charCodeAt(0) % 5) * 0.1)).toFixed(1);
  const reviewCount = product.reviewCount || (50 + (productId.charCodeAt(0) * 12));

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) addToCart(product);
  };

  const handleInc = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty < product.stock) updateQuantity(productId, qty + 1);
  };

  const handleDec = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty <= 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, qty - 1);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link
      to={`/product/${productId}`}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden p-3 md:p-4"
    >
      {/* Top Bar: Badge (left) & Wishlist (right) */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div>
          {discount > 0 ? (
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
              {discount}% OFF
            </span>
          ) : product.trending ? (
            <span className="bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
              TRENDING
            </span>
          ) : product.featured ? (
            <span className="bg-purple-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
              BEST SELLER
            </span>
          ) : null}
        </div>

        <button
          onClick={toggleWishlist}
          className="p-1.5 rounded-full bg-white/80 hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors shadow-xs"
          title="Add to Wishlist"
        >
          <svg
            className={`w-5 h-5 transition-transform active:scale-125 ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'fill-none stroke-current stroke-2'
            }`}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50/50 rounded-xl p-3 flex items-center justify-center mb-3">
        {rawImageUrl ? (
          <img
            src={rawImageUrl}
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl text-gray-300">🛒</span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-primary-600 transition-colors leading-tight">
          {product.name}
        </h3>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            ★ {rating}
          </span>
          <span className="text-xs text-gray-400 font-medium">({reviewCount.toLocaleString()})</span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-base font-black text-gray-900">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through font-medium">{formatPrice(product.mrp)}</span>
          )}
          {discount > 0 && (
            <span className="text-xs font-bold text-emerald-600">{discount}% OFF</span>
          )}
        </div>

        {/* Delivery Tag */}
        <div className="text-xs text-gray-500 flex items-center gap-1 mb-4 font-medium">
          <span>{product.price >= 499 ? '🚚 Free Delivery' : '⚡ Fast Delivery'}</span>
        </div>

        {/* Action Button / Quantity Counter */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center">
          {qty > 0 ? (
            <div
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-full flex items-center justify-between border-2 border-primary-500 rounded-xl bg-primary-50 h-10 px-1 text-xs font-bold text-primary-700 shadow-2xs"
            >
              <button
                type="button"
                onClick={handleDec}
                className="w-9 h-full flex items-center justify-center text-primary-700 hover:bg-primary-200/60 font-black text-base rounded-lg transition-colors active:scale-125"
                title="Decrease quantity"
              >
                −
              </button>
              <span className="font-extrabold text-primary-900 font-heading">
                {qty} {t('in_cart')}
              </span>
              <button
                type="button"
                onClick={handleInc}
                disabled={qty >= product.stock}
                className="w-9 h-full flex items-center justify-center text-primary-700 hover:bg-primary-200/60 font-black text-base rounded-lg transition-colors active:scale-125 disabled:opacity-30"
                title="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="w-full h-10 rounded-xl font-bold text-xs shadow-sm bg-primary-500 hover:bg-primary-600 active:scale-95 text-white transition-all flex items-center justify-center gap-1.5 shadow-primary-500/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? t('out_of_stock') : t('add_to_cart')}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
