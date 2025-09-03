import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogService } from '../dialogs/dialog.service';
import { DinoconfigBuilderWrapperComponent } from '../config-builder/config-builder.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSlideToggleModule, DinoconfigBuilderWrapperComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private dialogService = inject(DialogService);

  openSignupDialog() {
    this.dialogService.openSignupDialog();
  }
}
