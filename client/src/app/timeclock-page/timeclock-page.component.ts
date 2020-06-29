import { ViewChild, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as d3 from 'd3';
import { Observable, of, interval } from 'rxjs';
import { first, skip, withLatestFrom, startWith, switchMap, map, tap, pluck } from 'rxjs/operators';
import { group } from 'd3-array';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-timeclock-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/timeclock']">Timeclock</a>
  </app-page-title>
  <header>
    <ng-container *ngIf="active$ | async as active">
      <h1>{{active.list.length}} Clocked In</h1>
      <p>As of <span *ngIf="isToday(active.asof); else old">{{active.asof | date:'mediumTime'}}</span><ng-template #old>{{active.asof | date:'medium'}}</ng-template>, 34 Total Hours Today, <a [routerLink]="['/graphs']">Graphs</a></p>
    </ng-container>
  </header>
  <div class="controls">
    <form [formGroup]="form">
      <app-timeclock-datepicker formControlName="date" [max]="getMaxDate()"></app-timeclock-datepicker>
    </form>
    <!--
    <mat-button-toggle-group [(ngModel)]="activeView">
      <mat-button-toggle value="timeline" aria-label="Timeline" title="Timeline">
        <mat-icon>clear_all</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="table" aria-label="Table" title="Table">
        <mat-icon>list</mat-icon>
      </mat-button-toggle>
    </mat-button-toggle-group>
    -->
  </div>
  <app-slidy-table [date]="date$ | async"></app-slidy-table>
  `,
  styleUrls: ['../base.scss', './timeclock-page.component.scss'],
})
export class TimeclockPageComponent implements OnInit {
  // @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  activeView = 'table';
  displayedColumns = ['name', 'start', 'end', 'total', 'weekly_total'];
  window = new Date();
  dataSource: MatTableDataSource<any>;

  form: FormGroup;
  range$: Observable<any>;
  data = [];
  data$: Observable<any[]>;

  date$: Observable<Date>;

  active$ = this.apollo.watchQuery({
    query: gql`
      query MyQuery($timestamp: timestamp) {
        timeclock_shifts(order_by: {date_start: desc}, where: {date_stop: {_is_null: true}, date_start: {_gt: $timestamp}}) {
          date_start
          employee {
            first_name
            last_name
          }
        }
        timeclock_polls(limit: 1, order_by: {date: desc_nulls_last}) {
          date
        }
      }`,
    variables: {
      timestamp: (() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
      })(),
    },
  }).valueChanges.pipe(
    pluck('data'),
    map(({timeclock_polls, timeclock_shifts}: any) => {
      const dstr = timeclock_polls[0].date + 'Z';
      return {list: timeclock_shifts, asof: new Date(dstr)};
    }),
  );

  constructor(public apollo: Apollo, public fb: FormBuilder, public route: ActivatedRoute, public router: Router) {
    this.dataSource = new MatTableDataSource(this.data);

    this.form = this.fb.group({
      date: [],
    });

    const qp$ = this.route.queryParams;

    this.date$ = qp$.pipe(
      pluck('date'),
      map(s => {
        if (s != null) {
          const [yyyy, mm, dd] = s.split('-').map(ss => parseInt(ss, 10));
          return new Date(yyyy, mm - 1, dd);
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return today;
        }
      }),
    );

    this.date$.pipe(first()).subscribe(date => this.form.patchValue({date}));

    this.form.valueChanges.pipe(
      pluck('date'),
      map(date => ({date: [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')})),
    ).subscribe(queryParams => {
      this.router.navigate([], {relativeTo: route, queryParams, queryParamsHandling: 'merge'});
    });

    this.range$ = this.date$.pipe(
      map(date => {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return [start, end];
      }),
    );
    const includeActive$ = this.date$.pipe(
      map(date => date.toISOString().slice(0, 10) === (new Date()).toISOString().slice(0, 10)),
    );

    this.data$ = this.range$.pipe(
      withLatestFrom(includeActive$),
      switchMap(([range, includeActive]) => this.apollo.query({
        query: gql`
          query TimeclockShifts($_gte: timestamp, $_lte: timestamp, $includeActive: Boolean = false) {
            timeclock_shifts(where: {_and: [{date_start: {_gte: $_gte}}, {_or: [{date_stop: {_is_null: $includeActive}},{date_stop: {_lte: $_lte}}]}]}, order_by: {date_start: asc}) {
              date_start
              date_stop
              employee {
                id
                first_name
                last_name
                middle_name
              }
              duration
            }
          }`,
        variables: {_gte: range[0].toISOString(), _lte: range[1].toISOString(), includeActive},
      })),
      map(({data}: any) => data.timeclock_shifts as any[]),
    );
  }

  ngOnInit(): void {
    // this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.data$.subscribe(data => {
      data = Array.from(group(data.map(obj => {
          for (const key of ['date_start', 'date_stop']) {
            obj[key] = obj[key] ? new Date(obj[key] + 'Z') : null;
          }
          return obj;
        }), d => d.employee.id))
        .map(([_, shifts]) => shifts.sort((a, b) => a.date_start < b.date_start ? -1 : 1))
        .sort((a, b) => a[0].date_start < b[0].date_start ? -1 : 1)
        .map((shifts) => {
          let duration;
          if (shifts[shifts.length - 1].duration == null) {
            const base = shifts.reduce((acc, s) => acc + s.duration || 0, 0);
            const shift = shifts[shifts.length - 1];
            duration = interval(1000).pipe(
              startWith(null),
              map(() => (+new Date() - shift.date_start)),
            );
          } else {
            duration = of(shifts.reduce((acc, shift) => acc + shift.duration, 0));
          }
          return {
            employee: shifts[0].employee,
            date_start: shifts[0].date_start,
            date_stop: shifts[shifts.length - 1].date_stop,
            shifts,
            duration,
          };
        });
      this.data = data;
      this.dataSource.data = data;
    });
  }

  setToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.form.patchValue({date: today});
  }

  getMaxDate() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }

  isToday(date: Date) {
    const now = new Date();
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
}
