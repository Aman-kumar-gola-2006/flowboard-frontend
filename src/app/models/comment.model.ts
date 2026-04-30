export interface Comment {
  id: number;
  cardId: number;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentCommentId?: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CommentRequest {
  cardId: number;
  content: string;
  parentCommentId?: number;
}
