import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'logo.jpg'],
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        // Don't precache large chunks — they'll be cached on first use
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          // HTML pages — always network first (prevents stale chunk errors)
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 5, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // JS/CSS assets — CacheFirst (hashed filenames = safe forever)
          {
            urlPattern: /\/assets\/.+\.(js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Product images from Supabase Storage / ImgBB / CDN (ONLY image files, NEVER REST APIs)
          {
            urlPattern: ({ url }) =>
              (/\.(png|jpg|jpeg|webp|svg|gif|avif)$/i.test(url.pathname) ||
               url.pathname.includes('/storage/v1/object/public/')) &&
              !url.pathname.includes('/rest/v1/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'product-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase REST and Backend APIs — ALWAYS NetworkOnly (Zero Cache in Service Worker)
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/rest/v1/') ||
              url.pathname.startsWith('/api/') ||
              url.hostname.includes('supabase.co'),
            handler: 'NetworkOnly',
          },
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: 'NB Shop',
        short_name: 'NB Shop',
        description: 'NB Shop - Fresh Groceries Delivered',
        theme_color: '#FF6B00',
        background_color: '#FFF8F0',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],

  build: {
    // Target modern browsers — smaller output, no legacy polyfills
    target: 'es2020',
    // Raise chunk warning threshold (we're intentionally splitting)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // ── Manual chunk splitting ───────────────────────────────────────
        // Goal: Vendor libs are cached forever (content-hashed).
        // App code changes frequently. Keep them separate.
        manualChunks(id) {
          // React core — smallest, most shared chunk
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-is/')) {
            return 'vendor-react';
          }
          // React Router
          if (id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          // Clerk auth — large, rarely changes
          if (id.includes('node_modules/@clerk/')) {
            return 'vendor-clerk';
          }
          // React Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }
          // Framer Motion — large animation lib, only used on some pages
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Swiper — carousel, only on HomePage
          if (id.includes('node_modules/swiper')) {
            return 'vendor-swiper';
          }
          // Recharts — chart lib, only for admin Dashboard
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-') ||
              id.includes('node_modules/lodash')) {
            return 'vendor-charts';
          }
          // Axios + other utils
          if (id.includes('node_modules/axios') ||
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/react-hot-toast') ||
              id.includes('node_modules/react-helmet') ||
              id.includes('node_modules/react-hook-form')) {
            return 'vendor-utils';
          }
        },
      },
    },
  },

  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
