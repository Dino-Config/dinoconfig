import { Component, input, computed } from '@angular/core';

import { AuthVisualSidebarComponent } from '../auth-visual-sidebar/auth-visual-sidebar.component';

@Component({
  selector: 'dc-auth-layout',
  standalone: true,
  imports: [AuthVisualSidebarComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  title = input.required<string>();
  description = input.required<string>();
  sidebarTitle = input.required<string>();
  sidebarDescription = input.required<string>();
  maxWidth = input<string>('440px');
  padding = input<string>('p-8');
  showOverflow = input<boolean>(false);

  containerClasses = computed(() => {
    const classes = ['flex-1', 'flex', 'items-center', 'justify-center', 'bg-white', this.padding()];
    if (this.showOverflow()) {
      classes.push('overflow-y-auto');
    }
    return classes.join(' ');
  });
}

