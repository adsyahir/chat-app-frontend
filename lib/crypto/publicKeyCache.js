/**
 * Cache for storing recipient public keys to minimize API calls
 */
class PublicKeyCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Store a public key in the cache
   * @param {string} userId - User ID
   * @param {string} publicKey - Base64 public key
   * @param {boolean} encryptionEnabled - Whether encryption is enabled for this user
   */
  set(userId, publicKey, encryptionEnabled) {
    this.cache.set(userId, {
      publicKey,
      encryptionEnabled,
      timestamp: Date.now(),
    });
  }

  /**
   * Get a public key from the cache
   * @param {string} userId - User ID
   * @returns {Object|null} Cached data or null if expired/not found
   */
  get(userId) {
    const cached = this.cache.get(userId);

    // Cache expires after 1 hour
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached;
    }

    // Remove stale entry
    if (cached) {
      this.cache.delete(userId);
    }

    return null;
  }

  /**
   * Clear all cached keys
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Check if a user's key is cached
   * @param {string} userId - User ID
   * @returns {boolean}
   */
  has(userId) {
    return !!this.get(userId);
  }
}

// Export a singleton instance
export const publicKeyCache = new PublicKeyCache();
