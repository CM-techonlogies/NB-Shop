import React from 'react';

const shimmerClass = "bg-gray-200 animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,#f0f0f0_25%,#e0e0e0_50%,#f0f0f0_75%)] bg-[length:200%_100%] rounded";

export function SkeletonLine({ className = 'h-4 w-full' }) {
  return <div className={`${shimmerClass} ${className}`}></div>;
}

export function SkeletonBlock({ className = 'h-24 w-full' }) {
  return <div className={`${shimmerClass} ${className}`}></div>;
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-3">
      <SkeletonBlock className="h-32 w-full rounded-xl" />
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-3 w-1/2" />
      <div className="flex justify-between items-center mt-2">
        <SkeletonLine className="h-5 w-1/3" />
        <SkeletonBlock className="h-8 w-1/3 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonCategoryCard() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-16 w-16 rounded-full ${shimmerClass}`}></div>
      <SkeletonLine className="h-3 w-20" />
    </div>
  );
}

export function SkeletonOrderCard() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 mb-3 flex flex-col gap-3">
      <div className="flex justify-between">
        <SkeletonLine className="h-5 w-1/4" />
        <SkeletonLine className="h-5 w-1/5 rounded-full" />
      </div>
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="h-4 w-1/3" />
      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
        <SkeletonLine className="h-6 w-1/4" />
        <SkeletonLine className="h-8 w-1/4 rounded-lg" />
      </div>
    </div>
  );
}
