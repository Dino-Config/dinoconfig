import { Component, inject, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
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
    const currentUrl = this.router.url;
    
    if (currentUrl === '/' || currentUrl === '') {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = 70;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            const headerHeight = 70;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      });
    }
  }

  scrollToTop() {
    const currentUrl = this.router.url;
    
    if (currentUrl === '/' || currentUrl === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      });
    }
  }

  navigateToPolicy(policyId: string) {
    this.router.navigate(['/policies', policyId]);
  }

  navigateToDevelopers(section: string) {
    console.log(`Navigate to developers section: ${section}`);
  }
}
