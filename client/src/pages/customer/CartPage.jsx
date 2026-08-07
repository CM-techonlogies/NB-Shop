import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../hooks/useCart';
import { useLanguageStore } from '../../store/languageStore';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import { STORE_NAME } from '../../constants';
import { ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguageStore();

  if (cart.length === 0) {
    return (
      <div className="animate-fadeIn max-w-4xl mx-auto px-4 py-20 text-center">
        <Helmet>
          <title>{`${t('cart')} - ${STORE_NAME}`}</title>
        </Helmet>
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBagIcon className="w-16 h-16 text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-gray-800 mb-3">{t('your_cart_is_empty')}</h2>
          <p className="text-gray-500 mb-8 max-w-md">{t('cart_empty_desc')}</p>
          <Link to="/products" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform active:scale-95 text-lg">
            {t('shop_now')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Helmet>
        <title>{`${t('cart')} (${cart.length}) - ${STORE_NAME}`}</title>
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-4xl font-bold font-heading text-gray-900 flex items-center gap-3">
          <ShoppingBagIcon className="w-8 h-8 text-primary-500" />
          {t('my_cart')}
        </h1>
        <button 
          onClick={() => {
            if(window.confirm('Clear cart? / कार्ट खाली करें?')) clearCart();
          }}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-semibold transition-colors bg-red-50 px-4 py-2 rounded-lg"
        >
          <TrashIcon className="w-4 h-4" /> {t('clear_cart')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3 space-y-4">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="divide-y divide-gray-100">
              {cart.map(item => (
                <CartItem key={item._id || item.id} item={item} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold px-5 py-2.5 rounded-2xl text-sm transition-all active:scale-95 border border-primary-200/80 shadow-2xs"
            >
              <span>➕</span> {t('add_more_items')}
            </Link>
            <button
              onClick={() => {
                if (window.confirm('Clear cart? / कार्ट खाली करें?')) clearCart();
              }}
              className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors"
            >
              {t('clear_cart')}
            </button>
          </div>
        </div>

        {/* Cart Summary Sidebar */}
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
