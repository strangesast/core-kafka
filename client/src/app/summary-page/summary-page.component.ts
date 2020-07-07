import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/']">Overview</a>
  </app-page-title>
  <div class="container grid">
    <div class="grid-item mat-elevation-z4">
      <h1>3 Clocked In</h1>
      <p>12 Shifts Today, 200 Hours</p>
    </div>
    <div class="grid-item mat-elevation-z4">
      <h1>3 Machines Active</h1>
      <p>23% Average Activity</p>
      <p>4min cycle time</p>
      <p>8 parts today</p>
    </div>
  </div>
  `,
  styleUrls: ['../base.scss', './summary-page.component.scss']
})
export class SummaryPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
