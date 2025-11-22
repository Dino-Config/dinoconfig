import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Skip token refresh for public routes and auth endpoints
  const publicRoutes = ['/signin', '/signup', '/forgot-password', '/verify-email'];
  const isPublicRoute = publicRoutes.some(route => window.location.pathname.includes(route));
  const isAuthEndpoint = req.url.includes('/auth/login') || 
                        req.url.includes('/auth/signup') ||
                        req.url.includes('/auth/forgot-password') ||
                        req.url.includes('/auth/validate');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicRoute && !isAuthEndpoint) {
        // Handle 401 errors - could redirect to login or refresh token
        // For now, redirect to home if not on public route
        router.navigate(['/signin']);
      }
      return throwError(() => error);
    })
  );
};

