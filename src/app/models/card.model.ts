import { Label } from './label.model';

export interface Card {
  id: number;
  listId: number;
  boardId: number;
  title: string;
  description?: string;
  position: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  dueDate?: string;
  startDate?: string;
  assigneeId?: number;
  assigneeName?: string;
  assigneeAvatar?: string;
  createdBy: number;
  coverColor: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
}

export interface CardRequest {
  listId: number;
  boardId: number;
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  dueDate?: string;
  startDate?: string;
  assigneeId?: number;
  coverColor?: string;
}

export interface MoveCardRequest {
  targetListId: number;
  newPosition: number;
}
