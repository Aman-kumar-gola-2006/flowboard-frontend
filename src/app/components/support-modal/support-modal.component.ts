import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../services/support.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-support-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="show$ | async" class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-fade-in" (click)="close()">
      <div class="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 relative overflow-hidden" (click)="$event.stopPropagation()">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        
        <div class="mb-10 text-center">
          <div class="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <svg class="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Contact Support</h2>
          <p class="text-[var(--text-secondary)] font-medium">Need help? Send us a message and we'll get back to you.</p>
        </div>
        
        <form (ngSubmit)="submit()" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Full Name</label>
              <input type="text" [(ngModel)]="data.name" name="name" placeholder="Your Name" class="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-indigo-500/50 transition-all" required />
            </div>
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input type="email" [(ngModel)]="data.email" name="email" placeholder="Email" class="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-indigo-500/50 transition-all" required />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Subject</label>
            <input type="text" [(ngModel)]="data.subject" name="subject" placeholder="What can we help with?" class="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-indigo-500/50 transition-all" required />
          </div>
          
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Message</label>
            <textarea [(ngModel)]="data.message" name="message" placeholder="Write your message here..." rows="4" class="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-indigo-500/50 transition-all resize-none" required></textarea>
          </div>
          
          <div class="flex gap-4 pt-4">
            <button type="button" (click)="close()" class="flex-1 px-8 py-4 border border-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-2xl hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]">Cancel</button>
            <button type="submit" [disabled]="isSubmitting" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 uppercase tracking-widest text-[10px]">
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class SupportModalComponent implements OnInit {
  show$ = this.supportService.show$;
  isSubmitting = false;
  data = { name: '', email: '', subject: '', message: '' };

  constructor(
    private supportService: SupportService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.show$.subscribe(show => {
      if (show) {
        this.data.name = this.authService.getUserName();
        this.data.email = this.authService.getUserEmail();
      }
    });
  }

  close(): void {
    this.supportService.close();
    this.data = { name: '', email: '', subject: '', message: '' };
  }

  submit(): void {
    if (!this.data.name || !this.data.email || !this.data.subject || !this.data.message) {
      this.toastService.error('Missing Info', 'Please fill all fields');
      return;
    }

    this.isSubmitting = true;
    this.authService.contactAdmin(this.data).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Sent', 'Your message has been sent to our support team! 🚀');
        this.close();
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.error('Error', 'Could not send message. Please try again.');
      }
    });
  }
}
