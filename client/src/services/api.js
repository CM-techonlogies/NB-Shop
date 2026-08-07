import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Token will be set by Clerk's auth hook and stored here
let clerkToken = null;
export const setApiToken = (token) => { clerkToken = token; };

// Request interceptor - attach Clerk JWT to every request
api.interceptors.request.use(
  (config) => {
    if (clerkToken) {
      config.headers.Authorization = `Bearer ${clerkToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - Clerk will handle re-auth
      console.warn('API 401: Unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;
