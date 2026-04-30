export interface Notification {
  id: number;
  recipientId: number;
  actorId?: number;
  actorName?: string;
  type: 'ASSIGNMENT' | 'MENTION' | 'DUE_DATE' | 'COMMENT' | 'MOVE' | 'BROADCAST';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: 'CARD' | 'BOARD' | 'COMMENT';
  deepLink?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationEvent {
  recipientId: number;
  actorId?: number;
  type: string;
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
}
