import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useLanguageStore } from '../../store/languageStore';
import { formatPrice, formatDiscount } from '../../utils/formatPrice';

// ─── Loose Item Quantity Dialog ───────────────────────────────────────────────
function LooseQtyDialog({ product, onConfirm, onClose }) {
  const unit = product.unit || 'kg';
  const minQty = parseFloat(product.min_quantity) || 0;

  const stepMap = { kg: 0.25, g: 50, l: 0.25, ml: 100, pcs: 1, pack: 1, dozen: 1 };
  const step = stepMap[unit] || 0.25;

  const [qty, setQty] = useState(minQty > 0 ? minQty : step);
  const [inputVal, setInputVal] = useState(minQty > 0 ? String(minQty) : String(step));
  const [error, setError] = useState('');

  const presets = unit === 'g'
    ? [100, 250, 500, 1000]
    : unit === 'ml'
    ? [250, 500, 1000]
    : unit === 'kg' || unit === 'l'
    ? [0.25, 0.5, 1, 2, 5]
    : [1, 2, 3, 5];

  const handlePreset = (val) => {
    setQty(val);
    setInputVal(String(val));
    setError('');
  };

  const handleInput = (val) => {
    setInputVal(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setQty(num);
      setError('');
    }
  };

  const handleConfirm = () => {
    const num = parseFloat(inputVal);
    if (!num || num <= 0) { setError('Please enter a valid quantity'); return; }
    if (minQty > 0 && num < minQty) { setError(`Minimum order is ${minQty} ${unit}`); return; }
    onConfirm(num);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">
            ⚖️
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatPrice(product.price)} per {unit}
              {minQty > 0 && <span className="ml-1.5 text-orange-500">• Min: {minQty} {unit}</span>}
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Quick Select</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => handlePreset(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                qty === p
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300'
              }`}
            >
              {p} {unit}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Or Enter Custom</p>
        <div className="flex items-center gap-2 mb-1">
          <input
            type="number"
            min={minQty > 0 ? minQty : step}
            step={step}
            value={inputVal}
            onChange={(e) => handleInput(e.target.value)}
            className="flex-1 p-3 border-2 border-gray-200 focus:border-orange-400 rounded-xl outline-none text-lg font-bold text-gray-900 transition-colors"
            placeholder={`Enter ${unit}...`}
          />
          <span className="text-gray-500 font-bold text-sm bg-gray-100 px-3 py-3 rounded-xl">{unit}</span>
        </div>
        {error && <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>}

        {/* Price Preview */}
        {qty > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Total for {qty} {unit}</span>
            <span className="font-black text-orange-600 text-base">{formatPrice(parseFloat(product.price) * qty)}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-orange-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ProductCard ─────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { addToCart, updateQuantity, removeFromCart, getQty } = useCart();
  const { t } = useLanguageStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLooseDialog, setShowLooseDialog] = useState(false);

  const productId = product.id || product._id;
  const qty = getQty(productId);
  const isOutOfStock = product.stock <= 0;
  const discount = formatDiscount(product.mrp, product.price);
  const isLoose = product.is_loose === true || product.is_loose === 'true';

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
    if (isOutOfStock) return;
    if (isLoose) {
      setShowLooseDialog(true);
    } else {
      addToCart(product);
    }
  };

  const handleLooseConfirm = (qty) => {
    setShowLooseDialog(false);
    // Add with custom loose quantity stored in customQty field
    addToCart({ ...product, customQty: qty, qty: 1 });
  };

  const handleInc = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoose) {
      // For loose items re-open dialog to change quantity
      setShowLooseDialog(true);
    } else {
      if (qty < product.stock) updateQuantity(productId, qty + 1);
    }
  };

  const handleDec = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty <= 1) {
      removeFromCart(productId);
    } else if (!isLoose) {
      updateQuantity(productId, qty - 1);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // Find the cart item to get customQty for loose items
  const cartItem = useCart().getItem ? useCart().getItem(productId) : null;

  return (
    <>
      {showLooseDialog && (
        <LooseQtyDialog
          product={product}
          onConfirm={handleLooseConfirm}
          onClose={() => setShowLooseDialog(false)}
        />
      )}

      <Link
        to={`/product/${productId}`}
        className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden p-3 md:p-4"
      >
        {/* Top Bar: Badge (left) & Wishlist (right) */}
        <div className="flex items-center justify-between z-10 mb-2">
          <div className="flex items-center gap-1">
            {isLoose && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                ⚖️ LOOSE
              </span>
            )}
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
            {product.unit && (
              <span className="text-xs text-gray-400 font-medium">/{product.unit}</span>
            )}
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
                  title="Remove"
                >
                  −
                </button>
                <span className="font-extrabold text-primary-900 font-heading text-center leading-tight">
                  {isLoose && cartItem?.customQty
                    ? `${cartItem.customQty} ${product.unit || 'kg'}`
                    : `${qty} ${t('in_cart')}`}
                </span>
                <button
                  type="button"
                  onClick={handleInc}
                  disabled={!isLoose && qty >= product.stock}
                  className="w-9 h-full flex items-center justify-center text-primary-700 hover:bg-primary-200/60 font-black text-base rounded-lg transition-colors active:scale-125 disabled:opacity-30"
                  title={isLoose ? 'Change quantity' : 'Increase quantity'}
                >
                  {isLoose ? '✏️' : '+'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock}
                className="w-full h-10 rounded-xl font-bold text-xs shadow-sm bg-primary-500 hover:bg-primary-600 active:scale-95 text-white transition-all flex items-center justify-center gap-1.5 shadow-primary-500/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? t('out_of_stock') : (isLoose ? '⚖️ Select Qty' : t('add_to_cart'))}
              </button>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
