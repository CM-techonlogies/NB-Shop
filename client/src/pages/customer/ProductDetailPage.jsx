import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProductById, useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { STORE_NAME } from '../../constants';
import ProductGrid from '../../components/product/ProductGrid';
import {
  CheckBadgeIcon, ShieldCheckIcon, TruckIcon,
  ChevronLeftIcon, ShareIcon, HeartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Spinner from '../../components/ui/Spinner';
import { useLanguageStore } from '../../store/languageStore';

const PLACEHOLDER = 'https://via.placeholder.com/400x400?text=No+Image';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productData, isLoading } = useProductById(id);
  const { t } = useLanguageStore();

  const product = productData?.data ?? productData;

  const { data: relatedData, isLoading: relatedLoading } = useProducts({
    category: product?.category_id,
    limit: 4,
  });
  const relatedProducts = (relatedData?.data || []).filter(p => p.id !== id);

  const { addToCart, addToCartWithQty, cart, updateQuantity, updateCustomQty, removeFromCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  // Loose item selected quantity (default: min_quantity or 0.25)
  const [looseQty, setLooseQty] = useState(null);
  // Custom input mode — user types own quantity
  const [customInputMode, setCustomInputMode] = useState(false);
  const [customInputVal, setCustomInputVal] = useState('');
  const customInputRef = useRef(null);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[35vh] py-12">
        <Spinner size="md" />
        <span className="text-xs font-semibold text-gray-400 mt-2">Loading product...</span>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="text-center py-20 px-4">
        <span className="text-6xl block mb-4">😕</span>
        <h2 className="text-xl font-bold mb-3 text-gray-800">Product not found</h2>
        <Link to="/products" className="text-primary-500 font-semibold text-sm hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  const rawImages = product.product_images?.length > 0
    ? product.product_images
    : product.images?.length > 0
      ? product.images
      : [{ url: PLACEHOLDER }];

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const savings = product.mrp > product.price
    ? (parseFloat(product.mrp) - parseFloat(product.price)).toFixed(0)
    : 0;

  const productId = product.id || product._id;
  const cartItem = cart.find(item => item.id === productId);

  // Loose item: step & min quantity
  const looseStep = parseFloat(product.min_quantity) || 0.25;
  const effectiveLooseQty = looseQty ?? looseStep;

  // Format loose quantity for display (e.g. 0.25 kg → 250g, 1.5 kg → 1.5 kg)
  const formatQty = (qty, unit) => {
    const u = (unit || 'kg').toLowerCase();
    if ((u === 'kg') && qty < 1) return `${Math.round(qty * 1000)}g`;
    if ((u === 'l') && qty < 1) return `${Math.round(qty * 1000)}ml`;
    return `${qty} ${u}`;
  };

  return (
    <div className="animate-fadeIn bg-[#FFF8F0] min-h-screen pb-12 md:pb-0">
      <Helmet>
        <title>{`${product.name} - ${STORE_NAME}`}</title>
        <meta name="description" content={product.description || `Buy ${product.name} at NB Shop`} />
      </Helmet>

      {/* ── TOP BACK BAR (mobile) ────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-sm font-bold text-gray-800 truncate mx-3 flex-1 text-center">
          {product.name}
        </span>
        <button
          onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ShareIcon className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-0 md:px-6 lg:px-8 md:py-8">
        <div className="md:bg-white md:rounded-3xl md:shadow-card md:overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* ── IMAGE SECTION ──────────────────────────────────────────── */}
            <div className="md:w-[42%] flex-shrink-0 bg-white md:bg-gray-50 md:border-r md:border-gray-100">
              {/* Main image — constant 1:1 square ratio across all devices & browsers */}
              <div className="relative bg-white aspect-square w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] mx-auto flex items-center justify-center p-3">
                {discount > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                    {discount}% OFF
                  </div>
                )}
                {product.is_loose && (
                  <div className="absolute top-2 right-2 z-10 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    ⚖️ Loose
                  </div>
                )}
                <img
                  src={rawImages[activeImage]?.url || PLACEHOLDER}
                  alt={product.name}
                  className="w-full h-full object-contain max-h-full max-w-full p-2"
                  onError={e => { e.target.src = PLACEHOLDER; }}
                />
              </div>

              {/* Thumbnails */}
              {rawImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto px-4 pb-4 justify-center">
                  {rawImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-white transition-all ${
                        activeImage === idx
                          ? 'border-primary-500 shadow scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── INFO SECTION ───────────────────────────────────────────── */}
            <div className="flex-1 bg-white px-4 pt-4 pb-6 md:p-8 md:pt-6">

              {/* Category breadcrumb */}
              {product.categories?.name && (
                <Link
                  to={`/category/${product.categories?.slug}`}
                  className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1 inline-block hover:underline"
                >
                  {product.categories.name}
                </Link>
              )}

              {/* Brand */}
              {product.brand && (
                <p className="text-xs text-gray-500 font-medium mb-0.5">{product.brand}</p>
              )}

              {/* Product Name */}
              <h1 className="text-lg md:text-xl font-black font-heading text-gray-900 mb-2.5 leading-snug">
                {product.name}
              </h1>

              {/* Weight + Stock badges */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {(product.weight || product.unit) && (
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                    {product.weight} {product.unit}
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <CheckBadgeIcon className="w-3.5 h-3.5" /> {t('in_stock')}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                    {t('out_of_stock')}
                  </span>
                )}
                {/* Rating mock */}
                {product.rating > 0 && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <StarIcon className="w-3 h-3" /> {product.rating}
                  </span>
                )}
              </div>

              {/* Price Block */}
              <div className="bg-orange-50 rounded-xl p-2.5 mb-3 border border-orange-100">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="text-base text-gray-400 line-through mb-0.5">₹{product.mrp}</span>
                  )}
                  {discount > 0 && (
                    <span className="text-sm font-bold text-green-600 mb-0.5">({discount}% off)</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 font-medium">{t('inclusive_of_taxes')}</p>
                {savings > 0 && (
                  <p className="text-xs font-bold text-green-700 mt-1">
                    🎉 You save ₹{savings}
                  </p>
                )}
              </div>

              {/* ── Add to Cart — Loose vs Normal ────────────────────────── */}
              {product.is_loose ? (
                /* ── LOOSE ITEM UI ── */
                cartItem ? (
                  /* Already in cart → show customQty stepper + remove */
                  <div className="mb-4">
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-2">
                      <div>
                        <span className="text-xs font-semibold text-amber-700 block">⚖️ In Cart</span>
                        <span className="text-sm font-black text-gray-800">
                          {formatQty(cartItem.customQty || looseStep, product.unit)}
                        </span>
                      </div>
                      <div className="flex items-center bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm h-11">
                        <button
                          onClick={() => {
                            const next = parseFloat(((cartItem.customQty || looseStep) - looseStep).toFixed(3));
                            if (next <= 0) removeFromCart(productId);
                            else updateCustomQty(productId, next);
                          }}
                          className="w-11 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xl font-bold transition-colors"
                        >
                          −
                        </button>
                        <span className="min-w-[56px] text-center font-black text-gray-800 text-xs px-1">
                          {formatQty(cartItem.customQty || looseStep, product.unit)}
                        </span>
                        <button
                          onClick={() => {
                            const next = parseFloat(((cartItem.customQty || looseStep) + looseStep).toFixed(3));
                            updateCustomQty(productId, next);
                          }}
                          className="w-11 h-full flex items-center justify-center text-primary-500 hover:bg-primary-50 text-xl font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(productId)}
                      className="w-full text-xs font-semibold text-red-500 hover:text-red-700 py-1 transition-colors"
                    >
                      Remove from cart
                    </button>
                  </div>
                ) : (
                  /* Not in cart → quantity selector + Add to Cart */
                  <div className="mb-4">
                    {/* Quantity Stepper */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3">
                      <p className="text-xs font-bold text-amber-700 mb-3 flex items-center gap-1.5">
                        ⚖️ Select Quantity <span className="text-amber-500 font-medium">(loose item — sold by weight)</span>
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() => {
                            const next = parseFloat((effectiveLooseQty - looseStep).toFixed(3));
                            if (next >= looseStep) setLooseQty(next);
                          }}
                          disabled={effectiveLooseQty <= looseStep}
                          className="w-12 h-12 flex items-center justify-center bg-white border border-amber-300 rounded-xl text-2xl font-bold text-amber-700 hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-30 shadow-sm"
                        >
                          −
                        </button>

                        {/* Center: tappable qty display OR custom input */}
                        {customInputMode ? (
                          <div className="flex-1 flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 bg-white border-2 border-amber-400 rounded-xl px-3 py-1.5 w-full">
                              <input
                                ref={customInputRef}
                                type="number"
                                step={looseStep}
                                min={looseStep}
                                value={customInputVal}
                                onChange={e => setCustomInputVal(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    const parsed = parseFloat(customInputVal);
                                    if (!isNaN(parsed) && parsed >= looseStep) {
                                      setLooseQty(parseFloat(parsed.toFixed(3)));
                                    }
                                    setCustomInputMode(false);
                                  }
                                  if (e.key === 'Escape') setCustomInputMode(false);
                                }}
                                className="flex-1 text-center text-lg font-black text-gray-900 outline-none bg-transparent w-full"
                                placeholder={`e.g. 0.75`}
                                autoFocus
                              />
                              <span className="text-sm font-bold text-amber-600 flex-shrink-0">{product.unit || 'kg'}</span>
                            </div>
                            <div className="flex gap-1.5 w-full">
                              <button
                                onClick={() => {
                                  const parsed = parseFloat(customInputVal);
                                  if (!isNaN(parsed) && parsed >= looseStep) {
                                    setLooseQty(parseFloat(parsed.toFixed(3)));
                                  }
                                  setCustomInputMode(false);
                                }}
                                className="flex-1 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg"
                              >
                                ✓ Set
                              </button>
                              <button
                                onClick={() => setCustomInputMode(false)}
                                className="flex-1 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setCustomInputVal(effectiveLooseQty.toString());
                              setCustomInputMode(true);
                              setTimeout(() => customInputRef.current?.focus(), 50);
                            }}
                            className="flex-1 text-center group"
                            title="Tap to enter custom quantity"
                          >
                            <span className="text-2xl font-black text-gray-900 group-hover:text-amber-600 transition-colors">
                              {formatQty(effectiveLooseQty, product.unit)}
                            </span>
                            <p className="text-[10px] text-amber-500 mt-0.5 font-semibold">✏️ tap to customize</p>
                          </button>
                        )}

                        <button
                          onClick={() => setLooseQty(parseFloat((effectiveLooseQty + looseStep).toFixed(3)))}
                          className="w-12 h-12 flex items-center justify-center bg-white border border-amber-300 rounded-xl text-2xl font-bold text-amber-700 hover:bg-amber-100 active:scale-95 transition-all shadow-sm"
                        >
                          +
                        </button>
                      </div>
                      {/* Quick select presets */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {[looseStep, looseStep * 2, looseStep * 4, 1, 2].filter((v, i, arr) =>
                          arr.indexOf(v) === i && v > 0
                        ).slice(0, 4).map(preset => (
                          <button
                            key={preset}
                            onClick={() => setLooseQty(parseFloat(preset.toFixed(3)))}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              effectiveLooseQty === parseFloat(preset.toFixed(3))
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                            }`}
                          >
                            {formatQty(preset, product.unit)}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Add to Cart button */}
                    <button
                      onClick={() => {
                        addToCartWithQty(product, effectiveLooseQty);
                      }}
                      disabled={product.stock <= 0}
                      className="w-full bg-primary-500 hover:bg-primary-600 active:scale-[0.98] disabled:bg-gray-300 text-white font-black py-3.5 rounded-2xl transition-all text-base shadow-md shadow-orange-200"
                    >
                      {product.stock > 0
                        ? `🛒 Add ${formatQty(effectiveLooseQty, product.unit)} to Cart`
                        : t('out_of_stock')}
                    </button>
                  </div>
                )
              ) : (
                /* ── NORMAL ITEM UI ── */
                cartItem ? (
                  <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-2xl px-4 py-3 mb-4">
                    <span className="text-sm font-bold text-gray-700">In Cart</span>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-11">
                      <button
                        onClick={() => updateQuantity(cartItem.id, cartItem.qty - 1)}
                        className="w-11 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xl font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-black text-gray-800 text-sm">{cartItem.qty}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.id, cartItem.qty + 1)}
                        disabled={cartItem.qty >= product.stock}
                        className="w-11 h-full flex items-center justify-center text-primary-500 hover:bg-primary-50 text-xl font-bold transition-colors disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full bg-primary-500 hover:bg-primary-600 active:scale-[0.98] disabled:bg-gray-300 text-white font-black py-3.5 rounded-2xl transition-all text-base shadow-md shadow-orange-200 mb-4"
                  >
                    {product.stock > 0 ? `🛒 ${t('add_to_cart')}` : t('out_of_stock')}
                  </button>
                )
              )}

              {/* Trust Badges — compact 3-column */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: '🛡️', label: 'Quality\nAssured' },
                  { icon: '⚡', label: 'Fast\nDelivery' },
                  { icon: '↩️', label: 'Easy\nReturns' },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center text-center bg-gray-50 rounded-xl py-2 px-1 border border-gray-100">
                    <span className="text-lg mb-0.5">{b.icon}</span>
                    <span className="text-[10px] font-semibold text-gray-600 whitespace-pre-line leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {product.description && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">{t('product_details')}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── RELATED PRODUCTS ──────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 px-4 md:px-0">
            <h2 className="text-lg font-black font-heading text-gray-900 mb-4">
              {t('similar_products')}
            </h2>
            <ProductGrid products={relatedProducts} isLoading={relatedLoading} skeletonCount={4} />
          </div>
        )}
      </div>
    </div>
  );
}
