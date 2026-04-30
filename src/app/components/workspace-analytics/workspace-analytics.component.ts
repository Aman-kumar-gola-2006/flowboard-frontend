import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Workspace } from '../../models/workspace.model';
import { Board } from '../../models/board.model';

@Component({
  selector: 'app-workspace-analytics',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './workspace-analytics.component.html',
  styleUrls: ['./workspace-analytics.component.css']
})
export class WorkspaceAnalyticsComponent implements OnInit, OnDestroy {
  workspaceId!: number;
  workspace: Workspace | null = null;
  boards: Board[] = [];
  
  isLoading = true;
  stats = {
    totalBoards: 0,
    totalCards: 0,
    completedCards: 0,
    overdueCards: 0,
    totalMembers: 0,
    completionRate: 0
  };
  
  boardStats: any[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.workspaceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadWorkspaceData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkspaceData(): void {
    this.isLoading = true;
    
    // Fetch workspace, boards and members in parallel
    forkJoin({
      workspace: this.http.get<Workspace>(`/api/v1/workspaces/${this.workspaceId}`),
      boards: this.http.get<Board[]>(`/api/v1/boards/workspace/${this.workspaceId}`),
      members: this.http.get<any[]>(`/api/v1/workspaces/${this.workspaceId}/members`)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.workspace = data.workspace;
        this.boards = data.boards;
        this.stats.totalBoards = data.boards.length;
        this.stats.totalMembers = data.members.length;
        
        if (this.boards.length > 0) {
          this.loadAggregateCardStats();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading workspace analytics data', err);
        this.isLoading = false;
      }
    });
  }

  loadAggregateCardStats(): void {
    const cardRequests = this.boards.map(board => 
      this.http.get<any[]>(`/api/v1/cards/board/${board.id}`)
    );

    forkJoin(cardRequests).pipe(takeUntil(this.destroy$)).subscribe({
      next: (allBoardCards) => {
        let total = 0;
        let completed = 0;
        let overdue = 0;
        const now = new Date();

        this.boardStats = this.boards.map((board, index) => {
          const cards = allBoardCards[index];
          const bTotal = cards.length;
          const bDone = cards.filter(c => c.status === 'DONE').length;
          const bOverdue = cards.filter(c => c.dueDate && new Date(c.dueDate) < now && c.status !== 'DONE').length;
          
          total += bTotal;
          completed += bDone;
          overdue += bOverdue;

          return {
            name: board.name,
            total: bTotal,
            completed: bDone,
            overdue: bOverdue,
            rate: bTotal > 0 ? Math.round((bDone / bTotal) * 100) : 0
          };
        });

        this.stats.totalCards = total;
        this.stats.completedCards = completed;
        this.stats.overdueCards = overdue;
        this.stats.completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading card stats', err);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/workspace', this.workspaceId]);
  }
}
