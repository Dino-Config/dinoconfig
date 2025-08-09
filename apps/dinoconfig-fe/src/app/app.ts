import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../environments/environment';
import { MatDialog } from '@angular/material/dialog';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatDialogModule
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App {
  private httpClient = inject(HttpClient);
  private dialog = inject(MatDialog);
  private api = this.httpClient.get(environment.apiUrl);

  protected apiResponse = toSignal(this.api);

  openLoginDialog(): void {
    import('./auth/components/login/login-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.LoginDialogComponent, {
        width: '450px',
        maxHeight: '90vh',
        disableClose: false,
        panelClass: 'auth-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'signup') {
          this.openSignupDialog();
        }
      });
    });
  }

  openSignupDialog(): void {
    import('./auth/components/signup/signup-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.SignupDialogComponent, {
        width: '550px',
        maxHeight: '90vh',
        disableClose: false,
        panelClass: 'auth-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'login') {
          this.openLoginDialog();
        }
      });
    });
  }
}
