import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const JwtInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  // Skip auth endpoints to avoid infinite loops
  if (request.url.includes('/auth/')) {
    return next(request);
  }

  const token = authService.getToken();
  
  if (token) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('/auth/refresh')) {
        return handle401Error(request, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        return next(addToken(request, response.accessToken));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  } else {
    // If already refreshing, just return the original request
    // The user will be redirected to login if refresh fails
    return next(request);
  }
}
