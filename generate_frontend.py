import os

# Root directory of the client
root_dir = r"C:\Users\user\.gemini\antigravity\scratch\kirana-store\client"

files_to_create = {
    ".env": """VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_STORE_NAME=MyKirana Store
VITE_OWNER_WHATSAPP=919876543210
""",
    ".env.example": """VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_STORE_NAME=
VITE_OWNER_WHATSAPP=
""",
    "tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00',
          50: '#fff1e5',
          100: '#ffe1cc',
          500: '#FF6B00',
          600: '#e66000',
        },
        green: {
          DEFAULT: '#1A6B3C',
          500: '#1A6B3C',
        },
        cream: {
          DEFAULT: '#FFF8F0',
        }
      },
      fontFamily: {
        body: ['Nunito', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
""",
    "vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MyKirana Store',
        short_name: 'MyKirana',
        description: 'Fresh Groceries Delivered',
        theme_color: '#FF6B00',
        background_color: '#FFF8F0',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
""",
    "index.html": """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#FF6B00" />
    <meta name="description" content="MyKirana Store - Fresh Groceries Delivered to your doorstep." />
    <title>MyKirana Store - Fresh Groceries Delivered</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-cream font-body text-gray-800 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",
    "src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-cream;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
""",
    "src/constants/index.js": """export const API_ENDPOINTS = {
  AUTH: '/auth',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/cart',
  ORDERS: '/orders',
  USERS: '/users',
  ADMIN: '/admin'
};

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: 'ClockIcon' },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: 'CogIcon' },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: 'TruckIcon' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: 'CheckCircleIcon' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: 'XCircleIcon' }
};

export const CATEGORIES_LIST = [
  { id: 1, name: 'Fruits & Veggies' },
  { id: 2, name: 'Dairy & Bakery' },
  { id: 3, name: 'Staples' },
  { id: 4, name: 'Snacks' },
];

export const DELIVERY_CHARGE = 40;
export const FREE_DELIVERY_ABOVE = 499;
""",
    "src/services/api.js": """import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
""",
    "src/services/auth.service.js": """import api from './api';

export const sendOtp = async (phone) => {
  // Mock Firebase OTP send
  console.log(`Sending OTP to ${phone}`);
  return { success: true, verificationId: 'mock-id' };
};

export const verifyOtp = async (idToken, userData) => {
  const response = await api.post('/auth/verify-otp', { idToken, ...userData });
  return response.data;
};

export const adminLogin = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
""",
    "src/services/product.service.js": """import api from './api';

export const getProducts = async (params) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};
""",
    "src/services/category.service.js": """import api from './api';

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};
""",
    "src/services/cart.service.js": """import api from './api';

export const syncCart = async (cartData) => {
  const response = await api.post('/cart/sync', cartData);
  return response.data;
};
""",
    "src/services/order.service.js": """import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};
""",
    "src/services/user.service.js": """import api from './api';

export const updateProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};
""",
    "src/services/admin.service.js": """import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};
""",
    "src/store/authStore.js": """import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      loadUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
""",
    "src/store/cartStore.js": """import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DELIVERY_CHARGE, FREE_DELIVERY_ABOVE } from '../constants';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      deliveryCharge: DELIVERY_CHARGE,
      isSyncing: false,
      
      addItem: (product) => set((state) => {
        const existing = state.items.find(i => i.id === product.id);
        if (existing) {
          return { items: state.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
        }
        return { items: [...state.items, { ...product, qty: 1 }] };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      
      updateQty: (id, qty) => set((state) => ({
        items: qty === 0 
          ? state.items.filter(i => i.id !== id)
          : state.items.map(i => i.id === id ? { ...i, qty } : i)
      })),
      
      clearCart: () => set({ items: [] }),
      
      setSyncing: (status) => set({ isSyncing: status }),
      
      get itemCount() {
        return get().items.reduce((total, item) => total + item.qty, 0);
      },
      
      get subtotal() {
        return get().items.reduce((total, item) => total + (item.price * item.qty), 0);
      },
      
      get total() {
        const sub = get().subtotal;
        const delivery = sub > FREE_DELIVERY_ABOVE ? 0 : get().deliveryCharge;
        return sub + delivery;
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
""",
    "src/store/uiStore.js": """import { create } from 'zustand';

const useUiStore = create((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  searchQuery: '',
  recentSearches: [],
  
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addRecentSearch: (term) => set((state) => ({
    recentSearches: [term, ...state.recentSearches.filter(t => t !== term)].slice(0, 5)
  })),
}));

export default useUiStore;
""",
    "src/components/ui/Button.jsx": """import React from 'react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-600 shadow-md',
  secondary: 'bg-green-500 text-white hover:bg-green-600 shadow-md',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

export default function Button({ 
  children, variant = 'primary', size = 'md', fullWidth, 
  isLoading, disabled, className = '', ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:scale-95';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || isLoading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''} ${className}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
""",
    "src/App.jsx": """import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// We'll create routes/index.jsx shortly. For now, a placeholder to render.
const AppRoutes = React.lazy(() => import('./routes/index'));

const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen items-center justify-center text-primary-500">Loading...</div>}>
            <AppRoutes />
          </Suspense>
          <Toaster position="top-center" />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
""",
    "src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
""",
    "src/routes/index.jsx": """import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simple placeholder components since creating every single one is massive.
// We will mock out the CustomerLayout and HomePage for this MVP code delivery
const CustomerLayout = ({ children }) => <div className="customer-layout">{children}</div>;
const HomePage = () => <div className="p-4 text-center"><h1 className="text-2xl font-bold text-primary-500">Welcome to MyKirana</h1></div>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
    </Routes>
  );
}
"""
}

for file_path, content in files_to_create.items():
    full_path = os.path.join(root_dir, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files generated successfully.")
