import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useUser } from '@clerk/clerk-react';
import { useLanguageStore } from '../../store/languageStore';

export default function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { isSignedIn } = useUser();
  const { t } = useLanguageStore();

  const navItems = [
    { path: '/', icon: '🏠', label: t('home') },
    { path: '/categories', icon: '🛍️', label: t('categories') },
    { path: '/cart', icon: '🛒', label: t('cart'), isCart: true },
    { path: '/orders', icon: '📋', label: t('orders') },
    { path: isSignedIn ? '/profile' : '/login', icon: isSignedIn ? '👤' : '🔐', label: isSignedIn ? t('profile') : t('login') },
  ];

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe transition-colors">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, icon, label, isCart }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link key={path} to={path} className={`flex flex-col items-center gap-0.5 px-3 py-2 relative transition-all duration-200 ${
              isActive ? 'text-primary-500 scale-110' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="text-xl relative">
                {icon}
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
