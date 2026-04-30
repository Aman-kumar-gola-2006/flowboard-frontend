export interface TaskList {
  id: number;
  boardId: number;
  name: string;
  position: number;
  color?: string;
  isArchived: boolean;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListRequest {
  boardId: number;
  name: string;
  color?: string;
}

export interface ReorderRequest {
  listIds: number[];
}
