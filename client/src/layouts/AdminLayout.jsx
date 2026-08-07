import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { STORE_NAME } from '../constants';

const navLinks = [
  { path: '/admin', icon: '📊', label: 'Dashboard' },
  { path: '/admin/products', icon: '📦', label: 'Products' },
  { path: '/admin/categories', icon: '📁', label: 'Categories' },
  { path: '/admin/orders', icon: '📋', label: 'Orders' },
  { path: '/admin/customers', icon: '👥', label: 'Customers' },
  { path: '/admin/banners', icon: '🖼️', label: 'Banners' },
  { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 selection:bg-primary-200 selection:text-primary-900">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/admin" className="flex items-center gap-2.5 text-xl font-bold font-heading text-gray-800">
            <img src="/logo.jpg" alt={STORE_NAME} className="h-8 w-8 object-contain rounded-md" />
            <span>{STORE_NAME} <span className="text-primary-500">Admin</span></span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {navLinks.map(link => {
            const isActive = link.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(link.path);
            return (
              <Link key={link.path} to={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}>
                <span className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm border border-transparent hover:border-red-100">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu & Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <Link to="/admin" className="flex items-center gap-2 font-bold font-heading text-gray-800">
            <img src="/logo.jpg" alt={STORE_NAME} className="h-7 w-7 object-contain rounded-md" />
            <span>{STORE_NAME} Admin</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 bg-gray-50 rounded-lg active:scale-95 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}></div>
            <aside className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col shadow-2xl animate-slide-in-right">
              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                <span className="font-bold font-heading text-gray-800">{STORE_NAME} Admin</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map(link => {
                  const isActive = link.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(link.path);
                  return (
                    <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-sm ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                      <span className="text-xl">{link.icon}</span>
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-red-600 border border-red-100 hover:bg-red-50 transition-colors font-bold text-sm shadow-sm active:scale-95">
                  <span>🚪</span> Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
