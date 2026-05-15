import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-board-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-5 mb-4">
      <h3 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span>📊</span> Board Analytics
      </h3>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
          <p class="text-2xl font-bold text-indigo-600">{{ totalCards }}</p>
          <p class="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Total Cards</p>
        </div>
        <div class="bg-red-50 rounded-lg p-3 text-center border border-red-100">
          <p class="text-2xl font-bold text-red-600">{{ overdueCards }}</p>
          <p class="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Overdue</p>
        </div>
        <div class="bg-green-50 rounded-lg p-3 text-center border border-green-100">
          <p class="text-2xl font-bold text-green-600">{{ completionRate }}%</p>
          <p class="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Completion</p>
        </div>
        <div class="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
          <p class="text-2xl font-bold text-purple-600">{{ memberCount }}</p>
          <p class="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Members</p>
        </div>
      </div>
    </div>
  `
})
export class BoardAnalyticsComponent implements OnInit {
  @Input() boardId!: number;
  
  totalCards = 0;
  overdueCards = 0;
  completionRate = 0;
  memberCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.boardId) {
      this.loadData();
    }
  }

  loadData(): void {
    // Fetch Cards to calculate stats
    this.http.get<any[]>(`/api/cards/board/${this.boardId}`).subscribe({
      next: (cards) => {
        this.totalCards = cards.length;
        this.overdueCards = cards.filter((c: any) => 
          c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'DONE'
        ).length;
        const doneCards = cards.filter((c: any) => c.status === 'DONE').length;
        this.completionRate = cards.length > 0 ? Math.round((doneCards / cards.length) * 100) : 0;
      },
      error: (err) => console.error('Error fetching cards for analytics', err)
    });

    // Fetch Members count
    this.http.get<any[]>(`/api/boards/${this.boardId}/members`).subscribe({
      next: (members) => this.memberCount = members.length,
      error: (err) => console.error('Error fetching members for analytics', err)
    });
  }
}
