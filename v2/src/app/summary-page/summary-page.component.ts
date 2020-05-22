import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-page',
  template: `
  <app-toolbar>
    <span>Overview</span>
  </app-toolbar>
  <section>
    <h1>3 Machines Active</h1>
    <app-pie></app-pie>
  </section>
  <mat-divider></mat-divider>
  <section>
    <h1>3 Clocked In</h1>
    <app-activity-count-preview></app-activity-count-preview>
  </section>
  `,
  styleUrls: ['./summary-page.component.scss']
})
export class SummaryPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
