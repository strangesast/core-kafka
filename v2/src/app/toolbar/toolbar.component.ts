import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { UserService } from '../user.service';

@Component({
  selector: 'app-toolbar',
  template: `
    <mat-toolbar>
      <ng-content></ng-content>
      <ng-container *ngIf="user$ | async as user">
        <ul>
          <li>
            <button
              mat-icon-button
              aria-label="Alerts"
              [matMenuTriggerFor]="menu">
              <mat-icon matBadge="8" matBadgePosition="after" matBadgeColor="accent">notifications</mat-icon>
            </button>
            <mat-menu #menu="matMenu" xPosition="before">
              <mat-action-list>
                <button mat-list-item role="listitem">
                  <mat-icon matListIcon>folder</mat-icon>
                  <h4 matLine>Long alert that indicates something</h4>
                  <p matLine>This alert happened yesterday.</p>
                </button>
              </mat-action-list>
              <button mat-menu-item>Item 1</button>
              <button mat-menu-item>Item 2</button>
            </mat-menu>
          </li>
          <li *ngIf="user.user == null">
            <button (click)="loginRedirect()" mat-icon-button aria-label="Log in"><mat-icon>person</mat-icon></button>
          </li>
        </ul>
      </ng-container>
    </mat-toolbar>
  `,
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  user$ = this.userService.user$.pipe(map(user => ({user})));

  constructor(public router: Router, public userService: UserService) { }

  ngOnInit(): void {
  }

  loginRedirect() {
    this.router.navigate(['/login'], {queryParams: {redirect: this.router.url}});
  }

}
