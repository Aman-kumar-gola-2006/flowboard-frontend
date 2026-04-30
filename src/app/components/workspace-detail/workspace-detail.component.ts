import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { WorkspaceService } from '../../services/workspace.service';
import { BoardService } from '../../services/board.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { Workspace, WorkspaceRequest, WorkspaceMember, AddMemberRequest } from '../../models/workspace.model';
import { Board, BoardRequest } from '../../models/board.model';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-workspace-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './workspace-detail.component.html',
  styleUrls: ['./workspace-detail.component.css']
})
export class WorkspaceDetailComponent implements OnInit, OnDestroy {
  workspaceId!: number;
  workspace: Workspace | null = null;
  boards: Board[] = [];
  members: WorkspaceMember[] = [];
  
  isLoading = true;
  isLoadingBoards = true;
  isLoadingMembers = true;
  errorMessage = '';
  
  // Create board modal
  showCreateBoardModal = false;
  newBoard: BoardRequest = { workspaceId: 0, name: '', visibility: 'PRIVATE', backgroundColor: '#ffffff' };
  isCreatingBoard = false;
  
  // Invite member
  showInviteModal = false;
  inviteEmail = '';
  inviteRole: 'ADMIN' | 'MEMBER' = 'MEMBER';
  isInviting = false;
  inviteError = '';
  
  // Sidebar mobile toggle
  showSidebar = false;
  
  // Current user role
  isAdmin = false;
  
