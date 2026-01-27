import { Component, input, output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dc-nav-menu-item',
  standalone: true,
  imports: [
    MatIconModule
],
  templateUrl: './nav-menu-item.component.html',
  styleUrl: './nav-menu-item.component.scss'
})
export class NavMenuItemComponent {
  icon = input<string>('');
  label = input.required<string>();
  isActive = input<boolean>(false);
  isCollapsed = input<boolean>(false);
  showArrow = input<boolean>(false);
  isSubItem = input<boolean>(false);
  arrowRotated = input<boolean>(false);

  clicked = output<void>();

  onClick(): void {
    this.clicked.emit();
  }
}

