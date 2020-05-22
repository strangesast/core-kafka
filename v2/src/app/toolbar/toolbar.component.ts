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
            <app-notification-list></app-notification-list>
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
    const redirect = this.router.url;
    if (redirect !== '/') {
      this.router.navigate(['/login'], {queryParams: {redirect}});
    } else {
      this.router.navigate(['/login']);
    }
  }
}
