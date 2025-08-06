'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';

// Client component to sync server auth state with client store
export default function AuthSync({ IsAuthenticated, user}) {
  const { setUser, setIsAuthenticated, setIsLoading } = useAuthStore();

  useEffect(() => {
    // Read auth state from server headers (passed from middleware)
    const syncAuthFromServer = async () => {
      try {
        if (setIsAuthenticated, user) {
          setUser(user);
          setIsAuthenticated(true);
          console.log("Current user:", user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log("Current user:", user);

        }
      } catch (error) {
        console.error('Failed to sync auth state:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    syncAuthFromServer();
  }, [setUser, setIsAuthenticated, setIsLoading]);

  return null; // This component doesn't render anything
}