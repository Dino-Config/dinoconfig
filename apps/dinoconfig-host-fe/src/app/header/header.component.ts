import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../auth/services/auth.service';
import { DialogService } from '../dialogs/dialog.service';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  currentUser() {
    return this.authService.currentUser();
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  openLoginDialog() {
    window.location.href = `${environment.builderUrl}/signin`;
  }

  openSignupDialog() {
    window.location.href = `${environment.builderUrl}/signup`;
  }

  openBuilder() {
    if (this.authService.isAuthenticated()) {
      window.open(environment.builderUrl, '_blank');
    } else {
      window.location.href = `${environment.builderUrl}/signup`;
    }
  }

  logout() {
    this.authService.logout();
  }

  openCalendlyDialog() {
    this.dialogService.openCalendlyDialog();
  }

  navigateToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
