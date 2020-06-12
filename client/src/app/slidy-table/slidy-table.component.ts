import { AfterViewInit, ViewChild, OnChanges, SimpleChanges, Input, Component, OnInit } from '@angular/core';
import { trigger, state, animate, transition, style } from '@angular/animations';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { group } from 'd3-array';
import { of, interval, ReplaySubject } from 'rxjs';
import { startWith, pluck, tap, map, switchMap } from 'rxjs/operators';

const query = gql`
  query MyQuery($from: timestamp!, $to: timestamp!) {
    timeclock_shifts(where: {_and: {date_start: {_gte: $from, _lt: $to}}}) {
      employee {
        first_name
        last_name
        middle_name
        color
        id
      }
      date_start
      date_stop
      duration
      punch_start
      punch_stop
      timeclock_sync {
        complete_date
        id
      }
    }
  }
`;

@Component({
  selector: 'app-slidy-table',
  template: `
  <div class="container" cdkScrollable>
    <div class="table-container">
      <table mat-table [dataSource]="rows$" multiTemplateDataRows>
        <ng-container matColumnDef="name" sticky>
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let row"> <a [routerLink]="['/people', row.employee.id]">{{row.employee.first_name}} {{row.employee.last_name}}</a> </td>
        </ng-container>
        <ng-container matColumnDef="parts">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <div [ngStyle]="{'min-width.px': totalWidth, 'width.px': totalWidth, 'overflow': 'hidden'}" class="blocks">
              <span *ngFor="let shift of row.shifts" matTooltip="{{shift.date_start | date:'short'}} - {{shift.date_stop | date:'shortTime'}}" [ngStyle]="positionShift(shift, row.employee.color)"></span>
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="total" stickyEnd>
          <th mat-header-cell *matHeaderCellDef> Total </th>
          <td mat-cell *matCellDef="let row"> {{row.duration | async | duration:'h:mm:ss'}} </td>
        </ng-container>
        <ng-container matColumnDef="expandedDetail">
          <td mat-cell *matCellDef="let row" [attr.colspan]="displayedColumns.length">
            <div class="example-row-detail" [@detailExpand]="row == expanded ? 'expanded' : 'collapsed'">
              <div class="example-row-diagram">
                <div class="example-row-position"> {{row.position}} </div>
                <div class="example-row-symbol"> {{row.symbol}} </div>
                <div class="example-row-name"> {{row.name}} </div>
                <div class="example-row-weight"> {{row.weight}} </div>
              </div>
              <div class="example-row-description">
                {{row.description}}
                <span class="example-row-description-attribution"> -- Wikipedia </span>
              </div>
            </div>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            class="example-row-row"
            [class.example-expanded-row]="expanded === row"
            (click)="expanded = expanded === row ? null : row">
        </tr>
        <tr mat-row *matRowDef="let row; columns: ['expandedDetail']" class="example-detail-row"></tr>
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
export class SlidyTableComponent implements OnInit, OnChanges, AfterViewInit {
  displayedColumns = ['name', 'parts', 'total'];
  expanded = null;

  @Input()
  date: Date = new Date();

  @ViewChild(CdkScrollable)
  scroller: CdkScrollable;

  totalWidth = 400;

  clock$ = interval(1000).pipe(startWith(new Date()), map(() => new Date()));

  range$ = new ReplaySubject(1);

  data$ = this.range$.pipe(
    switchMap(([from, to]) => this.apollo.query({query, variables: {from, to}})),
    pluck('data'),
  );

  rows$ = this.data$.pipe(
    pluck('timeclock_shifts'),
    map((shifts: any[]) => Array.from(
      group(shifts.map(datum => {
        let {date_start, date_stop} = datum;
        date_start = new Date(date_start + 'Z');
        date_stop = date_stop ? new Date(date_stop + 'Z') : null;
        return {...datum, date_start, date_stop};
      }), s => s.employee.id),
      ([_, arr]) => {
        let duration;
        let base = arr.sort((a, b) => a.date_start < b.date_start ? -1 : 1)
          .reduce((acc, datum) => acc + (datum.date_stop ? +datum.date_stop - +datum.date_start : 0), 0);

        if (arr[arr.length - 1].date_stop != null) {
          duration = of(base);
        } else {
          base -= +arr[arr.length - 1].date_start;
          duration = this.clock$.pipe(map(now => +now + base));
        }
        return {
          employee: arr[0].employee,
          shifts: arr,
          duration,
        };
      }).sort((a, b) => {
        if (a.shifts[a.shifts.length - 1].date_stop != null && b.shifts[b.shifts.length - 1].date_stop == null) {
          return 1;
        } else if (a.shifts[a.shifts.length - 1].date_stop == null && b.shifts[b.shifts.length - 1].date_stop != null) {
          return -1;
        }
        return a.shifts[0].date_start < b.shifts[0].date_start ? -1 : 1;
      }),
    ),
  );

  constructor(
    public apollo: Apollo,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('date' in changes) {
      const from = new Date(changes.date.currentValue);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      this.range$.next([from, to]);
    }
  }

  ngOnInit(): void {
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

  positionShift(shift, color = 'blue') {
    const minDate = new Date(this.date);
    minDate.setHours(0, 0, 0, 0);

    let maxDate = new Date(minDate);
    maxDate.setDate(minDate.getDate() + 1);

    const now = new Date();
    if (now < maxDate) {
      maxDate = now;
    }

    const dateRange = +maxDate - +minDate;

    const left = (+shift.date_start - +minDate) / dateRange * this.totalWidth;

    const width = (+(shift.date_stop || new Date()) - +shift.date_start) / dateRange * this.totalWidth;

    return {'left.px': left, 'width.px': width, 'background-color': color};
  }
}
