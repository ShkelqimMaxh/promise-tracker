/**
 * User Service
 * Handles user-related database operations
 */

import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { User, RegisterRequest } from '../types/auth';

const SALT_ROUNDS = 10;

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(data: RegisterRequest): Promise<User> {
    const { email, password, name } = data;

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, password_hash, created_at, updated_at`,
      [email.toLowerCase().trim(), name.trim(), passwordHash]
    );

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, name, password_hash, google_id, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, name, password_hash, google_id, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by Google ID
   */
  static async findByGoogleId(googleId: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, name, password_hash, google_id, created_at, updated_at
       FROM users
       WHERE google_id = $1`,
      [googleId]
    );

    return result.rows[0] || null;
  }

  /**
   * Create or update user from Google OAuth
   */
  static async createOrUpdateGoogleUser(googleId: string, email: string, name: string): Promise<User> {
    // Check if user exists by Google ID
    const existingUserByGoogleId = await this.findByGoogleId(googleId);
    if (existingUserByGoogleId) {
      // Update name if changed
      const result = await pool.query(
        `UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP
         WHERE google_id = $2
         RETURNING id, email, name, password_hash, google_id, created_at, updated_at`,
        [name.trim(), googleId]
      );
      return result.rows[0];
    }

    // Check if user exists by email
    const existingUserByEmail = await this.findByEmail(email);
    if (existingUserByEmail) {
      // Link Google account to existing user
      const result = await pool.query(
        `UPDATE users SET google_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE email = $2
         RETURNING id, email, name, password_hash, google_id, created_at, updated_at`,
        [googleId, email.toLowerCase().trim()]
      );
      return result.rows[0];
    }

    // Create new user
    const result = await pool.query(
      `INSERT INTO users (email, name, google_id)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, password_hash, google_id, created_at, updated_at`,
      [email.toLowerCase().trim(), name.trim(), googleId]
    );

    return result.rows[0];
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string | null): Promise<boolean> {
    if (!hash) {
      return false; // OAuth users don't have passwords
    }
    return bcrypt.compare(password, hash);
  }

  /**
   * Check if email already exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    return parseInt(result.rows[0].count) > 0;
  }
}
