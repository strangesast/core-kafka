import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ReplaySubject, combineLatest, of, interval } from 'rxjs';
import { withLatestFrom, multicast, refCount, map, pluck, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as d3 from 'd3';
import { group } from 'd3-array';

import { BaseGraphComponent } from '../base-graph/base-graph.component';

const query = gql`
  query ($minDate: bigint, $machineId: String) {
    machine_values(order_by: {timestamp: asc}, where: {_and: [{timestamp: {_gte: $minDate}}, {machine_id: {_eq: $machineId}}]}) {
      offset
      property
      timestamp
      value
    }
  }
`;


@Component({
  selector: 'app-machine-live-graph',
  template: `<svg #svg></svg>`,
  styleUrls: ['../base-graph/base-graph.component.scss'],
})
export class MachineLiveGraphComponent extends BaseGraphComponent implements OnInit, AfterViewInit {
  minDate$ = interval(30000).pipe(
    startWith(0),
    map(() => {
      const d = +new Date();
      return d - 60000;
    }),
    multicast(new ReplaySubject(1)),
    refCount(),
  );

  machine$ = of('doosan-gt2100m');

  variables$ = combineLatest(
    this.minDate$.pipe(map(minDate => ({minDate}))),
    this.machine$.pipe(map(machineId => ({machineId}))),
    (a, b) => ({...a, ...b}),
  );

  data$ = this.variables$.pipe(
    switchMap(variables => this.apollo.query({query, variables})),
    pluck('data', 'machine_values'),
    takeUntil(this.destroyed$),
  );

  constructor(public apollo: Apollo) {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    const margin = {top: 40, right: 40, bottom: 40, left: 40};
    const {width, height} = this.el.nativeElement.getBoundingClientRect();
    const xScale = d3.scaleTime().range([margin.left, width - margin.right]);

    this.svg.style('height', `${12 * 100}px`);

    this.data$.pipe(withLatestFrom(this.minDate$)).subscribe(([data, minDate]: any[]) => {
      const keys = [
        'Xload',
        'Zload',
        'S1load',
        'S1speed',
        'path_feedrate',
        'Xact',
        'Zact',
        // 'path_position',
      ];

      xScale.domain([minDate, new Date()]);

      const arr = data.map(({offset, property, value, timestamp}) => ({
        offset,
        property,
        value: parseValue(value, property),
        timestamp: new Date(timestamp),
      }));

      const grouped = group(arr, (d: any) => d.property);
      const now = new Date();

      const t = d3.transition().ease(d3.easeLinear).duration(30000);

      this.svg.selectAll('g').data(keys.map(key => [key, grouped.get(key) || []]), d => d[0]).join(
        s => s.append('g').call(ss => {
          ss.append('path')
            .attr('stroke', 'black')
            .attr('fill', 'none');
          ss.append('text').attr('alignment-baseline', 'hanging').attr('y', 4).text((d: any) => d[0]);
        }),
        s => s,
        s => s.exit().remove(),
      )
      .attr('transform', (d, i) => `translate(0,${i * 100})`)
      .each(function(d: any) {
        const s = d3.select(this);
        const domain = d3.extent(d[0] === 'path_position' ? d[1].reduce((a, b) => a.concat(b), []) : d[1], (dd: any) => dd.value) as any;
        const yScale = d3.scaleLinear().domain(domain).range([100, 0]);
        const line = d3.line().x((dd: any) => xScale(dd.timestamp)).y((dd: any) => yScale(dd.value));
        s.select('path').attr('d', line(d[1]));
      });

      this.svg.selectAll('g').select('path')
        .attr('transform', (d, i) => `translate(0,0)`)
        .transition(t)
        .attr('transform', (d, i) => `translate(${xScale(now) - xScale(d3.timeSecond.offset(now, 5))},0)`);
    });
  }
}

function parseValue(value: string, property: string) {
  switch (property) {
    case 'Xload':
    case 'Zload':
    case 'S1load':
    case 'S1speed':
    case 'path_feedrate':
      return parseInt(value, 10);
    case 'Xact':
    case 'Zact':
      return parseFloat(value);
    case 'path_position':
      return value.split(' ').map(s => parseFloat(s));
    default:
      throw new Error(`unexpected property: "${property}"`);
  }
}
