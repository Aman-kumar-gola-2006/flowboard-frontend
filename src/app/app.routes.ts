import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Public routes
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  { 
    path: 'oauth2/callback', 
    loadComponent: () => import('./components/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent)
  },
  { 
    path: 'explore', 
    loadComponent: () => import('./components/public-boards/public-boards.component').then(m => m.PublicBoardsComponent)
  },
  
  // Protected routes
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'workspace/:id', 
    loadComponent: () => import('./components/workspace-detail/workspace-detail.component').then(m => m.WorkspaceDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'workspace/:id/analytics', 
    loadComponent: () => import('./components/workspace-analytics/workspace-analytics.component').then(m => m.WorkspaceAnalyticsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'board/:id', 
    loadComponent: () => import('./components/board-view/board-view.component').then(m => m.BoardViewComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  },
  
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard]
  },
  
  { path: '**', redirectTo: '/dashboard' }
];
