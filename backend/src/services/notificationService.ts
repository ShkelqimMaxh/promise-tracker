/**
 * Notification Service
 */

import { pool } from '../config/database';

export interface Notification {
  id: string;
  user_id: string;
  type: 'promise_invitation' | 'mentorship_invitation' | 'milestone_completed' | 'note_added' | 'promise_completed' | 'promise_overdue' | 'deadline_near';
  related_promise_id: string | null;
  message: string;
  read: boolean;
  created_at: Date;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(
    userId: string,
    type: Notification['type'],
    message: string,
    relatedPromiseId?: string
  ): Promise<Notification> {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, message, related_promise_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, type, message, relatedPromiseId || null]
    );

    return this.mapRowToNotification(result.rows[0]);
  }

  /**
   * Get all notifications for a user
   */
  static async findByUserId(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;
    const params: any[] = [userId];

    if (unreadOnly) {
      query += ` AND read = false`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows.map(row => this.mapRowToNotification(row));
  }

  /**
   * Get a notification by ID
   */
  static async findById(id: string, userId: string): Promise<Notification | null> {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToNotification(result.rows[0]);
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const result = await pool.query(
      `UPDATE notifications
       SET read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToNotification(result.rows[0]);
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications
       SET read = true
       WHERE user_id = $1 AND read = false`,
      [userId]
    );
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND read = false`,
      [userId]
    );

    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Map database row to Notification object
   */
  private static mapRowToNotification(row: any): Notification {
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      related_promise_id: row.related_promise_id,
      message: row.message,
      read: row.read,
      created_at: row.created_at,
    };
  }
}
