/**
 * Promise Types
 */

export interface Promise {
  id: string;
  user_id: string;
  promisee_id?: string | null;
  mentor_id?: string | null;
  title: string;
  description?: string | null;
  deadline?: Date | null;
  status: 'ongoing' | 'completed' | 'overdue' | 'declined';
  created_at: Date;
  updated_at: Date;
}

export interface CreatePromiseRequest {
  title: string;
  description?: string;
  deadline?: string;
  promisee_email?: string;
  mentor_email?: string;
}

export interface UpdatePromiseRequest {
  title?: string;
  description?: string;
  deadline?: string;
  status?: 'ongoing' | 'completed' | 'overdue' | 'declined';
}

export interface Milestone {
  id: string;
  promise_id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface PromiseNote {
  id: string;
  promise_id: string;
  user_id: string;
  note_text: string;
  created_at: Date;
}

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  completed?: boolean;
  order_index?: number;
}

export interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  order_index?: number;
}

export interface CreateNoteRequest {
  note_text: string;
}
