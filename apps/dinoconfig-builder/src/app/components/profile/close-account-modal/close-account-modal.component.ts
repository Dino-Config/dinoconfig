import { Component, inject, signal, computed } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { CloseAccountResponse } from '../../../services/account.service';
import { getHttpErrorMessage } from '../../../utils/http-error.utils';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-close-account-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './close-account-modal.component.html',
  styleUrl: './close-account-modal.component.scss',
})
export class CloseAccountModalComponent {
  private dialogRef = inject(MatDialogRef<CloseAccountModalComponent>);
  private accountService = inject(AccountService);

  password = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  isSubmitDisabled = computed(() => this.loading() || !this.password().trim());

  onSubmit(): void {
    const pwd = this.password().trim();
    if (!pwd || this.loading()) return;
    this.errorMessage.set(null);
    this.loading.set(true);
    this.accountService.closeAccount(pwd).pipe(
      catchError((err) => {
        this.errorMessage.set(getHttpErrorMessage(err, 'Invalid password. Please try again.'));
        this.loading.set(false);
        return of(null);
      }),
    ).subscribe((res: CloseAccountResponse | null) => {
      if (res) {
        this.loading.set(false);
        this.dialogRef.close(res);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
