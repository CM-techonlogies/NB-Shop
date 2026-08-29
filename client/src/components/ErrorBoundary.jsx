import React from 'react';

// ─── Chunk-load failure detector ──────────────────────────────────────────────
// When Vite pushes a new build, old chunk filenames (hashes) no longer exist.
// We detect this so we can show the user a friendly "Please refresh" message.
// NOTE: We do NOT auto-reload here — that was causing an infinite reload loop on iOS.
const CHUNK_FAIL_KEY = 'chunk_reload_v2';

function isChunkLoadError(error) {
  const msg = (error?.message || '').toLowerCase();
  return (
    msg.includes('importing a module') ||
    msg.includes('failed to fetch dynamically') ||
    msg.includes('dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('loading css chunk') ||
    msg.includes('import.meta') ||
    (error?.name === 'TypeError' && msg.includes('load'))
  );
}

// ─── Friendly Error UI ────────────────────────────────────────────────────────
function FriendlyErrorUI({ isChunkError, onRetry, onGoBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          {/* Illustration */}
          <div className="text-7xl mb-5 select-none">
            {isChunkError ? '🔄' : '😕'}
          </div>

          {/* Title */}
          <h1 className="text-xl font-black text-gray-900 mb-2 font-heading">
            {isChunkError ? 'App Updated!' : 'Something went wrong'}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 text-sm leading-relaxed mb-7">
            {isChunkError
              ? "We've pushed an update to the app. Please refresh to get the latest version."
              : 'This page had a problem loading. Please try again — it usually fixes itself.'}
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onRetry}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md text-sm"
            >
              {isChunkError ? '🔄  Refresh App' : '🔄  Try Again'}
            </button>
            <button
              onClick={onGoBack}
              className="w-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-semibold py-3.5 rounded-2xl transition-all text-sm"
            >
              ← Go Back
            </button>
          </div>
        </div>

        {/* Small footer hint */}
        <p className="text-center text-xs text-gray-400 mt-4">
          NB Shop — If the issue persists, please contact us.
        </p>
      </div>
    </div>
  );
}

// ─── ErrorBoundary class component ────────────────────────────────────────────
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
    this.handleRetry = this.handleRetry.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  static getDerivedStateFromError(error) {
    const isChunkError = isChunkLoadError(error);
    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error, info) {
    // Only log in dev — never expose raw errors to users in prod
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }

    // For chunk load errors: show user a "Refresh App" button.
    // We do NOT auto-reload anymore — that caused an infinite crash loop on iOS PWA
    // (sessionStorage resets on every reload, so the "already attempted" flag was lost).
  }

  handleRetry() {
    // Clear the flag so next chunk error also gets one auto-attempt
    sessionStorage.removeItem(CHUNK_FAIL_KEY);
    this.setState({ hasError: false, error: null, isChunkError: false });
    // iOS Safari crashes with reload(true) — use plain reload() instead
    window.location.reload();
  }

  handleGoBack() {
    sessionStorage.removeItem(CHUNK_FAIL_KEY);
    this.setState({ hasError: false, error: null, isChunkError: false });
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <FriendlyErrorUI
          isChunkError={this.state.isChunkError}
          onRetry={this.handleRetry}
          onGoBack={this.handleGoBack}
        />
      );
    }
    return this.props.children;
  }
}