  // Edit workspace modal
  showEditModal = false;
  editWorkspaceData: WorkspaceRequest = { name: '', description: '', visibility: 'PRIVATE' };
  isUpdatingWorkspace = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService,
    private boardService: BoardService,
    public authService: AuthService,
    private paymentService: PaymentService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    this.workspaceId = Number(this.route.snapshot.paramMap.get('id'));
    this.newBoard.workspaceId = this.workspaceId;
    this.loadWorkspace();
    this.loadBoards();
    this.loadMembers();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadWorkspace(): void {
    this.workspaceService.getWorkspaceById(this.workspaceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workspace) => {
          this.workspace = workspace;
          this.isLoading = false;
          this.checkAdminStatus();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load workspace';
          this.isLoading = false;
          console.error('Workspace load error:', err);
        }
      });
  }
  
  loadBoards(): void {
    this.isLoadingBoards = true;
    this.boardService.getBoardsByWorkspace(this.workspaceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boards) => {
          this.boards = boards;
          this.isLoadingBoards = false;
        },
        error: (err) => {
          console.error('Boards load error:', err);
          this.isLoadingBoards = false;
        }
      });
  }
  
  loadMembers(): void {
    this.isLoadingMembers = true;
    this.workspaceService.getMembers(this.workspaceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.members = members;
          this.isLoadingMembers = false;
          this.checkAdminStatus();
        },
        error: (err) => {
          console.error('Members load error:', err);
          this.isLoadingMembers = false;
        }
      });
  }
  
  checkAdminStatus(): void {
    const currentUserId = this.authService.getUserId();
    const currentMember = this.members.find(m => m.userId === currentUserId);
    this.isAdmin = currentMember?.role === 'ADMIN' || this.workspace?.ownerId === currentUserId;
  }
  
  // ========== BOARD OPERATIONS ==========
  
  openCreateBoardModal(): void {
    if (!this.workspace?.isPro && this.boards.length >= 3) {
      this.toastService.warning('Limit Reached', 'Free workspaces are limited to 3 boards. Upgrade to PRO!');
      return;
    }
    this.newBoard = { workspaceId: this.workspaceId, name: '', visibility: 'PRIVATE', backgroundColor: '#ffffff' };
    this.showCreateBoardModal = true;
  }
  
  closeCreateBoardModal(): void {
    this.showCreateBoardModal = false;
  }
  
  createBoard(): void {
    if (!this.newBoard.name?.trim()) return;
    
    this.isCreatingBoard = true;
    this.boardService.createBoard(this.newBoard)
      .subscribe({
        next: (board) => {
          this.boards.push(board);
          this.isCreatingBoard = false;
          this.closeCreateBoardModal();
          this.router.navigate(['/board', board.id]);
        },
        error: (err) => {
          console.error('Create board error:', err);
          this.isCreatingBoard = false;
        }
      });
  }
  
  deleteBoard(board: Board, event: Event): void {
    event.stopPropagation();
    this.confirmService.confirm({
      title: 'Delete Board?',
      message: `Are you sure you want to delete board "${board.name}"? This will remove all lists and cards inside it.`,
      confirmText: 'Delete Board',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.boardService.deleteBoard(board.id)
          .subscribe({
            next: () => {
              this.boards = this.boards.filter(b => b.id !== board.id);
              this.toastService.success('Board Deleted', 'The board has been removed.');
            },
            error: (err) => this.toastService.error('Error', 'Failed to delete board')
          });
      }
    });
  }
  
  // ========== MEMBER OPERATIONS ==========
  
  openInviteModal(): void {
    this.inviteEmail = '';
    this.inviteRole = 'MEMBER';
    this.inviteError = '';
    this.showInviteModal = true;
  }
  
  closeInviteModal(): void {
    this.showInviteModal = false;
  }
  
  inviteMember(): void {
    if (!this.inviteEmail.trim()) {
      this.inviteError = 'Email is required';
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.inviteEmail)) {
      this.inviteError = 'Please enter a valid email';
      return;
    }
    
    this.isInviting = true;
    this.inviteError = '';
    
    const request: AddMemberRequest = {
      email: this.inviteEmail.trim(),
      role: this.inviteRole
    };
    
    this.workspaceService.addMember(this.workspaceId, request)
      .subscribe({
        next: (member) => {
          this.members.push(member);
          this.isInviting = false;
          this.closeInviteModal();
        },
        error: (err) => {
          this.inviteError = err.error?.message || 'Failed to invite member';
          this.isInviting = false;
        }
      });
  }
  
  removeMember(member: WorkspaceMember): void {
    this.confirmService.confirm({
      title: 'Remove Member?',
      message: `Are you sure you want to remove ${member.userName} from this workspace?`,
      confirmText: 'Remove',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.workspaceService.removeMember(this.workspaceId, member.userId)
          .subscribe({
            next: () => {
              this.members = this.members.filter(m => m.userId !== member.userId);
              this.toastService.info('Member Removed', `${member.userName} is no longer part of this workspace.`);
            },
            error: (err) => this.toastService.error('Error', 'Failed to remove member')
          });
      }
    });
  }
  
  // ========== WORKSPACE OPERATIONS ==========

  openEditModal(): void {
    if (!this.workspace) return;
    this.editWorkspaceData = {
      name: this.workspace.name,
      description: this.workspace.description || '',
      visibility: this.workspace.visibility,
      logoUrl: this.workspace.logoUrl
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  updateWorkspace(): void {
    if (!this.editWorkspaceData.name.trim()) return;

    this.isUpdatingWorkspace = true;
    this.workspaceService.updateWorkspace(this.workspaceId, this.editWorkspaceData)
      .subscribe({
        next: (updatedWorkspace) => {
          this.workspace = updatedWorkspace;
          this.isUpdatingWorkspace = false;
          this.closeEditModal();
        },
        error: (err) => {
          console.error('Update workspace error:', err);
          this.isUpdatingWorkspace = false;
        }
      });
  }

  upgradeToPro(workspaceId: number): void {
    this.paymentService.upgradeToPro(workspaceId).subscribe({
      next: (verifyRes: any) => {
        this.toastService.success('Success', verifyRes.message || 'Upgrade successful! 🎉');
        this.loadWorkspace(); // Refresh to show PRO badge
      },
      error: (err: any) => {
        if (err !== 'Payment cancelled') {
          console.error('Upgrade error:', err);
          this.toastService.error('Upgrade Failed', err.message || 'Payment verification failed');
        }
      }
    });
  }
  
  // ========== UTILS ==========
  
  getRandomGradient(index: number): string {
    const gradients = [
      'from-blue-500 to-cyan-400',
      'from-purple-500 to-pink-400',
      'from-green-500 to-emerald-400',
      'from-orange-500 to-amber-400',
      'from-indigo-500 to-purple-400',
      'from-red-500 to-rose-400',
      'from-teal-500 to-cyan-400',
      'from-violet-500 to-purple-400'
    ];
    return gradients[index % gradients.length];
  }
  
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }
  
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
