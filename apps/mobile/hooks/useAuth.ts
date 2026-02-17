/**
 * Authentication Hook for CauseConnect
 * 
 * Provides authentication state and methods using WorkOS AuthKit.
 * Wraps the @workos-inc/authkit-react hooks with app-specific logic.
 */

import { useAuth as useWorkOSAuth, User as WorkOSUser } from '@workos-inc/authkit-react';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const TOKEN_KEY = 'causeconnect_access_token';
const REFRESH_TOKEN_KEY = 'causeconnect_refresh_token';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  organizationId: string | null;
  role: string | null;
  permissions: string[];
}

export function useAuth() {
  const workOSAuth = useWorkOSAuth();
  
  const [error, setError] = useState<Error | null>(null);

  // Destructure WorkOS state
  const { 
    user: workOSUser, 
    isLoading,
    organizationId,
    role,
    permissions,
    getAccessToken,
    signIn: workOSSignIn,
    signOut: workOSSignOut,
    signUp: workOSSignUp,
  } = workOSAuth;

  // Transform WorkOS user to our AuthUser format
  const user: AuthUser | null = workOSUser ? {
    id: workOSUser.id,
    email: workOSUser.email,
    firstName: (workOSUser as any).firstName || undefined,
    lastName: (workOSUser as any).lastName || undefined,
    profilePictureUrl: (workOSUser as any).profilePictureUrl || undefined,
  } : null;

  const isAuthenticated = !!user;

  /**
   * Sign in with WorkOS
   * Opens the AuthKit sign-in page
   */
  const signIn = async (options?: { organizationId?: string; redirectUri?: string }) => {
    try {
      setError(null);
      await workOSSignIn(options);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error);
      throw error;
    }
  };

  /**
   * Sign up with WorkOS
   * Opens the AuthKit sign-up page
   */
  const signUp = async (options?: { organizationId?: string; redirectUri?: string }) => {
    try {
      setError(null);
      await workOSSignUp(options);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setError(error);
      throw error;
    }
  };

  /**
   * Sign out
   * Clears the session and tokens
   */
  const signOut = async () => {
    try {
      setError(null);
      // Clear stored tokens
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      // Sign out from WorkOS
      await workOSSignOut();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed');
      setError(error);
      throw error;
    }
  };

  /**
   * Get access token for API calls
   * Returns the JWT token to use in Authorization header
   */
  const getToken = async (): Promise<string | null> => {
    try {
      const token = await getAccessToken();
      if (token) {
        // Store token securely
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
      return token;
    } catch (err) {
      console.error('Failed to get access token:', err);
      return null;
    }
  };

  /**
   * Get stored token (for API calls when you need the token string)
   */
  const getStoredToken = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  };

  /**
   * Switch to a different organization
   */
  const switchOrganization = async (orgId: string) => {
    try {
      setError(null);
      await workOSAuth.switchToOrganization({ organizationId: orgId });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to switch organization');
      setError(error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    organizationId,
    role,
    permissions,
    signIn,
    signUp,
    signOut,
    getToken,
    getStoredToken,
    switchOrganization,
  };
}
