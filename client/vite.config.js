import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // ⚠️ VitePWA / Service Worker completely removed.
    // On iOS Safari PWA mode, Workbox's navigateFallback intercepts ALL navigate-mode
    // fetches (including React Router's client-side navigation) and responds with the
    // precached index.html — triggering a full page reload on EVERY tab/link click.
    // Since this app always needs live Supabase data, offline caching has zero benefit
    // and causes more harm than good. PWA manifest is served via index.html <link> tags.
  ],

  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-is/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/@clerk/')) {
            return 'vendor-clerk';
          }
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/swiper')) {
            return 'vendor-swiper';
          }
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-') ||
              id.includes('node_modules/lodash')) {
            return 'vendor-charts';
          }
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
