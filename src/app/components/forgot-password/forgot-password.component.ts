import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  
  step: 'EMAIL' | 'OTP' | 'RESET' = 'EMAIL';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(private authService: AuthService) {}
  
  sendOtp(): void {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.step = 'OTP';
        this.successMessage = 'OTP sent to your email.';
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send OTP.';
      }
    });
  }
  
  verifyOtp(): void {
    if (!this.otp) {
      this.errorMessage = 'Please enter the OTP';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 'RESET';
        this.successMessage = 'OTP verified! Now enter your new password.';
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid or expired OTP.';
      }
    });
  }
  
  resetPassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.resetPassword(this.email, this.newPassword).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = 'Password reset successfully! You can now login.';
        setTimeout(() => this.authService.logout(), 2000); // Or redirect to login
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password.';
      }
    });
  }
}
