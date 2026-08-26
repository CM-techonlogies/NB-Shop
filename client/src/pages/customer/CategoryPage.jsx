import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCategories, useProducts } from '../../hooks/useProducts';
import ProductGrid from '../../components/product/ProductGrid';
import { STORE_NAME } from '../../constants';
import Spinner from '../../components/ui/Spinner';
import { useLanguageStore } from '../../store/languageStore';
import { getCategoryName, getCategoryDescription } from '../../constants/translations';

export default function CategoryPage() {
  const { slug } = useParams();
  const { t, language } = useLanguageStore();
  const { data: categoriesData, isLoading: catLoading } = useCategories();
  
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
  const category = categories.find(c => c.slug === slug);
  const categoryId = category?.id || category?._id;
  const catImg = category?.image_url || category?.image?.url || (typeof category?.image === 'string' ? category.image : null);
  const catDisplayName = category ? getCategoryName(category.name, language) : '';
  
  const { data: productsData, isLoading: prodLoading } = useProducts({ 
    category: categoryId,
    enabled: !!categoryId
  });

  const products = Array.isArray(productsData) 
    ? productsData 
    : (Array.isArray(productsData?.data) ? productsData.data : []);

  if (catLoading) return (
    <div className="flex justify-center items-center py-32">
      <Spinner size="lg" />
    </div>
  );

  if (!category) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">{language === 'hi' ? 'कैटेगरी नहीं मिली' : 'Category not found'}</h2>
      <Link to="/categories" className="text-primary-500 hover:underline">← {language === 'hi' ? 'सभी कैटेगरी' : 'All Categories'}</Link>
    </div>
  );

  return (
    <div className="animate-fadeIn pb-10">
      <Helmet>
        <title>{catDisplayName} - {STORE_NAME}</title>
      </Helmet>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-orange-400 text-white py-12 px-6 mb-8 rounded-b-3xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full p-2 flex items-center justify-center text-4xl shadow-inner border border-white/30 overflow-hidden">
            {catImg ? <img src={catImg} alt={catDisplayName} className="w-full h-full rounded-full object-cover" /> : '🛍️'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black font-heading mb-2">{catDisplayName}</h1>
            <p className="text-white/80 text-lg">
              {getCategoryDescription(category, language, category.name)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-500 font-medium">Showing {products.length} products</p>
        </div>

        <ProductGrid products={products} isLoading={prodLoading} skeletonCount={8} />

        {!prodLoading && products.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 mt-4">
            <span className="text-5xl mb-4 block">😕</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No products in this category yet</h3>
            <Link to="/products" className="inline-block mt-4 text-primary-500 font-semibold hover:underline">
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
