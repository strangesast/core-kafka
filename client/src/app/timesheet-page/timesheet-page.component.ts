import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { combineLatest } from 'rxjs';
import { map, switchMap, startWith, pluck } from 'rxjs/operators';

import { UserService } from '../user.service';

@Component({
  selector: 'app-timesheet-page',
  template: `
    <app-page-title>
      <a routerLink="/timesheet">Timesheet</a>
    </app-page-title>
    <header>
      <h1>Your Timesheet</h1>
    </header>
    <form [formGroup]="form">
      <app-timeclock-datepicker formControlName="date"></app-timeclock-datepicker>
    </form>
    <pre>{{dates$ | async | json}}</pre>
    <pre>{{data$ | async | json}}</pre>
  `,
  styleUrls: ['../base.scss', './timesheet-page.component.scss'],
})
export class TimesheetPageComponent implements OnInit {
  form = this.fb.group({
    date: [(() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })()],
  });

  weekOf$ = this.form.valueChanges.pipe(startWith(this.form.value), pluck('date'));

  data$ = combineLatest(
    this.userService.user$.pipe(map(user => {
      const {id} = user.employees[0];
      return {id};
    })),
    this.weekOf$.pipe(map(weekOf => {
      const gt = new Date(weekOf);
      gt.setDate(gt.getDate() - gt.getDay());
      const lt = new Date(gt);
      lt.setDate(lt.getDate() + 7);
      console.log([gt, lt]);
      return {gt, lt};
    })),
    (a, b) => ({...a, ...b}),
  ).pipe(
    switchMap(variables => this.apollo.query({
      query: gql`
        query MyQuery($gt: date!, $lt: date!, $id: Int!) {
          timeclock_shifts(where: {_and: {date: {_gte: $gt, _lt: $lt}, employee_id: {_eq: $id}}}) {
            date
            date_start
            date_stop
            duration
            punch_start
            punch_stop
            sync_id
            last_modified
            is_manual
          }
        }
      `,
      variables,
    })),
    pluck('data', 'timeclock_shifts'),
    map((shifts: any[]) => shifts.map(datum => {
      let {date, date_start, date_stop} = datum;
      const [yyyy, mm, dd] = date.split('-').map(s => parseInt(s, 10)) as [number, number, number];
      date = new Date(yyyy, mm - 1, dd);
      date_start = new Date(date_start);
      date_stop = new Date(date_stop);
      return {...datum, date, date_start, date_stop};
    })),
  );

  dates$ = this.weekOf$.pipe(
    map(date => {
      date = new Date(date);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - date.getDay());
      const dates = [];
      for (let i = 0; i < 7; i++) {
        date = new Date(date);
        dates.push(date);
        date.setDate(date.getDate() + 1);
      }
      return dates;
    }),
  );

  constructor(
    public fb: FormBuilder,
    public userService: UserService,
    public apollo: Apollo) { }

  ngOnInit(): void {
  }

}
