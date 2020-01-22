import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-timesheet-container-page',
  template: `
  <header>
    <h1>Timesheets</h1><h3 *ngIf="week$ | async as week">/\&nbsp;{{week}}</h3>
  </header>
  <router-outlet></router-outlet>
  `,
  styleUrls: ['./timesheet-container-page.component.scss']
})
export class TimesheetContainerPageComponent implements OnInit {
  week$ = this.route.firstChild.params.pipe(
    pluck('weekId')
  );

  constructor(public route: ActivatedRoute) {}

  ngOnInit() {
  }

}
