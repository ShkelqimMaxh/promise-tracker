/**
 * Milestone Service
 */

import { pool } from '../config/database';
import { Milestone, CreateMilestoneRequest, UpdateMilestoneRequest } from '../types/promise';

export class MilestoneService {
  /**
   * Create a new milestone
   */
  static async createMilestone(
    promiseId: string,
    data: CreateMilestoneRequest
  ): Promise<Milestone> {
    const result = await pool.query(
      `INSERT INTO milestones (promise_id, title, description, completed, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        promiseId,
        data.title,
        data.description || null,
        data.completed || false,
        data.order_index || 0,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update a milestone
   */
  static async updateMilestone(
    milestoneId: string,
    data: UpdateMilestoneRequest
  ): Promise<Milestone | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.completed !== undefined) {
      updates.push(`completed = $${paramCount++}`);
      values.push(data.completed);
    }
    if (data.order_index !== undefined) {
      updates.push(`order_index = $${paramCount++}`);
      values.push(data.order_index);
    }

    if (updates.length === 0) {
      // No updates, just return the milestone
      const result = await pool.query(
        `SELECT * FROM milestones WHERE id = $1`,
        [milestoneId]
      );
      return result.rows[0] || null;
    }

    values.push(milestoneId);
    const result = await pool.query(
      `UPDATE milestones
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a milestone
   */
  static async deleteMilestone(milestoneId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM milestones WHERE id = $1`,
      [milestoneId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get all milestones for a promise
   */
  static async findByPromiseId(promiseId: string): Promise<Milestone[]> {
    const result = await pool.query(
      `SELECT * FROM milestones
       WHERE promise_id = $1
       ORDER BY order_index ASC, created_at ASC`,
      [promiseId]
    );

    return result.rows;
  }
}
