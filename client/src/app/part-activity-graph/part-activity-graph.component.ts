import {
  ChangeDetectionStrategy,
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { group } from 'd3-array';
import * as d3 from 'd3';
import {
  multicast,
  debounceTime,
  throttleTime,
  startWith,
  tap,
  pluck,
  map,
  switchMap,
  skipUntil,
  refCount,
  withLatestFrom,
} from 'rxjs/operators';

import { BaseGraphComponent } from '../base-graph/base-graph.component';
import { ReplaySubject, Observable, range } from 'rxjs';
import { MachinesGridComponent } from '../machines-page/machines-page.component';

interface Employee {
  code: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  hire_date: string;
  color: string;
}

interface Records {
  employees: Employee[];
}

interface FormValue {
  minDate: Date;
  maxDate: Date;
  fields: { id: string; checked: boolean }[];
}

interface Sample {
  machine_id: string;
  timestamp: number;
  value: string;
  property: string;
  offset: number;
}

const query = gql`
  query {
    employees {
      code
      last_name
      middle_name
      first_name
      hire_date
      color
    }
  }
`;

const initQuery = gql`
  query {
    minval: machine_state(limit: 1, order_by: { timestamp: asc }) {
      timestamp
    }
    maxval: machine_state(limit: 1, order_by: { timestamp: desc }) {
      timestamp
    }
    properties: machine_state(distinct_on: property) {
      property
    }
  }
`;

const machineStateQuery = gql`
  query($fields: [String!], $minDate: bigint, $maxDate: bigint) {
    machine_state(
      where: {
        _and: {
          timestamp: { _gte: $minDate, _lt: $maxDate }
          property: { _in: $fields }
        }
      }
    ) {
      timestamp
      value
      machine_id
      offset
      property
    }
  }
`;

@Component({
  selector: 'app-part-activity-graph',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      Available data: {{ minDate.value | date }} - {{ maxDate.value | date }}
    </div>
    <div>
      <button mat-stroked-button [matMenuTriggerFor]="menu">
        Fields <mat-icon>expand_more</mat-icon>
      </button>
    </div>
    <mat-menu #menu>
      <form [formGroup]="form" *ngIf="fields">
        <ng-container formArrayName="fields">
          <div mat-menu-item>
            <mat-checkbox
              [checked]="allChecked"
              [indeterminate]="someChecked()"
              (change)="checkAll($event.checked)"
            >
              All
            </mat-checkbox>
          </div>
          <div
            mat-menu-item
            *ngFor="let each of fields.controls; let i = index"
            [formGroupName]="i"
          >
            <mat-checkbox
              (click)="$event.stopPropagation()"
              formControlName="checked"
            >
              {{ each.get('id').value }}
              <span
                class="circle"
                [ngStyle]="getFieldColor(each.get('id').value)"
              ></span>
            </mat-checkbox>
          </div>
        </ng-container>
      </form>
    </mat-menu>
    <svg #svg></svg>
  `,
  styleUrls: ['./part-activity-graph.component.scss'],
})
export class PartActivityGraphComponent extends BaseGraphComponent
  implements OnInit, AfterViewInit {
  colorScale: d3.ScaleOrdinal<string, unknown>;

  form = this.fb.group({
    minDate: [],
    maxDate: [],
    fields: this.fb.array([]),
  });

  absMinDate: Date;
  absMaxDate: Date;

  get minDate() {
    return this.form.get('minDate') as FormControl;
  }

  get maxDate() {
    return this.form.get('maxDate') as FormControl;
  }

  get fields() {
    return this.form.get('fields') as FormArray;
  }

  init$ = this.apollo
    .query({ query: initQuery })
    .pipe(multicast(new ReplaySubject(1)), refCount());

  data$ = this.http.get(`/api/data/part-activity`);

  employees$ = this.apollo
    .query<Records>({ query })
    .pipe(pluck('data', 'employees'));

  constructor(
    public fb: FormBuilder,
    public http: HttpClient,
    public apollo: Apollo
  ) {
    super();
  }

  get allChecked() {
    return this.fields.value.every((v) => v.checked);
  }

  someChecked() {
    return this.fields.value.some((v) => v.checked) && !this.allChecked;
  }

  checkAll(checkAll: boolean) {
    for (const control of this.fields.controls) {
      control.patchValue({ checked: checkAll });
    }
  }

  getFieldColor(property: string) {
    return { 'background-color': this.colorScale(property) };
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    const g = this.svg.append('g');
    const bg = g.append('rect').attr('fill', 'transparent');
    const x = this.svg.append('g');

    const DEFAULT_EXCLUDE = ['block'];
    this.init$
      .pipe(pluck('data'))
      .subscribe(({ minval, maxval, properties }) => {
        const fields = properties.map((v) => v.property);
        this.colorScale = d3
          .scaleOrdinal()
          .domain(d3.shuffle(fields))
          .range(d3.quantize(d3.interpolateSinebow, properties.length));

        this.absMinDate = new Date(minval[0].timestamp);
        this.absMaxDate = new Date(maxval[0].timestamp);
        const [minDate, maxDate] = [
          this.absMinDate,
          d3.timeHour.offset(this.absMinDate, 12),
        ];
        this.form.patchValue({ minDate, maxDate });
        this.form.setControl(
          'fields',
          this.fb.array(
            fields.sort(d3.ascending).map((property) =>
              this.fb.group({
                id: [property],
                checked: [!DEFAULT_EXCLUDE.includes(property)],
              })
            )
          )
        );
      });

    const margin = {
      top: 20,
      right: 40,
      bottom: 20,
      left: 40,
    };

    const fields$ = this.init$.pipe(
      pluck('data', 'properties'),
      map((v) => v.map((vv) => vv.property))
    );

    const form$: Observable<FormValue> = this.form.valueChanges.pipe(
      startWith(this.form.value)
    );

    const range$ = form$.pipe(
      map(({ minDate, maxDate }) => [minDate, maxDate])
    );

    let xScale = d3.scaleTime();
    const xAxis = d3.axisBottom(xScale);

    const zoom = d3.zoom();

    this.svg.call(zoom);

    this.init$
      .pipe(
        switchMap(() =>
          this.form.valueChanges.pipe(
            debounceTime(1000),
            startWith(this.form.value),
            map(({ fields, minDate, maxDate }) => {
              const window = [minDate, d3.timeHour.offset(minDate, 12)].map(
                (d) => +d
              );
              const variables = {
                fields: fields.filter((v) => v.checked).map((v) => v.id),
                minDate: window[0],
                maxDate: window[1],
              };
              return variables;
            }),
            switchMap((variables) =>
              this.apollo.query<{ machine_state: Sample[] }>({
                query: machineStateQuery,
                variables,
              })
            ),
            pluck('data', 'machine_state')
          )
        ),
        map((values) => values.map(parseValue)),
        withLatestFrom(range$, fields$)
      )
      .subscribe(([values, range, fields]) => {
        const byMachine = Array.from(group(values, (d) => d.machine_id));

        const { width, height } = this.svg.node().getBoundingClientRect();
        bg.attr('width', width).attr('height', height);

        xScale.domain(range).range([margin.left, width - margin.right]);

        x.call(xAxis).attr(
          'transform',
          `translate(0,${byMachine.length * 80})`
        );

        const groups = g
          .selectAll('g')
          .data(byMachine, (d) => d[0])
          .join('g')
          .attr('transform', (d, i) => `translate(0,${i * 80})`);

        groups
          .selectAll('g')
          .data((d) => d[1])
          .join((s) =>
            s.append('g').call((ss) =>
              ss
                .append('circle')
                .attr('r', 2)
                .attr('cy', 80 / 2)
            )
          )
          .attr('transform', (d) => `translate(${xScale(d.timestamp)},0)`)
          .select('circle')
          .attr('fill', (d) => this.colorScale(d.property as any) as string);

        zoom.on('zoom', () => {
          xScale = d3.event.transform.rescaleX(xScale);
          x.call(xAxis.scale(xScale));
          groups
            .selectAll('g')
            .attr(
              'transform',
              (d: any) => `translate(${xScale(d.timestamp)},0)`
            );
        });
      });

    /*
    this.data$.subscribe((data: any[]) => {
      const grouped = (group as any)(data.map(({
        machine_id,
        part_count,
        timestamp,
        next_timestamp,
        part_count_timestamp,
        part_count_prev_timestamp,
      }) => ({
        machine_id,
        part_count: parseInt(part_count, 10),
        timestamp: timestamp && new Date(timestamp),
        next_timestamp: next_timestamp && new Date(next_timestamp),
        part_count_timestamp: part_count_timestamp && new Date(part_count_timestamp),
        part_count_prev_timestamp: part_count_prev_timestamp && new Date(part_count_prev_timestamp),
      })), d => d.machine_id, d => d.part_count);
    });
    */
  }
}

function parseValue({ timestamp, value, property, ...props }: Sample) {
  let parsedValue: any = value;
  switch (property) {
    case 'part_count':
    case 'line':
      parsedValue = parseInt(value, 10);
      break;
  }
  return {
    ...props,
    timestamp: new Date(timestamp),
    property,
    value: parsedValue,
  };
}
