import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FieldFormComponent } from '../field-form/field-form.component';
import { FieldConfig } from '../../models/config.models';

export interface FieldEditModalData {
  mode: 'add' | 'edit';
  field: FieldConfig;
  title: string;
}

@Component({
  selector: 'dc-field-edit-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FieldFormComponent
],
  templateUrl: './field-edit-modal.component.html',
  styleUrl: './field-edit-modal.component.scss'
})
export class FieldEditModalComponent {
  constructor(
    public dialogRef: MatDialogRef<FieldEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FieldEditModalData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}

