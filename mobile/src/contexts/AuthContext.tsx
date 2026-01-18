/**
 * Authentication Context
 * Manages user authentication state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { apiService } from '../services/api';
import { Platform } from 'react-native';

interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const storedUser = await storage.getUser();
      const accessToken = await storage.getAccessToken();
      const refreshToken = await storage.getRefreshToken();

      if (storedUser && accessToken) {
        // Set token in API service
        apiService.setAccessToken(accessToken);

        // Verify token is still valid by fetching user
        try {
          const response = await apiService.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          // Token invalid, try to refresh
          if (refreshToken) {
            try {
              const refreshResponse = await apiService.refreshToken(refreshToken);
              await storage.setAccessToken(refreshResponse.access_token);
              apiService.setAccessToken(refreshResponse.access_token);
              
              // Try again to get user
              const userResponse = await apiService.getCurrentUser();
              setUser(userResponse.user);
            } catch (refreshError) {
              // Refresh failed, logout
              await logout();
            }
          } else {
            await logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, accessToken: string, refreshToken: string) => {
    await storage.setUser(userData);
    await storage.setAccessToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    apiService.setAccessToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await apiService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storage.clearAll();
      apiService.setAccessToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
