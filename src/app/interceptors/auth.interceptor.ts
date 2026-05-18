import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    
    let headers = req.headers;
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (userId !== null && userId !== undefined && userId !== 0) {
      headers = headers.set('X-User-Id', userId.toString());
    } else {
      // Don't warn for public auth endpoints
      const isPublicAuth = req.url.includes('/auth/login') || 
                          req.url.includes('/auth/register') || 
                          req.url.includes('/auth/forgot-password') || 
                          req.url.includes('/auth/reset-password') ||
                          req.url.includes('/auth/contact');
      if (!isPublicAuth) {
        console.warn('X-User-Id is MISSING or 0 in Interceptor! Value:', userId);
      }
    }
    
    // Also pass user name so services like chat can display sender name properly
    const userName = this.authService.getUserName();
    if (userName) {
      headers = headers.set('X-User-Name', userName);
    }
    
    const authReq = req.clone({ headers });
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
