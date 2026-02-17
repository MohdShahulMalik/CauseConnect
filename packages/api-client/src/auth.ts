/**
 * API Client with Authentication
 * 
 * This module provides an Axios instance with automatic JWT authentication.
 * It intercepts all requests and adds the Authorization header with the JWT token
 * retrieved from WorkOS AuthKit.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Token storage interface
 * Allows flexible token storage implementation (AsyncStorage, SecureStore, etc.)
 */
export interface TokenStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const TOKEN_KEY = 'causeconnect_access_token';

// Base API configuration
const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.API_URL) {
    return process.env.API_URL;
  }
  return 'http://localhost:8080';
};

/**
 * Create an authenticated Axios instance
 * 
 * @param tokenStorage - Storage implementation for tokens (e.g., expo-secure-store)
 * @returns Axios instance with auth interceptor
 */
export function createAuthenticatedClient(tokenStorage: TokenStorage): AxiosInstance {
  const client = axios.create({
    baseURL: getBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add JWT token
  client.interceptors.request.use(
    async (config) => {
      try {
        // Get token from secure storage
        const token = await tokenStorage.getItem(TOKEN_KEY);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      } catch (error) {
        // Error retrieving token
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle auth errors
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        // Clear the invalid token
        await tokenStorage.removeItem(TOKEN_KEY);
        
        // You might want to trigger a logout or token refresh here
        // This could emit an event that the auth hook listens to
      }
      
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Set the access token for API requests
 * This should be called after successful authentication
 * 
 * @param tokenStorage - Storage implementation
 * @param token JWT access token from WorkOS
 */
export async function setAccessToken(tokenStorage: TokenStorage, token: string): Promise<void> {
  await tokenStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear the access token
 * This should be called on logout
 * 
 * @param tokenStorage - Storage implementation
 */
export async function clearAccessToken(tokenStorage: TokenStorage): Promise<void> {
  await tokenStorage.removeItem(TOKEN_KEY);
}

/**
 * Get the current access token
 * 
 * @param tokenStorage - Storage implementation
 * @returns The stored JWT token or null
 */
export async function getAccessToken(tokenStorage: TokenStorage): Promise<string | null> {
  return await tokenStorage.getItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has a token)
 * Note: This doesn't validate the token, just checks if one exists
 * 
 * @param tokenStorage - Storage implementation
 * @returns true if a token exists
 */
export async function isAuthenticated(tokenStorage: TokenStorage): Promise<boolean> {
  const token = await getAccessToken(tokenStorage);
  return token !== null;
}

export default createAuthenticatedClient;
