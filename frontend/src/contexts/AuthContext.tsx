/**
 * Authentication Context
 * Manages authentication state across the application
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authAPI from '../api/auth';

interface UserInfo {
  id: string | number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have a token
      if (!authAPI.isAuthenticated()) {
        setLoading(false);
        return;
      }

      // Try to load stored user info first
      const storedUser = authAPI.getStoredUser();
      if (storedUser) {
        setUser(storedUser);

        // Validate token in background
        authAPI.getCurrentUser()
          .then((claims) => {
            // Update user from token claims if needed
            const userFromToken: UserInfo = {
              id: claims.sub,
              username: claims.email?.split('@')[0] || 'user',
              email: claims.email || '',
              role: claims.role || 'user',
            };
            setUser(userFromToken);
            authAPI.storeUser(userFromToken);
          })
          .catch(() => {
            // Token invalid - clear auth
            authAPI.clearTokens();
            setUser(null);
          })
          .finally(() => setLoading(false));

        return;
      }

      // No stored user - fetch from API
      const claims = await authAPI.getCurrentUser();
      const userFromToken: UserInfo = {
        id: claims.sub,
        username: claims.email?.split('@')[0] || 'user',
        email: claims.email || '',
        role: claims.role || 'user',
      };
      setUser(userFromToken);
      authAPI.storeUser(userFromToken);
    } catch (error) {
      // Authentication failed
      authAPI.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ username, password });

      // Set user from response or fetch from claims
      if (response.user) {
        setUser(response.user);
        authAPI.storeUser(response.user);
      } else {
        // Fetch user info from token
        const claims = await authAPI.getCurrentUser();
        const userFromToken: UserInfo = {
          id: claims.sub,
          username: claims.email?.split('@')[0] || username,
          email: claims.email || username,
          role: claims.role || 'user',
        };
        setUser(userFromToken);
        authAPI.storeUser(userFromToken);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

