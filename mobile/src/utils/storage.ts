/**
 * Storage Utilities
 * Handles token storage using AsyncStorage
 */

// Dynamic import to handle cases where AsyncStorage might not be available during build
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // Fallback for web or if package not installed
  if (typeof window !== 'undefined') {
    // Use localStorage for web
    AsyncStorage = {
      setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      multiRemove: (keys: string[]) => Promise.resolve(keys.forEach(k => localStorage.removeItem(k))),
    };
  } else {
    throw new Error('AsyncStorage not available. Please install @react-native-async-storage/async-storage');
  }
}

const ACCESS_TOKEN_KEY = '@promise_tracker:access_token';
const REFRESH_TOKEN_KEY = '@promise_tracker:refresh_token';
const USER_KEY = '@promise_tracker:user';

export const storage = {
  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async setUser(user: { id: string; email: string; name: string }): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<{ id: string; email: string; name: string } | null> {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  },
};
