import { Component, inject, OnInit } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';

declare const Calendly: any;

@Component({
  selector: 'calendly-dialog',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
],
  templateUrl: './calendly-dialog.component.html',
  styleUrls: ['./calendly-dialog.component.scss']
})
export class CalendlyDialogComponent implements OnInit {

  ngOnInit(): void {
    Calendly.initInlineWidget({
        url: 'https://calendly.com/dynamoconfig',
        parentElement: document.getElementById('calendly-embed'),
        });
  }

  private dialogRef = inject(MatDialogRef<CalendlyDialogComponent>);

  closeDialog(): void {
    this.dialogRef.close();
  }

  onBackdropClick(event: Event): void {
    this.dialogRef.close();
  }
}