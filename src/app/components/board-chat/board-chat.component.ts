import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Simple board chat feature - talks to /api/boards/{id}/chat
interface ChatMessage {
  id?: number;
  boardId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'error';
  tempId?: string;
}

@Component({
  selector: 'app-board-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board-chat.component.html',
  styleUrls: ['./board-chat.component.css']
})
export class BoardChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Input() boardId!: number;
  @Output() closePanel = new EventEmitter<void>();

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = true;
  isSending = false;
  isConnected = false;
  hasError = false;
  pollingInterval: any = null;

  // Mentions dropdown properties
  boardMembers: any[] = [];
  filteredMembers: any[] = [];
  showMentionDropdown = false;
  mentionQuery = '';

  currentUserId: number = 0;
  currentUserName: string = '';

  private stompClient: Client | null = null;
  private shouldScrollToBottom = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.currentUserName = this.authService.getUserName() || ('User ' + this.currentUserId);
    this.loadChatHistory();
    this.startPolling(); // Start polling fallback loop immediately
    this.connectWebSocket();
    this.loadBoardMembers();
  }

  ngOnDestroy(): void {
    this.stopPolling();
    // Clean up WebSocket on component destroy
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      console.log('Board chat WebSocket disconnected');
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // Load last 50 messages from REST API
  loadChatHistory(): void {
    this.isLoading = true;
    this.hasError = false;
    this.http.get<ChatMessage[]>(`/api/boards/${this.boardId}/chat`).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.isLoading = false;
        this.hasError = false;
        this.shouldScrollToBottom = true;
        console.log(`Loaded ${msgs.length} chat messages for board ${this.boardId}`);
      },
      error: (err) => {
        console.error('Failed to load chat history:', err);
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  // Connect to board WebSocket for real-time messages
  connectWebSocket(): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws-board'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.isConnected = true;
        console.log('Board chat WebSocket connected!');
        this.stopPolling(); // Stop polling when WS is connected

        // Subscribe to this board's chat topic
        this.stompClient!.subscribe(`/topic/board/${this.boardId}/chat`, (frame) => {
          const msg: ChatMessage = JSON.parse(frame.body);
          
          // Match and replace optimistic message
          const existingIndex = this.messages.findIndex(m => 
            m.id === msg.id || 
            (m.senderId === msg.senderId && m.content === msg.content && m.status === 'sending') ||
            (m.senderId === msg.senderId && m.content === msg.content && m.status === 'sent')
          );
          
          if (existingIndex !== -1) {
            this.messages[existingIndex] = { ...msg, status: 'sent', tempId: undefined };
          } else {
            this.messages.push(msg);
            this.shouldScrollToBottom = true;
          }
        });
      },
      onDisconnect: () => {
        this.isConnected = false;
        console.log('Board chat WebSocket disconnected, starting polling fallback...');
        this.startPolling();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        this.isConnected = false;
        this.startPolling();
      }
    });

    this.stompClient.activate();
  }

  // REST polling fallback helper methods
  startPolling(): void {
    if (this.pollingInterval) return;
    console.log('Starting REST polling fallback for board chat...');
    this.pollingInterval = setInterval(() => {
      this.pollChatHistory();
    }, 5000);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped REST polling fallback');
    }
  }

  pollChatHistory(): void {
    this.http.get<ChatMessage[]>(`/api/boards/${this.boardId}/chat`).subscribe({
      next: (msgs) => {
        // Find new messages and merge/update
        msgs.forEach(msg => {
          const existingIndex = this.messages.findIndex(m => 
            m.id === msg.id || 
            (m.senderId === msg.senderId && m.content === msg.content && !m.id)
          );
          
          if (existingIndex !== -1) {
            this.messages[existingIndex] = { ...msg, status: 'sent', tempId: undefined };
          } else {
            this.messages.push(msg);
            this.shouldScrollToBottom = true;
          }
        });
      },
      error: (err) => {
        console.error('Polling fallback error:', err);
      }
    });
  }

  // Send a new message with optimistic UI and live WS synchronization
  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content) return;

    this.newMessage = '';
    const tempId = 'temp-' + Date.now();

    // Create optimistic message
    const tempMsg: ChatMessage = {
      boardId: this.boardId,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      content: content,
      createdAt: new Date().toISOString(),
      status: 'sending',
      tempId: tempId
    };

    // Add to list immediately
    this.messages.push(tempMsg);
    this.shouldScrollToBottom = true;

    this.http.post<ChatMessage>(`/api/boards/${this.boardId}/chat`, { content }).subscribe({
      next: (saved) => {
        // Update optimistic message status and link database id
        const index = this.messages.findIndex(m => m.tempId === tempId);
        if (index !== -1) {
          this.messages[index] = { ...saved, status: 'sent', tempId: undefined };
        }
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        const index = this.messages.findIndex(m => m.tempId === tempId);
        if (index !== -1) {
          this.messages[index].status = 'error';
        }
      }
    });
  }

  // Emit close event to parent
  close(): void {
    this.closePanel.emit();
  }

  // Handle enter key - send message
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // TrackBy for ngFor performance
  trackById(index: number, msg: ChatMessage): number | undefined {
    return msg.id;
  }

  trackByMsgId(index: number, msg: ChatMessage): string | number | undefined {
    return msg.id || msg.createdAt;
  }

  // Scroll to the bottom of the messages container
  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // no-op
    }
  }

  // Format time nicely
  formatTime(createdAt: string): string {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Get avatar initials from sender name
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  // Mentions related helper methods
  loadBoardMembers(): void {
    this.http.get<any[]>(`/api/boards/${this.boardId}/members`).subscribe({
      next: (members) => {
        this.boardMembers = members.filter(m => m.userId !== this.currentUserId);
      },
      error: (err) => console.error('Failed to load board members for mentions', err)
    });
  }

  onInput(event: any): void {
    const val = this.newMessage;
    const selectionStart = event.target.selectionStart || 0;
    const textBeforeCursor = val.substring(0, selectionStart);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ')) {
      const query = textBeforeCursor.substring(lastAtIndex + 1);
      if (!query.includes(' ')) {
        this.showMentionDropdown = true;
        this.mentionQuery = query;
        this.filterMembers(query);
        return;
      }
    }
    this.showMentionDropdown = false;
  }

  filterMembers(query: string): void {
    this.filteredMembers = this.boardMembers.filter(m => 
      (m.userName && m.userName.toLowerCase().includes(query.toLowerCase())) ||
      (m.userEmail && m.userEmail.toLowerCase().includes(query.toLowerCase()))
    );
  }

  selectMention(member: any): void {
    const val = this.newMessage;
    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const mentionText = `@${member.userName} `;
      this.newMessage = val.substring(0, lastAtIndex) + mentionText;
    }
    this.showMentionDropdown = false;
    
    // Focus back on input
    setTimeout(() => {
      const inputEl = document.getElementById('chat-message-input');
      if (inputEl) inputEl.focus();
    }, 50);
  }
}
