import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setApiToken } from '../services/api';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken, userId, signOut } = useClerkAuth();
  const { openSignIn } = useClerk();

  // Sync token and load user-specific cart when session changes
  useEffect(() => {
    if (isSignedIn && userId) {
      getToken().then(token => setApiToken(token));
      useCartStore.getState().loadUserCart(userId);
    } else if (isLoaded && !isSignedIn) {
      setApiToken(null);
      useCartStore.getState().logoutReset();
    }
  }, [isSignedIn, isLoaded, userId, getToken]);

  const logout = async () => {
    // Reset active screen cart state to guest while preserving user's saved items in storage
    useCartStore.getState().logoutReset();
    await signOut();
    setApiToken(null);
    toast.success('Logged out successfully');
  };

  const openLogin = () => openSignIn();

  // Extract role from Clerk publicMetadata
  const role = user?.publicMetadata?.role || 'customer';
  const isAdmin = role === 'admin';

  return {
    user,
    userId,
    isLoaded,
    isAuthenticated: !!isSignedIn,
    isAdmin,
    role,
    logout,
    openLogin,
    getToken,
  };
};
