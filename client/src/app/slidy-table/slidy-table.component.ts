import { AfterViewInit, ViewChild, OnChanges, SimpleChanges, Input, Component, OnInit } from '@angular/core';
import { trigger, state, animate, transition, style } from '@angular/animations';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { group } from 'd3-array';
import { of, interval, ReplaySubject } from 'rxjs';
import { delay, startWith, pluck, tap, map, switchMap } from 'rxjs/operators';


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
            <div [ngStyle]="{'min-width.px': totalWidth, 'overflow': 'hidden'}" class="blocks">
              <span *ngFor="let shift of row.shifts" matTooltip="{{shift.date_start | date:'short'}} - {{shift.date_stop | date:'shortTime'}}" [ngStyle]="positionShift(shift, row.employee.color)"></span>
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
        <!--(click)="expanded = expanded === row ? null : row"-->
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            class="example-row-row"
            [class.example-expanded-row]="expanded === row">
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
  displayedColumns = ['name', 'parts', 'start', 'stop', 'total'];
  expanded = null;

  @Input()
  date: Date = new Date();

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
  );

  range$ = new ReplaySubject(1);

  rows$ = this.range$.pipe(
    map(([from, to]) => formatDate(from)),
    switchMap(date => this.apollo.query({ query, variables: {date}})),
    pluck('data', 'timeclock_shift_groups'),
    map((arr: any[]) => arr.map(record => {
      const {employee, date_start, date_stop} = record;
      const shifts = record.shifts.map(({id, date_start: a, date_stop: b}) => ({
        id,
        date_start: a && new Date(a + 'Z'),
        date_stop: b && new Date(b + 'Z'),
      }));
      let base = shifts.reduce((acc, {date_start: a, date_stop: b}) => b ? b - a + acc : acc, 0);
      let duration;
      if (date_stop != null) {
        duration = of(base);
      } else {
        base -= +shifts[shifts.length - 1].date_start;
        duration = this.clock$.pipe(map(now => +now + base));
      }
      return {
        employee,
        duration,
        shifts,
        date_start: date_start && new Date(date_start + 'Z'),
        date_stop: date_stop && new Date(date_stop + 'Z'),
      };
    })),
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
    maxDate.setHours(6, 0, 0, 0);

    const now = new Date();
    if (now < maxDate) {
      maxDate = now;
    }

    const dateRange = +maxDate - +minDate;

    const left = (+shift.date_start - +minDate) / dateRange * 100 + '%'; //  * this.totalWidth;

    const width = ((+(shift.date_stop || new Date()) - +shift.date_start) / dateRange) * 100 + '%'; //  * this.totalWidth;

    return {left, width, 'background-color': color};
  }
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
