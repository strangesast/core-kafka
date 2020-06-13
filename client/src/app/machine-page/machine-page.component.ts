import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, ReplaySubject, of } from 'rxjs';
import { startWith, map, pluck, switchMap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as d3 from 'd3';
import { Selection } from 'd3';


const query = gql`
  query ExecutionState($machineID: String = "unknown", $minDate: String!, $maxDate: String!) {
    machine_execution_state(where: {_and: {machine_id: {_eq: $machineID}, timestamp: {_gte: $minDate, _lt: $maxDate}}}, order_by: {timestamp: asc}) {
      value
      timestamp
    }
  }
`;

const allQuery = gql`
  query ExecutionState($machineID: String = "unknown") {
    machine_execution_state(where: {machine_id: {_eq: $machineID}}) {
      value
      timestamp
    }
  }
`;

interface Record {
  id: string;
  name: string;
}

@Component({
  selector: 'app-machine-page',
  template: `
  <form [formGroup]="form">
    <mat-button-toggle-group name="interval" aria-label="Time Interval" formControlName="interval">
      <mat-button-toggle value="all">All</mat-button-toggle>
      <mat-button-toggle value="day">Last Day</mat-button-toggle>
      <mat-button-toggle value="4hour">Last 4 Hours</mat-button-toggle>
      <mat-button-toggle value="hour">Last Hour</mat-button-toggle>
    </mat-button-toggle-group>
  </form>
  <svg #svg></svg>
  <!--
  <ng-container *ngIf="machine$ | async as machine; else loading">
    <app-page-title>
      <a routerLink="/machines">Machines</a> / <a [routerLink]="['/machines', machine.id]">{{machine.name}}</a>
    </app-page-title>
    <header>
      <h1>{{machine.name}}</h1>
      <p>4% Utilization this Week</p>
    </header>
    <mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="order">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Order </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/orders', cell.order]"> {{cell.order}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="part">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Part </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/people', cell.part]"> {{cell.part}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="qty">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Qty </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.qty}} </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
    <mat-paginator [hidePageSize]="true"></mat-paginator>
  </ng-container>
  <ng-template #loading>Loading...</ng-template>
  -->
  `,
  styleUrls: ['../base.scss', './machine-page.component.scss']
})
export class MachinePageComponent implements OnInit, AfterViewInit {
  @ViewChild('svg')
  el: ElementRef;

  form = this.fb.group({
    interval: ['all'],
  });

  svg: Selection<any, SVGElement, any, any>;

  xScale;
  xAxis;
  margin = {left: 0, right: 40, top: 20, bottom: 20};

  machineID$ = this.route.params.pipe(
    pluck('id'),
  );

  displayedColumns = ['order', 'part', 'qty'];
  dataSource: MatTableDataSource<any>;

  range$ = this.form.valueChanges.pipe(startWith(this.form.value), pluck('interval'), map(interval => {
    const now = new Date();
    switch (interval) {
      case 'hour':
        return [d3.timeHour.offset(now, -1), now];
      case '4hour':
        return [d3.timeHour.offset(now, -4), now];
      case 'day':
        return [d3.timeDay.offset(now, -1), now];
      default:
        return null;
    }
  }));

  data$ = combineLatest(
    this.machineID$.pipe(map(machineID => ({machineID}))),
    this.range$.pipe(map(range => ({range}))),
    (a, b) => ({...a, ...b}),
  ).pipe(
    switchMap(({machineID, range}) => this.apollo.query(range != null ?
      ({ query, variables: { machineID, minDate: range[0], maxDate: range[1] }}) :
      ({ query: allQuery, variables: { machineID }}))
    ),
    pluck('data', 'machine_execution_state'),
    map((data: any[]) => data.map(datum => {
      const {value, timestamp} = datum;
      return {value, timestamp: new Date(timestamp)};
    })),
  );

  constructor(
    public route: ActivatedRoute,
    public apollo: Apollo,
    public fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.svg = d3.select(this.el.nativeElement);
    this.data$.subscribe(data => this.draw(data));

    this.xScale = d3.scaleTime();

    this.svg.append('g').classed('x-axis', true).call(this.xAxis = d3.axisBottom(this.xScale));
  }

  draw(data) {
    const { width, height } = this.el.nativeElement.getBoundingClientRect();
    this.xScale.range([this.margin.left, width - this.margin.right]);

    data.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1);
    const domain = [data[0].timestamp, data[data.length - 1].timestamp];

    this.xScale.domain(domain);


    const arr = data.slice(0, -1).map((datum, i) => ({
      value: datum.value,
      x0: this.xScale(datum.timestamp),
      x1: this.xScale(data[i + 1].timestamp),
    }));

    this.svg.selectAll('rect').data(arr).join('rect')
      .attr('height', 40)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('x', (d: any) => d.x0)
      .attr('fill', (d: any) => stateColor(d.value))
      .on('mouseenter', function(d) {
        const s = d3.select(this);
        s.attr('opacity', 0.5);
      })
      .on('mouseleave', function(d) {
        const s = d3.select(this);
        s.attr('opacity', 1);
      });

    this.svg.select('g.x-axis').attr('transform', `translate(0,${42})`).call(this.xAxis);

  }
}

function stateColor(state: string) {
  switch (state) {
    case 'ACTIVE':
      return 'green';
    case 'READY':
      return 'yellow';
    case 'STOPPED':
      return 'red';
    default:
      return 'blue';
  }
}
