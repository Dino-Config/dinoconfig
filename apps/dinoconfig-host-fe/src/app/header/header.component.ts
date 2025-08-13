import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/services/auth.service';
import { DialogService } from '../dialogs/dialog.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  currentUser() {
    return this.authService.currentUser();
  }

  openLoginDialog() {
    this.dialogService.openLoginDialog();
  }

  openSignupDialog() {
    this.dialogService.openSignupDialog();
  }

  logout() {
    this.authService.logout();
  }
}
