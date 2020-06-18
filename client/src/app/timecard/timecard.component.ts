import { SimpleChanges, OnChanges, Input, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { of, BehaviorSubject, ReplaySubject } from 'rxjs';
import { pluck, startWith, multicast, refCount, map, switchMap, publishBehavior } from 'rxjs/operators';

const query = gql`
  query MyQuery($min: timestamp, $max: timestamp, $employeeId: Int) {
    timeclock_shifts(where: {_and: [{date_start: {_gte: $min}}, {_or: [{date_stop: {_lt: $max}}, {date_stop: {_is_null: true}}]}, {employee_id: {_eq: $employeeId}}]}, order_by: {date: asc}) {
      date
      date_stop
      date_start
    }
  }
`;

@Component({
  selector: 'app-timecard',
  template: `
  <div class="header">
    <form [formGroup]="form">
      <button mat-icon-button (click)="decrementWeek()"><mat-icon>chevron_left</mat-icon></button>
      <div class="select">
        <mat-select #select formControlName="week" required>
          <mat-option *ngFor="let week of weeks$ | async" [value]="week">{{formatWeekText(week)}}</mat-option>
        </mat-select>
        <button mat-stroked-button (click)="select.open()" class="select">{{formatWeekText(form.get('week').value)}}</button>
      </div>
      <button mat-icon-button (click)="incrementWeek()"><mat-icon>chevron_right</mat-icon></button>
    </form>
    <div class="timecard">
      <ng-container *ngFor="let datum of data$ | async">
        <div class="date">
          <span class="dow">{{formatDay(datum.date)}}</span>
          <span>{{datum.date.getMonth()}}/{{datum.date.getDate()}}</span>
        </div>
        <div><span *ngFor="let shift of datum.shifts">{{shift | json}}</span></div>
      </ng-container>
    </div>
  </div>
  `,
  styleUrls: ['./timecard.component.scss']
})
export class TimecardComponent implements OnInit, OnChanges {
  @Input()
  employeeId: string;

  employeeId$ = new ReplaySubject<string>(1);

  thisWeek = (() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay());
    return date;
  })();

  weeks$ = this.http.get('/', {responseType: 'text'}).pipe(
    switchMap(res => of(null)),
    map(() => {
      const arr = [];
      let date = new Date(this.thisWeek);
      do {
        arr.unshift(serializeDate(date));
        date = new Date(date);
        date.setDate(date.getDate() - 7);
      } while (arr.length < 10);
      console.log('arr', arr);
      return arr;
    }),
    publishBehavior([]),
    refCount(),
  );

  form = this.fb.group({week: [serializeDate(this.thisWeek)]});

  week$ = this.form.get('week').valueChanges.pipe(startWith(this.form.get('week').value));

  data$ = this.employeeId$.pipe(
    switchMap(employeeId => this.week$.pipe(
      switchMap(week => {
        const min = parseDate(week);
        const max = new Date(week);
        max.setDate(max.getDate() + 7);
        const variables = {min: min.toISOString(), max: max.toISOString(), employeeId};
        console.log(variables);
        return this.apollo.query({query, variables}).pipe(
          pluck('data', 'timeclock_shifts'),
          map((data: any[]) => {
            const byDate = [];

            const days = [];
            for (let i = 0; i < 7; i++) {
              const date = new Date(min);
              date.setDate(date.getDate() + i);
              byDate.push({date, shifts: []});
              days.push(serializeDate(date));
            }
            for (const each of data) {
              console.log(each.date, days);
              const i = days.indexOf(each.date);
              if (i > -1) {
                byDate[i].shifts.push(each);
              }
            }
            return byDate;
          }),
        );
      }))
    ),
  );

  constructor(public apollo: Apollo, public fb: FormBuilder, public http: HttpClient) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('employeeId' in changes) {
      this.employeeId$.next(changes.employeeId.currentValue);
    }
  }

  incrementWeek() {
    const week = this.form.get('week').value;
    const weeks = (this.weeks$ as any).source.getSubject().getValue();
    const i = weeks.indexOf(week);
    if (i < weeks.length - 1) {
      this.form.patchValue({week: weeks[i + 1]});
    }
  }

  decrementWeek() {
    const week = this.form.get('week').value;
    const weeks = (this.weeks$ as any).source.getSubject().getValue();
    const i = weeks.indexOf(week);
    if (i > 0) {
      this.form.patchValue({week: weeks[i - 1]});
    }
  }

  formatWeekText(week: string) {
    const sun = parseDate(week);
    sun.setDate(sun.getDate() - sun.getDay());
    const sat = new Date(sun);
    sat.setDate(sat.getDate() + 6);
    return `Week of ${sun.getMonth() + 1}/${sun.getDate()} - ${sat.getMonth() + 1}/${sat.getDate()}${week === serializeDate(this.thisWeek) ? ' (this week)' : ''}`;
  }

  formatDay(date: Date) {
    return date.toLocaleDateString('en-us', {weekday: 'short'});
  }
}

function serializeDate(date: Date): string {
  return [date.getFullYear(), ('0' + (date.getMonth() + 1)).slice(-2), ('0' + date.getDate()).slice(-2)].join('-');
}

function parseDate(str: string): Date {
  const [yyyy, mm, dd] = str.split('-').map(s => parseInt(s, 10));
  return new Date(yyyy, mm - 1, dd);
}
