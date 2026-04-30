export interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  ownerName?: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  logoUrl?: string;
  isActive: boolean;
  isPro: boolean;
  memberCount: number;
  boardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceRequest {
  name: string;
  description?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  logoUrl?: string;
}

export interface WorkspaceMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: 'ADMIN' | 'MEMBER';
  status?: 'PENDING' | 'ACTIVE' | 'REJECTED';
  joinedAt: string;
}

export interface AddMemberRequest {
  email: string;
  role?: 'ADMIN' | 'MEMBER';
}
