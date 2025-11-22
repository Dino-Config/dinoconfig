import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import './auth-visual-sidebar.component.scss';

@Component({
  selector: 'dc-auth-visual-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-visual-sidebar.component.html',
  styleUrl: './auth-visual-sidebar.component.scss'
})
export class AuthVisualSidebarComponent {
  @Input() title: string = 'Welcome to DinoConfig';
  @Input() description: string = 'Manage your configurations with ease and confidence.';
}

