import { Route } from '@angular/router';
import { authRoutes } from './auth/auth.routes';

export const appRoutes: Route[] = [
    ...authRoutes
  ];