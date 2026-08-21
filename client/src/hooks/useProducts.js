import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';

// Helper: safely extract array from API response
// Handles both: r.data.data (paginated) and r.data (direct array)
const extractArray = (r) => {
  const body = r?.data;
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  return [];
};

const extractPaginated = (r) => {
  const body = r?.data;
  if (!body) return { data: [], total: 0, page: 1 };
  if (body.data && typeof body.data === 'object' && Array.isArray(body.data.data)) {
    // double-nested: { data: { data: [], total: N } }
    return body.data;
  }
  if (Array.isArray(body.data)) {
    return { data: body.data, total: body.data.length, page: 1 };
  }
  return { data: [], total: 0, page: 1 };
};

export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params).then(r => extractPaginated(r)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getFeatured().then(r => extractArray(r)),
    staleTime: 15 * 60 * 1000, // featured list changes rarely
  });
};

export const useTrendingProducts = () => {
  return useQuery({
    queryKey: ['products', 'trending'],
    queryFn: () => productService.getTrending().then(r => extractArray(r)),
    staleTime: 15 * 60 * 1000,
  });
};

export const useNewArrivals = () => {
  return useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productService.getNewArrivals().then(r => extractArray(r)),
    staleTime: 15 * 60 * 1000,
  });
};

export const useProductById = (id) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getProductById(id).then(r => r?.data?.data || r?.data || null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Always returns a plain array
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories().then(r => extractArray(r)),
    staleTime: 60 * 60 * 1000, // categories change very rarely — cache for 1 hour
  });
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['categories-admin'],
    queryFn: () => categoryService.getAllAdmin().then(r => extractArray(r)),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategoryBySlug = (slug) => {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: () => categoryService.getCategoryBySlug(slug).then(r => r?.data?.data || r?.data || null),
    enabled: !!slug,
    staleTime: 60 * 60 * 1000,
  });
};

// Fetch products for a specific category (by category id), limited to `limit` items
export const useProductsByCategory = (categoryId, limit = 5) => {
  return useQuery({
    queryKey: ['products-by-category', categoryId, limit],
    queryFn: () =>
      productService
        .getProducts({ category: categoryId, limit, available: true })
        .then(r => extractPaginated(r).data || []),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useBanners = () => {
  return useQuery({
    queryKey: ['public-banners'],
    queryFn: () => productService.getProducts ? productService.getProducts().then(() => []).catch(() => []) : [],
    staleTime: 15 * 60 * 1000,
  });
};
