import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-5">
      <Helmet>
        <title>Page Not Found – NB Shop</title>
      </Helmet>

      <div className="w-full max-w-md text-center">
        {/* Big 404 */}
        <div className="relative mb-6 select-none">
          <p className="text-[120px] font-black leading-none text-orange-100 tracking-tighter">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl drop-shadow-sm animate-bounce">🛒</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-black text-gray-900 mb-2 font-heading">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back to shopping!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-md shadow-orange-200 text-sm"
          >
            🏠 Go to Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-semibold py-3.5 px-8 rounded-2xl transition-all text-sm"
          >
            ← Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-4 font-medium">Quick Links</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { to: '/products', label: '🛍️ All Products' },
              { to: '/categories', label: '📦 Categories' },
              { to: '/cart', label: '🛒 My Cart' },
              { to: '/orders', label: '📋 My Orders' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-300 mt-8">NB Shop – M/s Navaram Bhubaji</p>
      </div>
    </div>
  );
}
