import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/']">Overview</a>
  </app-page-title>
  <header>
    <h1>3 Machines Active</h1>
    <app-pie></app-pie>
  </header>
  <mat-divider></mat-divider>
  <header>
    <h1>3 Clocked In</h1>
    <app-activity-count-preview></app-activity-count-preview>
  </header>
  `,
  styleUrls: ['../base.scss', './summary-page.component.scss']
})
export class SummaryPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
