import { connect } from 'socket.io-client';
import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  _hasHydrated: false,

  setUser: (user) => set({ 
    user, 
    userId: user?.id || null,
    isAuthenticated: !!user, 
    isLoading: false 
  }),

  setIsAuthenticated: (state) => set({ isAuthenticated: state }),
  setIsLoading: (state) => set({ isLoading: state }),
  setHasHydrated: (state) => set({ _hasHydrated: state }),

  reset: () => set({ 
    user: null, 
    userId: null,
    isAuthenticated: false, 
    isLoading: false 
  }),

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
