import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'policies',
    loadComponent: () => import('./policies/policies.component').then(m => m.PoliciesComponent)
  },
  {
    path: 'policies/:id',
    loadComponent: () => import('./policies/policy-page.component').then(m => m.PolicyPageComponent)
  }
];
