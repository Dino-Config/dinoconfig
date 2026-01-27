import { Component, input } from '@angular/core';


@Component({
  selector: 'dc-auth-visual-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './auth-visual-sidebar.component.html',
  styleUrl: './auth-visual-sidebar.component.scss'
})
export class AuthVisualSidebarComponent {
  title = input<string>('Welcome to DinoConfig');
  description = input<string>('Manage your configurations with ease and confidence.');
}

