/**
 * Refresh Token Service
 * Handles refresh token storage and validation
 */

import { pool } from '../config/database';
import { RefreshToken } from '../types/auth';

export class RefreshTokenService {
  /**
   * Store refresh token
   * If token already exists, update it (ON CONFLICT)
   */
  static async storeToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const result = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) 
       DO UPDATE SET 
         user_id = EXCLUDED.user_id,
         expires_at = EXCLUDED.expires_at,
         created_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, token, expires_at, created_at`,
      [userId, token, expiresAt]
    );

    return result.rows[0];
  }

  /**
   * Find refresh token
   */
  static async findToken(token: string): Promise<RefreshToken | null> {
    const result = await pool.query(
      `SELECT id, user_id, token, expires_at, created_at
       FROM refresh_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete refresh token
   */
  static async deleteToken(token: string): Promise<void> {
    await pool.query(
      `DELETE FROM refresh_tokens WHERE token = $1`,
      [token]
    );
  }

  /**
   * Delete all refresh tokens for a user
   */
  static async deleteAllUserTokens(userId: string): Promise<void> {
    await pool.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * Delete expired tokens
   */
  static async deleteExpiredTokens(): Promise<void> {
    await pool.query(
      `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
    );
  }
}
