/**
 * Promise Routes
 */

import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { PromiseService } from '../services/promiseService';
import { MilestoneService } from '../services/milestoneService';
import { NoteService } from '../services/noteService';
import { NotificationService } from '../services/notificationService';
import { UserService } from '../services/userService';
import { EmailService } from '../services/emailService';
import {
  CreatePromiseRequest,
  UpdatePromiseRequest,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  CreateNoteRequest,
} from '../types/promise';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get all promises for current user
 * GET /api/promises
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = req.query.status as string | undefined;
    const promises = await PromiseService.findByUserId(req.user.id, status as any);

    res.json({ promises });
  } catch (error: any) {
    console.error('Get promises error:', error);
    res.status(500).json({ error: 'Failed to get promises' });
  }
});

/**
 * Get owned promises
 * GET /api/promises/owned
 */
router.get('/owned', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = req.query.status as string | undefined;
    const promises = await PromiseService.findOwnedPromises(req.user.id, status as any);

    res.json({ promises });
  } catch (error: any) {
    console.error('Get owned promises error:', error);
    res.status(500).json({ error: 'Failed to get owned promises' });
  }
});

/**
 * Get promises made to user
 * GET /api/promises/promised-to-me
 */
router.get('/promised-to-me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = req.query.status as string | undefined;
    const promises = await PromiseService.findPromisedToUser(req.user.id, status as any);

    res.json({ promises });
  } catch (error: any) {
    console.error('Get promised-to-me error:', error);
    res.status(500).json({ error: 'Failed to get promises' });
  }
});

/**
 * Get mentored promises
 * GET /api/promises/mentoring
 */
router.get('/mentoring', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = req.query.status as string | undefined;
    const promises = await PromiseService.findMentoredPromises(req.user.id, status as any);

    res.json({ promises });
  } catch (error: any) {
    console.error('Get mentored promises error:', error);
    res.status(500).json({ error: 'Failed to get mentored promises' });
  }
});

