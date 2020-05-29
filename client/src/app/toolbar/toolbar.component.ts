import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { pluck, map } from 'rxjs/operators';

import { UserService } from '../user.service';

@Component({
  selector: 'app-toolbar',
  template: `
    <mat-toolbar>
      <ng-content></ng-content>
      <ng-container *ngIf="userData$ | async as userData">
        <ul>
          <li>
            <app-notification-list [notifications]="notifications$ | async"></app-notification-list>
          </li>
          <li *ngIf="userData.user == null">
            <button (click)="loginRedirect()" mat-icon-button aria-label="Log in"><mat-icon>person</mat-icon></button>
          </li>
          <li *ngIf="userData.user != null">
            <button mat-icon-button aria-label="User settings" [matMenuTriggerFor]="menu">
              <app-user-badge [initials]="initials$ | async"></app-user-badge>
            </button>
            <mat-menu #menu="matMenu" xPosition="before">
              <a mat-menu-item [routerLink]="['/timesheet']" *ngIf="userData.user.roles.includes('isPaidHourly')"><mat-icon>assignment</mat-icon><span>Your timesheet</span></a>
              <a mat-menu-item [routerLink]="['/settings']"><mat-icon>settings</mat-icon><span>Account Settings</span></a>
              <button mat-menu-item (click)="logout()"><mat-icon>exit_to_app</mat-icon><span>Log out</span></button>
            </mat-menu>
          </li>
        </ul>
      </ng-container>
    </mat-toolbar>
  `,
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  userData$ = this.userService.user$.pipe(map(user => ({user})));

  initials$ = this.userData$.pipe(
    map(({user}) => {
      if (user) {
        const {name: {first, middle, last}, username} = user;
        return [first, middle, last].map(v => (v || '').slice(0, 1)).join('') || username.slice(0, 1);
      }
      return '';
    }),
  );

  notifications$ = this.store.pipe(
    select('user', 'notifications'),
  );

  constructor(
    public router: Router,
    public store: Store<any>,
    public userService: UserService,
  ) { }

  ngOnInit(): void {
  }

  loginRedirect() {
    const redirect = this.router.url;
    if (redirect !== '/') {
      this.router.navigate(['/login'], {queryParams: {redirect}});
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigateByUrl('/');
  }
}
