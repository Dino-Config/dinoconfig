import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class DialogService {
	private dialog = inject(MatDialog);

  openLoginDialog(): void {
    import('../auth/components/login/login-dialog.component').then(m => {
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

        if (result === 'forgot-password') {
          this.openForgotPasswordDialog();
        }
      });
    });
  }

  openSignupDialog(): void {
    import('../auth/components/signup/signup-dialog.component').then(m => {
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

  openForgotPasswordDialog(): void {
    import('../auth/components/forgot-password/forgot-password-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.ForgotPasswordDialogComponent, {
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

  openCalendlyDialog(): void {
    import('../auth/components/calendly/calendly-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.CalendlyDialogComponent, {
        width: '550px',
        maxHeight: '90vh',
        disableClose: false,
        panelClass: 'auth-dialog'
      });
    });
  }
}