import { Component, OnInit } from '@angular/core';

const TODAY = floorDate(new Date());
const MONDAY = new Date(TODAY);
MONDAY.setDate(MONDAY.getDate() - MONDAY.getDay() + 1);

@Component({
  selector: 'app-timesheet-page',
  template: `
  <div class="table">
    <ng-container *ngFor="let week of data">
      <div class="divider">Week of {{week.startDate | date:'shortDate'}}</div>
      <div class="row" *ngFor="let row of week.days">{{row.date | date:'EEE, M/d'}}</div>
    </ng-container>
  </div>
  `,
  styleUrls: ['./timesheet-page.component.scss']
})
export class TimesheetPageComponent implements OnInit {
  data = Array.from(Array(7)).map((_, i) => {
    const startDate = addDays(MONDAY, -i * 7);
    const days = Array.from(Array(7)).map((__, j) => ({date: addDays(startDate, j)}));
    return { startDate, days };
  });

  constructor() { }

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
