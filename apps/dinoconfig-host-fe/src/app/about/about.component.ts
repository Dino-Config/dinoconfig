import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule, MatTabGroup, MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  private queryParamsSubscription?: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if there's a tab query parameter on initial load
    const params = this.route.snapshot.queryParams;
    if (!params['tab']) {
      // Only scroll to top if no tab parameter
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngAfterViewInit() {
    // Handle tab selection from query params
    setTimeout(() => {
      this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
        if (params['tab'] && this.tabGroup) {
          const tabIndex = this.getTabIndex(params['tab']);
          if (tabIndex !== -1 && this.tabGroup.selectedIndex !== tabIndex) {
            this.tabGroup.selectedIndex = tabIndex;
            // Scroll to tabs after tab is selected
            setTimeout(() => {
              this.scrollToTabs();
            }, 150);
          }
        } else if (params['tab'] && !this.tabGroup) {
          // If tabGroup not ready yet, try scrolling anyway
          setTimeout(() => {
            this.scrollToTabs();
          }, 150);
        }
      });

      // Handle initial query param on load
      const initialParams = this.route.snapshot.queryParams;
      if (initialParams['tab']) {
        setTimeout(() => {
          this.scrollToTabs();
        }, 200);
      }
    }, 0);
  }

  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    const tabNames = ['about', 'contact', 'careers', 'blog'];
    const tabName = tabNames[event.index];
    this.router.navigate(['/about'], { queryParams: { tab: tabName }, queryParamsHandling: 'merge' });
    // Scroll to tabs when clicking on a tab (if already on the page)
    setTimeout(() => {
      this.scrollToTabs();
    }, 100);
  }

  private scrollToTabs() {
    const tabsElement = document.getElementById('tabs-section');
    if (tabsElement) {
      const headerHeight = 70; // Height of sticky header
      const tabsOffset = tabsElement.offsetTop - headerHeight;
      window.scrollTo({ top: tabsOffset, behavior: 'smooth' });
    }
  }

  private getTabIndex(tabName: string): number {
    const tabMap: Record<string, number> = {
      'about': 0,
      'contact': 1,
      'careers': 2,
      'blog': 3
    };
    return tabMap[tabName.toLowerCase()] ?? -1;
  }
}

