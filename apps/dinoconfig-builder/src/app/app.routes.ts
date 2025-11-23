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
    path: '',
    loadComponent: () => import('./components/layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: 'brands',
        loadComponent: () => import('./components/brand-selection/brand-selection.component').then(m => m.BrandSelectionComponent)
      },
      {
        path: '',
        redirectTo: 'brands',
        pathMatch: 'full'
      }
    ]
  }
];
