import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-timesheet-container-page',
  template: `
  <mat-toolbar>
    <span>Timesheets</span>
  </mat-toolbar>
  <router-outlet></router-outlet>
  `,
  styleUrls: [
    '../container-page-formatting.scss',
    './timesheet-container-page.component.scss',
  ],
  styles: [
    `
    mat-toolbar {
      background: white;
    }
    `
  ],
})
export class TimesheetContainerPageComponent implements OnInit {
  constructor(public route: ActivatedRoute) {}

  ngOnInit() {
  }

}
