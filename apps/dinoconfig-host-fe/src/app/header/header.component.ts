import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { DialogService } from '../dialogs/dialog.service';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private dialogService = inject(DialogService);
  private router = inject(Router);

  openLoginDialog() {
    window.location.href = `${environment.builderUrl}/signin`;
  }

  openSignupDialog() {
    window.location.href = `${environment.builderUrl}/signup`;
  }

  openBuilder() {
    window.location.href = `${environment.builderUrl}/signup`;
  }

  openCalendlyDialog() {
    this.dialogService.openCalendlyDialog();
  }

  navigateToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToTop() {
    const currentUrl = this.router.url;
    
    if (currentUrl === '/' || currentUrl === '') {
      // If already on home page, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If on another page, navigate to home which will auto-scroll
      this.router.navigate(['/']).then(() => {
        // Small delay to ensure page has loaded, then scroll
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      });
    }
  }
}
