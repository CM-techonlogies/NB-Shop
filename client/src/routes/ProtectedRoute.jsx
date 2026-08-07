import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Spinner from '../components/ui/Spinner';

export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
