import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-list-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/users']">Users</a>
  </app-page-title>
  <header>
    <h1>Users</h1>
  </header>
  `,
  styleUrls: ['../base.scss', './user-list-page.component.scss']
})
export class UserListPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
