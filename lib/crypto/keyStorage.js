const PRIVATE_KEY_STORAGE_KEY = 'chat_app_private_key';
const PUBLIC_KEY_STORAGE_KEY = 'chat_app_public_key';

/**
 * Store keypair in browser storage
 * Using sessionStorage for security (cleared on tab close)
 * @param {string} publicKey - Base64 public key
 * @param {string} privateKey - Base64 private key
 */
export const storeKeyPair = (publicKey, privateKey) => {
  try {
    // Use sessionStorage for security (cleared on tab close)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PUBLIC_KEY_STORAGE_KEY, publicKey);
      sessionStorage.setItem(PRIVATE_KEY_STORAGE_KEY, privateKey);
    }
    return true;
  } catch (error) {
    console.error('Error storing keypair:', error);
    return false;
  }
};

/**
 * Retrieve private key from storage
 * @returns {string|null} Base64 private key or null if not found
 */
export const getPrivateKey = () => {
  try {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving private key:', error);
    return null;
  }
};

/**
 * Retrieve public key from storage
 * @returns {string|null} Base64 public key or null if not found
 */
export const getPublicKey = () => {
  try {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(PUBLIC_KEY_STORAGE_KEY);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving public key:', error);
    return null;
  }
};

/**
 * Check if user has keys stored
 * @returns {boolean}
 */
export const hasStoredKeys = () => {
  return !!getPrivateKey() && !!getPublicKey();
};

/**
 * Clear all stored keys (for logout)
 */
export const clearStoredKeys = () => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
      sessionStorage.removeItem(PUBLIC_KEY_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error clearing keys:', error);
  }
};
