import { connect } from 'socket.io-client';
import { create } from 'zustand';

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

  // You can replace this with real session/token checks
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      // Simulate auth check
      set({ isLoading: false });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({ user: null, userId: null, isAuthenticated: false, isLoading: false });
    }
  },

}));
