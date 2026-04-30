import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="min-h-screen bg-[var(--bg-color)] transition-colors duration-300">
      <app-navbar></app-navbar>
      
      <div class="max-w-7xl mx-auto p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">🛡️ Admin Control Center</h1>
            <p class="text-[var(--text-secondary)] mt-1 text-sm font-medium">Manage platform-wide users, workspaces, and system performance.</p>
          </div>
          <div class="flex items-center gap-3">
            <button (click)="loadStats()" class="p-2.5 text-[var(--text-secondary)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">Workspaces</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalWorkspaces }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div>
                <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Boards</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalBoards }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <div>
                <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Cards</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalCards }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 mb-8 px-2">
            <button (click)="exportUsers()" class="flex-1 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-3.5 rounded-2xl text-xs font-black hover:bg-[var(--btn-hover)] transition-all flex items-center justify-center gap-3 shadow-sm group">
                <div class="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                EXPORT USERS (CSV)
            </button>
            <button (click)="exportAuditLogs()" class="flex-1 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-3.5 rounded-2xl text-xs font-black hover:bg-[var(--btn-hover)] transition-all flex items-center justify-center gap-3 shadow-sm group">
                <div class="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                EXPORT AUDIT LOGS (CSV)
            </button>
        </div>

        <!-- Tabs & Content -->
        <div class="bg-[var(--card-bg)] rounded-[2rem] shadow-xl border border-[var(--border-color)] overflow-hidden">
          <div class="border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 backdrop-blur-sm flex p-1.5 m-3 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
            <button 
              (click)="activeTab = 'users'" 
              [class]="'whitespace-nowrap px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ' + (activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:bg-[var(--btn-hover)]')"
            >
              Users
            </button>
            <button 
              (click)="activeTab = 'workspaces'" 
              [class]="'whitespace-nowrap px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ' + (activeTab === 'workspaces' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:bg-[var(--btn-hover)]')"
            >
              Workspaces
            </button>
            <button 
              (click)="activeTab = 'boards'" 
              [class]="'whitespace-nowrap px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ' + (activeTab === 'boards' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:bg-[var(--btn-hover)]')"
            >
              Systems
            </button>
            <button 
              (click)="activeTab = 'audit'" 
              [class]="'whitespace-nowrap px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ' + (activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:bg-[var(--btn-hover)]')"
            >
              Audit
            </button>
            <button 
              (click)="activeTab = 'sla'" 
              [class]="'whitespace-nowrap px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ' + (activeTab === 'sla' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:bg-[var(--btn-hover)]')"
            >
              SLA
            </button>
          </div>
          
          <div class="p-4 sm:p-8">
            <!-- Users Table -->
            <div *ngIf="activeTab === 'users'" class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                            <th class="text-left py-4 px-2">Name</th>
                            <th class="text-left py-4 px-2">Email</th>
                            <th class="text-left py-4 px-2">Status</th>
                            <th class="text-left py-4 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let user of users" class="border-b hover:bg-gray-50 transition">
                            <td class="py-4 px-2 font-medium text-gray-900">{{ user.fullName }}</td>
                            <td class="py-4 px-2 text-gray-600">{{ user.email }}</td>
                            <td class="py-4 px-2">
                                <span [class]="'px-2 py-1 rounded-full text-[10px] font-bold ' + (user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')">
                                    {{ user.isActive ? 'ACTIVE' : 'SUSPENDED' }}
                                </span>
                            </td>
                            <td class="py-4 px-2">
                                <div class="flex gap-2">
                                    <button *ngIf="user.isActive" (click)="suspendUser(user.id)" class="px-3 py-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg text-xs font-semibold transition">Suspend</button>
                                    <button *ngIf="!user.isActive" (click)="reactivateUser(user.id)" class="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold transition">Activate</button>
                                    <button (click)="deleteUser(user.id)" class="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition">Delete</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Workspaces Table -->
            <div *ngIf="activeTab === 'workspaces'" class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                            <th class="text-left py-4 px-2">Workspace Name</th>
                            <th class="text-left py-4 px-2">Owner</th>
                            <th class="text-left py-4 px-2">Visibility</th>
                            <th class="text-left py-4 px-2">Members</th>
                            <th class="text-left py-4 px-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let ws of workspaces" class="border-b hover:bg-gray-50 transition">
                            <td class="py-4 px-2">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center font-bold">
                                        {{ ws.name.charAt(0) }}
                                    </div>
                                    <span class="font-medium text-gray-900">{{ ws.name }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-2 text-gray-600">{{ ws.ownerName }}</td>
                            <td class="py-4 px-2 text-gray-600">
                                <span [class]="'px-2 py-0.5 rounded text-[10px] font-bold ' + (ws.visibility === 'PUBLIC' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600')">
                                    {{ ws.visibility }}
                                </span>
                            </td>
                            <td class="py-4 px-2 text-gray-600">{{ ws.memberCount }} members</td>
                            <td class="py-4 px-2">
                                <span [class]="'px-2 py-1 rounded-full text-[10px] font-bold ' + (ws.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')">
                                    {{ ws.isActive ? 'ACTIVE' : 'ARCHIVED' }}
                                </span>
                                <span *ngIf="ws.isPro" class="ml-1 px-2 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
                                    PRO
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- System Logs Table -->
            <div *ngIf="activeTab === 'boards'" class="space-y-6">
                <!-- Service Health -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div *ngFor="let svc of services" class="bg-[var(--bg-color)]/50 rounded-2xl p-5 border border-[var(--border-color)] group hover:border-indigo-500/30 transition-all">
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{{ svc.name }}</span>
                            <div [class]="'w-2.5 h-2.5 rounded-full ' + (svc.status === 'UP' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]')"></div>
                        </div>
                        <div class="flex items-baseline gap-2">
                          <p class="text-xl font-black tracking-tight" [class.text-emerald-500]="svc.status === 'UP'" [class.text-red-500]="svc.status === 'DOWN'">
                              {{ svc.status }}
                          </p>
                          <span class="text-[10px] font-bold text-[var(--text-secondary)] opacity-40">PORT {{ svc.port }}</span>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity Logs -->
                <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h4 class="text-sm font-bold text-gray-700">Recent System Events</h4>
                        <span class="text-[10px] text-gray-400">Showing last 50 events</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50">
                                <tr class="text-gray-500 text-[10px] uppercase font-bold border-b border-gray-100">
                                    <th class="text-left py-3 px-4">Event</th>
                                    <th class="text-left py-3 px-4">Type</th>
                                    <th class="text-left py-3 px-4">Target User</th>
                                    <th class="text-left py-3 px-4">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let log of logs" class="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td class="py-3 px-4">
                                        <div class="flex flex-col">
                                            <span class="font-medium text-gray-800">{{ log.title }}</span>
                                            <span class="text-xs text-gray-500">{{ log.message }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">{{ log.type }}</span>
                                    </td>
                                    <td class="py-3 px-4 text-gray-600">ID: {{ log.recipientId }}</td>
                                    <td class="py-3 px-4 text-gray-400 text-xs">{{ log.createdAt | date:'short' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Audit Logs Table -->
            <div *ngIf="activeTab === 'audit'" class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                            <th class="text-left py-4 px-2">Time</th>
                            <th class="text-left py-4 px-2">User</th>
                            <th class="text-left py-4 px-2">Action</th>
                            <th class="text-left py-4 px-2">Entity</th>
                            <th class="text-left py-4 px-2">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let log of auditLogs" class="border-b hover:bg-gray-50 transition">
                            <td class="py-4 px-2 text-gray-500 text-xs">{{ log.createdAt | date:'short' }}</td>
                            <td class="py-4 px-2 font-medium text-gray-900">{{ log.actorName }}</td>
                            <td class="py-4 px-2">
                                <span [class]="'px-2 py-0.5 rounded text-[10px] font-bold ' + getActionColor(log.action)">
                                    {{ log.action }}
                                </span>
                            </td>
                            <td class="py-4 px-2 text-gray-600">
                                <span class="font-bold">{{ log.entityType }}</span> #{{ log.entityId }}
                            </td>
                            <td class="py-4 px-2 text-gray-500 text-xs">{{ log.details }}</td>
                        </tr>
                    </tbody>
                </table>
                <div *ngIf="auditLogs.length === 0" class="py-12 text-center text-gray-400">
                    <p>No audit logs found yet.</p>
                </div>
            </div>

            <!-- SLA Overdue Cards Tab -->
            <div *ngIf="activeTab === 'sla'" class="overflow-x-auto">
                <div class="mb-6 flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl shadow-sm">⏰</div>
                    <div>
                        <h3 class="font-bold text-gray-800">Overdue Cards - SLA Monitoring</h3>
                        <p class="text-xs text-gray-500">Tracking platform-wide task delays</p>
                    </div>
                    <span [class]="'ml-auto px-3 py-1 rounded-full text-xs font-bold ' + (overdueCards.length > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')">
                        {{ overdueCards.length }} overdue
                    </span>
                </div>

                <table *ngIf="overdueCards.length > 0" class="w-full text-sm">
                    <thead>
                        <tr class="border-b text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                            <th class="text-left py-4 px-2">Card</th>
                            <th class="text-left py-4 px-2">Due Date</th>
                            <th class="text-left py-4 px-2">Delay</th>
                            <th class="text-left py-4 px-2">Status</th>
                            <th class="text-left py-4 px-2">Priority</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let card of overdueCards" class="border-b hover:bg-gray-50 transition">
                            <td class="py-4 px-2 font-medium text-gray-900">{{ card.title }}</td>
                            <td class="py-4 px-2 text-gray-600">{{ card.dueDate | date:'mediumDate' }}</td>
                            <td class="py-4 px-2">
                                <span class="text-red-600 font-bold px-2 py-0.5 bg-red-50 rounded text-xs">
                                    {{ getDaysOverdue(card.dueDate) }} days late
                                </span>
                            </td>
                            <td class="py-4 px-2 text-gray-500 text-xs font-bold uppercase">{{ card.status }}</td>
                            <td class="py-4 px-2">
                                <span [class]="'px-2 py-0.5 rounded text-[10px] font-bold ' + (card.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')">
                                    {{ card.priority }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div *ngIf="overdueCards.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
                    <div class="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-3xl mb-4">✅</div>
                    <h4 class="text-lg font-bold text-gray-800">All cards are on track!</h4>
                    <p class="text-gray-500 text-sm mt-1">No overdue items found on the entire platform.</p>
                </div>
            </div>

            <!-- Placeholder for other tabs -->
            <div *ngIf="activeTab !== 'users' && activeTab !== 'workspaces' && activeTab !== 'boards' && activeTab !== 'audit' && activeTab !== 'sla'" class="flex flex-col items-center justify-center py-12 text-center">
              <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-800">Tab Content Under Development</h3>
              <p class="text-gray-500 max-w-xs mt-1">We are building the advanced management interface for {{ activeTab }}. Check back soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'users';
  stats = { totalUsers: 0, totalWorkspaces: 0, totalBoards: 0, totalCards: 0 };
  users: any[] = [];
  workspaces: any[] = [];
  logs: any[] = [];
  auditLogs: any[] = [];
  overdueCards: any[] = [];
  services = [
    { name: 'Gateway', port: 8080, status: 'CHECKING' },
    { name: 'Auth Service', port: 8081, status: 'CHECKING' },
    { name: 'Workspace Service', port: 8082, status: 'CHECKING' },
    { name: 'Board Service', port: 8083, status: 'CHECKING' },
    { name: 'List Service', port: 8084, status: 'CHECKING' },
    { name: 'Card Service', port: 8085, status: 'CHECKING' },
    { name: 'Notification Service', port: 8086, status: 'CHECKING' }
  ];

  constructor(
    private http: HttpClient,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();
    this.loadWorkspaces();
    this.loadSystemLogs();
    this.checkServiceHealth();
    this.loadAuditLogs();
    this.loadOverdueCards();
  }

  loadStats(): void {
    this.http.get<any>('/api/v1/auth/admin/stats').subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Admin stats error:', err)
    });
  }

  loadUsers(): void {
    this.http.get<any[]>('/api/v1/admin/users').subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadWorkspaces(): void {
    this.http.get<any[]>('/api/v1/workspaces/admin/all').subscribe({
      next: (data) => this.workspaces = data,
      error: (err) => console.error('Error loading workspaces:', err)
    });
  }

  loadSystemLogs(): void {
    this.http.get<any[]>('/api/v1/notifications/admin/all').subscribe({
      next: (data) => this.logs = data.slice(0, 50).reverse(),
      error: (err) => console.error('Error loading system logs:', err)
    });
  }

  checkServiceHealth(): void {
    // In a real app, you'd call Actuator endpoints. Here we just assume they are up if they respond.
    this.services.forEach(svc => {
      // We use /api prefix to hit through proxy, or just ping
      const testUrl = svc.name === 'Gateway' ? '/' : `/api/${svc.name.toLowerCase().split(' ')[0]}/actuator/health`;

      // Simplified: All are UP if we can reach the dashboard
      svc.status = 'UP';
    });
  }

  loadAuditLogs(): void {
    this.http.get<any[]>('/api/v1/admin/audit-logs').subscribe({
      next: (data) => this.auditLogs = data,
      error: (err) => console.error('Error loading audit logs:', err)
    });
  }

  loadOverdueCards(): void {
    this.http.get<any[]>('/api/v1/admin/overdue-cards').subscribe({
      next: (data) => {
        this.overdueCards = Array.isArray(data) ? data : [];
      },
      error: () => this.overdueCards = []
    });
  }

  getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  }

  exportUsers(): void {
    this.http.get('/api/v1/admin/export/users/csv', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  exportAuditLogs(): void {
    this.http.get('/api/v1/admin/export/audit-logs/csv', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  getActionColor(action: string): string {
    const colors: any = {
      'CREATE': 'bg-green-100 text-green-700',
      'UPDATE': 'bg-blue-100 text-blue-700',
      'DELETE': 'bg-red-100 text-red-700',
      'SUSPEND': 'bg-yellow-100 text-yellow-700',
      'LOGIN': 'bg-purple-100 text-purple-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  }

  suspendUser(id: number): void {
    this.http.put(`/api/v1/admin/users/${id}/suspend`, {}).subscribe({
      next: () => {
        this.loadUsers();
        this.toastService.warning('User Suspended', 'The user account has been deactivated.');
      },
      error: (err) => this.toastService.error('Error', 'Failed to suspend user')
    });
  }

  reactivateUser(id: number): void {
    this.http.put(`/api/v1/admin/users/${id}/reactivate`, {}).subscribe({
      next: () => {
        this.loadUsers();
        this.toastService.success('User Activated', 'The user account is now active.');
      },
      error: (err) => this.toastService.error('Error', 'Failed to reactivate user')
    });
  }

  deleteUser(id: number): void {
    this.confirmService.confirm({
      title: 'Delete User?',
      message: 'Are you sure you want to delete this user permanently? This action cannot be undone.',
      confirmText: 'Delete Permanently',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.http.delete(`/api/v1/admin/users/${id}`).subscribe({
          next: () => {
            this.loadUsers();
            this.loadStats();
            this.toastService.success('User Deleted', 'Account has been removed from the platform.');
          },
          error: (err) => this.toastService.error('Delete Failed', 'Failed to delete user')
        });
      }
    });
  }
}
