/**
 * WebCrypto Polyfill for WorkOS SDK
 * 
 * The WorkOS SDK uses WebCrypto APIs (crypto.subtle) for PKCE.
 * React Native doesn't provide these natively, so we need to polyfill them.
 * This is required for the @workos-inc/authkit-react SDK to work properly.
 */

import { install } from 'react-native-quick-crypto';

// Install the WebCrypto polyfill
install();

// Ensure crypto is available globally
if (typeof global.crypto === 'undefined') {
  throw new Error('WebCrypto polyfill failed to install. crypto is not available.');
}

// Ensure crypto.subtle is available
if (typeof global.crypto.subtle === 'undefined') {
  throw new Error('WebCrypto polyfill failed to install. crypto.subtle is not available.');
}

console.log('✅ WebCrypto polyfill installed successfully');
