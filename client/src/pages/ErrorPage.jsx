import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

/**
 * Dedicated error page — used by ErrorBoundary and can also be linked
 * directly when you want to show a full-page error (e.g. after a failed API call).
 *
 * Props:
 *  - title: string  (optional)
 *  - message: string (optional)
 *  - onRetry: function (optional) — called when user taps "Try Again"
 *  - showHome: boolean (default true)
 */
export default function ErrorPage({
  title = 'Something Went Wrong',
  message = 'We hit an unexpected problem. Please try again — it usually fixes itself.',
  onRetry,
  showHome = true,
}) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-5">
      <Helmet>
        <title>Error – NB Shop</title>
      </Helmet>

      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl select-none">⚠️</span>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-black text-gray-900 mb-3 font-heading">{title}</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs mx-auto">{message}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-md shadow-orange-200 text-sm"
          >
            🔄 Try Again
          </button>
          {showHome && (
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-semibold py-3.5 px-8 rounded-2xl transition-all text-sm"
            >
              🏠 Go to Home
            </Link>
          )}
        </div>

        {/* Contact hint */}
        <p className="text-xs text-gray-400 mt-10">
          If this keeps happening, call us:{' '}
          <a href="tel:02971294111" className="text-orange-500 font-semibold">02971-294111</a>
        </p>

        <p className="text-xs text-gray-300 mt-2">NB Shop – M/s Navaram Bhubaji</p>
      </div>
    </div>
  );
}
