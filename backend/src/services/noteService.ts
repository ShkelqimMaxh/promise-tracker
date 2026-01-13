/**
 * Note Service
 */

import { pool } from '../config/database';
import { PromiseNote, CreateNoteRequest } from '../types/promise';
import { PromiseService } from './promiseService';

export class NoteService {
  /**
   * Create a new note
   */
  static async createNote(
    promiseId: string,
    userId: string,
    data: CreateNoteRequest
  ): Promise<PromiseNote | null> {
    // Verify user has access to the promise
    const promise = await PromiseService.findById(promiseId, userId);
    if (!promise) {
      return null;
    }

    const result = await pool.query(
      `INSERT INTO promise_notes (promise_id, user_id, note_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [promiseId, userId, data.note_text]
    );

    return result.rows[0];
  }

  /**
   * Get all notes for a promise
   */
  static async findByPromiseId(
    promiseId: string,
    userId: string
  ): Promise<PromiseNote[]> {
    // Verify user has access to the promise
    const promise = await PromiseService.findById(promiseId, userId);
    if (!promise) {
      return [];
    }

    const result = await pool.query(
      `SELECT * FROM promise_notes
       WHERE promise_id = $1
       ORDER BY created_at DESC`,
      [promiseId]
    );

    return result.rows;
  }

  /**
   * Delete a note (only the creator can delete)
   */
  static async deleteNote(noteId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM promise_notes
       WHERE id = $1 AND user_id = $2`,
      [noteId, userId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }
}
