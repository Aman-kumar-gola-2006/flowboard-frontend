import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../services/toast.service';
import { Workspace, WorkspaceRequest } from '../../models/workspace.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { Subject, takeUntil } from 'rxjs';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName = '';
  workspaces: Workspace[] = [];
  filteredWorkspaces: Workspace[] = [];
  pendingInvitations: Workspace[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  showCreateModal = false;
  showDeleteConfirm = false;
  workspaceToDelete: Workspace | null = null;
  
  // Create form
  newWorkspace: WorkspaceRequest = {
    name: '',
    description: '',
    visibility: 'PRIVATE'
  };
  isCreating = false;
  createError = '';
  
  // Contact Form Properties
  showContactForm = false;
  contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  isSubmittingContact = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private workspaceService: WorkspaceService,
    public authService: AuthService,
    private paymentService: PaymentService,
    private toastService: ToastService,
    private searchService: SearchService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.loadWorkspaces();
    this.loadPendingInvitations();

    // Listen for search queries from Navbar
    this.searchService.searchQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => {
        this.searchQuery = query;
        this.onSearch();
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadWorkspaces(): void {
    this.isLoading = true;
    const userId = this.authService.getUserId();
    
    this.workspaceService.getUserWorkspaces(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workspaces) => {
          this.workspaces = workspaces;
          this.filteredWorkspaces = workspaces;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load workspaces';
          this.isLoading = false;
          console.error('Workspace load error:', err);
        }
      });
  }

  loadPendingInvitations(): void {
    const userId = this.authService.getUserId();
    this.workspaceService.getPendingInvitations(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invites) => {
          this.pendingInvitations = invites;
        },
        error: (err) => console.error('Pending invites error:', err)
      });
  }

  acceptInvitation(workspaceId: number): void {
    const userId = this.authService.getUserId();
    this.workspaceService.acceptInvitation(workspaceId, userId)
      .subscribe({
        next: () => {
          this.pendingInvitations = this.pendingInvitations.filter(i => i.id !== workspaceId);
          this.toastService.success('Invitation Accepted', 'Welcome to the workspace!');
          this.loadWorkspaces();
        },
        error: (err) => this.toastService.error('Action Failed', 'Failed to accept invitation')
      });
  }

  rejectInvitation(workspaceId: number): void {
    const userId = this.authService.getUserId();
    this.workspaceService.rejectInvitation(workspaceId, userId)
      .subscribe({
        next: () => {
          this.pendingInvitations = this.pendingInvitations.filter(i => i.id !== workspaceId);
          this.toastService.info('Invitation Rejected', 'You declined the workspace invitation.');
        },
        error: (err) => this.toastService.error('Action Failed', 'Failed to reject invitation')
      });
  }
  
  onSearch(): void {
    if (!this.searchQuery) {
      this.filteredWorkspaces = this.workspaces;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredWorkspaces = this.workspaces.filter(w =>
        w.name.toLowerCase().includes(query) ||
        (w.description && w.description.toLowerCase().includes(query))
      );
    }
  }
  
  openCreateModal(): void {
    this.newWorkspace = { name: '', description: '', visibility: 'PRIVATE' };
    this.createError = '';
    this.showCreateModal = true;
  }
  
  closeCreateModal(): void {
    this.showCreateModal = false;
  }
  
  createWorkspace(): void {
    if (!this.newWorkspace.name?.trim()) {
      this.createError = 'Workspace name is required';
      return;
    }
    
    this.isCreating = true;
    this.createError = '';
    
    this.workspaceService.createWorkspace(this.newWorkspace)
      .subscribe({
        next: (workspace) => {
          this.workspaces.unshift(workspace);
          this.filteredWorkspaces = [...this.workspaces];
          this.isCreating = false;
          this.closeCreateModal();
          this.router.navigate(['/workspace', workspace.id]);
        },
        error: (err) => {
          this.createError = err.error?.message || 'Failed to create workspace';
          this.isCreating = false;
        }
      });
  }
  
  confirmDelete(workspace: Workspace, event: Event): void {
    event.stopPropagation();
    this.workspaceToDelete = workspace;
    this.showDeleteConfirm = true;
  }
  
  cancelDelete(): void {
    this.workspaceToDelete = null;
    this.showDeleteConfirm = false;
  }
  
  deleteWorkspace(): void {
    if (!this.workspaceToDelete) return;
    
    this.workspaceService.deleteWorkspace(this.workspaceToDelete.id)
      .subscribe({
        next: () => {
          this.workspaces = this.workspaces.filter(w => w.id !== this.workspaceToDelete?.id);
          this.filteredWorkspaces = [...this.workspaces];
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.cancelDelete();
        }
      });
  }
  
  navigateToWorkspace(id: number): void {
    this.router.navigate(['/workspace', id]);
  }
  
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

  hasProWorkspace(): boolean {
    return this.workspaces.some(w => w.isPro);
  }

  initiateUpgrade(): void {
    if (this.workspaces.length === 0) {
      this.errorMessage = 'You need at least one workspace to upgrade';
      return;
    }

    const workspaceId = this.workspaces[0].id; // Upgrade first workspace by default
    this.paymentService.upgradeToPro(workspaceId).subscribe({
      next: (res) => {
        this.toastService.success('FlowBoard PRO', 'Congratulations! You are now a PRO Member. 🚀');
        this.loadWorkspaces(); // Refresh list to see updated badges
      },
      error: (err) => {
        if (err !== 'Payment cancelled') {
          console.error('Upgrade error:', err);
          this.toastService.error('Upgrade Failed', 'We could not process your upgrade. Please try again.');
        }
      }
    });
  }

  openContactForm(event?: Event): void {
    if (event) event.preventDefault();
    this.showContactForm = true;
    // Pre-fill user data if available
    this.contactData.name = this.authService.getUserName();
    this.contactData.email = this.authService.getUserEmail();
  }

  closeContactForm(): void {
    this.showContactForm = false;
    this.contactData = { name: '', email: '', subject: '', message: '' };
  }

  submitContactForm(): void {
    if (!this.contactData.name || !this.contactData.email || !this.contactData.subject || !this.contactData.message) {
      this.toastService.error('Missing Info', 'Please fill all fields');
      return;
    }

    this.isSubmittingContact = true;
    this.authService.contactAdmin(this.contactData).subscribe({
      next: (res) => {
        this.isSubmittingContact = false;
        this.toastService.success('Sent', 'Your message has been sent to Aman! 🚀');
        this.closeContactForm();
      },
      error: (err) => {
        this.isSubmittingContact = false;
        this.toastService.error('Error', 'Could not send message. Please try again.');
      }
    });
  }
}
