import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Spinner from '../components/ui/Spinner';

export default function AdminRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  const isAdmin = user?.publicMetadata?.role === 'admin';
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
