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
        path: 'brands/:brandId/builder',
        loadComponent: () => import('./components/builder/builder.component').then(m => m.BuilderComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'settings/sdk',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'settings/features',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'subscription',
        loadComponent: () => import('./components/subscription/subscription.component').then(m => m.SubscriptionComponent)
      },
      {
        path: 'subscription/success',
        loadComponent: () => import('./components/subscription-success/subscription-success.component').then(m => m.SubscriptionSuccessComponent)
      },
      {
        path: 'subscription/cancel',
        loadComponent: () => import('./components/subscription-cancel/subscription-cancel.component').then(m => m.SubscriptionCancelComponent)
      },
      {
        path: '',
        redirectTo: 'brands',
        pathMatch: 'full'
      }
    ]
  }
];
