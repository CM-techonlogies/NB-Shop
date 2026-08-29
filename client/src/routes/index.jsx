import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Spinner from '../components/ui/Spinner';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFoundPage from '../pages/NotFoundPage';

// ─── Retry-aware lazy loader ──────────────────────────────────────────────────
// Wraps React.lazy so that if a chunk import fails (stale SW cache / network blip),
// we wait 800ms and try once more before giving up and letting ErrorBoundary handle it.
function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn().catch((err) => {
      // One silent retry after a short delay
      return new Promise((resolve, reject) => {
        setTimeout(() => importFn().then(resolve).catch(reject), 800);
      });
    })
  );
}

// Main Customer pages — eagerly imported for instant 0ms native app-like tab switching (no Suspense flash)
import HomePage from '../pages/customer/HomePage';
import CategoriesPage from '../pages/customer/CategoriesPage';
import CartPage from '../pages/customer/CartPage';
import OrdersPage from '../pages/customer/OrdersPage';
import ProfilePage from '../pages/customer/ProfilePage';

// Other customer pages (lazy + retry)
const ProductsPage     = lazyWithRetry(() => import('../pages/customer/ProductsPage'));
const ProductDetailPage= lazyWithRetry(() => import('../pages/customer/ProductDetailPage'));
const CategoryPage     = lazyWithRetry(() => import('../pages/customer/CategoryPage'));
const CheckoutPage     = lazyWithRetry(() => import('../pages/customer/CheckoutPage'));
const OrderDetailPage  = lazyWithRetry(() => import('../pages/customer/OrderDetailPage'));
const LoginPage        = lazyWithRetry(() => import('../pages/customer/LoginPage'));
const AboutPage        = lazyWithRetry(() => import('../pages/customer/AboutPage'));
const ContactPage      = lazyWithRetry(() => import('../pages/customer/ContactPage'));
const PrivacyPage      = lazyWithRetry(() => import('../pages/customer/PrivacyPage'));
const TermsPage        = lazyWithRetry(() => import('../pages/customer/TermsPage'));

// Admin pages (lazy + retry)
const AdminLoginPage        = lazyWithRetry(() => import('../pages/admin/AdminLoginPage'));
const DashboardPage         = lazyWithRetry(() => import('../pages/admin/DashboardPage'));
const ProductsAdminPage     = lazyWithRetry(() => import('../pages/admin/ProductsAdminPage'));
const AddProductPage        = lazyWithRetry(() => import('../pages/admin/AddProductPage'));
const EditProductPage       = lazyWithRetry(() => import('../pages/admin/EditProductPage'));
const CategoriesAdminPage   = lazyWithRetry(() => import('../pages/admin/CategoriesAdminPage'));
const OrdersAdminPage       = lazyWithRetry(() => import('../pages/admin/OrdersAdminPage'));
const OrderDetailAdminPage  = lazyWithRetry(() => import('../pages/admin/OrderDetailAdminPage'));
const CustomersAdminPage    = lazyWithRetry(() => import('../pages/admin/CustomersAdminPage'));
const BannersAdminPage      = lazyWithRetry(() => import('../pages/admin/BannersAdminPage'));
const OffersAdminPage       = lazyWithRetry(() => import('../pages/admin/OffersAdminPage'));
const SettingsAdminPage     = lazyWithRetry(() => import('../pages/admin/SettingsAdminPage'));

const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-[30vh] py-12">
    <Spinner size="md" />
  </div>
);

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/search" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsAdminPage />} />
            <Route path="products/add" element={<AddProductPage />} />
            <Route path="products/edit/:id" element={<EditProductPage />} />
            <Route path="categories" element={<CategoriesAdminPage />} />
            <Route path="orders" element={<OrdersAdminPage />} />
            <Route path="orders/:id" element={<OrderDetailAdminPage />} />
            <Route path="customers" element={<CustomersAdminPage />} />
            <Route path="banners" element={<BannersAdminPage />} />
            <Route path="offers" element={<OffersAdminPage />} />
            <Route path="settings" element={<SettingsAdminPage />} />
          </Route>
          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
