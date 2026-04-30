import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { ToastService } from '../../services/toast.service';

import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  emailOrUsername = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  inviteToken: string | null = null;
  
  // Contact Form Properties
  showContactForm = false;
  contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  isSubmittingContact = false;
  
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private toastService: ToastService,
    private themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }
  
  ngOnInit(): void {
    // Check for invitation token in URL
    this.inviteToken = this.route.snapshot.queryParamMap.get('inviteToken');

    // Check for OAuth2 errors
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error === 'oauth2') {
      this.toastService.error('Login Failed', 'Google login failed. Please try again.');
    } else if (error === 'suspended') {
      this.errorMessage = 'Your account has been suspended by an admin. Please contact support.';
      this.toastService.error('Account Locked', 'Your account is suspended.');
    }

    // Agar already logged in hai to dashboard pe bhejo
    if (!this.authService.isTokenExpired()) {
      this.router.navigate(['/dashboard']);
    }
  }
  
  onLogin(): void {
    if (!this.emailOrUsername || !this.password) {
      this.errorMessage = 'Please enter email/username and password';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login({
      emailOrUsername: this.emailOrUsername,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (this.inviteToken) {
          const userId = this.authService.getUserId();
          this.workspaceService.acceptInvitationByToken(this.inviteToken, userId).subscribe({
            next: () => {
              this.toastService.success('Workspace Joined', 'You have successfully joined the workspace! 🎉');
              this.router.navigate(['/dashboard']);
            },
            error: (err) => {
              console.error('Invite acceptance error:', err);
              this.toastService.error('Invite Error', 'Could not join the workspace automatically.');
              this.router.navigate(['/dashboard']);
            }
          });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Customize the 'Bad credentials' message to be more user-friendly
        if (err.error?.message === 'Bad credentials' || err.status === 401) {
          this.errorMessage = 'Incorrect details. Please check your email and password.';
        } else {
          this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        }
      }
    });
  }
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  loginWithGitHub(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  }

  openContactForm(event?: Event): void {
    if (event) event.preventDefault();
    this.showContactForm = true;
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
