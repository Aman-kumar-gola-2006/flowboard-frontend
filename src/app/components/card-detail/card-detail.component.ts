import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { CardService } from '../../services/card.service';
import { CommentService } from '../../services/comment.service';
import { LabelService } from '../../services/label.service';
import { BoardService } from '../../services/board.service';
import { AuthService } from '../../services/auth.service';
import { Card } from '../../models/card.model';
import { Comment, CommentRequest } from '../../models/comment.model';
import { Label } from '../../models/label.model';
import { BoardMember } from '../../models/board.model';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.css']
})
export class CardDetailComponent implements OnInit, OnDestroy {
  @Input() card!: Card;
  @Input() boardId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Card>();
  @Output() deleted = new EventEmitter<number>();
  
  // Edit mode
  isEditingTitle = false;
  editedTitle = '';
  isEditingDescription = false;
  editedDescription = '';
  
  // Comments
  comments: Comment[] = [];
  newComment = '';
  replyTo: Comment | null = null;
  replyContent = '';
  isLoadingComments = false;
  
  // Labels
  boardLabels: Label[] = [];
  showLabelDropdown = false;
  isLoadingLabels = false;
  newLabelName = '';
  newLabelColor = '#4f46e5';
  
  // Assignee
  boardMembers: BoardMember[] = [];
  showAssigneeDropdown = false;
  isLoadingMembers = false;
  
  // Due Date
  showDatePicker = false;
  selectedDate: string | null = null;
  
  // Delete confirmation
  showDeleteConfirm = false;
  
  selectedPriority: string = 'MEDIUM';
  selectedStatus: string = 'TO_DO';
  
  // User
  currentUserId: number;
  currentUserName: string;
  
  // Checklist
  checklistItems: any[] = [];
  newChecklistItem = '';
  activities: any[] = [];
  attachments: any[] = [];

  
  private destroy$ = new Subject<void>();
  
  constructor(
    private cardService: CardService,
    private commentService: CommentService,
    private labelService: LabelService,
    private boardService: BoardService,
    private authService: AuthService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private http: HttpClient
  ) {

    this.currentUserId = this.authService.getUserId();
    this.currentUserName = this.authService.getUserName();
  }
  
  ngOnInit(): void {
    this.loadComments();
    this.loadBoardLabels();
    this.loadBoardMembers();
    this.loadChecklist();
    this.loadActivity();
    this.loadAttachments();
    this.loadCardLabels();

    this.editedTitle = this.card.title;
    this.editedDescription = this.card.description || '';
    this.selectedDate = this.card.dueDate || null;
    this.selectedPriority = this.card.priority || 'MEDIUM';
    this.selectedStatus = this.card.status || 'TO_DO';
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // ========== TITLE ==========
  
  startEditTitle(): void {
    this.isEditingTitle = true;
    this.editedTitle = this.card.title;
  }
  
  saveTitle(): void {
    if (!this.editedTitle.trim() || this.editedTitle === this.card.title) {
      this.isEditingTitle = false;
      return;
    }
    
    this.cardService.updateCard(this.card.id, { title: this.editedTitle.trim() })
      .subscribe({
        next: (updatedCard) => {
          this.card = updatedCard;
          this.isEditingTitle = false;
          this.updated.emit(updatedCard);
        },
        error: (err) => console.error('Update title error:', err)
      });
  }
  
  cancelEditTitle(): void {
    this.isEditingTitle = false;
    this.editedTitle = this.card.title;
  }
  
  // ========== DESCRIPTION ==========
  
  startEditDescription(): void {
    this.isEditingDescription = true;
    this.editedDescription = this.card.description || '';
  }
  
  saveDescription(): void {
    if (this.editedDescription === this.card.description) {
      this.isEditingDescription = false;
      return;
    }
    
    this.cardService.updateCard(this.card.id, { description: this.editedDescription })
      .subscribe({
        next: (updatedCard) => {
          this.card = updatedCard;
          this.isEditingDescription = false;
          this.updated.emit(updatedCard);
        },
        error: (err) => console.error('Update description error:', err)
      });
  }
  
  cancelEditDescription(): void {
    this.isEditingDescription = false;
    this.editedDescription = this.card.description || '';
  }
  
  // ========== COMMENTS ==========
  
  loadComments(): void {
      this.commentService.getCommentsByCard(this.card.id).subscribe({
          next: (data) => this.comments = data || [],
          error: () => this.comments = []
      });
  }
  
  isPostingComment = false;

  addComment(): void {
      if (!this.newComment || !this.newComment.trim() || this.isPostingComment) return;
      
      this.isPostingComment = true;
      console.log('Adding comment to card:', this.card?.id);
      console.log('Payload:', { cardId: this.card?.id, content: this.newComment.trim() });
      
      this.commentService.addComment({
          cardId: this.card.id,
          content: this.newComment.trim()
      }).subscribe({
          next: (comment) => {
              this.comments.unshift(comment);
              this.newComment = '';
              this.isPostingComment = false;
          },
          error: (err) => {
              console.error('Add comment error:', err);
              this.isPostingComment = false;
          }
      });
  }
  

  
  deleteComment(comment: any): void {
      this.confirmService.confirm({
          title: 'Delete Comment?',
          message: 'Are you sure you want to remove this comment? This action cannot be undone.',
          confirmText: 'Delete',
          type: 'danger'
      }).then(confirmed => {
          if (confirmed) {
              this.commentService.deleteComment(comment.id).subscribe({
                  next: () => {
                      this.comments = this.comments.filter((c: any) => c.id !== comment.id);
                      this.toastService.success('Comment Deleted', 'Your comment has been removed.');
                  },
                  error: (err) => this.toastService.error('Error', 'Failed to delete comment')
              });
          }
      });
  }
  
  // ========== LABELS ==========
  
  loadBoardLabels(): void {
    this.isLoadingLabels = true;
    this.labelService.getBoardLabels(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (labels) => {
          this.boardLabels = labels;
          this.isLoadingLabels = false;
        },
        error: (err) => {
          console.error('Load labels error:', err);
          this.isLoadingLabels = false;
        }
      });
  }

