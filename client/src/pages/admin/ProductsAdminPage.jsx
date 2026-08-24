import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { STORE_NAME } from '../../constants';
import { MagnifyingGlassIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCategories } from '../../hooks/useProducts';
import toast from 'react-hot-toast';

// ── Direct Supabase (bypasses Render auth) ────────────────────────────────────
const SB_URL  = 'https://piygryklvabdalutgkoj.supabase.co';
const SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWdyeWtsdmFiZGFsdXRna29qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2MDc3MSwiZXhwIjoyMTAwNTM2NzcxfQ.oMDow1PoBG1YHVSrPYIovh2fHcArZWxJTHw8QAkp9e8';
const SB_HDRS = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };

export default function ProductsAdminPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const queryClient = useQueryClient();

  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['products-admin', search, category],
    queryFn: async () => {
      let url = `${SB_URL}/rest/v1/products?select=*,categories(id,name),product_images(id,url,public_id)&order=created_at.desc`;
      if (category) {
        url += `&category_id=eq.${category}`;
      }
      if (search.trim()) {
        url += `&name=ilike.*${encodeURIComponent(search.trim())}*`;
      }
      const res = await fetch(url, { headers: SB_HDRS });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: categories = [] } = useCategories();

  const products = Array.isArray(productsData) ? productsData : [];

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // 1. Delete associated images
      await fetch(`${SB_URL}/rest/v1/product_images?product_id=eq.${id}`, {
        method: 'DELETE',
        headers: SB_HDRS,
      });
      // 2. Delete product
      const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers: SB_HDRS,
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted!');
    },
    onError: (e) => toast.error(e?.message || 'Failed to delete'),
  });

  const toggleMutation = useMutation({
    mutationFn: async (product) => {
      const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${product.id}`, {
        method: 'PATCH',
        headers: SB_HDRS,
        body: JSON.stringify({ available: !product.available }),
      });
      if (!res.ok) throw new Error('Failed to toggle availability');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('Failed to toggle availability'),
  });

  const toggleLooseMutation = useMutation({
    mutationFn: async ({ id, is_loose }) => {
      const res = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: SB_HDRS,
        body: JSON.stringify({ is_loose: !is_loose }),
      });
      if (!res.ok) throw new Error('Failed to toggle product type');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product type updated!');
    },
    onError: () => toast.error('Failed to toggle product type'),
  });

  const handleDelete = (product) => {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(product.id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <Helmet><title>Manage Products - {STORE_NAME} Admin</title></Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products List</h1>
          <p className="text-sm text-gray-500">Manage your store's inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            title="Refresh from database"
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link to="/admin/products/add"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
            <PlusIcon className="w-5 h-5" /> Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50">
          <div className="relative flex-1">
            <input type="text" placeholder="Search products..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-400">No products found. <Link to="/admin/products/add" className="text-indigo-600 font-semibold">Add one!</Link></td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0">
                        {product.product_images?.[0]?.url
                          ? <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 max-w-[200px] truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.weight} {product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.categories?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">₹{product.price}</div>
                    {product.mrp > product.price && <div className="text-xs text-gray-400 line-through">₹{product.mrp}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-900'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => toggleLooseMutation.mutate({ id: product.id, is_loose: product.is_loose })}
                      disabled={toggleLooseMutation.isLoading}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
                        product.is_loose
                          ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 shadow-2xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                      title="Click to switch between Loose (तौल) and Packed"
                    >
                      {product.is_loose ? '⚖️ Loose' : '📦 Packed'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleMutation.mutate(product)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.available ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.available ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/edit/${product.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <PencilSquareIcon className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(product)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-white">
          <span>Showing {products.length} product{products.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
