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
import { getProductName, getProductDescription } from '../../utils/language';
import LooseDetailSelector from '../../components/product/LooseDetailSelector';

const PLACEHOLDER = 'https://via.placeholder.com/400x400?text=No+Image';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productData, isLoading } = useProductById(id);
  const { t, language } = useLanguageStore();

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
  const cartItem = cart.find(item => String(item.id || item._id) === String(productId));
  const isLoose = Boolean(
    product?.is_loose === true ||
    product?.is_loose === 'true' ||
    product?.is_loose === 1 ||
    product?.is_loose === '1'
  );

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

  const productName = getProductName(product, language);
  const productDesc = getProductDescription(product, language);

  return (
    <div className="animate-fadeIn bg-[#FFF8F0] min-h-screen pb-12 md:pb-0">
      <Helmet>
        <title>{`${productName} - ${STORE_NAME}`}</title>
        <meta name="description" content={productDesc || `Buy ${productName} at NB Shop`} />
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
          {productName}
        </span>
        <button
          onClick={() => navigator.share?.({ title: productName, url: window.location.href })}
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
                {isLoose && (
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
                {productName}
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
              {isLoose ? (
                <LooseDetailSelector
                  product={product}
                  cartItem={cartItem}
                  onAddToCart={(customQty, customDisplay) => {
                    addToCart({ ...product, customQty, customDisplay, qty: 1 });
                  }}
                  onUpdateCart={(customQty) => updateCustomQty(productId, customQty)}
                  onRemove={(id) => removeFromCart(id)}
                />
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
              {productDesc && (
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {t('product_details')}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal whitespace-pre-line">
                    {productDesc}
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
