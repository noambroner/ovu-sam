/**
 * Authentication API
 * Wrappers for auth endpoints
 */

import api, { setTokens, clearTokens } from './apiClient';

// Re-export for convenience
export { clearTokens };

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: {
    id: string | number;
    username: string;
    email: string;
    role: string;
  };
}

export interface UserClaims {
  sub: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);

  // Store tokens
  setTokens(response.data.access_token, response.data.refresh_token);

  // Store user info if provided
  if (response.data.user) {
    localStorage.setItem('sam_user', JSON.stringify(response.data.user));
  }

  return response.data;
};

/**
 * Refresh access token
 */
export const refresh = async (refreshToken: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/refresh', {
    refresh_token: refreshToken
  });

  // Update tokens
  setTokens(response.data.access_token, response.data.refresh_token);

  return response.data;
};

/**
 * Get current user info from token claims
 */
export const getCurrentUser = async (): Promise<UserClaims> => {
  const response = await api.get<UserClaims>('/auth/me');
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    // Attempt to logout on server (optional - ULM may track sessions)
    await api.post('/auth/logout');
  } catch (error) {
    // Ignore errors - we'll clear tokens anyway
    console.error('Logout error:', error);
  } finally {
    // Always clear local tokens
    clearTokens();
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('sam_token');
  return !!token;
};

/**
 * Get stored user info
 */
export const getStoredUser = (): any | null => {
  const userStr = localStorage.getItem('sam_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Store user info
 */
export const storeUser = (user: any): void => {
  localStorage.setItem('sam_user', JSON.stringify(user));
};

