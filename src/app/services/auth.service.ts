import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RegisterRequest, MessageResponse, User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://3.110.61.209.nip.io:8080/api/auth';
  private tokenKey = 'token';
  private userIdKey = 'userId';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private isProSubject = new BehaviorSubject<boolean>(this.isPro());
  isPro$ = this.isProSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.saveUserId(response.id.toString());
        localStorage.setItem('userEmail', response.email);
        localStorage.setItem('userName', response.fullName);
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('isPro', response.isPro.toString());
        this.isProSubject.next(response.isPro);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }
  
  register(user: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/register`, user);
  }
  
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isPro');
    this.isProSubject.next(false);
    this.isAuthenticatedSubject.next(false);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  getUserId(): number {
    const userId = Number(localStorage.getItem(this.userIdKey));
    if (userId && userId !== 0) return userId;
    
    // Rescue logic: Extract from token
    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.id) {
          console.log('Rescued User ID from Token:', decoded.id);
          this.saveUserId(decoded.id.toString());
          return Number(decoded.id);
        }
      } catch (e) {
        console.error('Failed to decode token for ID rescue', e);
      }
    }
    
    return 0;
  }
  
  getUserName(): string {
    return localStorage.getItem('userName') || '';
  }
  
  getUserEmail(): string {
    return localStorage.getItem('userEmail') || '';
  }

  isAdmin(): boolean {
    const role = localStorage.getItem('userRole');
    if (role === 'ADMIN') return true;
    
    // Rescue logic: Check token
    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.role === 'ADMIN';
      } catch {
        return false;
      }
    }
    return false;
  }

  isPro(): boolean {
    return localStorage.getItem('isPro') === 'true';
  }

  setProStatus(status: boolean): void {
    localStorage.setItem('isPro', status.toString());
    this.isProSubject.next(status);
  }
  
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  
  private saveUserId(userId: string): void {
    console.log('Saving User ID to localStorage:', userId);
    localStorage.setItem(this.userIdKey, userId);
  }
  
  private hasToken(): boolean {
    return !!this.getToken();
  }
  
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/forgot-password`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/verify-otp`, { email, otp });
  }

  resetPassword(email: string, newPassword: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, { email, newPassword });
  }

  contactAdmin(data: { name: string; email: string; subject: string; message: string }): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/contact`, data);
  }
}
