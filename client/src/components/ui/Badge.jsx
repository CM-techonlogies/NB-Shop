import React from 'react';

const variants = {
  sale: 'bg-red-500 text-white',
  new: 'bg-green-500 text-white',
  trending: 'bg-purple-500 text-white',
  featured: 'bg-primary-500 text-white',
  'out-of-stock': 'bg-gray-400 text-white',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
};

export default function Badge({ children, variant = 'primary', className = '', size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${sizeClass} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </span>
  );
}
