import { authenticatedClientFetch } from "./client.js";

export const userAPI = {

    getUserById: async (id) => {
        return await authenticatedClientFetch(`api/users/get-user-by-id/${id}`, {
          method: "GET",
        });
    },

    // Save user's public key
    savePublicKey: async (publicKey) => {
        return await authenticatedClientFetch('/api/users/public-key', {
          method: 'POST',
          body: JSON.stringify({ publicKey }),
        });
    },

    // Get another user's public key
    getPublicKey: async (userId) => {
        return await authenticatedClientFetch(`/api/users/public-key/${userId}`, {
          method: 'GET',
        });
    },

    // Batch fetch public keys
    getPublicKeys: async (userIds) => {
        return await authenticatedClientFetch('/api/users/public-keys', {
          method: 'POST',
          body: JSON.stringify({ userIds }),
        });
    },
}