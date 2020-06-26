import { AfterViewInit, OnDestroy, ViewChild, ElementRef, Component, OnInit } from '@angular/core';
import { Selection } from 'd3';
import * as d3 from 'd3';
import { group } from 'd3-array';
import { combineLatest, ReplaySubject, Subject } from 'rxjs';
import { withLatestFrom, switchMap, pluck, tap, map, takeUntil } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { BaseGraphComponent } from '../base-graph/base-graph.component';


const machinesQuery = gql`
  query {
    machine_execution_state(order_by: {machine_id: asc, timestamp: desc}, distinct_on: machine_id) {
      machine_id
      timestamp
      value
    }
  }
`;

const query = gql`
  query ($from: timestamptz, $to: timestamptz) {
    machine_execution_state(where: {_and: [{timestamp: {_gte: $from}}, {_or: [{next_timestamp: {_is_null: true}}, {next_timestamp: {_lt: $to}}]}]}, order_by: {timestamp: asc}) {
      machine_id
      timestamp
      next_timestamp
      offset
      value
    }
    bounds: machine_execution_state(distinct_on: machine_id, order_by: {machine_id: asc, timestamp: asc}, where: {_and: [{next_timestamp: {_gt: $from}}, {timestamp: {_lte: $from}}]}) {
      machine_id
      timestamp
      next_timestamp
      offset
      value
    }
  }
`;


@Component({
  selector: 'app-machine-activity-graph',
  template: `<svg #svg></svg>`,
  styleUrls: ['../base-graph/base-graph.component.scss'],
})
export class MachineActivityGraphComponent extends BaseGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('svg') el: ElementRef;
  range$ = new ReplaySubject(1);

  variables$ = this.range$.pipe(map(([fromDate, toDate]) => ({from: fromDate.toISOString(), to: toDate.toISOString()})));

  machines$ = this.apollo.query({query: machinesQuery}).pipe(pluck('data', 'machine_execution_state'));

  data$ = combineLatest(
    this.machines$,
    this.variables$.pipe(
      switchMap(variables => this.apollo.query({query, variables})),
      pluck('data'),
      withLatestFrom(this.range$),
      map(([{machine_execution_state, bounds}, range]: any) => {
        const arr = machine_execution_state.map(({machine_id, next_timestamp, timestamp, offset, value}) => ({
          timestamp: timestamp && new Date(timestamp.endsWith('+00:00') ? timestamp.slice(0, -6) + 'Z' : timestamp),
          next_timestamp: next_timestamp ?
            new Date(next_timestamp.endsWith('+00:00') ? next_timestamp.slice(0, -6) + 'Z' : next_timestamp) :
            new Date(),
          offset,
          machine_id,
          value,
        }));
        const grouped = group(arr, (d: any) => d.machine_id);
        const boundsByKey = bounds.reduce((acc, val) => ({...acc, [val.machine_id]: val.value}), {});
        for (const [key, each] of grouped) {
          each.unshift({...each[0], timestamp: range[0], next_timestamp: each[0].timestamp, value: boundsByKey[key]});
        }
        return grouped;
      })
    ),
  ).pipe(map(([machines, machineValues]: any) => machines.map(({timestamp, machine_id, value}) => ({
    machine_id,
    data: machineValues.get(machine_id),
    lastTimestamp: timestamp,
    lastValue: value,
  }))));

  constructor(public apollo: Apollo) {
    super();
  }

  ngOnInit(): void {
    const now = new Date();
    const fromDate = d3.timeHour.floor(d3.timeHour.offset(now, -12));
    const toDate = now;
    this.range$.next([fromDate, toDate]);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    const margin = {top: 40, left: 40, right: 40, bottom: 40};
    const { width, height } = this.el.nativeElement.getBoundingClientRect();
    const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
    const xAxis = d3.axisBottom(xScale);

    const gx = this.svg.append('g');

    const g = this.svg.append('g');

    this.data$.pipe(withLatestFrom(this.range$), takeUntil(this.destroyed$)).subscribe(([data, range]: [any[], any]) => {
      xScale.domain(range);
      gx.attr('transform', `translate(0,${data.length * 70 + margin.top})`).call(xAxis);

      g.selectAll('g').data(data).join(
        s => s.append('g').call(ss => {
          ss.append('g').classed('values', true).attr('transform', `translate(0,${20})`);
          ss.append('g').classed('text', true).attr('transform', `translate(${margin.left},0)`).call(sss => sss.append('text'));
        }),
      )
        .attr('transform', (d, i) => `translate(0,${margin.top + i * 70})`)
        .call(s => s.select('.text').select('text')
          .attr('alignment-baseline', 'hanging')
          .text(d => d.machine_id)
        )
        .select('g.values').selectAll('g').data(d => d.data).join(
          s => s.append('g').call(ss => {
            ss.append('rect').attr('height', 40);
          })
        )
        .attr('transform', (d: any) => `translate(${xScale(d.timestamp)},0)`)
        .select('rect')
          .attr('width', (d: any) => xScale(d.next_timestamp) - xScale(d.timestamp))
          .attr('fill', (d: any) => {
            switch (d.value) {
              case 'ACTIVE':
                return 'green';
              case 'STOPPED':
                return 'red';
              case 'READY':
                return 'yellow';
              case 'INTERRUPTED':
                return 'blue';
              default:
                return 'lightgrey';
            }
          });
    });
  }
}
