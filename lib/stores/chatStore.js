import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

// Registry to hold per-user store instances
const userStoreRegistry = new Map();

/**
 * Internal: Creates a new chat store for a specific user
 */
const createInternalChatStore = (userId) => {
  return create(
    persist(
      (set, get) => ({
        selectedContact: null,
        _hasHydrated: false,
        onlineUsers: [],
        socket: null,
        setSelectedContact: (contact) => set({ selectedContact: contact }),
        clearSelectedContact: () => set({ selectedContact: null }),
        setOnlineUsers: (users) => set({ onlineUsers: users }),
        setSocket: (socket) => set({ socket }),
        setHasHydrated: (state) => set({ _hasHydrated: Boolean(state) }),
        reset: () => set({ selectedContact: null, socket: null }),
      }),
      {
        name: `chat-store-${userId}`,
        version: 1,
        partialize: (state) => ({
          selectedContact: state.selectedContact,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('❌ Rehydration error:', error);
            return;
          }
          state?.setHasHydrated(true);
        },
        skipHydration: false,
      }
    )
  );
};

// Internal hook that requires explicit auth params (keep for specific use cases)
export const useChatStoreWithAuth = (userId, isAuthenticated) => {
  // Always create a store (even if temporary) to maintain hook order
  const fallbackStore = create(() => ({
    selectedContact: null,
    _hasHydrated: false,
    onlineUsers: [],
    socket: null,
    isRealStore: false, // Add flag to distinguish from real store
    setSelectedContact: () => {},
    clearSelectedContact: () => {},
    setOnlineUsers: () => {},
    setSocket: () => {},
    setHasHydrated: () => {},
    reset: () => {},
  }));

  // Use fallback store when not authenticated
  if (!isAuthenticated || !userId) {

    return fallbackStore();
  }

  // Check if we already have a store for this user
  if (!userStoreRegistry.has(userId)) {
    // Create and cache the store for this user
    userStoreRegistry.set(userId, createInternalChatStore(userId));
  }
  
  // Get the store for this user and return its hook result
  const store = userStoreRegistry.get(userId);
  const storeState = store();
  
  // Add flag to identify real store
  return {
    ...storeState,
    isRealStore: true,
  };
};

// Main hook that automatically handles auth - USE THIS IN COMPONENTS
export const useChatStore = () => {
  // Automatically get auth state
  const { user, userId, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();
  
  // Call the internal hook with auth params
  const chatStore = useChatStoreWithAuth(userId, isAuthenticated);
  
  // Return both auth and chat store data
  return {
    // Auth state (so components don't need to call useAuthStore separately)
    user,
    userId,
    isAuthenticated,
    isLoading,
    _hasHydrated,
    
    // Chat store state and methods
    ...chatStore,
    
    // Helper computed properties
    isReady: _hasHydrated && isAuthenticated && chatStore.isRealStore,
  };
};

// Alternative hook that throws error (use this if you prefer error handling)
export const useChatStoreStrict = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const userId = user?.id;

  if (isLoading) {
    throw new Error('useChatStore called while authentication is loading');
  }

  if (!isAuthenticated || !userId) {
    throw new Error('useChatStore requires an authenticated user with a valid userId');
  }

  // Check if we already have a store for this user
  if (!userStoreRegistry.has(userId)) {
    userStoreRegistry.set(userId, createInternalChatStore(userId));
  }

  const store = userStoreRegistry.get(userId);
  return store();
};

// Utility function to clear all user stores (useful for logout)
export const clearAllUserStores = () => {
  userStoreRegistry.clear();
};

// Direct access function for non-React contexts (like socket.js)
export const getChatStore = (userId) => {
  if (!userId) return null;
  
  // Check if we already have a store for this user
  if (!userStoreRegistry.has(userId)) {
    console.warn(`Creating new chat store for user ${userId}`);
    userStoreRegistry.set(userId, createInternalChatStore(userId));
  }
  
  return userStoreRegistry.get(userId);
};