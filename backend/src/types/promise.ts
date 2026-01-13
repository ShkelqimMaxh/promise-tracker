/**
 * Promise Types
 */

export type PromiseStatus = 'ongoing' | 'completed' | 'overdue' | 'declined';

export interface PromiseRecord {
  id: string;
  user_id: string;
  promisee_id?: string | null;
  mentor_id?: string | null;
  title: string;
  description?: string | null;
  deadline?: Date | null;
  status: PromiseStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePromiseRequest {
  title: string;
  description?: string;
  deadline?: string;
  promisee_email?: string;
  mentor_email?: string;
  promisee_id?: string;
  mentor_id?: string;
  milestones?: CreateMilestoneRequest[];
}

export interface UpdatePromiseRequest {
  title?: string;
  description?: string;
  deadline?: string;
  status?: PromiseStatus;
  promisee_id?: string;
  mentor_id?: string;
}

export interface PromiseWithRelations extends PromiseRecord {
  promisee?: {
    id: string;
    name: string;
    email: string;
  };
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
  milestones?: Milestone[];
  notes?: (PromiseNote & { user_name?: string; user_email?: string })[];
  milestone_count?: number;
  completed_milestones?: number;
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
