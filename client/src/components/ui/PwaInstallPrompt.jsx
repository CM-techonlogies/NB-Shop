import React, { useState, useEffect } from 'react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if app is already running standalone / installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install app to Home Screen:\n• Chrome/Android: Tap menu (⋮) → "Add to Home screen"\n• Safari/iOS: Tap Share button (⎋) → "Add to Home Screen"');
    }
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-primary-600 to-orange-500 text-white p-3 px-4 shadow-md flex items-center justify-between gap-3 text-xs font-semibold relative z-40">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xl flex-shrink-0">📲</span>
        <div className="truncate">
          <p className="font-bold truncate">Install NB Shop App</p>
          <p className="text-[11px] text-white/80 font-normal truncate">Add to your Home Screen for fast 1-tap grocery access</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-white text-primary-600 font-bold px-3 py-1.5 rounded-lg shadow-xs hover:bg-gray-100 transition-all active:scale-95 text-xs whitespace-nowrap"
        >
          Add to Home Screen
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-white/80 hover:text-white text-base leading-none p-1 font-bold"
          title="Close banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
