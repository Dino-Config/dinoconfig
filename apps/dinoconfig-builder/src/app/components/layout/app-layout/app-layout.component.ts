import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { filter } from 'rxjs';
import { LeftNavigationComponent } from '../../navigation/left-navigation/left-navigation.component';

@Component({
  selector: 'dc-app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, LeftNavigationComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  private router = inject(Router);

  isCollapsed = signal(false);

  activeItem = computed<'builder' | 'profile' | 'settings'>(() => {
    const path = this.currentPath();
    if (path.startsWith('/builder')) return 'builder';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/settings')) return 'settings';
    return 'builder';
  });

  currentPath = signal<string>('');

  constructor() {
    // Track current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPath.set(this.router.url);
    });
    
    // Set initial path
    this.currentPath.set(this.router.url);
  }

  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }

  getSidenavWidth(): string {
    return this.isCollapsed() ? '72px' : '280px';
  }
}

