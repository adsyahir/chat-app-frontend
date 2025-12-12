"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateKeyPair, isValidKey } from '../crypto/encryption';
import {
  storeKeyPair,
  getPrivateKey,
  getPublicKey,
  clearStoredKeys,
  hasStoredKeys
} from '../crypto/keyStorage';
import { publicKeyCache } from '../crypto/publicKeyCache';
import { authenticatedClientFetch } from '../api/client';

export const useEncryptionStore = create(
  persist(
    (set, get) => ({
      isEncryptionEnabled: false,
      isInitialized: false,
      publicKey: null,

      // Initialize encryption on app load
      initializeEncryption: async (userId, userPublicKey) => {
        try {
          // Check if user has encryption enabled on server
          if (!userPublicKey) {
            set({ isEncryptionEnabled: false, isInitialized: true });
            return false;
          }

          // Check if keys exist in storage
          if (hasStoredKeys()) {
            const storedPublicKey = getPublicKey();

            // Verify stored public key matches server
            if (storedPublicKey === userPublicKey) {
              set({
                isEncryptionEnabled: true,
                isInitialized: true,
                publicKey: userPublicKey
              });
              return true;
            } else {
              console.warn('Stored key mismatch - clearing local keys');
              clearStoredKeys();
            }
          }

          // Keys don't exist locally but exist on server
          set({
            isEncryptionEnabled: false,
            isInitialized: true,
            publicKey: userPublicKey
          });
          return false;
        } catch (error) {
          console.error('Encryption initialization error:', error);
          set({ isEncryptionEnabled: false, isInitialized: true });
          return false;
        }
      },

      // Generate and save new keypair
      enableEncryption: async () => {
        try {
          // Generate new keypair
          const { publicKey, privateKey } = generateKeyPair();

          // Validate keys
          if (!isValidKey(publicKey) || !isValidKey(privateKey)) {
            throw new Error('Generated invalid keys');
          }

          // Store locally
          storeKeyPair(publicKey, privateKey);

          // Send public key to server
          await authenticatedClientFetch('/api/users/public-key', {
            method: 'POST',
            body: JSON.stringify({ publicKey }),
          });

          set({
            isEncryptionEnabled: true,
            isInitialized: true,
            publicKey
          });

          return { success: true, publicKey };
        } catch (error) {
          console.error('Error enabling encryption:', error);
          return { success: false, error: error.message };
        }
      },

      // Get stored private key
      getPrivateKey: () => {
        return getPrivateKey();
      },

      // Get recipient's public key (with caching)
      getRecipientPublicKey: async (userId) => {
        try {
          // Check cache first
          const cached = publicKeyCache.get(userId);
          if (cached) {
            return cached.publicKey;
          }

          // Fetch from server
          const result = await authenticatedClientFetch(`/api/users/public-key/${userId}`, {
            method: 'GET',
          });

          // Cache result
          if (result.publicKey) {
            publicKeyCache.set(userId, result.publicKey, result.encryptionEnabled);
          }

          return result.publicKey;
        } catch (error) {
          console.error('Error fetching public key:', error);
          return null;
        }
      },

      // Batch fetch public keys for multiple users
      prefetchPublicKeys: async (userIds) => {
        try {
          const result = await authenticatedClientFetch('/api/users/public-keys', {
            method: 'POST',
            body: JSON.stringify({ userIds }),
          });

          // Cache all results
          Object.entries(result.keys).forEach(([userId, data]) => {
            publicKeyCache.set(userId, data.publicKey, data.encryptionEnabled);
          });

          return result.keys;
        } catch (error) {
          console.error('Error prefetching public keys:', error);
          return {};
        }
      },

      // Clear encryption state (on logout)
      clearEncryption: () => {
        clearStoredKeys();
        publicKeyCache.clear();
        set({
          isEncryptionEnabled: false,
          isInitialized: false,
          publicKey: null
        });
      },

      // Check if can send encrypted message to user
      canEncryptFor: async (userId) => {
        const recipientPublicKey = await get().getRecipientPublicKey(userId);
        const myPrivateKey = getPrivateKey();
        console.log('🔍 canEncryptFor check:', {
          userId,
          hasRecipientPublicKey: !!recipientPublicKey,
          hasMyPrivateKey: !!myPrivateKey,
          recipientPublicKey: recipientPublicKey?.substring(0, 20) + '...',
        });
        return !!(recipientPublicKey && myPrivateKey);
      },
    }),
    {
      name: 'encryption-store',
      partialize: (state) => ({
        isEncryptionEnabled: state.isEncryptionEnabled,
        publicKey: state.publicKey,
      }),
    }
  )
);
