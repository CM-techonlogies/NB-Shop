import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import TokenSyncer from './components/auth/TokenSyncer';
import ScrollToTop from './components/ScrollToTop';

const AppRoutes = React.lazy(() => import('./routes/index'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,   // data is fresh for 5 min
      gcTime: 30 * 60 * 1000,     // keep in cache for 30 min (avoids re-fetch on back-nav)
      refetchOnWindowFocus: false, // don't refetch every time user switches tabs
    },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <TokenSyncer />
          <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <AppRoutes />
          </Suspense>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontFamily: 'Nunito, sans-serif' },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
