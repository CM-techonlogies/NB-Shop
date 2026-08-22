import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { STORE_NAME } from '../../constants';
import { MagnifyingGlassIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { useCategories } from '../../hooks/useProducts';
import toast from 'react-hot-toast';

export default function ProductsAdminPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-admin', search, category],
    queryFn: () => productService.getProducts({ search, category, limit: 50 }).then(r => {
      const body = r?.data;
      if (!body) return [];
      if (Array.isArray(body.data?.data)) return body.data.data;
      if (Array.isArray(body.data)) return body.data;
      return [];
    }),
  });

  const { data: categories = [] } = useCategories();

  const products = Array.isArray(productsData) ? productsData : [];

  const deleteMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      toast.success('Product deleted!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => productService.toggleAvailability(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products-admin'] }),
    onError: () => toast.error('Failed to toggle availability'),
  });

  const toggleLooseMutation = useMutation({
    mutationFn: (id) => productService.toggleLoose(id),
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
        <Link to="/admin/products/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <PlusIcon className="w-5 h-5" /> Add Product
        </Link>
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
                      onClick={() => toggleLooseMutation.mutate(product.id)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
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
                      onClick={() => toggleMutation.mutate(product.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.available ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.available ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
