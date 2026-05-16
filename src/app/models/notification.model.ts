export interface Notification {
  id: number;
  recipientId: number;
  actorId?: number;
  actorName?: string;
  type: 'ASSIGNMENT' | 'MENTION' | 'DUE_DATE' | 'COMMENT' | 'MOVE' | 'BROADCAST' | 'INVITE' | 'WELCOME' | 'PRO' | 'SUSPEND' | 'REACTIVATE';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: 'CARD' | 'BOARD' | 'COMMENT' | 'WORKSPACE';
  deepLink?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationEvent {
  id?: number;
  recipientId: number;
  actorId?: number;
  actorName?: string;
  type: string;
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
  deepLink?: string;
}
