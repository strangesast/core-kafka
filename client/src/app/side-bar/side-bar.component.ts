import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  template: `
  <ul>
    <li><a routerLink="/timesheet">
      <mat-icon class="icon">access_time</mat-icon>
      <span>Timesheet</span>
    </a></li>
    <li><a routerLink="/machines">
      <mat-icon class="icon">account_tree</mat-icon>
      <span>Machines</span>
    </a></li>
    <li><a routerLink="/timesheet">
      <mat-icon class="icon">build</mat-icon>
      <span>Tools</span>
    </a></li>
  </ul>
  `,
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
