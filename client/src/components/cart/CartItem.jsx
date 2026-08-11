import React from 'react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const productId = item.id;
  const isLoose = item.customQty !== undefined;
  const qty = item.qty || 1;
  const customQty = item.customQty;
  const customDisplay = item.customDisplay || `${customQty} ${unit}`;  // e.g. "500 g" or "1.5 kg"
  const unit = item.unit || '';

  // Effective quantity for price calculation (always in base unit)
  const effectiveQty = isLoose ? customQty : qty;
  const lineTotal = parseFloat(item.price) * effectiveQty;

  const imageUrl =
    item.product_images?.[0]?.url ||
    item.images?.[0]?.url ||
    item.image ||
    null;

  return (
    <div className="flex gap-4 p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-3 items-center">
      <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 p-1">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-2xl text-gray-300">🛒</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-800 truncate mb-0.5">{item.name}</h4>
        {isLoose ? (
          <div className="text-xs text-amber-600 font-medium mb-1">
            ⚖️ {customQty} {unit} × {formatPrice(item.price)}/{unit}
          </div>
        ) : (
          <div className="text-xs text-gray-500 mb-1">{item.weight}</div>
        )}
        <div className="text-sm font-bold text-primary-600">{formatPrice(item.price)}/{isLoose ? unit : 'unit'}</div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {/* Line total */}
        <div className="text-sm font-bold text-gray-800">{formatPrice(lineTotal)}</div>

        {isLoose ? (
          // Loose item: show weight badge + remove button only
          <div className="flex items-center gap-2">
            <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
              {customDisplay}
            </span>
            <button
              onClick={() => removeFromCart(productId)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-full"
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ) : (
          // Fixed item: normal +/- counter
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 h-7 md:h-8">
              <button
                onClick={() => updateQuantity(productId, qty - 1)}
                className="w-7 md:w-8 h-full flex items-center justify-center text-gray-600 font-medium hover:bg-gray-100 rounded-l-full transition-colors active:scale-95"
              >
                -
              </button>
              <span className="w-6 text-center text-xs md:text-sm font-semibold text-gray-800">
                {qty}
              </span>
              <button
                onClick={() => updateQuantity(productId, qty + 1)}
                disabled={item.stock != null && qty >= item.stock}
                className="w-7 md:w-8 h-full flex items-center justify-center text-gray-600 font-medium hover:bg-gray-100 rounded-r-full transition-colors active:scale-95 disabled:opacity-40"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeFromCart(productId)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-full"
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
