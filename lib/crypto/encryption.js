import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

/**
 * Generate a new keypair for E2E encryption
 * @returns {Object} { publicKey: string, privateKey: string }
 */
export const generateKeyPair = () => {
  const keypair = nacl.box.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keypair.publicKey),
    privateKey: naclUtil.encodeBase64(keypair.secretKey),
  };
};

/**
 * Encrypt a message using recipient's public key
 * @param {string} message - Plaintext message
 * @param {string} recipientPublicKey - Base64 recipient public key
 * @param {string} senderPrivateKey - Base64 sender private key
 * @returns {Object} { ciphertext: string, nonce: string }
 */
export const encryptMessage = (message, recipientPublicKey, senderPrivateKey) => {
  try {
    const messageUint8 = naclUtil.decodeUTF8(message);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const recipientPublicKeyUint8 = naclUtil.decodeBase64(recipientPublicKey);
    const senderPrivateKeyUint8 = naclUtil.decodeBase64(senderPrivateKey);

    const ciphertext = nacl.box(
      messageUint8,
      nonce,
      recipientPublicKeyUint8,
      senderPrivateKeyUint8
    );

    return {
      ciphertext: naclUtil.encodeBase64(ciphertext),
      nonce: naclUtil.encodeBase64(nonce),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * Decrypt a message using sender's public key
 * @param {string} ciphertext - Base64 encrypted message
 * @param {string} nonce - Base64 nonce
 * @param {string} senderPublicKey - Base64 sender public key
 * @param {string} recipientPrivateKey - Base64 recipient private key
 * @returns {string} Decrypted plaintext message
 */
export const decryptMessage = (ciphertext, nonce, senderPublicKey, recipientPrivateKey) => {
  try {
    const ciphertextUint8 = naclUtil.decodeBase64(ciphertext);
    const nonceUint8 = naclUtil.decodeBase64(nonce);
    const senderPublicKeyUint8 = naclUtil.decodeBase64(senderPublicKey);
    const recipientPrivateKeyUint8 = naclUtil.decodeBase64(recipientPrivateKey);

    const decrypted = nacl.box.open(
      ciphertextUint8,
      nonceUint8,
      senderPublicKeyUint8,
      recipientPrivateKeyUint8
    );

    if (!decrypted) {
      throw new Error('Decryption failed - invalid keys or corrupted data');
    }

    return naclUtil.encodeUTF8(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Unable to decrypt message]';
  }
};

/**
 * Validate if a string is a valid base64-encoded key
 * @param {string} key - Key to validate
 * @returns {boolean}
 */
export const isValidKey = (key) => {
  try {
    if (!key || typeof key !== 'string') return false;
    const decoded = naclUtil.decodeBase64(key);
    return decoded.length === 32; // NaCl keys are 32 bytes
  } catch {
    return false;
  }
};
