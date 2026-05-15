import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-public-boards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <nav class="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-800">FlowBoard</span>
          </a>
          <div class="flex items-center gap-3">
            <a routerLink="/login" class="text-gray-600 hover:text-gray-800 font-medium">Sign In</a>
            <a routerLink="/register" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">Get Started</a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16 px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl font-bold mb-4">Explore Public Boards</h1>
          <p class="text-white/80 text-lg">Discover projects and get inspired by the FlowBoard community</p>
        </div>
      </div>

      <!-- Boards Grid -->
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div *ngIf="boards.length === 0" class="text-center py-16">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <p class="text-gray-500 text-lg">No public boards available yet.</p>
          <a routerLink="/register" class="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-md">Create Your First Board</a>
        </div>

        <div *ngIf="boards.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let board of boards; let i = index" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div [class]="'h-32 bg-gradient-to-r ' + getGradient(i)"></div>
            <div class="p-6">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Public</span>
              </div>
              <h3 class="font-bold text-gray-900 text-xl mb-2">{{ board.name }}</h3>
              <p class="text-gray-500 text-sm line-clamp-2">{{ board.description || 'No description provided for this board.' }}</p>
              
              <div class="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <span>{{ board.memberCount || 0 }} Members</span>
                </div>
                <a [routerLink]="['/board', board.id]" class="text-indigo-600 font-semibold text-sm hover:text-indigo-700">View Board →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gradient-primary {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    }
  `]
})
export class PublicBoardsComponent implements OnInit {
  boards: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/boards/public').subscribe({
      next: (data) => this.boards = data,
      error: (err) => {
        console.error('Error fetching public boards:', err);
        this.boards = [];
      }
    });
  }

  getGradient(index: number): string {
    const gradients = [
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-indigo-600',
      'from-blue-500 to-teal-400',
      'from-rose-500 to-orange-400',
      'from-emerald-500 to-teal-600',
    ];
    return gradients[index % gradients.length];
  }
}
