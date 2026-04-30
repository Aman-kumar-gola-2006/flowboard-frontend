import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  fullName = '';
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  inviteToken: string | null = null;
  invitingWorkspaceName: string | null = null;
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  passwordStrengthText = 'Weak';
  passwordStrengthColor = 'bg-red-500';
  
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    if (!this.authService.isTokenExpired()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Check for invitation token
    this.inviteToken = this.route.snapshot.queryParamMap.get('inviteToken');
    if (this.inviteToken) {
      this.validateInvitation();
    }
  }

  validateInvitation(): void {
    if (!this.inviteToken) return;
    
    this.workspaceService.validateInvitation(this.inviteToken).subscribe({
      next: (invite) => {
        this.email = invite.email; // Pre-fill email
        // We could also show which workspace they are joining
        console.log('Valid invitation for email:', invite.email);
      },
      error: (err) => {
        console.error('Invalid invitation token:', err);
        this.inviteToken = null; // Reset if invalid
      }
    });
  }
  
  checkPasswordStrength(): void {
    const password = this.password;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length >= 8;
    
    const strength = [hasUpper, hasLower, hasNumber, hasSpecial, length].filter(Boolean).length;
    
    if (strength <= 2) {
      this.passwordStrength = 'weak';
      this.passwordStrengthText = 'Weak';
      this.passwordStrengthColor = 'bg-red-500';
    } else if (strength <= 4) {
      this.passwordStrength = 'medium';
      this.passwordStrengthText = 'Medium';
      this.passwordStrengthColor = 'bg-yellow-500';
    } else {
      this.passwordStrength = 'strong';
      this.passwordStrengthText = 'Strong';
      this.passwordStrengthColor = 'bg-green-500';
    }
  }
  
  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validation
    if (!this.fullName || !this.email || !this.username || !this.password || !this.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }
    
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    if (this.passwordStrength === 'weak') {
      this.errorMessage = 'Please choose a stronger password';
      return;
    }
    
    if (!this.acceptTerms) {
      this.errorMessage = 'You must accept the terms and conditions';
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }
    
    this.isLoading = true;
    
    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        // If there's an invite token, accept it before moving on
        if (this.inviteToken) {
          // We need a userId to accept the invite. 
          // The register response usually doesn't have it, but we can get it from login
          // OR, the acceptInvitationByToken can be called after the user logs in for the first time.
          // For now, let's just go to login. The user will log in, and we can handle it there.
          this.successMessage = 'Registration successful! Your workspace invitation is waiting for you. Please login to join.';
        } else {
          this.successMessage = 'Registration successful! Redirecting to login...';
        }

        setTimeout(() => {
          this.router.navigate(['/login'], { 
            queryParams: this.inviteToken ? { inviteToken: this.inviteToken } : {} 
          });
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  getPasswordStrengthWidth(): string {
    switch (this.passwordStrength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  }
}
