/**
 * Authentication Routes
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { UserService } from '../services/userService';
import { RefreshTokenService } from '../services/refreshTokenService';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getAccessTokenExpiryInSeconds,
} from '../utils/jwt';
import { RegisterRequest, LoginRequest, RefreshTokenRequest, AuthenticatedRequest } from '../types/auth';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name }: RegisterRequest = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    // Check if email already exists
    const emailExists = await UserService.emailExists(email);
    if (emailExists) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Create user
    const user = await UserService.createUser({ email, password, name });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Calculate refresh token expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token
    await RefreshTokenService.storeToken(user.id, refreshToken, expiresAt);

    // Return response
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: getAccessTokenExpiryInSeconds(),
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await UserService.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if user has a password (OAuth users don't have passwords)
    if (!user.password_hash) {
      res.status(401).json({ error: 'This account uses Google sign-in. Please sign in with Google.' });
      return;
    }

    // Verify password
    const isValidPassword = await UserService.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Calculate refresh token expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token
    await RefreshTokenService.storeToken(user.id, refreshToken, expiresAt);

    // Return response
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: getAccessTokenExpiryInSeconds(),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token }: RefreshTokenRequest = req.body;

    if (!refresh_token) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refresh_token);
    } catch (error: any) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Check if token exists in database
    const storedToken = await RefreshTokenService.findToken(refresh_token);
    if (!storedToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Get user
    const user = await UserService.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    // Return new access token
    res.json({
      access_token: accessToken,
      expires_in: getAccessTokenExpiryInSeconds(),
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * Logout user (delete refresh token)
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refresh_token }: RefreshTokenRequest = req.body;

    if (refresh_token) {
      await RefreshTokenService.deleteToken(refresh_token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * Get current user (requires authentication)
 * GET /api/auth/me
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get full user data including created_at
    const fullUser = await UserService.findById(req.user.id);
    
    if (!fullUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        created_at: fullUser.created_at instanceof Date 
          ? fullUser.created_at.toISOString() 
          : fullUser.created_at,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * Google OAuth authentication
 * POST /api/auth/google
 * Body: { idToken?: string, accessToken?: string }
 * Accepts either id_token (preferred) or access_token (fallback for web)
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken, accessToken } = req.body;

    let googleId: string;
    let email: string;
    let name: string;

    // Try to verify id_token first (preferred method)
    // But first check if it's actually an access_token (starts with "ya29" or similar)
    if (idToken) {
      // Check if idToken is actually an access_token (access tokens typically start with "ya29")
      // or have a different structure (id_tokens are JWT with 3 parts separated by dots)
      const isLikelyAccessToken = idToken.startsWith('ya29.') || idToken.split('.').length !== 3;
      
      if (isLikelyAccessToken) {
        // It's actually an access_token, treat it as such
        console.log('Detected access_token sent as idToken, treating as access_token');
        try {
          const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user info from Google');
          }

          const userInfo = await response.json();
          googleId = userInfo.id;
          email = userInfo.email || '';
          name = userInfo.name || '';
        } catch (error: any) {
          console.error('Google access token verification error:', error);
          res.status(401).json({ error: 'Invalid Google access token' });
          return;
        }
      } else {
        // It's a real id_token, verify it
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });

          const payload = ticket.getPayload();
          if (!payload) {
            res.status(401).json({ error: 'Invalid Google token payload' });
            return;
          }

          googleId = payload.sub;
          email = payload.email || '';
          name = payload.name || '';
        } catch (error) {
          console.error('Google ID token verification error:', error);
          res.status(401).json({ error: 'Invalid Google ID token' });
          return;
        }
      }
    } 
    // Fallback: use access_token to fetch user info (for web)
    else if (accessToken) {
      try {
        // Set the access token
        googleClient.setCredentials({ access_token: accessToken });

        // Fetch user info from Google API
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user info from Google');
        }

        const userInfo = await response.json();
        googleId = userInfo.id;
        email = userInfo.email || '';
        name = userInfo.name || '';
      } catch (error: any) {
        console.error('Google access token verification error:', error);
        res.status(401).json({ error: 'Invalid Google access token' });
        return;
      }
    } else {
      res.status(400).json({ error: 'Either idToken or accessToken is required' });
      return;
    }

    if (!email || !name || !googleId) {
      res.status(400).json({ error: 'Missing required user information from Google' });
      return;
    }

    // Create or update user
    const user = await UserService.createOrUpdateGoogleUser(googleId, email, name);

    // Generate tokens
    const jwtAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Calculate refresh token expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token
    await RefreshTokenService.storeToken(user.id, refreshToken, expiresAt);

    // Return response
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      access_token: jwtAccessToken,
      refresh_token: refreshToken,
      expires_in: getAccessTokenExpiryInSeconds(),
    });
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ 
      error: 'Google authentication failed',
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Look up user by email (for adding promisee/mentor)
 * GET /api/auth/lookup?email=user@example.com
 */
router.get('/lookup', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email query parameter is required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Find user by email
    const user = await UserService.findByEmail(email);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Don't return password hash
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Lookup user error:', error);
    res.status(500).json({ error: 'Failed to lookup user' });
  }
});

export default router;
