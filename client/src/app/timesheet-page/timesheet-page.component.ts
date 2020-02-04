import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject } from 'rxjs';
import { tap, map, pluck, takeUntil, share } from 'rxjs/operators';

const LOCALE = 'en-us';

enum ShiftState {
  Complete = 'complete',
  Progress = 'progress',
}

interface ShiftPunch {
  date: Date;
}

interface DayShiftDetail {
  date: Date;
  start: Date;
  end: Date;
  state: ShiftState;
  total: number;
  punches: ShiftPunch[];
}

@Component({
  selector: 'app-timesheet-page',
  template: `
  <header>
    <h1>Timesheet</h1>
    <nav>
      <p>Week of {{week$ | async | date:'shortDate'}}</p>
      <pre>{{week$ | async | json}}</pre>
    </nav>
  </header>
  <table mat-table [dataSource]="dataSource">
    <ng-container matColumnDef="date">
      <th mat-header-cell *matHeaderCellDef>Date</th>
      <td mat-cell *matCellDef="let element"><app-mini-date [date]="element.date"></app-mini-date></td>
    </ng-container>
    <ng-container matColumnDef="start">
      <th mat-header-cell *matHeaderCellDef>Begin</th>
      <td mat-cell *matCellDef="let element"> {{element.start | date:'shortTime'}} </td>
    </ng-container>
    <ng-container matColumnDef="state">
      <th mat-header-cell *matHeaderCellDef> state </th>
      <td mat-cell *matCellDef="let element"> {{element.state}} </td>
    </ng-container>
    <ng-container matColumnDef="punchCount">
      <th mat-header-cell *matHeaderCellDef> Punches </th>
      <td mat-cell *matCellDef="let element"> {{element.punches.length}} </td>
    </ng-container>
    <ng-container matColumnDef="total">
      <th mat-header-cell *matHeaderCellDef>Total</th>
      <td mat-cell *matCellDef="let element"> {{element.total | hours}} </td>
    </ng-container>
    <ng-container matColumnDef="end">
      <th mat-header-cell *matHeaderCellDef>End</th>
      <td mat-cell *matCellDef="let element"> {{element.end | date:'shortTime'}} </td>
    </ng-container>
    <tr class="header" mat-header-row *matHeaderRowDef="columns"></tr>
    <tr mat-row *matRowDef="let row; columns: columns;"></tr>
  </table>
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
export class TimesheetPageComponent implements OnInit, OnDestroy {
  columns = ['date', 'start', 'end', 'total']; // , 'punchCount'];

  constructor(public route: ActivatedRoute) {
    this.dataSource = new MatTableDataSource([]);
  }

  destroyed$ = new Subject();

  dataSource: MatTableDataSource<DayShiftDetail>;

  timesheet$ = this.route.params.pipe(
    pluck('period'),
    map(period => {
      if (period) {

      } else {
      }
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      const values: DayShiftDetail[] = Array.from(Array(7)).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dayName = d.toLocaleDateString(LOCALE, { weekday: 'long' });
        const start = new Date(d);
        start.setHours(d.getHours() + 6);
        const end = new Date(d);
        end.setHours(d.getHours() + 16);
        const total = +end - +start;
        const punches = [{ date: start }, { date: end }];
        return {date: d, start, end, total, punches, state: ShiftState.Complete};
      });
      return { values, week: startDate };
    }),
    takeUntil(this.destroyed$),
    share(),
  );

  week$ = this.timesheet$.pipe(
    pluck('week'),
    tap(week => console.log(week)),
  );

  /*
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
  */

  computeWidth = (hours) => Math.min(hours / 40, 1) * 100 + '%';

  ngOnInit() {
    this.timesheet$.pipe(pluck('values')).subscribe(data => {
      console.log(data);
      this.dataSource.data = data;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
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
