/**
 * JWT Utility Functions
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '../types/auth';

const JWT_SECRET = (process.env.JWT_SECRET || 'default-secret-change-in-production') as string;

// Validate and sanitize token expiry values
// Valid formats: "15m", "1h", "7d", "3600" (seconds), etc.
const isValidExpiry = (value: string): boolean => {
  if (!value) return false;
  // Check if it's a valid time string (ends with m, h, d, s) or is a number
  const timeRegex = /^(\d+)([smhd]|ms)?$/i;
  const isNumber = /^\d+$/.test(value);
  return timeRegex.test(value) || isNumber;
};

const getAccessTokenExpiry = (): string => {
  const envValue = process.env.ACCESS_TOKEN_EXPIRY;
  if (envValue && isValidExpiry(envValue)) {
    return envValue;
  }
  // Invalid value in env, use default
  if (envValue) {
    console.warn(`Invalid ACCESS_TOKEN_EXPIRY value: "${envValue}". Using default "15m"`);
  }
  return '15m';
};

const getRefreshTokenExpiry = (): string => {
  const envValue = process.env.REFRESH_TOKEN_EXPIRY;
  if (envValue && isValidExpiry(envValue)) {
    return envValue;
  }
  // Invalid value in env, use default
  if (envValue) {
    console.warn(`Invalid REFRESH_TOKEN_EXPIRY value: "${envValue}". Using default "7d"`);
  }
  return '7d';
};

const ACCESS_TOKEN_EXPIRY = getAccessTokenExpiry();
const REFRESH_TOKEN_EXPIRY = getRefreshTokenExpiry();

/**
 * Generate access token
 */
export function generateAccessToken(payload: { userId: string; email: string }): string {
  const tokenPayload: TokenPayload = {
    userId: payload.userId,
    email: payload.email,
    type: 'access',
  };

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  } as SignOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: { userId: string; email: string }): string {
  const tokenPayload: TokenPayload = {
    userId: payload.userId,
    email: payload.email,
    type: 'refresh',
  };

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  } as SignOptions);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Get access token expiry in seconds
 */
export function getAccessTokenExpiryInSeconds(): number {
  // Parse ACCESS_TOKEN_EXPIRY (e.g., "15m", "1h", "30d")
  const expiry = ACCESS_TOKEN_EXPIRY.toLowerCase();
  
  if (expiry.endsWith('m')) {
    // Minutes
    const minutes = parseInt(expiry.slice(0, -1), 10);
    return minutes * 60;
  } else if (expiry.endsWith('h')) {
    // Hours
    const hours = parseInt(expiry.slice(0, -1), 10);
    return hours * 60 * 60;
  } else if (expiry.endsWith('d')) {
    // Days
    const days = parseInt(expiry.slice(0, -1), 10);
    return days * 24 * 60 * 60;
  } else if (expiry.endsWith('s')) {
    // Seconds
    return parseInt(expiry.slice(0, -1), 10);
  } else {
    // Default: assume it's in seconds or default to 15 minutes
    const parsed = parseInt(expiry, 10);
    return isNaN(parsed) ? 15 * 60 : parsed;
  }
}
