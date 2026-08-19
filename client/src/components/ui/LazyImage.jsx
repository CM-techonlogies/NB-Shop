import React, { useState, useRef, useEffect } from 'react';

/**
 * LazyImage — performant image component with:
 *  • Native `loading="lazy"` for below-fold images
 *  • Blur-up placeholder: a tiny inline SVG that fades out once the real image loads
 *  • Fade-in transition so the jump from blank → image is smooth
 *  • onError fallback to a neutral emoji placeholder
 *  • Intersection-Observer based trigger (so src is only set when near viewport)
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  fallback = null,
  eager = false, // set true for above-the-fold images (hero, first visible card)
  style,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(eager); // eager images start as inView
  const wrapperRef = useRef(null);

  // IntersectionObserver: only set src when the image is ~200px away from viewport
  useEffect(() => {
    if (eager || !src) return;
    const el = wrapperRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src, eager]);

  if (!src || error) {
    return (
      <div
        ref={wrapperRef}
        className={`flex items-center justify-center bg-gray-100 ${wrapperClassName}`}
        style={style}
      >
        {fallback || <span className="text-4xl text-gray-300">🛒</span>}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={style}
    >
      {/* Shimmer placeholder shown until real image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      )}

      {/* Real image — only assign src once in-view */}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={style}
        />
      )}
    </div>
  );
}
