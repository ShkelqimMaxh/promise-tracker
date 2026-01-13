/**
 * Authentication Types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  google_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
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

export interface RefreshTokenRequest {
  refresh_token: string;
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

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    name: string;
    created_at?: Date;
  };
}
