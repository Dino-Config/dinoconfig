import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'dc-config-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatError
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

