import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { Subject, takeUntil } from 'rxjs';

import { ThemeService } from '../../services/theme.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() showSearch: boolean = true;
  @Input() searchPlaceholder: string = 'Search...';

  userName = '';
  userAvatar = '';
  searchQuery = '';
  unreadCount = 0;
  notifications: Notification[] = [];
  showNotifications = false;
  showUserMenu = false;
  showMobileMenu = false;

  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    public themeService: ThemeService,
    private searchService: SearchService,
    private router: Router
  ) { }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.loadNotifications();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.notificationService.disconnectWebSocket();
  }

  connectWebSocket(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.connectWebSocket(userId);

      this.notificationService.notification$
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          this.handleNewNotification(event);
        });
    }
  }

  loadNotifications(): void {
    const userId = this.authService.getUserId();
    this.notificationService.getUserNotifications(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications.slice(0, 10);
          this.updateUnreadCount();
        }
      });

    this.notificationService.getUnreadCount(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.unreadCount = res.count;
        }
      });
  }

  handleNewNotification(event: any): void {
    // Play sound or show toast
    this.unreadCount++;

    // Add to top of notifications list
    this.notifications.unshift({
      id: event.id || Date.now(),
      recipientId: event.recipientId,
      actorId: event.actorId,
      actorName: event.actorName || 'System',
      type: event.type,
      title: event.title,
      message: event.message,
      relatedId: event.relatedId,
      relatedType: event.relatedType,
      deepLink: event.deepLink,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Keep only last 10
    this.notifications = this.notifications.slice(0, 10);
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  onSearch(): void {
    this.searchService.setSearchQuery(this.searchQuery);
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id)
      .subscribe({
        next: () => {
          notification.isRead = true;
          this.updateUnreadCount();
        }
      });
  }

  markAllAsRead(): void {
    const userId = this.authService.getUserId();
    this.notificationService.markAllAsRead(userId)
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
        }
      });
  }

  navigateToNotification(notification: Notification): void {
    this.markAsRead(notification);
    this.showNotifications = false;

    if (notification.deepLink) {
      this.router.navigateByUrl(notification.deepLink);
    } else if (notification.relatedType === 'CARD' && notification.relatedId) {
      // Navigate to card detail
      console.log('Navigate to card:', notification.relatedId);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'ASSIGNMENT': '👤',
      'MENTION': '💬',
      'DUE_DATE': '⏰',
      'COMMENT': '📝',
      'MOVE': '🔄',
      'BROADCAST': '📢'
    };
    return icons[type] || '🔔';
  }

  getTimeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
