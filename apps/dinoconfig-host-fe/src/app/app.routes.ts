import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'builder',
    loadComponent: () => import('./config-builder/config-builder.component').then(m => m.DinoconfigBuilderWrapperComponent)
  }
];
