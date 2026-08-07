import React from 'react';
import { SignIn, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { STORE_NAME } from '../../constants';

export default function AdminLoginPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  // If already signed in as admin, redirect to dashboard
  if (isLoaded && isSignedIn && user?.publicMetadata?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>Admin Login - {STORE_NAME}</title>
      </Helmet>

      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center p-2 mb-4 shadow-lg shadow-indigo-500/20 overflow-hidden">
          <img src="/logo.jpg" alt={STORE_NAME} className="w-full h-full object-contain rounded-xl" />
        </div>
        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
        <p className="text-gray-400 text-sm mt-1">Sign in to manage your store</p>
      </div>

      <div className="w-full max-w-md">
        <SignIn
          routing="hash"
          afterSignInUrl="/admin"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-gray-800 shadow-2xl rounded-2xl border border-gray-700',
              headerTitle: 'text-white font-bold',
              headerSubtitle: 'text-gray-400',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-gray-900 border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500',
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl py-3 transition-colors',
              socialButtonsBlockButton: 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 rounded-xl',
              footerActionLink: 'text-indigo-400 font-bold hover:underline',
              dividerLine: 'bg-gray-700',
              dividerText: 'text-gray-500',
              identityPreviewText: 'text-gray-300',
              identityPreviewEditButton: 'text-indigo-400',
            },
          }}
        />
      </div>

      <div className="mt-8 text-center text-xs text-gray-600 max-w-sm">
        <p>To get admin access, sign in then have your Clerk admin set</p>
        <code className="text-indigo-400">publicMetadata.role = 'admin'</code>
        <p className="mt-1">in the Clerk Dashboard.</p>
      </div>
    </div>
  );
}
