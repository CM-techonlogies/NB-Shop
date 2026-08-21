import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useLanguageStore } from '../../store/languageStore';
import { formatPrice, formatDiscount } from '../../utils/formatPrice';
import LazyImage from '../ui/LazyImage';

// ─── Unit helpers ─────────────────────────────────────────────────────────────
const SUB_UNITS = {
  kg:  ['kg', 'gm'],
  l:   ['l', 'ml'],
  g:   ['gm'],
  gm:  ['gm'],
  ml:  ['ml'],
  pcs: ['pcs'],
  pack: ['pack'],
  dozen: ['dozen'],
};

// Factor to convert selected display unit → base unit
// e.g. if product is in kg and user selects "gm", factor = 0.001
const toBaseUnit = (displayUnit, baseUnit) => {
  if (displayUnit === baseUnit) return 1;
  if ((displayUnit === 'gm' || displayUnit === 'g') && baseUnit === 'kg') return 0.001;
  if (displayUnit === 'ml' && baseUnit === 'l')  return 0.001;
  return 1;
};

const PRESETS_BY_UNIT = {
  kg:    [0.25, 0.5, 1, 2, 5],
  gm:    [100, 250, 500, 1000],
  g:     [100, 250, 500, 1000],
  l:     [0.25, 0.5, 1, 2],
  ml:    [100, 250, 500, 1000],
  pcs:   [1, 2, 3, 5],
  pack:  [1, 2, 3],
  dozen: [1, 2],
};

const STEP_BY_UNIT = { kg: 0.25, gm: 50, g: 50, l: 0.25, ml: 100, pcs: 1, pack: 1, dozen: 1 };

