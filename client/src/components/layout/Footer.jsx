import React from 'react';
import { Link } from 'react-router-dom';
import { STORE_NAME, OWNER_WHATSAPP } from '../../constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.jpg" alt={STORE_NAME} className="h-10 w-10 object-contain rounded-lg bg-white p-0.5" />
              <h3 className="text-2xl font-heading font-bold text-primary-400">{STORE_NAME}</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Your trusted local Kirana store. Fresh groceries, daily essentials, and household items delivered right to your doorstep.
            </p>
            <a href={`https://wa.me/${OWNER_WHATSAPP}`} className="inline-flex items-center gap-2 mt-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-green-400 text-sm font-medium transition-colors">
              <span>💬</span> Chat on WhatsApp
            </a>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-300 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[['/', 'Home'], ['/categories', 'Shop by Category'], ['/products', 'All Products'], ['/cart', 'My Cart'], ['/orders', 'My Orders']].map(([path, label]) => (
                <li key={path}><Link to={path} className="hover:text-white transition-colors block">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-300 text-sm uppercase tracking-wider">Help & Policies</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[['/help', 'Help Center & Shop Info'], ['/profile', 'My Account'], ['/privacy', 'Privacy Policy'], ['/terms', 'Terms of Service']].map(([path, label]) => (
                <li key={path}><Link to={path} className="hover:text-white transition-colors block">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
          <p>Made with ❤️ for our local community.</p>
        </div>
      </div>
    </footer>
  );
}
