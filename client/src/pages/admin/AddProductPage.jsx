import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { STORE_NAME } from '../../constants';
import { useCategories } from '../../hooks/useProducts';
import { productService } from '../../services/product.service';
import ImgBBUploader from '../../components/admin/ImgBBUploader';

export default function AddProductPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { unit: 'kg', available: true }
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();

  // Up to 5 image URL inputs
  const [imageUrls, setImageUrls] = useState(['']);

  const addImageUrl = () => {
    if (imageUrls.length < 5) setImageUrls([...imageUrls, '']);
  };
  const removeImageUrl = (i) => setImageUrls(imageUrls.filter((_, idx) => idx !== i));
  const updateImageUrl = (i, val) => {
    const updated = [...imageUrls];
    updated[i] = val;
    setImageUrls(updated);
  };

  const mutation = useMutation({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully!');
      navigate('/admin/products');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add product'),
  });

  const onSubmit = (data) => {
    const validUrls = imageUrls.filter(u => u.trim());
    const tagsList = data.tags ? (Array.isArray(data.tags) ? [...data.tags] : String(data.tags).split(',').map(t => t.trim())) : [];
    if (data.name_hi && data.name_hi.trim()) {
      tagsList.push(`hi:${data.name_hi.trim()}`);
    }
    mutation.mutate({
      ...data,
      mrp: parseFloat(data.mrp),
      price: parseFloat(data.price),
      stock: parseInt(data.stock) || 0,
      weight: data.weight ? parseFloat(data.weight) : undefined,
      is_loose: data.is_loose === true || data.is_loose === 'true' || data.is_loose === 'on' || data.is_loose === 1,
      min_quantity: data.min_quantity ? parseFloat(data.min_quantity) : undefined,
      images: validUrls,
      tags: tagsList,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fadeIn">
      <Helmet><title>Add Product - {STORE_NAME} Admin</title></Helmet>

      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition-colors">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (English) *</label>
              <input {...register('name', { required: 'Product name is required' })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="e.g. India Gate Basmati Rice 5kg" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hindi Product Name / हिंदी नाम <span className="text-xs text-indigo-600 font-normal">(Optional - for Hindi storefront)</span>
              </label>
              <input {...register('name_hi')}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="जैसे: बासमती चावल, सरसों तेल, गेहूं का आटा" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea {...register('description')} rows="3"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                placeholder="Product details, features, ingredients..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select {...register('category_id', { required: 'Category is required' })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand (Optional)</label>
              <input {...register('brand')}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="e.g. Tata, Amul, Nestlé" />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
              <input type="number" step="0.01" {...register('price', { required: 'Price is required', min: 0 })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="0.00" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹) *</label>
              <input type="number" step="0.01" {...register('mrp', { required: 'MRP is required', min: 0 })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="0.00" />
              {errors.mrp && <p className="text-red-500 text-xs mt-1">{errors.mrp.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input type="number" {...register('stock', { required: 'Stock is required', min: 0 })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="100" />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
            </div>
          </div>
        </div>

        {/* Weight, Unit & Loose Item Config */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Weight, Unit & Item Type</h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight/Volume (Optional)</label>
              <input {...register('weight')}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="e.g. 1, 500, 2 (or leave empty)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit (Optional)</label>
              <select {...register('unit')}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                <option value="">None / Selective</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">L</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
                <option value="pack">pack</option>
                <option value="dozen">dozen</option>
              </select>
            </div>
          </div>

          {/* Loose Item Toggle */}
          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" {...register('is_loose')} id="is_loose" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-amber-500 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-amber-300" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">⚖️ Loose Item (तौल से बिकने वाला)</p>
                <p className="text-xs text-gray-500 mt-0.5">Customer will choose quantity (e.g. 250g, 1.5 kg) before adding to cart</p>
              </div>
            </label>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Quantity <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <input type="number" step="0.01" min="0" {...register('min_quantity')}
                  className="w-40 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm"
                  placeholder="e.g. 0.25" />
                <span className="text-sm text-gray-500">same unit as selected above (e.g. 0.25 kg = 250g min)</span>
              </div>
            </div>
          </div>
        </div>


        {/* Product Images — Upload from phone or paste URL */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1 border-b pb-2">
            <h2 className="text-lg font-bold text-gray-900">Product Images</h2>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">ImgBB CDN</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            📷 Click the button below to take a photo or pick from gallery — image uploads automatically!
          </p>
          <ImgBBUploader imageUrls={imageUrls} setImageUrls={setImageUrls} maxImages={5} />
        </div>

        {/* Status flags */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Visibility</h2>
          <div className="flex gap-6 flex-wrap">
            {[
              { name: 'available', label: 'Available (Active)' },
              { name: 'featured', label: 'Featured (Deals)' },
              { name: 'trending', label: 'Trending' },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register(name)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || mutation.isPending}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
            {(isSubmitting || mutation.isPending) && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
