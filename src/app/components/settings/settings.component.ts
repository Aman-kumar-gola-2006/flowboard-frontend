import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>
      
      <div class="max-w-2xl mx-auto p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="font-semibold text-gray-700">Preferences</h3>
          <p class="text-gray-500 text-sm">Theme, notification preferences, and account settings will be available here.</p>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {}
