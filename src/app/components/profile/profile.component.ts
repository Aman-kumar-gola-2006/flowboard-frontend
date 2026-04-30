import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>
      
      <div class="max-w-2xl mx-auto p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
        
        <!-- Profile Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <!-- Avatar Section -->
          <div class="flex items-center gap-4 mb-6">
            <div class="relative group cursor-pointer" (click)="fileInput.click()">
              <div *ngIf="!avatarUrl" class="w-20 h-20 gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {{ getInitials() }}
              </div>
              <img *ngIf="avatarUrl" [src]="avatarUrl" class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
              <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
            </div>
            <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden" />
            <div>
              <h2 class="text-xl font-semibold text-gray-800">{{ userName }}</h2>
              <p class="text-gray-500">{{ userEmail }}</p>
              <span class="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{{ userRole }}</span>
            </div>
          </div>

          <!-- Edit Form -->
          <div class="border-t pt-4 space-y-4">
            <div>
              <label class="text-sm text-gray-500">Full Name</label>
              <input [(ngModel)]="editName" class="w-full p-2 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="text-sm text-gray-500">Username</label>
              <input [(ngModel)]="editUsername" class="w-full p-2 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="text-sm text-gray-500">Email</label>
              <input [(ngModel)]="editEmail" class="w-full p-2 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:border-indigo-500" disabled />
            </div>
            
            <button (click)="saveProfile()" [disabled]="isSaving" class="gradient-primary text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Change Password -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="font-semibold text-gray-800 mb-4">Change Password</h3>
          <div class="space-y-4">
            <input [(ngModel)]="currentPassword" type="password" placeholder="Current Password" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" />
            <input [(ngModel)]="newPassword" type="password" placeholder="New Password" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" />
            <input [(ngModel)]="confirmPassword" type="password" placeholder="Confirm New Password" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" />
            
            <button (click)="changePassword()" [disabled]="isChangingPassword" class="gradient-primary text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50">
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  userName = '';
  userEmail = '';
  userRole = '';
  avatarUrl = '';
  
  editName = '';
  editUsername = '';
  editEmail = '';
  
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  isSaving = false;
  isChangingPassword = false;
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
    this.userRole = localStorage.getItem('userRole') || 'MEMBER';
    
    this.editName = this.userName;
    this.editEmail = this.userEmail;
  }
  
  getInitials(): string {
    return this.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.avatarUrl = e.target.result;
      reader.readAsDataURL(file);
      
      // TODO: Upload to server
      const formData = new FormData();
      formData.append('avatar', file);
      // this.http.post('/api/auth/avatar', formData).subscribe();
    }
  }
  
  saveProfile(): void {
    this.isSaving = true;
    this.http.put('/api/auth/profile', {
      fullName: this.editName,
      username: this.editUsername
    }).subscribe({
      next: () => {
        alert('Profile updated!');
        this.isSaving = false;
      },
      error: () => {
        alert('Failed to update profile');
        this.isSaving = false;
      }
    });
  }
  
  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    this.isChangingPassword = true;
    this.http.put('/api/auth/profile', {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        alert('Password changed!');
        this.isChangingPassword = false;
      },
      error: () => {
        alert('Failed to change password');
        this.isChangingPassword = false;
      }
    });
  }
}
