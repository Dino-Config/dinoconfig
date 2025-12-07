import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule, MatTabGroup, MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription, filter } from 'rxjs';

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
  private routerSubscription?: Subscription;
  private isUserInitiatedTabChange = false;
  private preservedScrollPosition = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (!params['tab']) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngAfterViewInit() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url.startsWith('/about')) {
          if (this.isUserInitiatedTabChange && this.preservedScrollPosition > 0) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.scrollTo({ top: this.preservedScrollPosition, behavior: 'auto' });
                this.preservedScrollPosition = 0;
              });
            });
          } else {
            const params = this.route.snapshot.queryParams;
            if (params['tab']) {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  this.scrollToTabs();
                });
              });
            }
          }
        }
      });

    setTimeout(() => {
      this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
        if (params['tab'] && this.tabGroup) {
          const tabIndex = this.getTabIndex(params['tab']);
          if (tabIndex !== -1 && this.tabGroup.selectedIndex !== tabIndex) {
            this.tabGroup.selectedIndex = tabIndex;
            if (!this.isUserInitiatedTabChange) {
              setTimeout(() => {
                this.scrollToTabs();
              }, 150);
            }
            this.isUserInitiatedTabChange = false;
          }
        } else if (params['tab'] && !this.tabGroup && !this.isUserInitiatedTabChange) {
          setTimeout(() => {
            this.scrollToTabs();
          }, 150);
        }
      });

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
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    const tabNames = ['about', 'contact', 'careers', 'blog'];
    const tabName = tabNames[event.index];
    this.isUserInitiatedTabChange = true;
    this.preservedScrollPosition = window.scrollY;
    this.router.navigate(['/about'], { queryParams: { tab: tabName }, queryParamsHandling: 'merge' });
  }

  private scrollToTabs() {
    const tabsElement = document.getElementById('tabs-section');
    if (tabsElement) {
      const headerHeight = 70;
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

