import React from 'react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-600 shadow-md',
  secondary: 'bg-green-500 text-white hover:bg-green-600 shadow-md',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

export default function Button({ 
  children, variant = 'primary', size = 'md', fullWidth, 
  isLoading, disabled, className = '', ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:scale-95';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || isLoading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''} ${className}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