/**
 * Get promise by ID
 * GET /api/promises/:id
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const promise = await PromiseService.findById(req.params.id, req.user.id);

    if (!promise) {
      res.status(404).json({ error: 'Promise not found' });
      return;
    }

    res.json({ promise });
  } catch (error: any) {
    console.error('Get promise error:', error);
    res.status(500).json({ error: 'Failed to get promise' });
  }
});

/**
 * Create a new promise
 * POST /api/promises
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: CreatePromiseRequest = req.body;

    if (!data.title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    // Validate deadline format if provided
    if (data.deadline) {
      const deadlineDate = new Date(data.deadline);
      if (isNaN(deadlineDate.getTime())) {
        res.status(400).json({ error: 'Invalid deadline date format. Please use YYYY-MM-DD format.' });
        return;
      }
    }

    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.promisee_email && !emailRegex.test(data.promisee_email)) {
      res.status(400).json({ error: 'Invalid promisee email format' });
      return;
    }
    if (data.mentor_email && !emailRegex.test(data.mentor_email)) {
      res.status(400).json({ error: 'Invalid mentor email format' });
      return;
    }

    // Look up users by email if emails are provided (but don't fail if they don't exist)
    let promisee_id = data.promisee_id;
    let mentor_id = data.mentor_id;
    let promisee_email = data.promisee_email;
    let mentor_email = data.mentor_email;

    // If promisee_email is provided, try to find the user
    if (promisee_email && !promisee_id) {
      const promisee = await UserService.findByEmail(promisee_email);
      if (promisee) {
        promisee_id = promisee.id;
        promisee_email = undefined; // Don't store email if user exists
      }
    }

    // If mentor_email is provided, try to find the user
    if (mentor_email && !mentor_id) {
      const mentor = await UserService.findByEmail(mentor_email);
      if (mentor) {
        mentor_id = mentor.id;
        mentor_email = undefined; // Don't store email if user exists
      }
    }

    // Validate promisee_id exists if provided (shouldn't happen, but double-check)
    if (promisee_id) {
      const promisee = await UserService.findById(promisee_id);
      if (!promisee) {
        res.status(400).json({ error: 'Invalid promisee_id' });
        return;
      }
    }

    // Validate mentor_id exists if provided (shouldn't happen, but double-check)
    if (mentor_id) {
      const mentor = await UserService.findById(mentor_id);
      if (!mentor) {
        res.status(400).json({ error: 'Invalid mentor_id' });
        return;
      }
    }

    // Create promise with resolved IDs and emails
    const promiseData = {
      ...data,
      promisee_id,
      mentor_id,
      promisee_email,
      mentor_email,
    };
    const promise = await PromiseService.createPromise(req.user.id, promiseData);

    // Send emails to promisee/mentor (even if they don't exist as users)
    if (promisee_email || promisee_id) {
      const emailToSend = promisee_email || (promisee_id ? (await UserService.findById(promisee_id))?.email : null);
      if (emailToSend) {
        await EmailService.sendPromiseInvitation(
          emailToSend,
          req.user.name,
          data.title,
          data.description,
          promise.id
        );
      }
    }

    if (mentor_email || mentor_id) {
      const emailToSend = mentor_email || (mentor_id ? (await UserService.findById(mentor_id))?.email : null);
      if (emailToSend) {
        await EmailService.sendMentorshipInvitation(
          emailToSend,
          req.user.name,
          data.title,
          data.description,
          promise.id
        );
      }
    }

    // Create in-app notifications only if users exist
    if (promisee_id) {
      await NotificationService.createNotification(
        promisee_id,
        'promise_invitation',
        `${req.user.name} made a promise to you: "${data.title}"`,
        promise.id
      );
    }

    if (mentor_id) {
      await NotificationService.createNotification(
        mentor_id,
        'mentorship_invitation',
        `${req.user.name} invited you to mentor their promise: "${data.title}"`,
        promise.id
      );
    }

    // Create milestones if provided
    if (data.milestones && data.milestones.length > 0) {
      for (const milestoneData of data.milestones) {
        await MilestoneService.createMilestone(promise.id, milestoneData);
      }
    }

    // Get full promise with relations
    const fullPromise = await PromiseService.findById(promise.id, req.user.id);

    res.status(201).json({ promise: fullPromise });
  } catch (error: any) {
    console.error('Create promise error:', error);
    
    // Return more specific error messages
    if (error.message && error.message.includes('Invalid deadline')) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      res.status(400).json({ error: 'A promise with this information already exists' });
      return;
    }
    
    if (error.code === '23503') { // PostgreSQL foreign key constraint violation
      res.status(400).json({ error: 'Invalid user reference' });
      return;
    }
    
    res.status(500).json({ error: error.message || 'Failed to create promise' });
  }
});

/**
 * Update promise (only owner can update)
 * PUT /api/promises/:id
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: UpdatePromiseRequest = req.body;

    try {
      const promise = await PromiseService.updatePromise(req.params.id, req.user.id, data);

      if (!promise) {
        res.status(404).json({ error: 'Promise not found' });
        return;
      }

      // If status was changed to completed, notify all involved users
      if (data.status === 'completed') {
        const fullPromise = await PromiseService.findById(promise.id, req.user.id);
        if (fullPromise) {
          const notifyUsers = [fullPromise.user_id];
          if (fullPromise.promisee_id) notifyUsers.push(fullPromise.promisee_id);
          if (fullPromise.mentor_id) notifyUsers.push(fullPromise.mentor_id);

          for (const userId of notifyUsers) {
            if (userId !== req.user.id) {
              await NotificationService.createNotification(
                userId,
                'promise_completed',
                `${req.user.name} completed the promise: "${fullPromise.title}"`,
                fullPromise.id
              );
            }
          }
        }
      }

      // Get full promise with relations - use requesting user's ID for access check
      const fullPromise = await PromiseService.findById(promise.id, req.user.id);

      res.json({ promise: fullPromise });
    } catch (error: any) {
      if (error.message === 'Only the owner can update a promise' || 
          error.message === 'Only the owner can update promise details' ||
          error.message === 'Only the owner can update promise status') {
        res.status(403).json({ error: error.message });
        return;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Update promise error:', error);
    // Include underlying error when it's a constraint/DB issue (e.g. status not_made not yet migrated)
    const msg = error.message || 'Failed to update promise';
    const isDb = error.code === '23514' || String(msg).toLowerCase().includes('check constraint');
    res.status(500).json({
      error: isDb ? (msg + ' (run backend restart to apply DB migration for not_made)') : 'Failed to update promise',
    });
  }
});

/**
 * Delete promise (only owner can delete)
 * DELETE /api/promises/:id
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const deleted = await PromiseService.deletePromise(req.params.id, req.user.id);

      if (!deleted) {
        res.status(404).json({ error: 'Promise not found' });
        return;
      }

      res.json({ message: 'Promise deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Only the owner can delete a promise') {
        res.status(403).json({ error: error.message });
        return;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Delete promise error:', error);
    res.status(500).json({ error: 'Failed to delete promise' });
  }
});

/**
 * Decline promise (only promisee can decline)
 * POST /api/promises/:id/decline
 */
