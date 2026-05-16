import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Notification, NotificationEvent } from '../models/notification.model';
import { MessageResponse } from '../models/user.model';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = '/api/notifications';
  private stompClient: Client | null = null;
  private notificationSubject = new Subject<NotificationEvent>();
  notification$ = this.notificationSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  connectWebSocket(userId: number): void {
    console.log('Attempting to connect to WebSocket for user:', userId);
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        console.log('STOMP connected successfully');
        
        // Subscribe to user-specific notifications
        const topic = `/topic/notifications/${userId}`;
        console.log('Subscribing to topic:', topic);
        
        client.subscribe(topic, (message: Message) => {
          console.log('Real-time notification received:', message.body);
          const notification = JSON.parse(message.body);
          this.notificationSubject.next(notification);
        });
        
        // Subscribe to broadcasts
        client.subscribe('/topic/broadcast', (message: Message) => {
          console.log('Broadcast received:', message.body);
          const broadcast = JSON.parse(message.body);
          this.notificationSubject.next(broadcast);
        });
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
      },
      onWebSocketClose: () => {
        console.warn('WebSocket connection closed');
      }
    });
    
    client.activate();
    this.stompClient = client;
  }
  
  disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }
  
  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${userId}`);
  }
  
  getUnreadCount(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/user/${userId}/unread-count`);
  }
  
  markAsRead(id: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/${id}/read`, {});
  }
  
  markAllAsRead(userId: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/user/${userId}/read-all`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  deleteAllNotifications(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user/${userId}/all`);
  }
}
