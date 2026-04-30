import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmOptions } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="options$ | async as options" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-[var(--card-bg)] w-full max-w-md rounded-[2rem] border border-[var(--border-color)] shadow-2xl overflow-hidden animate-zoom-in">
        <!-- Header with Icon -->
        <div class="p-8 text-center">
          <div [ngClass]="{
            'bg-red-500/10 text-red-500': options.type === 'danger',
            'bg-amber-500/10 text-amber-500': options.type === 'warning',
            'bg-blue-500/10 text-blue-500': options.type === 'info'
          }" class="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <svg *ngIf="options.type === 'danger'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <svg *ngIf="options.type === 'warning'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <svg *ngIf="options.type === 'info'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          
          <h2 class="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight">{{ options.title }}</h2>
          <p class="text-[var(--text-secondary)] font-medium leading-relaxed">{{ options.message }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 p-6 bg-[var(--bg-color)]/50 border-t border-[var(--border-color)]">
          <button (click)="resolve(false)" class="flex-1 py-4 px-6 rounded-2xl font-bold text-[var(--text-secondary)] hover:bg-[var(--btn-hover)] transition-all uppercase text-[10px] tracking-widest">
            {{ options.cancelText }}
          </button>
          <button (click)="resolve(true)" 
            [ngClass]="{
              'bg-red-500 hover:bg-red-600 shadow-red-500/20': options.type === 'danger',
              'bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/90 shadow-indigo-500/20': options.type === 'warning' || options.type === 'info'
            }"
            class="flex-1 py-4 px-6 rounded-2xl font-black text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase text-[10px] tracking-widest">
            {{ options.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-zoom-in {
      animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ConfirmModalComponent {
  options$ = this.confirmService.options$;

  constructor(private confirmService: ConfirmService) {}

  resolve(result: boolean): void {
    this.confirmService.resolve(result);
  }
}
