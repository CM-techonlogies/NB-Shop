import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { STORE_NAME } from '../../constants';
import { useCategories } from '../../hooks/useProducts';
import { productService, supabasePatchProduct } from '../../services/product.service';
import Spinner from '../../components/ui/Spinner';
import ImgBBUploader from '../../components/admin/ImgBBUploader';
import { getHindiFromTags } from '../../utils/language';

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useCategories();

  // Fetch product data
  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id).then(r => r.data?.data || r.data || null),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { unit: 'kg', available: true }
  });

  const [imageUrls, setImageUrls] = useState(['']);
  const [isLoose, setIsLoose] = useState(false);

  // Pre-fill form when productData is loaded
  useEffect(() => {
    if (productData) {
      const looseVal = Boolean(
        productData.is_loose === true ||
        productData.is_loose === 'true' ||
        productData.is_loose === 1 ||
        productData.is_loose === '1' ||
        (productData.min_quantity && parseFloat(productData.min_quantity) > 0)
      );
      setIsLoose(looseVal);

      reset({
        name: productData.name || '',
        name_hi: getHindiFromTags(productData.tags) || '',
        description: productData.description || '',
        category_id: productData.category_id || productData.category?.id || productData.categories?.id || '',
        brand: productData.brand || '',
        mrp: productData.mrp || '',
        price: productData.price || '',
        stock: productData.stock !== undefined ? productData.stock : 0,
        weight: productData.weight || '',
        unit: productData.unit || 'kg',
        available: productData.available !== false,
        featured: productData.featured === true,
        trending: productData.trending === true,
        min_quantity: productData.min_quantity || '',
      });

      // Populate image URLs
      const imgs = (productData.product_images || productData.images || []).map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
      if (imgs.length > 0) {
        setImageUrls(imgs);
      } else {
        setImageUrls(['']);
      }
    }
  }, [productData, reset]);

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
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: async (_, variables) => {
      // GUARANTEED WRITE: directly patch is_loose to Supabase REST, bypassing
      // Render backend. Ensures is_loose is always correct regardless of which
      // server version is running on Render.
      await supabasePatchProduct(variables.id, { is_loose: Boolean(isLoose) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product'),
  });

  const onSubmit = (data) => {
    const validUrls = imageUrls.filter(u => u.trim());
    // Filter existing hi: tags out, then append new name_hi if present
    const existingTags = Array.isArray(productData?.tags) ? productData.tags.filter(t => typeof t === 'string' && !t.startsWith('hi:') && !t.startsWith('name_hi:')) : [];
    if (data.name_hi && data.name_hi.trim()) {
      existingTags.push(`hi:${data.name_hi.trim()}`);
    }

    // C5 FIX: coerce ALL numeric fields to numbers before sending
    mutation.mutate({
      id,
      data: {
        ...data,
        mrp: parseFloat(data.mrp),
        price: parseFloat(data.price),
        stock: parseInt(data.stock) || 0,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        is_loose: Boolean(isLoose),
        min_quantity: isLoose && data.min_quantity ? parseFloat(data.min_quantity) : undefined,
        images: validUrls,
        tags: existingTags,
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !productData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Product not found</h2>
        <button onClick={() => navigate('/admin/products')} className="text-indigo-600 font-semibold hover:underline">
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fadeIn">
      <Helmet><title>Edit Product - {STORE_NAME} Admin</title></Helmet>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition-colors font-medium">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>
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

        {/* Weight & Unit (Optional) */}
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
          <div className={`mt-5 p-4 rounded-xl border transition-all ${
            isLoose ? 'bg-amber-50 border-amber-300 shadow-xs' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">⚖️ Loose Item (तौल से बिकने वाला)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isLoose ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isLoose ? 'ON — Loose' : 'OFF — Packed'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Customer will choose quantity (e.g. 250g, 1.5 kg) before adding to cart
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLoose(!isLoose)}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isLoose ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isLoose ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isLoose && (
              <div className="mt-4 pt-3 border-t border-amber-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Quantity <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" min="0" {...register('min_quantity')}
                    className="w-40 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm bg-white"
                    placeholder="e.g. 0.25" />
                  <span className="text-sm text-gray-500">same unit as selected above (e.g. 0.25 kg = 250g min)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Images — Upload from phone or paste URL */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1 border-b pb-2">
            <h2 className="text-lg font-bold text-gray-900">Product Images</h2>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">ImgBB CDN</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            📷 Take a photo or choose from gallery — uploads automatically to ImgBB CDN!
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
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
}
