/**
 * Promise Service
 * Handles promise-related database operations
 */

import { pool } from '../config/database';
import { PromiseRecord, CreatePromiseRequest, UpdatePromiseRequest, PromiseWithRelations, PromiseStatus } from '../types/promise';

export class PromiseService {
  /**
   * Create a new promise
   */
  static async createPromise(userId: string, data: CreatePromiseRequest): Promise<PromiseRecord> {
    const { title, description, deadline, promisee_id, mentor_id, promisee_email, mentor_email } = data;

    // Validate and parse deadline
    let deadlineDate: Date | null = null;
    if (deadline) {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('Invalid deadline date format');
      }
    }

    // Normalize emails to lowercase
    const normalizedPromiseeEmail = promisee_email ? promisee_email.toLowerCase().trim() : null;
    const normalizedMentorEmail = mentor_email ? mentor_email.toLowerCase().trim() : null;

    const result = await pool.query(
      `INSERT INTO promises (user_id, promisee_id, mentor_id, promisee_email, mentor_email, title, description, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        promisee_id || null,
        mentor_id || null,
        normalizedPromiseeEmail,
        normalizedMentorEmail,
        title,
        description || null,
        deadlineDate,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get promise by ID with relations
   */
  static async findById(id: string, userId: string): Promise<PromiseWithRelations | null> {
    // Get promise with user info
    const promiseResult = await pool.query(
      `SELECT 
        p.*,
        promisee.id as promisee_user_id,
        promisee.name as promisee_name,
        promisee.email as promisee_user_email,
        mentor.id as mentor_user_id,
        mentor.name as mentor_name,
        mentor.email as mentor_user_email
       FROM promises p
       LEFT JOIN users promisee ON p.promisee_id = promisee.id
       LEFT JOIN users mentor ON p.mentor_id = mentor.id
       WHERE p.id = $1
       AND (p.user_id = $2 OR p.promisee_id = $2 OR p.mentor_id = $2 OR p.promisee_email = (SELECT email FROM users WHERE id = $2) OR p.mentor_email = (SELECT email FROM users WHERE id = $2))`,
      [id, userId]
    );

    if (promiseResult.rows.length === 0) {
      return null;
    }

    const promise = promiseResult.rows[0];

    // Get milestones
    const milestonesResult = await pool.query(
      `SELECT * FROM milestones WHERE promise_id = $1 ORDER BY order_index, created_at`,
      [id]
    );

    // Get notes with user info
    const notesResult = await pool.query(
      `SELECT 
        pn.*,
        u.name as user_name,
        u.email as user_email
       FROM promise_notes pn
       JOIN users u ON pn.user_id = u.id
       WHERE pn.promise_id = $1
       ORDER BY pn.created_at DESC`,
      [id]
    );

    return {
      id: promise.id,
      user_id: promise.user_id,
      promisee_id: promise.promisee_id,
      mentor_id: promise.mentor_id,
      promisee_email: promise.promisee_email,
      mentor_email: promise.mentor_email,
      title: promise.title,
      description: promise.description,
      deadline: promise.deadline,
      status: promise.status,
      created_at: promise.created_at,
      updated_at: promise.updated_at,
      promisee: promise.promisee_user_id
        ? {
            id: promise.promisee_user_id,
            name: promise.promisee_name,
            email: promise.promisee_user_email || promise.promisee_email,
          }
        : promise.promisee_email
        ? {
            id: '', // No user ID yet
            name: promise.promisee_email.split('@')[0], // Use email prefix as name
            email: promise.promisee_email,
          }
        : undefined,
      mentor: promise.mentor_user_id
        ? {
            id: promise.mentor_user_id,
            name: promise.mentor_name,
            email: promise.mentor_user_email || promise.mentor_email,
          }
        : promise.mentor_email
        ? {
            id: '', // No user ID yet
            name: promise.mentor_email.split('@')[0], // Use email prefix as name
            email: promise.mentor_email,
          }
        : undefined,
      milestones: milestonesResult.rows,
      notes: notesResult.rows.map((note: any) => ({
        id: note.id,
        promise_id: note.promise_id,
        user_id: note.user_id,
        note_text: note.note_text,
        created_at: note.created_at,
        user_name: note.user_name,
        user_email: note.user_email,
      })),
      milestone_count: milestonesResult.rows.length,
      completed_milestones: milestonesResult.rows.filter((m: any) => m.completed).length,
    };
  }

  /**
   * Get all promises for a user (where user is owner, promisee, or mentor)
   */
  static async findByUserId(userId: string, status?: PromiseStatus): Promise<PromiseRecord[]> {
    let query = `
      SELECT * FROM promises
      WHERE (user_id = $1 OR promisee_id = $1 OR mentor_id = $1)
    `;
    const params: any[] = [userId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get promises where user is owner
   */
  static async findOwnedPromises(userId: string, status?: PromiseStatus): Promise<PromiseRecord[]> {
    let query = `SELECT * FROM promises WHERE user_id = $1`;
    const params: any[] = [userId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get promises where user is promisee (promised to them)
   */
  static async findPromisedToUser(userId: string, status?: PromiseStatus): Promise<PromiseRecord[]> {
    let query = `SELECT * FROM promises WHERE promisee_id = $1 AND status != 'declined'`;
    const params: any[] = [userId];

    if (status && status !== 'declined') {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get promises where user is mentor
   */
  static async findMentoredPromises(userId: string, status?: PromiseStatus): Promise<PromiseRecord[]> {
    let query = `SELECT * FROM promises WHERE mentor_id = $1`;
    const params: any[] = [userId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Update promise
   * - Owner can update: title, description, deadline, status, promisee_id, mentor_id
   * - Promisee can update: status (to 'completed' only)
   */
  static async updatePromise(id: string, userId: string, data: UpdatePromiseRequest): Promise<PromiseRecord | null> {
    // Get promise details to check permissions
    const checkResult = await pool.query(
      `SELECT user_id, promisee_id, status FROM promises WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return null;
    }

