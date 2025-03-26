import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add Firebase auth token to request if available
    // This would typically come from your auth service
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || 
            (error.error && error.error.error && 
             error.error.error.message === 'Firebase ID token has expired.')) {
          // Token has expired or authentication error
          this.authService.logout().subscribe();
          this.router.navigate(['/auth/login'], { 
            queryParams: { message: 'Your session has expired. Please log in again.' } 
          });
        }
        return throwError(() => error);
      })
    );
  }
}