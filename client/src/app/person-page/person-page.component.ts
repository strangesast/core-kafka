import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { shareReplay, map, pluck, switchMap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';


@Component({
  selector: 'app-person-page',
  template: `
  <ng-container *ngIf="person$ | async as person">
    <app-page-title>
      <a routerLink="/people">People</a> / <a [routerLink]="['/people', person.id]">{{person.first_name}} {{person.last_name}}</a>
    </app-page-title>
    <header>
      <h1>{{person.first_name}} {{person.last_name}}</h1>
    </header>
    <pre>{{person | json}}</pre>
    <pre *ngFor="let shift of shifts$ | async">{{shift | json}}</pre>
  </ng-container>
  <ng-template #loading>Loading...</ng-template>
  `,
  styleUrls: ['../base.scss', './person-page.component.scss']
})
export class PersonPageComponent implements OnInit {
  limit$ = of(20).pipe(map(limit => ({limit})));
  offset$ = of(0).pipe(map(offset => ({offset})));

  data$ = combineLatest(
    this.limit$,
    this.offset$,
    this.route.params.pipe(pluck('id'), map(id => ({id}))),
    (a, b, c) => ({...a, ...b, ...c})
  ).pipe(switchMap(variables => this.apollo.query({
      query: gql`
        query MyQuery($id: Int!, $limit: Int = 20, $offset: Int = 0) {
          employees_by_pk(id: $id) {
            id
            first_name
            last_name
            timeclock_shifts(limit: $limit, offset: $offset, order_by: {date_start: desc, date_stop: desc_nulls_first}) {
              date
              date_stop
              duration
              is_manual
              punch_start
              punch_stop
              date_start
            }
            hire_date
            code
            middle_name
          }
        }`,
      variables,
    })),
    pluck('data', 'employees_by_pk'),
    shareReplay(1),
  );

  person$ = this.data$.pipe(
    map((data: any) => {
      const {id, first_name, last_name, middle_name, code} = data;
      return {id, first_name, middle_name, last_name, code, hire_date: new Date(data.hire_date)};
    }),
  );

  shifts$ = this.data$.pipe(
    pluck('timeclock_shifts'),
    map((shifts: any[]) => shifts.map(({date, date_stop, duration, date_start}) => ({
      date: new Date(date),
      date_start: new Date(date_start),
      date_stop: new Date(date_stop),
    }))),
  );


  constructor(public route: ActivatedRoute, public apollo: Apollo) { }

  ngOnInit(): void {
  }

}
