import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'signin',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'brands',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) // Placeholder - will be replaced later
  },
  {
    path: '',
    redirectTo: '/signin',
    pathMatch: 'full'
  }
];