    const promise = checkResult.rows[0];
    const isOwner = promise.user_id === userId;
    const isPromisee = promise.promisee_id === userId;

    // If updating status: completed (owner or promisee), not_made (owner only)
    if (data.status !== undefined) {
      if (data.status === 'completed' && (isOwner || isPromisee)) {
        // Both owner and promisee can mark as completed
      } else if (data.status === 'not_made' && isOwner) {
        // Only owner can mark as not made (softer than "failed")
      } else if (!isOwner) {
        // Only owner can change status to other values
        throw new Error('Only the owner can update promise status');
      }
    }

    // For non-status updates, only owner can update
    const hasNonStatusUpdates = data.title !== undefined || 
                                data.description !== undefined || 
                                data.deadline !== undefined ||
                                data.promisee_id !== undefined ||
                                data.mentor_id !== undefined;
    
    if (hasNonStatusUpdates && !isOwner) {
      throw new Error('Only the owner can update promise details');
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.deadline !== undefined) {
      updates.push(`deadline = $${paramIndex++}`);
      values.push(data.deadline ? new Date(data.deadline) : null);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.promisee_id !== undefined) {
      updates.push(`promisee_id = $${paramIndex++}`);
      values.push(data.promisee_id || null);
    }
    if (data.mentor_id !== undefined) {
      updates.push(`mentor_id = $${paramIndex++}`);
      values.push(data.mentor_id || null);
    }

    if (updates.length === 0) {
      // No updates, just return the promise
      const result = await pool.query(`SELECT * FROM promises WHERE id = $1`, [id]);
      return result.rows[0] || null;
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE promises SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete promise (only owner can delete)
   */
  static async deletePromise(id: string, userId: string): Promise<boolean> {
    // Check if user is the owner
    const checkResult = await pool.query(
      `SELECT user_id FROM promises WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return false;
    }

    if (checkResult.rows[0].user_id !== userId) {
      throw new Error('Only the owner can delete a promise');
    }

    const result = await pool.query(
      `DELETE FROM promises WHERE id = $1`,
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Decline promise (only promisee can decline)
   */
  static async declinePromise(id: string, promiseeId: string): Promise<PromiseRecord | null> {
    const result = await pool.query(
      `UPDATE promises 
       SET status = 'declined' 
       WHERE id = $1 AND promisee_id = $2
       RETURNING *`,
      [id, promiseeId]
    );

    return result.rows[0] || null;
  }

  /**
   * Check and update overdue promises
   */
  static async updateOverduePromises(): Promise<void> {
    await pool.query(
      `UPDATE promises 
       SET status = 'overdue' 
       WHERE status = 'ongoing' 
       AND deadline IS NOT NULL 
       AND deadline < NOW()`
    );
  }

  /**
   * Link email addresses to user_id when a user joins
   * This is called after user registration/login to connect promises to new users
   */
  static async linkEmailToUserId(userId: string, email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Update promises where promisee_email matches
    await pool.query(
      `UPDATE promises 
       SET promisee_id = $1 
       WHERE promisee_email = $2 
       AND promisee_id IS NULL`,
      [userId, normalizedEmail]
    );

    // Update promises where mentor_email matches
    await pool.query(
      `UPDATE promises 
       SET mentor_id = $1 
       WHERE mentor_email = $2 
       AND mentor_id IS NULL`,
      [userId, normalizedEmail]
    );
  }
}
