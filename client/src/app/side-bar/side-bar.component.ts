import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  template: `
  <ul>
    <li *ngFor="let each of [1,2,3]">
      <a routerLink="/timesheet">
        <mat-icon class="icon">access_time</mat-icon>
        <span>Timesheet</span>
      </a>
    </li>
  </ul>
  `,
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
