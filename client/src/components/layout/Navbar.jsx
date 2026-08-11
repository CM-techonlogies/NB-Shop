import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useLanguageStore } from '../../store/languageStore';
import { STORE_NAME } from '../../constants';

export default function Navbar() {
  const [search, setSearch] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { openSignIn } = useClerk();
  const { language, toggleLanguage, t } = useLanguageStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setShowMobileSearch(false);
    } else {
      navigate('/products');
      setShowMobileSearch(false);
    }
  };

  const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm min-h-16 py-2 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-between gap-4">
        {showMobileSearch ? (
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                placeholder="Search groceries..."
                className="w-full bg-gray-100 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-600 p-1 font-bold text-xs">
                Go
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowMobileSearch(false)}
              className="p-2 text-gray-500 text-sm font-bold"
            >
              ✕
            </button>
          </form>
        ) : (
          <>
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/logo.jpg" alt="NB SHOP" className="h-9 w-9 object-contain rounded-lg shadow-xs" />
              <div className="flex flex-col justify-center leading-tight">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight font-heading leading-none">
                  <span className="text-primary-500">NB</span>{' '}
                  <span className="text-gray-900">SHOP</span>
                </span>
                <span className="text-[9px] text-gray-500 font-medium tracking-tighter leading-tight">
                  Your Nearby Grocery Store
                </span>
              </div>
            </Link>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center mx-4">
              <div className="relative w-full">
                <input 
                  type="text"
                  placeholder="Search for groceries, essentials..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-5 pr-12 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-inner"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-primary-500 hover:bg-primary-600 p-1.5 rounded-full transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Language Switcher Button */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95"
                title="Switch Language / भाषा बदलें"
              >
                <span className="text-xs">🌐</span>
                <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
              </button>

              <Link
                to="/orders"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 hover:text-primary-600 hover:bg-primary-50 border border-gray-200 transition-all shadow-2xs group"
              >
                <span className="group-hover:scale-110 transition-transform">📋</span>
                <span>{t('orders')}</span>
              </Link>

              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-500 transition-colors hidden md:block group">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
              
              <div className="hidden md:block">
                {isSignedIn ? (
                  <Link to="/profile" className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 transition-colors cursor-pointer group">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs group-hover:bg-primary-200 transition-colors">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">{displayName}</span>
                  </Link>
                ) : (
                  <button onClick={() => openSignIn()} className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md">
                    Login
                  </button>
                )}
              </div>

              <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="md:hidden p-2 text-gray-600 bg-gray-50 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