  loadCardLabels(): void {
    this.labelService.getCardLabels(this.card.id, this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (labels) => {
          this.card.labels = labels;
        },
        error: (err) => console.error('Load card labels error:', err)
      });
  }
  
  hasLabel(label: Label): boolean {
    return this.card.labels?.some(l => l.id === label.id) || false;
  }
  
  toggleLabel(label: any): void {
    if (this.hasLabel(label)) {
        this.labelService.removeLabelFromCard(this.card.id, label.id, this.boardId).subscribe({
            next: () => {
                this.card.labels = this.card.labels?.filter((l: any) => l.id !== label.id) || [];
                this.updated.emit(this.card);
            }
        });
    } else {
        this.labelService.addLabelToCard(this.card.id, label.id, this.boardId).subscribe({
            next: () => {
                if (!this.card.labels) this.card.labels = [];
                this.card.labels.push(label);
                this.updated.emit(this.card);
            }
        });
    }
    this.showLabelDropdown = false;
}

  createAndAddLabel(): void {
    if (!this.newLabelName.trim()) return;
    
    this.labelService.createLabel(this.boardId, { name: this.newLabelName, color: this.newLabelColor }).subscribe({
        next: (label) => {
            this.boardLabels.push(label);
            this.toggleLabel(label);
            this.newLabelName = '';
            this.newLabelColor = '#4f46e5';
        },
        error: (err) => console.error('Create label error:', err)
    });
  }

  removeLabel(label: any): void {
    this.labelService.removeLabelFromCard(this.card.id, label.id, this.boardId).subscribe({
        next: () => {
            this.card.labels = this.card.labels?.filter((l: any) => l.id !== label.id) || [];
            this.updated.emit(this.card);
        },
        error: (err) => console.error('Remove label error:', err)
    });
  }

  getTextColor(hex: string): string {
    if (!hex || hex === '#dddddd') return '#333';
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 150 ? '#fff' : '#333';
  }
  
  // ========== ASSIGNEE ==========
  
  isWorkspaceAdmin = false;
  
  loadBoardMembers(): void {
    this.isLoadingMembers = true;
    this.boardService.getWorkspaceMembersByBoard(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.boardMembers = members;
          this.isLoadingMembers = false;
          
          // Check if current user is admin of the workspace
          const currentUserMember = members.find(m => m.userId === this.currentUserId);
          this.isWorkspaceAdmin = currentUserMember?.role === 'ADMIN';
        },
        error: (err) => {
          console.error('Load members error:', err);
          this.isLoadingMembers = false;
        }
      });
  }
  
  assignTo(member: any): void {
    this.cardService.updateCard(this.card.id, { assigneeId: member.userId })
      .subscribe({
        next: (updatedCard) => {
          this.card = updatedCard;
          this.card.assigneeName = member.userName;
          this.showAssigneeDropdown = false;
          this.updated.emit(this.card);
        },
        error: (err) => console.error('Assign error:', err)
      });
  }
  
  unassign(): void {
    this.cardService.updateCard(this.card.id, { assigneeId: null as any })
      .subscribe({
        next: (updatedCard) => {
          this.card = updatedCard;
          this.showAssigneeDropdown = false;
          this.updated.emit(updatedCard);
        },
        error: (err) => console.error('Unassign error:', err)
      });
  }
  
  // ========== DUE DATE ==========
  
  saveDueDate(): void {
    this.cardService.updateCard(this.card.id, { dueDate: this.selectedDate || null as any })
      .subscribe({
        next: (updatedCard) => {
          this.card = updatedCard;
          this.showDatePicker = false;
          this.updated.emit(updatedCard);
        },
        error: (err) => console.error('Update due date error:', err)
      });
  }
  
  removeDueDate(): void {
    this.selectedDate = null;
    this.saveDueDate();
  }
  
  // ========== PRIORITY & STATUS ==========

  updatePriority(): void {
    this.cardService.updateCard(this.card.id, { priority: this.selectedPriority as any }).subscribe({
      next: (updatedCard) => {
        this.card = updatedCard;
        this.updated.emit(updatedCard);
      },
      error: (err) => console.error('Update priority error:', err)
    });
  }

  updateStatus(): void {
    this.cardService.updateCard(this.card.id, { status: this.selectedStatus as any }).subscribe({
      next: (updatedCard) => {
        this.card = updatedCard;
        this.updated.emit(updatedCard);
      },
      error: (err) => console.error('Update status error:', err)
    });
  }

  // ========== DELETE ==========
  
  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }
  
  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }
  
  deleteCard(): void {
    this.cardService.deleteCard(this.card.id)
      .subscribe({
        next: () => {
          this.deleted.emit(this.card.id);
          this.close.emit();
        },
        error: (err) => console.error('Delete card error:', err)
      });
  }
  
  // ========== CHECKLIST ==========
  
  loadChecklist(): void {
    this.http.get<any[]>(`/api/cards/${this.card.id}/checklist`).subscribe({
      next: (items) => this.checklistItems = items
    });
  }

  addChecklistItem(): void {
    if (!this.newChecklistItem.trim()) return;
    this.http.post(`/api/cards/${this.card.id}/checklist`, { text: this.newChecklistItem }).subscribe({
      next: (item) => {
        this.checklistItems.push(item);
        this.newChecklistItem = '';
      }
    });
  }

  toggleChecklistItem(item: any): void {
    this.http.put(`/api/cards/${this.card.id}/checklist/${item.id}`, {}).subscribe({
      next: (updated: any) => {
        item.isCompleted = updated.isCompleted;
      }
    });
  }

  deleteChecklistItem(itemId: number): void {
    this.http.delete(`/api/cards/${this.card.id}/checklist/${itemId}`).subscribe({
      next: () => this.checklistItems = this.checklistItems.filter(i => i.id !== itemId)
    });
  }

  getChecklistProgress(): number {
    if (this.checklistItems.length === 0) return 0;
    const completed = this.checklistItems.filter(i => i.isCompleted).length;
    return Math.round((completed / this.checklistItems.length) * 100);
  }

  // ========== UTILS ==========

  
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  
  getTimeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  loadActivity(): void {
    this.http.get<any[]>(`/api/cards/${this.card.id}/activity`).subscribe({
      next: (data) => this.activities = data,
      error: () => this.activities = []
    });
  }

  loadAttachments(): void {
    this.http.get<any[]>(`/api/cards/${this.card.id}/attachments`).subscribe({
      next: (data) => this.attachments = data,
      error: () => this.attachments = []
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.http.post(`/api/cards/${this.card.id}/attachments`, formData).subscribe({
        next: () => {
            this.loadAttachments();
            this.toastService.success('File Uploaded', 'Attachment added successfully.');
        },
        error: () => this.toastService.error('Upload Failed', 'Could not upload the file. Please try again.')
      });
    }
  }

  deleteAttachment(id: number): void {
    this.http.delete(`/api/cards/${this.card.id}/attachments/${id}`).subscribe({
      next: () => this.loadAttachments()
    });
  }

  getFileIcon(type: string): string {
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('pdf')) return '📄';
    return '📎';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return Math.round(kb) + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  }
  
  closeModal(): void {
    this.close.emit();
  }
}
