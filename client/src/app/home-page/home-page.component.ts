import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

import { transition, animate, trigger, state, style } from '@angular/animations';


@Component({
  animations: [],
  selector: 'app-home-page',
  template: `
  <mat-sidenav-container autosize>
    <mat-sidenav #nav [mode]="'side'"
      [opened]="opened">
      <mat-toolbar>
        <a routerLink="/">CORE</a>
      </mat-toolbar>
      <mat-nav-list>
        <a routerLink="/timesheet" mat-list-item>
          <mat-icon mat-list-icon>access_time</mat-icon>
          <h4 mat-line>Timesheets</h4>
        </a>
        <a routerLink="/documentation" mat-list-item>
          <mat-icon mat-list-icon>notes</mat-icon>
          <h4 mat-line>Documentation</h4>
        </a>
        <a routerLink="/machines" mat-list-item>
          <mat-icon mat-list-icon>build</mat-icon>
          <h4 mat-line>Machines</h4>
        </a>
      </mat-nav-list>
    </mat-sidenav>
    <mat-sidenav-content>
      <router-outlet>
        <mat-toolbar>
          <app-search></app-search>
          <a mat-stroked-button routerLink="/login">Login</a>
        </mat-toolbar>
      </router-outlet>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  // styleUrls: ['./home-page.component.scss']
  styles: [
    `
    :host {
      height: 100%;
      display: block;
    }
    mat-toolbar {
      background: white;
      display: flex;
      justify-content: space-between;
    }
    mat-toolbar a {
      text-decoration: none;
      color: inherit;
    }
    :host > mat-sidenav-container {
      height: 100%;
    }
    mat-sidenav-content {
      background: white;
    }
    :host > mat-sidenav-container > mat-sidenav {
      width: 304px;
      border-right: none;
    }
    `
  ],
})
export class HomePageComponent implements OnInit, OnDestroy {
  opened = true;

  get mini() {
    return this.opened ? 'expanded' : 'condensed';
  }

  mobileQuery: MediaQueryList;

  private mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

}
