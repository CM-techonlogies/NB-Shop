import React, { useState, useEffect } from 'react';
import { useLanguageStore } from '../../store/languageStore';

// Detect iOS/Safari (they don't support beforeinstallprompt)
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export default function PwaInstallPrompt() {
  const { t } = useLanguageStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // ── Already installed as PWA ──────────────────────────────────
    if (isInStandaloneMode() || localStorage.getItem('pwa-installed')) {
      setInstalled(true);
      return;
    }

    // ── User permanently dismissed (clicked ✕) ───────────────────
    if (localStorage.getItem('pwa-dismissed')) return;

    // ── If prompt was already captured earlier in this SPA session ─
    // (beforeinstallprompt only fires ONCE per browser session;
    //  storing it on window keeps it alive across React re-mounts)
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt);
      setShowBanner(true);
      return;
    }

    // ── iOS: no install event — show banner immediately ───────────
    if (isIos()) {
      setShowBanner(true);
      return;
    }

    // ── Android/Chrome: listen for beforeinstallprompt ────────────
    const handlePrompt = (e) => {
      e.preventDefault();
      window.__pwaPrompt = e;       // persist on window for SPA navigation
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleInstalled = () => {
      localStorage.setItem('pwa-installed', '1');
      window.__pwaPrompt = null;
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Triggers native "Install and create shortcut" dialog
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', '1');
        window.__pwaPrompt = null;
        setInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
      window.__pwaPrompt = null;
    } else if (isIos()) {
      setShowIosModal(true);
    }
  };

  // Permanently dismiss (won't show again until localStorage is cleared)
  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (installed || !showBanner) return null;

  return (
    <>
      {/* ── Install Banner ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary-600 to-orange-500 text-white p-3 px-4 shadow-md flex items-center justify-between gap-3 text-xs font-semibold relative z-40">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">📲</span>
          <div className="truncate">
            <p className="font-bold truncate">{t('install_app_title')}</p>
            <p className="text-[11px] text-white/80 font-normal truncate">
              {t('install_app_desc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-white text-primary-600 font-bold px-3 py-1.5 rounded-lg shadow-xs hover:bg-gray-100 transition-all active:scale-95 text-xs whitespace-nowrap"
          >
            {isIos() ? t('how_to_install') : t('add_to_home_screen')}
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white text-base leading-none p-1 font-bold"
            title="Dismiss"
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
            className="bg-white rounded-t-3xl p-6 w-full max-w-sm shadow-2xl"
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
