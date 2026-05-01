import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Notification, NotificationEvent } from '../models/notification.model';
import { MessageResponse } from '../models/user.model';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = 'http://16.176.51.5:8080/api/v1/notifications';
  private stompClient: Client | null = null;
  private notificationSubject = new Subject<NotificationEvent>();
  notification$ = this.notificationSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  connectWebSocket(userId: number): void {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8088/ws'),
      onConnect: () => {
        console.log('STOMP connected');
        
        // Subscribe to user-specific notifications
        client.subscribe(`/user/${userId}/queue/notifications`, (message: Message) => {
          const notification = JSON.parse(message.body);
          this.notificationSubject.next(notification);
        });
        
        // Subscribe to broadcasts
        client.subscribe('/topic/broadcast', (message: Message) => {
          const broadcast = JSON.parse(message.body);
          this.notificationSubject.next(broadcast);
        });
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
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
}
