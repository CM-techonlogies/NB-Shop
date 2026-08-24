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
      staleTime: 0,                // data is always considered stale -> real-time network queries
      gcTime: 5 * 60 * 1000,
      refetchOnMount: 'always',    // always fetch fresh data when navigating
      refetchOnWindowFocus: true,  // refetch immediately when window/tab is focused
      refetchOnReconnect: true,
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
            <div className="flex items-center justify-center min-h-[40vh] py-12">
              <div className="w-7 h-7 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
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