router.post('/:id/decline', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const promise = await PromiseService.declinePromise(req.params.id, req.user.id);

    if (!promise) {
      res.status(404).json({ error: 'Promise not found or you are not the promisee' });
      return;
    }

    // Notify owner
    const ownerPromise = await PromiseService.findById(promise.id, promise.user_id);
    if (ownerPromise) {
      await NotificationService.createNotification(
        promise.user_id,
        'promise_invitation', // Could be a new type like 'promise_declined'
        `${req.user.name} declined your promise: "${promise.title}"`,
        promise.id
      );
    }

    res.json({ message: 'Promise declined', promise });
  } catch (error: any) {
    console.error('Decline promise error:', error);
    res.status(500).json({ error: 'Failed to decline promise' });
  }
});

// Milestone routes

/**
 * Create milestone
 * POST /api/promises/:id/milestones
 */
router.post('/:id/milestones', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user has access to promise
    const promise = await PromiseService.findById(req.params.id, req.user.id);
    if (!promise) {
      res.status(404).json({ error: 'Promise not found' });
      return;
    }

    const data: CreateMilestoneRequest = req.body;

    if (!data.title) {
      res.status(400).json({ error: 'Milestone title is required' });
      return;
    }

    const milestone = await MilestoneService.createMilestone(req.params.id, data);

    // Notify all involved users
    const notifyUsers = [promise.user_id];
    if (promise.promisee_id) notifyUsers.push(promise.promisee_id);
    if (promise.mentor_id) notifyUsers.push(promise.mentor_id);

    for (const userId of notifyUsers) {
      if (userId !== req.user.id) {
        await NotificationService.createNotification(
          userId,
          'note_added', // Using note_added as closest type, could add 'milestone_added'
          `${req.user.name} added a milestone to promise: "${promise.title}"`,
          promise.id
        );
      }
    }

    res.status(201).json({ milestone });
  } catch (error: any) {
    console.error('Create milestone error:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

/**
 * Update milestone
 * PUT /api/promises/:promiseId/milestones/:milestoneId
 */
router.put('/:promiseId/milestones/:milestoneId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user has access to promise
    const promise = await PromiseService.findById(req.params.promiseId, req.user.id);
    if (!promise) {
      res.status(404).json({ error: 'Promise not found' });
      return;
    }

    const data: UpdateMilestoneRequest = req.body;
    const milestone = await MilestoneService.updateMilestone(req.params.milestoneId, data);

    if (!milestone) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    // If milestone was marked as completed, notify users
    if (data.completed === true) {
      const notifyUsers = [promise.user_id];
      if (promise.promisee_id) notifyUsers.push(promise.promisee_id);
      if (promise.mentor_id) notifyUsers.push(promise.mentor_id);

      for (const userId of notifyUsers) {
        if (userId !== req.user.id) {
          await NotificationService.createNotification(
            userId,
            'milestone_completed',
            `${req.user.name} completed a milestone in promise: "${promise.title}"`,
            promise.id
          );
        }
      }
    }

    res.json({ milestone });
  } catch (error: any) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

/**
 * Delete milestone
 * DELETE /api/promises/:promiseId/milestones/:milestoneId
 */
router.delete('/:promiseId/milestones/:milestoneId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user has access to promise
    const promise = await PromiseService.findById(req.params.promiseId, req.user.id);
    if (!promise) {
      res.status(404).json({ error: 'Promise not found' });
      return;
    }

    const deleted = await MilestoneService.deleteMilestone(req.params.milestoneId);

    if (!deleted) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error: any) {
    console.error('Delete milestone error:', error);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

// Note routes

/**
 * Create note
 * POST /api/promises/:id/notes
 */
router.post('/:id/notes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: CreateNoteRequest = req.body;

    if (!data.note_text) {
      res.status(400).json({ error: 'Note text is required' });
      return;
    }

    const note = await NoteService.createNote(req.params.id, req.user.id, data);

    if (!note) {
      res.status(404).json({ error: 'Promise not found or access denied' });
      return;
    }

    // Get promise to notify other users
    const promise = await PromiseService.findById(req.params.id, req.user.id);
    if (promise) {
      const notifyUsers = [promise.user_id];
      if (promise.promisee_id) notifyUsers.push(promise.promisee_id);
      if (promise.mentor_id) notifyUsers.push(promise.mentor_id);

      for (const userId of notifyUsers) {
        if (userId !== req.user.id) {
          await NotificationService.createNotification(
            userId,
            'note_added',
            `${req.user.name} added a note to promise: "${promise.title}"`,
            promise.id
          );
        }
      }
    }

    res.status(201).json({ note });
  } catch (error: any) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

/**
 * Get all notes for a promise
 * GET /api/promises/:id/notes
 */
router.get('/:id/notes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notes = await NoteService.findByPromiseId(req.params.id, req.user.id);

    res.json({ notes });
  } catch (error: any) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

/**
 * Delete note
 * DELETE /api/promises/:promiseId/notes/:noteId
 */
router.delete('/:promiseId/notes/:noteId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const deleted = await NoteService.deleteNote(req.params.noteId, req.user.id);

    if (!deleted) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
