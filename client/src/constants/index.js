export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  // Products
  PRODUCTS: '/products',
  FEATURED_PRODUCTS: '/products/featured',
  TRENDING_PRODUCTS: '/products/trending',
  NEW_ARRIVALS: '/products/new-arrivals',
  // Categories
  CATEGORIES: '/categories',
  // Cart
  CART: '/cart',
  // Orders
  ORDERS: '/orders',
  MY_ORDERS: '/orders/my',
  // Users
  PROFILE: '/users/profile',
  ADDRESSES: '/users/addresses',
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ORDERS: '/orders/admin/all',
  ADMIN_USERS: '/users/admin/all',
  ADMIN_PRODUCTS: '/products',
  ADMIN_CATEGORIES: '/categories/admin',
  BANNERS: '/banners',
  OFFERS: '/offers',
  SETTINGS: '/settings',
};

export const ORDER_STATUSES = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', step: 0 },
  payment_received: { label: 'Payment Received', color: 'bg-blue-100 text-blue-700', step: 1 },
  confirmed: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700', step: 2 },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700', step: 3 },
  packed: { label: 'Packed', color: 'bg-orange-100 text-orange-700', step: 4 },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-700', step: 5 },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', step: 6 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', step: -1 },
};

export const DELIVERY_CHARGE = 40;
export const FREE_DELIVERY_ABOVE = 499;

export const SAMPLE_CATEGORIES = [
  { _id: '1', name: 'Rice & Atta', slug: 'rice-atta', image: { url: '' } },
  { _id: '2', name: 'Oil & Ghee', slug: 'oil-ghee', image: { url: '' } },
  { _id: '3', name: 'Spices', slug: 'spices', image: { url: '' } },
  { _id: '4', name: 'Pulses', slug: 'pulses', image: { url: '' } },
  { _id: '5', name: 'Tea & Coffee', slug: 'tea-coffee', image: { url: '' } },
  { _id: '6', name: 'Cold Drinks', slug: 'cold-drinks', image: { url: '' } },
  { _id: '7', name: 'Snacks', slug: 'snacks', image: { url: '' } },
  { _id: '8', name: 'Cleaning', slug: 'cleaning', image: { url: '' } },
  { _id: '9', name: 'Personal Care', slug: 'personal-care', image: { url: '' } },
  { _id: '10', name: 'Dairy', slug: 'dairy', image: { url: '' } },
];

export const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'MyKirana Store';
export const OWNER_WHATSAPP = import.meta.env.VITE_OWNER_WHATSAPP || '919876543210';
