import React, { useState, useEffect } from 'react';

// Detect iOS/Safari (they don't support beforeinstallprompt)
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed as PWA — never show banner
    if (isInStandaloneMode()) {
      setInstalled(true);
      return;
    }

    // Already dismissed by user this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    // iOS: show banner immediately (no beforeinstallprompt on iOS)
    if (isIos()) {
      setShowBanner(true);
      return;
    }

    // Android/Chrome: wait for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();      // prevent mini-infobar
      setDeferredPrompt(e);    // save event to trigger later
      setShowBanner(true);
    };

    const installedHandler = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Triggers native Chrome "Install and create shortcut" dialog
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos()) {
      // iOS: show manual step-by-step modal
      setShowIosModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (installed || !showBanner) return null;

  return (
    <>
      {/* ── Install Banner ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary-600 to-orange-500 text-white p-3 px-4 shadow-md flex items-center justify-between gap-3 text-xs font-semibold relative z-40">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">📲</span>
          <div className="truncate">
            <p className="font-bold truncate">Install NB Shop App</p>
            <p className="text-[11px] text-white/80 font-normal truncate">
              Add to your Home Screen for fast 1-tap grocery access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-white text-primary-600 font-bold px-3 py-1.5 rounded-lg shadow-xs hover:bg-gray-100 transition-all active:scale-95 text-xs whitespace-nowrap"
          >
            {isIos() ? '📖 How to Install' : 'Add to Home Screen'}
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white text-base leading-none p-1 font-bold"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── iOS Step-by-Step Modal ─────────────────────────────── */}
      {showIosModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowIosModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-6 w-full max-w-sm shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <img
                src="/logo.jpg"
                className="w-16 h-16 rounded-2xl mx-auto mb-3 shadow-md"
                alt="NB Shop"
              />
              <h3 className="text-lg font-bold text-gray-900">Install NB Shop</h3>
              <p className="text-sm text-gray-500 mt-1">
                Follow these steps to install on your iPhone/iPad
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                <span className="text-2xl">1️⃣</span>
                <p className="text-sm text-gray-700">
                  Tap the <strong>Share</strong> button{' '}
                  <span className="text-lg font-bold">⎋</span> at the bottom of Safari
                </p>
              </div>
              <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                <span className="text-2xl">2️⃣</span>
                <p className="text-sm text-gray-700">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
              <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                <span className="text-2xl">3️⃣</span>
                <p className="text-sm text-gray-700">
                  Tap <strong>"Add"</strong> in the top-right corner — done!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="mt-5 w-full bg-primary-500 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-all"
            >
              Got it! ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
