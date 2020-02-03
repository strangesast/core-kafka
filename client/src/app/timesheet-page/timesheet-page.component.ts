import { Component, OnInit } from '@angular/core';

const TODAY = floorDate(new Date());
const MONDAY = new Date(TODAY);
MONDAY.setDate(MONDAY.getDate() - MONDAY.getDay() + 1);

@Component({
  selector: 'app-timesheet-page',
  template: `
  <header>
    <h1>Current</h1>
  </header>
  <app-data-table></app-data-table>
  <!--
  <div class="table">
    <a *ngFor="let week of data" class="row" tabindex="0" [routerLink]="['/timesheet', 'week', week.startDate.toISOString().slice(0,10)]">
      <div>{{week.startDate | date:'shortDate' }}</div>
      <div class="svg">
        <svg>
          <rect height="100%" width="100%" stroke="black" fill="white"/>
          <rect height="100%" [attr.width]="computeWidth(week.total)" stroke="black" fill="black"/>
        </svg>
        <div *ngIf="week.total > 40">
          <mat-icon>add</mat-icon>
        </div>
      </div>
      <div class="hours">
        <span class="hours_left">{{week.total}}</span>
        <span>/</span>
        <span class="hours_right">40</span>
      </div>
          <span class="dow">{{row.date | date:'EEE'}}</span>
          <span class="date">{{row.date | date:'M/d'}}</span>
    </a>
  </div>
  -->
  `,
  styleUrls: ['./timesheet-page.component.scss'],
  styles: [
    `
    header {
      padding: 0 16px;
    }
    `,
  ],
})
export class TimesheetPageComponent implements OnInit {
  data = Array.from(Array(7)).map((_, i) => {
    const startDate = addDays(MONDAY, -i * 7);
    const days = Array.from(Array(i === 0 ? 3 : 7)).map((__, j) => {
      const date = addDays(startDate, j);
      const enter = addHours(date, 6);
      const leave = addHours(date, 16);
      return { date, enter, leave };
    });
    const total = days.reduce((val, {enter, leave}) => val + +leave - +enter, 0) / 3.6e6;
    return { startDate, days, total };
  });

  computeWidth = (hours) => Math.min(hours / 40, 1) * 100 + '%';

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
