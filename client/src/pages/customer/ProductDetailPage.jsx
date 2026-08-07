import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProductById, useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { STORE_NAME } from '../../constants';
import ProductGrid from '../../components/product/ProductGrid';
import { CheckBadgeIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/ui/Spinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: productData, isLoading } = useProductById(id);

  // Supabase returns data directly (not nested in .data)
  const product = productData?.data ?? productData;

  const { data: relatedData, isLoading: relatedLoading } = useProducts({
    category: product?.category_id,
    limit: 4,
  });
  const relatedProducts = (relatedData?.data || []).filter(p => p.id !== id);

  const { addToCart, cart, updateQuantity } = useCart();
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Spinner size="xl" /></div>;
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products" className="text-primary-500 hover:underline">← Back to products</Link>
      </div>
    );
  }

  // Supabase: images come from joined `product_images` table
  const rawImages = product.product_images?.length > 0
    ? product.product_images
    : product.images?.length > 0
      ? product.images
      : [{ url: 'https://via.placeholder.com/600' }];

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const productId = product.id || product._id;
  const cartItem = cart.find(item => item.id === productId);

  const handleAddToCart = () => addToCart(product);

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{`${product.name} - ${STORE_NAME}`}</title>
      </Helmet>

      <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-12">
        <div className="flex flex-col md:flex-row">

          {/* Image Gallery */}
          <div className="md:w-1/2 p-6 md:p-10 flex flex-col items-center bg-gray-50 border-r border-gray-100">
            <div className="w-full max-w-md aspect-square relative mb-6 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
              {discount > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                  {discount}% OFF
                </div>
              )}
              <img
                src={rawImages[activeImage]?.url}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>

            {/* Thumbnails */}
            {rawImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2 px-1 w-full max-w-md justify-center">
                {rawImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                      activeImage === idx
                        ? 'border-primary-500 shadow-md scale-105'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img.url} alt={`${product.name} ${idx}`} className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-6 md:p-12 flex flex-col">
            <div className="mb-2">
              {product.brand && (
                <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">{product.brand}</span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="text-sm font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">
                {product.weight} {product.unit}
              </div>
              {product.stock > 0 ? (
                <div className="flex items-center text-green-600 text-sm font-bold gap-1 bg-green-50 px-3 py-1 rounded-lg">
                  <CheckBadgeIcon className="w-5 h-5" /> In Stock
                </div>
              ) : (
                <div className="text-red-500 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg">Out of Stock</div>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                {product.mrp > product.price && (
                  <span className="text-xl text-gray-400 line-through mb-1">₹{product.mrp}</span>
                )}
              </div>
              <p className="text-sm text-green-600 font-medium">Inclusive of all taxes</p>
            </div>

            {/* Action Area */}
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              {cartItem ? (
                <div className="flex items-center gap-6">
                  <span className="text-gray-700 font-semibold">Quantity in Cart:</span>
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-12 w-32">
                    <button
                      onClick={() => updateQuantity(cartItem.id, cartItem.qty - 1)}
                      className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-xl font-bold"
                    >-</button>
                    <span className="flex-1 text-center font-bold text-gray-800">{cartItem.qty}</span>
                    <button
                      onClick={() => updateQuantity(cartItem.id, cartItem.qty + 1)}
                      disabled={cartItem.qty >= product.stock}
                      className="w-10 h-full flex items-center justify-center text-primary-500 hover:bg-primary-50 transition-colors text-xl font-bold disabled:opacity-50"
                    >+</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 text-lg"
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-blue-700">
                <ShieldCheckIcon className="w-6 h-6" />
                <span className="text-sm font-semibold">Quality Assured</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-green-700">
                <TruckIcon className="w-6 h-6" />
                <span className="text-sm font-semibold">Fast Delivery</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-bold mb-3 font-heading text-gray-800">Product Details</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold font-heading mb-6 border-b pb-2">Similar Products</h2>
          <ProductGrid products={relatedProducts} isLoading={relatedLoading} skeletonCount={4} />
        </div>
      )}
    </div>
  );
}