// ─── Loose Item Quantity Dialog ───────────────────────────────────────────────
function LooseQtyDialog({ product, onConfirm, onClose }) {
  const baseUnit = product.unit || 'kg';
  const minQtyBase = parseFloat(product.min_quantity) || 0; // in base unit
  const subUnitOptions = SUB_UNITS[baseUnit] || [baseUnit];

  const [selectedUnit, setSelectedUnit] = useState(baseUnit);
  const factor = toBaseUnit(selectedUnit, baseUnit);           // e.g. 0.001 for g→kg
  const presets = PRESETS_BY_UNIT[selectedUnit] || [1, 2, 5];
  const step = STEP_BY_UNIT[selectedUnit] || 1;

  // minQty expressed in selectedUnit for validation display
  const minInDisplay = minQtyBase > 0 ? (minQtyBase / factor) : 0;

  const initVal = minInDisplay > 0 ? minInDisplay : (presets[0] || step);
  const [inputVal, setInputVal] = useState(String(initVal));
  const [qty, setQty] = useState(initVal);       // quantity in DISPLAY unit
  const [error, setError] = useState('');

  const handleUnitSwitch = (newUnit) => {
    setSelectedUnit(newUnit);
    // keep same BASE quantity, convert display
    const newFactor = toBaseUnit(newUnit, baseUnit);
    const baseQty = qty * factor;                // current value in base unit
    const newDisplay = baseQty / newFactor;      // convert to new display unit
    const rounded = parseFloat(newDisplay.toFixed(2));
    setQty(rounded);
    setInputVal(String(rounded));
    setError('');
  };

  const handlePreset = (val) => {
    setQty(val);
    setInputVal(String(val));
    setError('');
  };

  const handleInput = (val) => {
    setInputVal(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) { setQty(num); setError(''); }
  };

  // qty is in display unit; convert to base unit for price calc & storage
  const qtyInBase = qty * factor;
  const totalPrice = parseFloat(product.price) * qtyInBase;

  const handleConfirm = () => {
    const num = parseFloat(inputVal);
    if (!num || num <= 0) { setError('Please enter a valid quantity'); return; }
    if (minInDisplay > 0 && num < minInDisplay) {
      setError(`Minimum order is ${minInDisplay} ${selectedUnit}`);
      return;
    }
    // Pass back base-unit qty + display string
    onConfirm(parseFloat((num * factor).toFixed(3)), `${num} ${selectedUnit}`);
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
        {/* Handle bar (mobile) */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">⚖️</div>
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatPrice(product.price)} per {baseUnit}
              {minQtyBase > 0 && <span className="ml-1.5 text-orange-500">• Min: {minQtyBase} {baseUnit}</span>}
            </p>
          </div>
        </div>

        {/* Unit Switcher — only show if there are multiple sub-units */}
        {subUnitOptions.length > 1 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Unit</p>
            <div className="flex gap-2">
              {subUnitOptions.map(u => (
                <button
                  key={u}
                  onClick={() => handleUnitSwitch(u)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    selectedUnit === u
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

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
              {p} {selectedUnit}
            </button>
          ))}
        </div>

        {/* Custom Input with unit dropdown */}
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Or Enter Custom</p>
        <div className="flex items-center gap-2 mb-1">
          <input
            type="number"
            min={minInDisplay > 0 ? minInDisplay : step}
            step={step}
            value={inputVal}
            onChange={(e) => handleInput(e.target.value)}
            className="flex-1 p-3 border-2 border-gray-200 focus:border-orange-400 rounded-xl outline-none text-lg font-bold text-gray-900 transition-colors"
            placeholder={`Enter quantity...`}
          />
          {/* Dropdown unit selector */}
          <select
            value={selectedUnit}
            onChange={(e) => handleUnitSwitch(e.target.value)}
            className="bg-gray-100 text-gray-700 font-bold text-sm px-3 py-3 rounded-xl border-0 outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
          >
            {subUnitOptions.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>}

        {/* Price Preview */}
        {qtyInBase > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Total for {qty} {selectedUnit}</span>
            <span className="font-black text-orange-600 text-base">{formatPrice(totalPrice)}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-orange-200">
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
  const safeIdStr = String(productId || '1');
  const rating = product.rating || (4.5 + ((safeIdStr.charCodeAt(0) % 5) * 0.1)).toFixed(1);
  const reviewCount = product.reviewCount || (50 + (safeIdStr.charCodeAt(0) * 12));

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

  const handleLooseConfirm = (qtyInBase, displayStr) => {
    setShowLooseDialog(false);
    // customQty = base unit (kg/l) for price calc
    // customDisplay = user-visible string like "500 g" or "1.5 kg"
    addToCart({ ...product, customQty: qtyInBase, customDisplay: displayStr || `${qtyInBase} ${product.unit || 'kg'}`, qty: 1 });
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
        {/* Product Image — uniform 1:1 aspect ratio across all products & devices */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50/50 rounded-xl p-2.5 flex items-center justify-center mb-3">
          {/* Absolute badges overlay — keeps top edge identical across all cards */}
          {isLoose && (
            <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-amber-200 shadow-2xs">
              ⚖️ {t('loose')}
            </span>
          )}
          {discount > 0 ? (
            <span className="absolute top-2 right-2 z-10 inline-block bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shadow-2xs">
              {discount}% OFF
            </span>
          ) : product.trending ? (
            <span className="absolute top-2 right-2 z-10 inline-block bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shadow-2xs">
              HOT
            </span>
          ) : product.featured ? (
            <span className="absolute top-2 right-2 z-10 inline-block bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shadow-2xs">
              TOP
            </span>
          ) : null}

          <LazyImage
            src={rawImageUrl}
            alt={product.name}
            className="object-contain w-full h-full max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
            wrapperClassName="w-full h-full flex items-center justify-center"
            fallback={<span className="text-4xl text-gray-300">🛒</span>}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {t('out_of_stock')}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1">
          {/* Title with min-height for uniform alignment */}
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.25rem] mb-1.5 group-hover:text-primary-600 transition-colors leading-tight">
            {product.name}
          </h3>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              ★ {rating}
            </span>
            <span className="text-xs text-gray-400 font-medium">({reviewCount.toLocaleString()})</span>
          </div>

          {/* Thin separator line */}
          <div className="w-full h-px bg-gray-200 mb-2" />

          {/* Price Row */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-black text-gray-900">{formatPrice(product.price)}</span>
            {product.unit && (
              <span className="text-xs text-gray-400 font-medium">/{product.unit}</span>
            )}
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through font-medium">{formatPrice(product.mrp)}</span>
            )}
          </div>

          {/* Delivery Tag */}
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-4 font-medium">
            <span>{product.price >= 499 ? t('free_delivery') : t('fast_delivery')}</span>
          </div>

          {/* Action Button / Quantity Counter */}
          <div className="mt-auto pt-2 flex items-center">
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
                    ? (cartItem.customDisplay || `${cartItem.customQty} ${product.unit || 'kg'}`)
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
                {isOutOfStock ? t('out_of_stock') : (isLoose ? t('select_qty') : t('add_to_cart'))}
              </button>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
