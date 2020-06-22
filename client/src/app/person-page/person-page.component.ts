import { OnDestroy, AfterViewInit, ViewChild, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, ReplaySubject, combineLatest, of } from 'rxjs';
import {
  startWith,
  takeUntil,
  multicast,
  refCount,
  tap,
  map,
  pluck,
  switchMap,
} from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


const query = gql`
  query ($employeeId: Int!, $limit: Int = 10, $offset: Int = 0, $order_by: [timeclock_shifts_order_by!] = {}) {
    timeclock_shifts(where: {employee_id: {_eq: $employeeId}}, limit: $limit, offset: $offset, order_by: $order_by) {
      date
      date_start
      date_stop
      last_modified
      punch_start
      punch_stop
      duration
      timeclock_sync {
        complete_date
      }
      is_manual
      id
    }
  }
`;

@Component({
  selector: 'app-person-page',
  template: `
  <ng-container *ngIf="employee$ | async as employee">
    <app-page-title>
      <a routerLink="/people">People</a> / <a [routerLink]="['/people', employee.id]">{{employee.first_name}} {{employee.last_name}}</a>
    </app-page-title>
    <header>
      <h1>{{employee.first_name}} {{employee.last_name}}</h1>
    </header>
  </ng-container>
  <h2>Recent Shifts</h2>
  <!--
  <mat-form-field>
    <mat-label>Filter</mat-label>
    <input matInput (keyup)="applyFilter($event)" placeholder="Ex. Mia">
  </mat-form-field>
  -->
  <div class="table-container">
    <table mat-table [dataSource]="dataSource" matSort matSortActive="date_start" matSortDirection="desc" matSortDisableClear>
      <ng-container matColumnDef="date_start">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Start </th>
        <td mat-cell *matCellDef="let row"> {{row.date_start | date:'short'}} </td>
      </ng-container>
      <ng-container matColumnDef="date_stop">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Stop </th>
        <td mat-cell *matCellDef="let row"> {{row.date_stop | date:'short'}} </td>
      </ng-container>
      <ng-container matColumnDef="duration">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Duration </th>
        <td mat-cell *matCellDef="let row"> {{row.duration | duration:'h:mm:ss'}} </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;">
      </tr>
    </table>
    <mat-paginator pageSize="10" [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>
  </div>
  <ng-template #loading>Loading...</ng-template>
  `,
  styleUrls: ['../base.scss', './person-page.component.scss']
})
export class PersonPageComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns = ['date_start', 'date_stop', 'duration'];
  dataSource = new MatTableDataSource();
  destroyed$ = new Subject();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  employee$ = this.route.data.pipe(pluck('data'), map(({hire_date, ...props}) => {
    return {hire_date: new Date(hire_date + 'Z'), ...props};
  }));

  constructor(public route: ActivatedRoute, public apollo: Apollo) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    const employeeId$ = this.employee$.pipe(map(({id}) => ({employeeId: id})));
    const orderBy$ = this.sort.sortChange.pipe(
      map(({active, direction}) => (direction !== '' ? {order_by: {[active]: direction}} : {})),
      startWith({order_by: {[this.sort.active]: this.sort.direction}}),
    );
    const offset$ = this.paginator.page.pipe(
      map(({pageIndex, pageSize}) => ({offset: pageSize * pageIndex, limit: pageSize})),
      startWith({offset: 0, limit: this.paginator.pageSize}),
    );
    const variables$ = combineLatest(employeeId$, orderBy$, offset$, (a, b, c) => ({...a, ...b, ...c}));

    this.employee$.pipe(
      switchMap(employee => this.apollo.query({
        query: gql`
          query MyQuery($employeeId: Int!) {
            timeclock_shifts_aggregate(where: {employee_id: {_eq: $employeeId}}) {
              aggregate {
                count
              }
            }
          }`,
        variables: {employeeId: employee.id},
      })),
      pluck('data', 'timeclock_shifts_aggregate', 'aggregate', 'count'),
      takeUntil(this.destroyed$),
    ).subscribe((length: number) => this.paginator.length = length);

    variables$.pipe(
      switchMap(variables => this.apollo.query({query, variables})),
      pluck('data', 'timeclock_shifts'),
      map((data: any[]) => data.map(({date_start, date_stop, ...props}) =>
        ({...props, date_start: date_start && new Date(date_start + 'Z'), date_stop: date_stop && new Date(date_stop + 'Z')}))),
      takeUntil(this.destroyed$),
      multicast(new ReplaySubject(1)),
      refCount(),
    ).subscribe(data => this.dataSource.data = data);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
