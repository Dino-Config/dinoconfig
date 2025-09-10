import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogService } from '../dialogs/dialog.service';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  openSignupDialog() {
    if (this.authService.isAuthenticated()) {
      window.open(environment.builderUrl, '_blank');
    } else {
      this.dialogService.openSignupDialog();
    }
  }
}
