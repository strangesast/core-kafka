import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timesheet-page',
  template: `
    <app-page-title>
      <a routerLink="/timesheet">Timesheet</a>
    </app-page-title>
    <header>
      <h1>Your Timesheet</h1>
    </header>
  `,
  styleUrls: ['../base.scss', './timesheet-page.component.scss'],
})
export class TimesheetPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
