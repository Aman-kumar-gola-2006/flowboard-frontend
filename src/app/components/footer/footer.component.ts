import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportService } from '../../services/support.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="mt-auto border-t border-[var(--border-color)] bg-[var(--card-bg)]/50 backdrop-blur-xl py-10 px-8">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <!-- Left: Copyright -->
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em]">FlowBoard</span>
            <span class="text-indigo-500 text-[10px] font-black">TM</span>
          </div>
          <div class="h-4 w-px bg-[var(--border-color)] hidden md:block"></div>
          <p class="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">
            FlowBoard &copy; 2026 | Architected with ❤️ by <span class="text-[var(--text-primary)]">Aman Kumar Gola</span>
          </p>
        </div>

        <!-- Right: Support & Status -->
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-6">
            <button (click)="openSupport()" class="text-[10px] font-black text-[var(--text-secondary)] hover:text-indigo-500 uppercase tracking-widest transition-colors bg-transparent border-none cursor-pointer">Contact Support</button>
            <a href="#" class="text-[10px] font-black text-[var(--text-secondary)] hover:text-indigo-500 uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" class="text-[10px] font-black text-[var(--text-secondary)] hover:text-indigo-500 uppercase tracking-widest transition-colors">Terms of Service</a>
          </div>
          <div class="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  constructor(private supportService: SupportService) {}

  openSupport(): void {
    this.supportService.open();
  }
}
