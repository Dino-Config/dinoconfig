import { Component, input, inject } from '@angular/core';

import { Router } from '@angular/router';
import { User } from '../../../models/user.models';

@Component({
  selector: 'dc-user-info',
  standalone: true,
  imports: [],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent {
  private router = inject(Router);

  user = input.required<User>();
  isCollapsed = input<boolean>(false);

  getUserDisplayName(): string {
    const user = this.user();
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  }

  goProfile(): void {
    this.router.navigate(['/profile']);
  }
}

