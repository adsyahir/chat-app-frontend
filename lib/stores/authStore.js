import { create } from 'zustand';
import { authAPI } from '../api/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  _hasHydrated: false,
  publicKey: null,
  encryptionEnabled: false,

  setUser: (user) => {
    set({
      user,
      userId: user?.id || null,
      isAuthenticated: !!user,
      isLoading: false,
      publicKey: user?.publicKey || null,
      encryptionEnabled: user?.encryptionEnabled || false,
    });

    // Initialize encryption if user has it enabled
    if (user?.publicKey && typeof window !== 'undefined') {
      import('./encryptionStore').then(({ useEncryptionStore }) => {
        useEncryptionStore.getState().initializeEncryption(user.id, user.publicKey);
      });
    }
  },

  setIsAuthenticated: (state) => set({ isAuthenticated: state }),
  setIsLoading: (state) => set({ isLoading: state }),
  setHasHydrated: (state) => set({ _hasHydrated: state }),

  reset: () => {
    set({
      user: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
      publicKey: null,
      encryptionEnabled: false,
    });

    // Clear encryption
    if (typeof window !== 'undefined') {
      import('./encryptionStore').then(({ useEncryptionStore }) => {
        useEncryptionStore.getState().clearEncryption();
      });
    }
  },

  // Asks the backend whether the session cookie is still valid. The previous
  // version set isLoading true then immediately false without checking
  // anything, so the app treated every visitor as resolved-and-signed-out.
  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      const user = await authAPI.session();

      if (user) {
        // setUser also seeds the encryption store from the session payload.
        get().setUser(user);
      } else {
        set({ user: null, userId: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({ user: null, userId: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

}));
