export interface Board {
  id: number;
  workspaceId: number;
  name: string;
  description?: string;
  backgroundColor: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: number;
  isClosed: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardRequest {
  workspaceId: number;
  name: string;
  description?: string;
  backgroundColor?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface BoardMember {
  id: number;
  userId: number;
  role: 'ADMIN' | 'MEMBER' | 'OBSERVER';
  userName?: string;
  userEmail?: string;
  joinedAt: string;
}
