/**
 * API Client for sam
 *
 * Features:
 * - Automatic token injection
 * - Automatic token refresh on 401
 * - X-App-Source header for tracking
 * - Redirect to login on auth failure
 */

import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const APP_SOURCE = import.meta.env.VITE_APP_SOURCE || 'sam-web';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Token management
const getAccessToken = () => localStorage.getItem('sam_token');
const getRefreshToken = () => localStorage.getItem('sam_refresh_token');

export const setTokens = (access?: string, refresh?: string) => {
  if (access) {
    localStorage.setItem('sam_token', access);
  }
  if (refresh) {
    localStorage.setItem('sam_refresh_token', refresh);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('sam_token');
  localStorage.removeItem('sam_refresh_token');
  localStorage.removeItem('sam_user');
};

// Request interceptor: add auth token and app source
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  const headers = config.headers ?? {};

  // Always send app source for tracking in ULM logs
  headers['X-App-Source'] = APP_SOURCE;

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  config.headers = headers;
  return config;
});

// Token refresh state
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh access token using refresh token
 * Implements singleton pattern to avoid multiple simultaneous refreshes
 */
const refreshToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await api.post('/api/v1/auth/refresh', {
          refresh_token: refresh
        });
        const newAccess = response.data?.access_token;
        const newRefresh = response.data?.refresh_token || refresh;
        setTokens(newAccess, newRefresh);
        return newAccess || null;
      } catch (err) {
        // Refresh failed - clear everything
        clearTokens();
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

// Response interceptor: handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Skip redirect for auth endpoints to avoid infinite loops
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
                          originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      // Wait for ongoing refresh if one is in progress
      if (isRefreshing) {
        const newToken = await refreshPromise;
        if (newToken) {
          // Retry original request with new token
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          originalRequest._retry = true;
          return api(originalRequest);
        } else {
          // Refresh failed - redirect to login
          clearTokens();
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.location.href = '/';
          }
          return Promise.reject(error);
        }
      }

      // Start token refresh
      isRefreshing = true;
      const newToken = await refreshToken();

      if (newToken) {
        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        originalRequest._retry = true;
        return api(originalRequest);
      }

      // Refresh failed - redirect to login immediately
      clearTokens();
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

