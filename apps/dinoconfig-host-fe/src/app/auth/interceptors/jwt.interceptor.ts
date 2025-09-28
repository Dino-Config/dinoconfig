import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

let isRefreshing = false;

export const JwtInterceptor: HttpInterceptorFn = (request, next) => {
  // Skip auth endpoints to avoid infinite loops
  if (request.url.includes('/auth/')) {
    return next(request);
  }

  // Ensure all requests include credentials (cookies)
  if (!request.url.includes('/auth/')) {
    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('/auth/refresh')) {
        return handle401Error(request, next);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;

    // Get HttpClient directly without injecting AuthService
    const http = inject(HttpClient);
    
    return http.post('/api/auth/refresh', {}, { withCredentials: true }).pipe(
      switchMap(() => {
        isRefreshing = false;
        // Retry the original request with credentials
        return next(request.clone({ withCredentials: true }));
      }),
      catchError((error) => {
        isRefreshing = false;
        // If refresh fails, redirect to login
        window.location.href = '/';
        return throwError(() => error);
      })
    );
  } else {
    // If already refreshing, just return the original request
    // The user will be redirected to login if refresh fails
    return next(request);
  }
}
