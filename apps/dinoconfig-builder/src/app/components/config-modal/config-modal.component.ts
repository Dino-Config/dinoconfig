import { Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dc-config-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule
],
  templateUrl: './config-modal.component.html',
  styleUrl: './config-modal.component.scss'
})
export class ConfigModalComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<ConfigModalComponent>);

  configForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['']
  });

  onSubmit(): void {
    if (this.configForm.valid) {
      this.dialogRef.close(this.configForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

