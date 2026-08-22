import React, { useState, useEffect } from 'react';
import { SUB_UNITS, PRESETS_BY_UNIT, STEP_BY_UNIT, toBaseUnit } from '../../utils/looseHelpers';
import { formatPrice } from '../../utils/formatPrice';

export default function LooseDetailSelector({ product, cartItem, onAddToCart, onUpdateCart, onRemove }) {
  const baseUnit = product.unit || 'kg';
  const minQtyBase = parseFloat(product.min_quantity) || 0;
  const subUnitOptions = SUB_UNITS[baseUnit] || [baseUnit];

  const [selectedUnit, setSelectedUnit] = useState(baseUnit);
  const factor = toBaseUnit(selectedUnit, baseUnit); // e.g. 0.001 for g→kg
  const presets = PRESETS_BY_UNIT[selectedUnit] || [1, 2, 5];
  const step = STEP_BY_UNIT[selectedUnit] || 1;

  const minInDisplay = minQtyBase > 0 ? (minQtyBase / factor) : 0;
  const defaultVal = minInDisplay > 0 ? minInDisplay : (presets[0] || step);

  const [inputVal, setInputVal] = useState(String(defaultVal));
  const [qty, setQty] = useState(defaultVal);
  const [error, setError] = useState('');

  // Handle switching between units (e.g. KG <-> GM)
  const handleUnitSwitch = (newUnit) => {
    setSelectedUnit(newUnit);
    const newFactor = toBaseUnit(newUnit, baseUnit);
    const baseQty = qty * factor;
    const newDisplay = baseQty / newFactor;
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
    if (!isNaN(num) && num > 0) {
      setQty(num);
      setError('');
    }
  };

  const handleInc = () => {
    const next = parseFloat((qty + step).toFixed(2));
    setQty(next);
    setInputVal(String(next));
    setError('');
  };

  const handleDec = () => {
    const minAllowed = minInDisplay > 0 ? minInDisplay : step;
    if (qty - step >= minAllowed) {
      const next = parseFloat((qty - step).toFixed(2));
      setQty(next);
      setInputVal(String(next));
      setError('');
    }
  };

  const qtyInBase = qty * factor;
  const totalPrice = parseFloat(product.price) * qtyInBase;

  const handleConfirmAdd = () => {
    const num = parseFloat(inputVal);
    if (!num || num <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    if (minInDisplay > 0 && num < minInDisplay) {
      setError(`Minimum order is ${minInDisplay} ${selectedUnit}`);
      return;
    }
    const finalBaseQty = parseFloat((num * factor).toFixed(3));
    const displayStr = `${num} ${selectedUnit}`;
    onAddToCart(finalBaseQty, displayStr);
  };

  // If item is already in cart, show cart controls + re-customize option
  if (cartItem) {
    const currentDisplay = cartItem.customDisplay || `${cartItem.customQty} ${baseUnit}`;
    const currentPrice = parseFloat(product.price) * (cartItem.customQty || 1);

    return (
      <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-bold text-amber-700 block uppercase tracking-wide">⚖️ Added to Cart</span>
            <span className="text-base font-black text-gray-900">{currentDisplay}</span>
            <span className="text-xs text-amber-600 ml-2 font-bold">({formatPrice(currentPrice)})</span>
          </div>
          <button
            onClick={() => onRemove(product.id || product._id)}
            className="text-xs font-bold text-red-500 hover:text-red-700 bg-white px-2.5 py-1 rounded-lg border border-red-200 shadow-xs"
          >
            Remove
          </button>
        </div>

        {/* Change Quantity controls */}
        <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-gray-600">Want to change quantity?</span>
          <button
            onClick={() => onRemove(product.id || product._id)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            ✏️ Change Quantity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50/40 to-white border-2 border-amber-200/80 rounded-2xl p-4 md:p-5 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-lg">⚖️</span>
          <div>
            <h4 className="text-sm font-black text-gray-900 leading-tight">Select Loose Quantity</h4>
            <p className="text-[11px] text-amber-700 font-medium">Sold by weight • {formatPrice(product.price)} per {baseUnit}</p>
          </div>
        </div>
      </div>

      {/* ── UNIT SWITCHER TABS ── */}
      {subUnitOptions.length > 1 && (
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Unit</label>
          <div className="grid grid-cols-2 gap-2 bg-white/80 p-1 rounded-xl border border-amber-200">
            {subUnitOptions.map(u => (
              <button
                key={u}
                type="button"
                onClick={() => handleUnitSwitch(u)}
                className={`py-2 rounded-lg text-xs font-black transition-all ${
                  selectedUnit === u
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-amber-100/50'
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── QUICK SELECT PRESETS ── */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Quick Select</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                qty === p
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-105'
                  : 'bg-white text-gray-700 border-amber-200 hover:border-amber-400'
              }`}
            >
              {p} {selectedUnit}
            </button>
          ))}
        </div>
      </div>

      {/* ── ENTER CUSTOM QUANTITY ── */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Or Enter Custom</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDec}
            className="w-11 h-11 flex items-center justify-center bg-white border border-amber-300 rounded-xl text-xl font-black text-amber-700 hover:bg-amber-100 active:scale-95 transition-all shadow-xs"
          >
            −
          </button>
          <div className="flex-1 flex items-center gap-1 bg-white border-2 border-amber-300 focus-within:border-amber-500 rounded-xl px-3 py-1 shadow-inner">
            <input
              type="number"
              min={minInDisplay > 0 ? minInDisplay : step}
              step={step}
              value={inputVal}
              onChange={(e) => handleInput(e.target.value)}
              className="w-full text-center text-lg font-black text-gray-900 outline-none bg-transparent"
              placeholder="e.g. 0.25"
            />
          </div>
          <select
            value={selectedUnit}
            onChange={(e) => handleUnitSwitch(e.target.value)}
            className="bg-white text-gray-800 font-bold text-xs px-2.5 py-3 rounded-xl border border-amber-300 outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-xs"
          >
            {subUnitOptions.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleInc}
            className="w-11 h-11 flex items-center justify-center bg-white border border-amber-300 rounded-xl text-xl font-black text-amber-700 hover:bg-amber-100 active:scale-95 transition-all shadow-xs"
          >
            +
          </button>
        </div>
        {error && <p className="text-red-500 text-xs font-semibold mt-1.5">{error}</p>}
      </div>

      {/* ── LIVE PRICE CALCULATION DISPLAY BOX ── */}
      {qtyInBase > 0 && (
        <div className="bg-white border-2 border-amber-300/80 rounded-xl p-3.5 mb-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-gray-500 block">Total for {qty} {selectedUnit}:</span>
            <span className="text-xs text-amber-600 font-medium">({qtyInBase} {baseUnit} × {formatPrice(product.price)})</span>
          </div>
          <span className="text-xl font-black text-amber-600">{formatPrice(totalPrice)}</span>
        </div>
      )}

      {/* ── ADD TO CART BUTTON ── */}
      <button
        type="button"
        onClick={handleConfirmAdd}
        disabled={product.stock <= 0}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] disabled:bg-gray-300 text-white font-black py-3.5 rounded-xl transition-all text-sm md:text-base shadow-md shadow-orange-200 flex items-center justify-center gap-2"
      >
        🛒 Add {qty} {selectedUnit} to Cart — {formatPrice(totalPrice)}
      </button>
    </div>
  );
}
