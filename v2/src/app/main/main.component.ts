import { HostListener, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';


@Component({
  selector: 'app-main',
  template: `
  <mat-sidenav-container>
    <mat-sidenav #snav [mode]="mobileQuery.matches ? 'over' : 'side'" [fixedInViewport]="mobileQuery.matches" fixedTopGap="56" [opened]="!mobileQuery.matches || opened">
      <mat-toolbar>
        <a routerLink="/" class="brand">
          <span>CORE</span>
          <!--
          <svg><use href="/assets/logo.svg#logo"/></svg>
          -->
        </a>
      </mat-toolbar>
      <mat-nav-list>
        <div>
          <a mat-list-item [routerLink]="['/timeclock']">Timeclock</a>
          <a mat-list-item [routerLink]="['/machines']">Machines</a>
          <a mat-list-item [routerLink]="['/orders']">Orders</a>
          <a mat-list-item [routerLink]="['/inventory']">Inventory</a>
          <a mat-list-item [routerLink]="['/parts']">Parts</a>
          <!-- huh? <a mat-list-item [routerLink]="['/history']">History</a>-->
        </div>
        <div [ngClass]="navStickyClass" class="bottom">
          <a mat-list-item target="_blank" class="flex-between" rel="noopener noreferrer" href="http://git.direktforce.com">Git<mat-icon>launch</mat-icon></a>
          <a mat-list-item target="_blank" class="flex-between" rel="noopener noreferrer" href="http://icinga.direktforce.com">Icinga<mat-icon>launch</mat-icon></a>
        </div>
      </mat-nav-list>
    </mat-sidenav>
    <mat-sidenav-content>
      <router-outlet></router-outlet>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  opened = false;
  navStickyClass = 'bottomRelative';
  mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
  }

  @HostListener('window:resize', ['$event'])
  getScreenHeight(event?){
    if (window.innerHeight <= 412){
      this.navStickyClass = 'bottomRelative';
    } else {
      this.navStickyClass = 'bottomStick';
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

  ngOnInit(): void {
    this.getScreenHeight();
  }

}
