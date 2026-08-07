// This component keeps the Axios API token in sync with Clerk's session token
// It refreshes the token every 50 seconds (Clerk tokens expire in 60s)
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setApiToken } from '../../services/api';

export default function TokenSyncer() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setApiToken(null);
      return;
    }

    // Set token immediately
    getToken().then(token => setApiToken(token));

    // Refresh token every 50 seconds
    const interval = setInterval(async () => {
      const token = await getToken();
      setApiToken(token);
    }, 50 * 1000);

    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return null; // renders nothing
}
