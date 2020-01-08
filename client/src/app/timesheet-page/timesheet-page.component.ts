import { Component, OnInit } from '@angular/core';

const TODAY = floorDate(new Date());
const MONDAY = new Date(TODAY);
MONDAY.setDate(MONDAY.getDate() - MONDAY.getDay() + 1);

@Component({
  selector: 'app-timesheet-page',
  template: `
  <div class="forehead"></div>
  <header>
    <h1>Timesheet</h1>
  </header>
  <div class="table">
    <ng-container *ngFor="let week of data">
      <div
        class="divider">
        Week of&nbsp;<span class="week">{{week.startDate | date:'shortDate'}}</span>
      </div>
      <div
        class="row"
        *ngFor="let row of week.days">
        <div class="date">
          <span class="dow">{{row.date | date:'EEE'}}</span>
          <span class="date">{{row.date | date:'M/d'}}</span>
        </div>
        <svg>
          <rect width="100%" height="20px"></rect>
        </svg>
      </div>
    </ng-container>
  </div>
  `,
  styleUrls: ['./timesheet-page.component.scss']
})
export class TimesheetPageComponent implements OnInit {
  data = Array.from(Array(7)).map((_, i) => {
    const startDate = addDays(MONDAY, -i * 7);
    const days = Array.from(Array(7)).map((__, j) => {
      const date = addDays(startDate, j);
      const enter = addHours(date, 6);
      const leave = addHours(date, 16);
      return { date, enter, leave };
    });
    return { startDate, days };
  });

  constructor() {}

  ngOnInit() {
  }

}

function floorDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(date: Date, ...args: [number, number?, number?]): Date {
  const d = new Date(date);
  d.setHours(...args);
  return d;
}
