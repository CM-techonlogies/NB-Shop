import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { STORE_NAME } from '../../constants';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Helmet>
        <title>Login - {STORE_NAME}</title>
        <meta name="description" content={`Sign in to ${STORE_NAME}`} />
      </Helmet>

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none" />

      {/* Brand header */}
      <div className="mb-8 text-center relative z-10">
        <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center p-2 mb-4 shadow-xl shadow-orange-200 border border-orange-100 overflow-hidden">
          <img src="/logo.jpg" alt={STORE_NAME} className="w-full h-full object-contain rounded-2xl" />
        </div>
        <h1 className="text-3xl font-black font-heading text-gray-900">{STORE_NAME}</h1>
        <p className="text-gray-500 mt-1 text-sm">Fresh groceries at your door</p>
      </div>

      {/* Clerk SignIn component with custom styling */}
      <div className="relative z-10 w-full max-w-md">
        <SignIn
          routing="hash"
          afterSignInUrl="/"
          afterSignUpUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-2xl rounded-3xl border border-white/50 backdrop-blur-sm',
              headerTitle: 'font-heading font-black text-2xl text-gray-900',
              headerSubtitle: 'text-gray-500',
              formButtonPrimary: 'bg-gradient-to-r from-primary-500 to-orange-600 hover:from-primary-600 hover:to-orange-700 font-bold rounded-xl py-3 transition-all active:scale-95',
              formFieldInput: 'rounded-xl border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              socialButtonsBlockButton: 'rounded-xl border-gray-200 hover:bg-gray-50 font-semibold',
              footerActionLink: 'text-primary-600 font-bold hover:underline',
              dividerLine: 'bg-gray-200',
              dividerText: 'text-gray-400 text-sm',
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
            },
          }}
        />
      </div>
    </div>
  );
}
