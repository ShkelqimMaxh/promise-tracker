/**
 * API Service
 * Handles all API calls to the backend
 */

// For web: use localhost:3000
// For mobile (iOS/Android): use your computer's IP address (e.g., http://192.168.1.100:3000/api)
// You can set EXPO_PUBLIC_API_URL environment variable to override
// Default to Railway production backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://promise-tracker-production.up.railway.app/api';

console.log('API Base URL:', API_BASE_URL);

export interface ApiError {
  error: string;
  message?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    console.log(`[API] ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Try to parse JSON, but handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('[API Non-JSON Response]', response.status, text);
        throw {
          error: `Server error (${response.status}): ${text || 'Invalid response'}`,
          status: response.status,
        } as ApiError & { status: number };
      }

      if (!response.ok) {
        console.error('[API Error]', response.status, data);
        throw {
          error: data.error || data.message || `An error occurred (${response.status})`,
          status: response.status,
        } as ApiError & { status: number };
      }

      console.log('[API Success]', endpoint);
      return data as T;
    } catch (error: any) {
      console.error('[API Request Error]', error);
      if (error.error) {
        throw error;
      }
      // Network error - check if backend is running
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        throw {
          error: 'Cannot connect to server. Please check your internet connection and try again.',
        } as ApiError;
      }
      throw {
        error: error.message || 'Network error. Please check your connection.',
      } as ApiError;
    }
  }

  // Authentication endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    return this.request<{ access_token: string; expires_in: number }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async logout(refreshToken: string): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async getCurrentUser(): Promise<{ user: { id: string; email: string; name: string; created_at?: string } }> {
    const response = await this.request<{ user: { id: string; email: string; name: string; created_at?: string } }>('/auth/me', {
      method: 'GET',
    });
    return response;
  }

  async googleAuth(token: string, tokenType: 'idToken' | 'accessToken' = 'idToken'): Promise<AuthResponse> {
    const body = tokenType === 'idToken' 
      ? { idToken: token }
      : { accessToken: token };
    
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }


  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);
