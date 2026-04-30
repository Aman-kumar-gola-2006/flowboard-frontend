import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen gradient-primary flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-white text-lg">Logging you in...</p>
      </div>
    </div>
  `,
  styles: [`
    .gradient-primary {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private toastService: ToastService
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const name = params['name'];
      const id = params['id'];
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userName', name || 'User');
        if (id) {
          localStorage.setItem('userId', id);
        }
        
        this.toastService.success('Login Successful', `Welcome back, ${name || 'User'}! 🚀`);
        this.router.navigate(['/dashboard']);
      } else {
        this.toastService.error('Login Failed', 'Unable to authenticate with social account.');
        this.router.navigate(['/login']);
      }
    });
  }
}
