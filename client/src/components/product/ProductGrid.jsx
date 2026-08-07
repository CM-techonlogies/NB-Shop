import React from 'react';
import ProductCard from './ProductCard';
import { SkeletonProductCard } from '../ui/Skeleton';

export default function ProductGrid({ products, isLoading, skeletonCount = 8 }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonProductCard key={i} />)}
      </div>
    );
  }

  if (!products?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map(product => <ProductCard key={product._id} product={product} />)}
    </div>
  );
}
