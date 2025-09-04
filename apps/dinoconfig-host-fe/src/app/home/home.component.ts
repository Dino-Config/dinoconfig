import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogService } from '../dialogs/dialog.service';
import { DinoconfigBuilderWrapperComponent } from '../config-builder/config-builder.component';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSlideToggleModule, DinoconfigBuilderWrapperComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  openSignupDialog() {
    if (this.authService.isAuthenticated()) {
      window.open('https://builder.dinoconfig.com', '_blank');
    } else {
      this.dialogService.openSignupDialog();
    }
  }
}
