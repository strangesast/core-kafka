import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-timesheet-week-page',
  template: `
  <div>Week page</div>
  `,
  styleUrls: ['./timesheet-week-page.component.scss']
})
export class TimesheetWeekPageComponent implements OnInit {
  week$ = this.route.params.pipe(pluck('weekId'));

  constructor(public route: ActivatedRoute) { }

  ngOnInit() {
  }

}
