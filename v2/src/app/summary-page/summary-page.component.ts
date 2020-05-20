import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-page',
  template: `
  <mat-toolbar>
    <h1>Overview</h1>
  </mat-toolbar>
  <section>
    <h1>3 Machines Active</h1>
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
