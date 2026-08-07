import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import BottomNav from '../components/layout/BottomNav';
import Footer from '../components/layout/Footer';
import FloatingWhatsApp from '../components/layout/FloatingWhatsApp';
import PwaInstallPrompt from '../components/ui/PwaInstallPrompt';
import { Toaster } from 'react-hot-toast';

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col font-sans text-gray-800 selection:bg-primary-200 selection:text-primary-900">
      <PwaInstallPrompt />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 md:px-6 py-4 md:py-8 pb-24 md:pb-12">
        {children || <Outlet />}
      </main>

      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: { iconTheme: { primary: '#FF6B00', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
