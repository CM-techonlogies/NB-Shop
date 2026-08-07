import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Spinner from '../components/ui/Spinner';

// Customer pages (lazy)
const HomePage = lazy(() => import('../pages/customer/HomePage'));
const ProductsPage = lazy(() => import('../pages/customer/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/customer/ProductDetailPage'));
const CategoriesPage = lazy(() => import('../pages/customer/CategoriesPage'));
const CategoryPage = lazy(() => import('../pages/customer/CategoryPage'));
const CartPage = lazy(() => import('../pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('../pages/customer/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/customer/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/customer/OrderDetailPage'));
const ProfilePage = lazy(() => import('../pages/customer/ProfilePage'));
const LoginPage = lazy(() => import('../pages/customer/LoginPage'));
const AboutPage = lazy(() => import('../pages/customer/AboutPage'));
const ContactPage = lazy(() => import('../pages/customer/ContactPage'));
const PrivacyPage = lazy(() => import('../pages/customer/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/customer/TermsPage'));

// Admin pages (lazy)
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const ProductsAdminPage = lazy(() => import('../pages/admin/ProductsAdminPage'));
const AddProductPage = lazy(() => import('../pages/admin/AddProductPage'));
const EditProductPage = lazy(() => import('../pages/admin/EditProductPage'));
const CategoriesAdminPage = lazy(() => import('../pages/admin/CategoriesAdminPage'));
const OrdersAdminPage = lazy(() => import('../pages/admin/OrdersAdminPage'));
const OrderDetailAdminPage = lazy(() => import('../pages/admin/OrderDetailAdminPage'));
const CustomersAdminPage = lazy(() => import('../pages/admin/CustomersAdminPage'));
const BannersAdminPage = lazy(() => import('../pages/admin/BannersAdminPage'));
const OffersAdminPage = lazy(() => import('../pages/admin/OffersAdminPage'));
const SettingsAdminPage = lazy(() => import('../pages/admin/SettingsAdminPage'));

const Loading = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
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
      </Routes>
    </Suspense>
  );
}
