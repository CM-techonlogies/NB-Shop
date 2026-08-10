import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useLanguageStore } from '../../store/languageStore';
import { formatPrice } from '../../utils/formatPrice';

export default function CartSummary({ showCheckoutButton = true }) {
  const navigate = useNavigate();
  const { subtotal: cartTotal, itemCount, deliveryCharge, freeDeliveryAbove, total } = useCart();
  const { t, language } = useLanguageStore();
  
  const needsMoreForFree = cartTotal > 0 && cartTotal < freeDeliveryAbove;
  const progressPercent = Math.min(100, (cartTotal / freeDeliveryAbove) * 100);

  if (itemCount === 0) return null;

  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 font-heading">
        {t('order_summary')}
      </h3>
      
      {needsMoreForFree && (
        <div className="mb-4 bg-orange-50 p-3 rounded-2xl border border-orange-100">
          <p className="text-xs text-orange-700 font-medium mb-2">
            {language === 'hi' 
              ? `मुफ्त डिलीवरी के लिए ${formatPrice(freeDeliveryAbove - cartTotal)} का सामान और जोड़ें`
              : `Add ${formatPrice(freeDeliveryAbove - cartTotal)} more for free delivery`
            }
          </p>
          <div className="w-full bg-orange-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
        <div className="flex justify-between">
          <span>{t('item_total')} ({itemCount})</span>
          <span className="font-medium text-gray-800">{formatPrice(cartTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('delivery_charge')}</span>
          {deliveryCharge > 0 ? (
            <span className="font-medium text-gray-800">{formatPrice(deliveryCharge)}</span>
          ) : (
            <span className="font-bold text-emerald-600">{t('free')}</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end mb-5">
        <span className="text-base font-bold text-gray-800 font-heading">{t('to_pay')}</span>
        <span className="text-2xl font-black text-primary-600 font-heading">{formatPrice(total)}</span>
      </div>

      {showCheckoutButton && (
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-center text-sm"
        >
          {t('proceed_checkout')}
        </button>
      )}

      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50/70 py-2.5 px-3 rounded-2xl border border-emerald-100/70">
        <span>🛡️</span>
        <span>{t('safe_checkout')}</span>
      </div>
    </div>
  );
}
