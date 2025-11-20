import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class DialogService {
	private dialog = inject(MatDialog);

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