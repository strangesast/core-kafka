import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  SimpleChanges,
  Input,
  OnDestroy,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { group } from 'd3-array';
import { Observable, of, Subject, interval, ReplaySubject } from 'rxjs';
import {
  delay,
  takeUntil,
  map,
  pluck,
  startWith,
  switchMap,
  take,
  tap,
  multicast,
  refCount,
} from 'rxjs/operators';


const query = gql`
  query DateShiftGroups($date: date) {
    timeclock_shift_groups(order_by: {date_start: desc}, limit: 20, where: {date: {_eq: $date}}) {
      employee {
        id
        first_name
        last_name
        color
      }
      shifts(order_by: {date_start: asc}) {
        id
        date_start
        date_stop
      }
      date_start
      date_stop
    }
  }
`;

const periodSummaryQuery = gql`
  query MyQuery($minDate: timestamp, $maxDate: timestamp, $employeeId: Int) {
    timeclock_shifts(where: {_and: {date_start: {_gte: $minDate}, date_stop: {_lt: $maxDate}, employee_id: {_eq: $employeeId}}}) {
      date_start
      date_stop
      date
    }
  }
`;

@Component({
  selector: 'app-slidy-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="container" cdkScrollable>
    <div class="table-container">
      <table mat-table [dataSource]="dataSource" [trackBy]="trackByFn" multiTemplateDataRows>
        <ng-container matColumnDef="name" sticky>
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let row">
            <a [routerLink]="['/people', row.employee.id]">
            {{row.employee.first_name}} {{row.employee.last_name}}
            </a>
          </td>
        </ng-container>
        <ng-container matColumnDef="parts">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <div [ngStyle]="{'min-width.px': totalWidth, 'overflow': 'hidden'}" class="blocks">
              <span
                *ngFor="let shift of row.shifts; ngForTrackBy: trackBy"
                matTooltip="{{shift.date_start | date:'short'}} - {{shift.date_stop | date:'shortTime'}}"
                [ngStyle]="positionShift(shift, row.employee.color)">
              </span>
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="start">
          <th mat-header-cell *matHeaderCellDef> Start </th>
          <td mat-cell *matCellDef="let row"> {{row.date_start | date:'shortTime'}} </td>
        </ng-container>
        <ng-container matColumnDef="stop">
          <th mat-header-cell *matHeaderCellDef> Stop </th>
          <td mat-cell *matCellDef="let row"> {{row.date_stop | date:'shortTime'}} </td>
        </ng-container>
        <ng-container matColumnDef="total" stickyEnd>
          <th mat-header-cell *matHeaderCellDef> Total </th>
          <td mat-cell *matCellDef="let row">
            <span *ngIf="row.duration != null; else dur">{{row.duration | duration:'h:mm:ss'}}</span>
            <ng-template #dur>{{getDuration(row.date_start) | async | duration:'h:mm:ss'}}</ng-template>
          </td>
        </ng-container>
        <ng-container matColumnDef="expandedDetail">
          <td mat-cell *matCellDef="let row" [attr.colspan]="displayedColumns.length">
            <div class="detail" [@detailExpand]="row == expanded ? 'expanded' : 'collapsed'">
              <ng-container *ngIf="expanded === row && expandedData$ | async as data; else loading">
                <div class="days">
                  <div class="day" *ngFor="let each of data.days">
                    <span>{{each.value > 0 ? each.value.toFixed(1) : ''}}</span>
                    <span
                      class="pill vert"
                      [matTooltip]="each.value.toFixed(2)"
                      [ngStyle]="{'height': (each.frac * 40) + 'px', 'background-color': row.employee.color}">
                    </span>
                    <div class="label">
                      <span>{{each.abbr}}</span>
                      <span>{{each.date | date:'M/d' }}</span>
                    </div>
                  </div>
                </div>
                <div>Total: {{data.total.toFixed(2)}}</div>
              </ng-container>
              <ng-template #loading>Loading...</ng-template>
            </div>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            (click)="setExpanded(row)"
            class="example-row-row"
            [class.example-expanded-row]="expanded === row">
        </tr>
        <tr
          mat-row
          *matRowDef="let row; columns: ['expandedDetail']"
          class="example-detail-row">
        </tr>
      </table>
    </div>
  </div>
  `,
  styleUrls: ['./slidy-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SlidyTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  displayedColumns = ['name', 'parts', 'start', 'stop', 'total'];
  expanded = null;

  expandedData$ = null;

  @Input()
  date: Date = new Date();

  date$ = new ReplaySubject(1);

  @ViewChild(CdkScrollable)
  scroller: CdkScrollable;

  totalWidth = 400;

  clock$ = interval(1000).pipe(
    delay((() => {
      const d = +new Date();
      return d - Math.floor(d / 1000) * 1000 + 500;
    })()),
    startWith(null),
    map(() => new Date()),
    multicast(new ReplaySubject(1)),
    refCount(),
  );

  range$ = new ReplaySubject(1);

  range;

  dataSource = new MatTableDataSource();

  destroyed$ = new Subject();

  trackByFn = (row) => row.id;

  constructor(
    public apollo: Apollo,
  ) {}

  trackBy = (s) => s.id;

  setExpanded(row) {
    this.expanded = this.expanded === row ? null : row;
    this.expandedData$ = this.getDays(row.date_start, row.employee.id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('date' in changes) {
      const from = new Date(changes.date.currentValue);
      from.setHours(0, 0, 0, 0);
      this.date$.next(from);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.date$.pipe(
      switchMap(date => this.apollo.query({ query, variables: {date}})),
      pluck('data', 'timeclock_shift_groups'),
      map((arr: any[]) => {
        let minDate;
        let maxDate;

        const records = [];
        for (const record of arr) {
          const {employee, date_start: d0, date_stop: d1} = record;
          const shifts = record.shifts.map(({id, date_start: a, date_stop: b}) => ({
            id,
            date_start: a && new Date(a + 'Z'),
            date_stop: b && new Date(b + 'Z'),
          }));

          const dateStart = d0 && new Date(d0 + 'Z');
          const dateStop = d1 && new Date(d1 + 'Z');
          const duration = dateStop != null ? shifts.reduce((acc, {date_start: a, date_stop: b}) => b ? b - a + acc : acc, 0) : null;

          // set range
          if (!minDate || dateStart < minDate) {
            minDate = dateStart;
          }
          if (!maxDate || dateStop > maxDate) {
            maxDate = dateStop;
          }
          records.push({
            employee,
            duration,
            shifts,
            date_start: dateStart,
            date_stop: dateStop,
          });
        }
        if (maxDate == null) {
          maxDate = new Date();
        }
        this.range = [minDate, maxDate, +maxDate - +minDate];
        return records;
      }),
      takeUntil(this.destroyed$),
    ).subscribe(data => this.dataSource.data = data);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.scroller.scrollTo({left: this.scale(new Date())});
    }, 1000);
  }

  scale(val: Date, rel?: Date) {
    const minDate = new Date(this.date);
    minDate.setHours(0, 0, 0, 0);
    const maxDate = new Date(minDate);
    maxDate.setDate(minDate.getDate() + 1);

    const dateRange = +maxDate - +minDate;

    return (+val - +(rel || minDate)) / dateRange * this.totalWidth;
  }

  getDays(ofDate, employeeId) {
    const weekNo = getWeekNumber(ofDate);
    const n = (weekNo + 1) % 2 * 7 + ofDate.getDay();

    const minDate = new Date(ofDate);
    minDate.setDate(minDate.getDate() - n);

    const maxDate = new Date(minDate);
    maxDate.setDate(maxDate.getDate() + 14);
    const variables = {minDate, maxDate, employeeId};

    const days = [];
    const daysData = [];

    {
      const d = minDate.getDate();
      for (let i = 0; i < 14; i++) {
        const date = new Date(minDate);
        date.setDate(d + i);
        const abbr = date.toLocaleDateString('en-us', {weekday: 'short'});
        days.push(`${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`);
        daysData.push({date, abbr, frac: 0, value: 0});
      }
    }

    return this.apollo.query({query: periodSummaryQuery, variables}).pipe(
      pluck('data', 'timeclock_shifts'),
      map((arr: any[]) => arr.map(({date, date_start, date_stop}) => ({
        date,
        date_start: new Date(date_start + 'Z'),
        date_stop: new Date(date_stop + 'Z'),
      }))),
      map(arr => {
        const vals = [];
        let total = 0;
        for (const [key, value] of group(arr, d => d.date)) {
          const i = days.indexOf(key);
          const val = value.reduce((acc, shift) => acc + (+shift.date_stop - +shift.date_start), 0) / 3.6e6;
          total += val;
          daysData[i].value = val;
          daysData[i].frac = Math.min(val / 8, 1.2);
        }
        return {days: daysData, total};
      }),
    );
  }

  getDuration(dateStart: Date) {
    return this.clock$.pipe(map(date => +date - +dateStart));
  }

  positionShift(shift, color = 'blue') {
    const [minDate, maxDate, dateRange] = this.range;

    const [a, b, c] = [shift.date_start, shift.date_stop || new Date(), minDate].map(s => +s);

    const left = (a - c) / dateRange * 100 + '%';
    const width = (b - a) / dateRange * 100 + '%';

    return {left, width, 'background-color': color};
  }
}

function getWeekNumber(date: Date): number {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  return Math.ceil( (((+now - +onejan) / 8.64e7) + onejan.getDay() + 1) / 7 );
}
