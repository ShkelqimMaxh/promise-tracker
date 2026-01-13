/**
 * Notification Scheduler
 * Handles periodic notification checks for overdue promises and upcoming deadlines
 */

import { pool } from '../config/database';
import { PromiseService } from './promiseService';
import { NotificationService } from './notificationService';

/**
 * Check and update overdue promises, then notify all involved users
 */
export async function checkOverduePromises(): Promise<void> {
  try {
    // First, update promises that are overdue
    await PromiseService.updateOverduePromises();

    // Get all promises that just became overdue (status = 'overdue' and deadline has passed)
    const result = await pool.query(
      `SELECT id, user_id, promisee_id, mentor_id, title, deadline
       FROM promises
       WHERE status = 'overdue'
       AND deadline IS NOT NULL
       AND deadline < NOW()
       AND deadline >= NOW() - INTERVAL '1 hour'`
    );

    // Notify all involved users about each overdue promise
    for (const promise of result.rows) {
      const notifyUsers = [promise.user_id];
      if (promise.promisee_id) notifyUsers.push(promise.promisee_id);
      if (promise.mentor_id) notifyUsers.push(promise.mentor_id);

      for (const userId of notifyUsers) {
        // Check if notification already exists for this promise and user
        const existingNotification = await pool.query(
          `SELECT id FROM notifications
           WHERE user_id = $1
           AND related_promise_id = $2
           AND type = 'promise_overdue'
           AND created_at >= NOW() - INTERVAL '1 hour'`,
          [userId, promise.id]
        );

        // Only create notification if one doesn't already exist
        if (existingNotification.rows.length === 0) {
          await NotificationService.createNotification(
            userId,
            'promise_overdue',
            `The promise "${promise.title}" is now overdue`,
            promise.id
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking overdue promises:', error);
    throw error;
  }
}

/**
 * Check for promises with deadlines approaching (within 24 hours) and notify users
 */
export async function checkDeadlineNotifications(): Promise<void> {
  try {
    // Get promises with deadlines in the next 24 hours that are still ongoing
    const result = await pool.query(
      `SELECT id, user_id, promisee_id, mentor_id, title, deadline
       FROM promises
       WHERE status = 'ongoing'
       AND deadline IS NOT NULL
       AND deadline > NOW()
       AND deadline <= NOW() + INTERVAL '24 hours'`
    );

    // Notify all involved users about upcoming deadlines
    for (const promise of result.rows) {
      const notifyUsers = [promise.user_id];
      if (promise.promisee_id) notifyUsers.push(promise.promisee_id);
      if (promise.mentor_id) notifyUsers.push(promise.mentor_id);

      for (const userId of notifyUsers) {
        // Check if notification already exists for this promise and user
        const existingNotification = await pool.query(
          `SELECT id FROM notifications
           WHERE user_id = $1
           AND related_promise_id = $2
           AND type = 'deadline_near'
           AND created_at >= NOW() - INTERVAL '6 hours'`,
          [userId, promise.id]
        );

        // Only create notification if one doesn't already exist
        if (existingNotification.rows.length === 0) {
          const deadlineDate = new Date(promise.deadline);
          const hoursUntilDeadline = Math.round(
            (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60)
          );

          let message: string;
          if (hoursUntilDeadline < 1) {
            message = `The promise "${promise.title}" deadline is in less than an hour`;
          } else if (hoursUntilDeadline === 1) {
            message = `The promise "${promise.title}" deadline is in 1 hour`;
          } else {
            message = `The promise "${promise.title}" deadline is in ${hoursUntilDeadline} hours`;
          }

          await NotificationService.createNotification(
            userId,
            'deadline_near',
            message,
            promise.id
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking deadline notifications:', error);
    throw error;
  }
}
