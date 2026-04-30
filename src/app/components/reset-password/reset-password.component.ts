import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  
  isLoading = false;
  isSuccess = false;
  errorMessage = '';
  
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  passwordStrengthText = 'Weak';
  passwordStrengthColor = 'bg-red-500';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
    }
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
  
  getPasswordStrengthWidth(): string {
    switch (this.passwordStrength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  }
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.password || !this.confirmPassword) {
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
    
    this.isLoading = true;
    
    this.http.post<{ message: string; success: boolean }>('/api/v1/auth/reset-password', {
      token: this.token,
      newPassword: this.password
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password. The link may have expired.';
      }
    });
  }
}
