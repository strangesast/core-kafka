import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { group } from 'd3-array';
import { of, ReplaySubject } from 'rxjs';
import { withLatestFrom, switchMap, takeUntil } from 'rxjs/operators';

import { BaseGraphComponent } from '../base-graph/base-graph.component';

@Component({
  selector: 'app-weekly-shift-graph',
  template: `<svg #svg></svg>`,
  styleUrls: ['../base-graph/base-graph.component.scss'],
})
export class WeeklyShiftGraphComponent extends BaseGraphComponent implements AfterViewInit, OnInit {

  range$ = new ReplaySubject<[Date, Date]>(1);

  data$ = this.range$.pipe(
    switchMap(arg => {
      const [fromDate, toDate] = arg.map(d => d.toISOString());
      return this.http.get(`/api/data/weekly`, {params: {fromDate, toDate}});
    }),
    takeUntil(this.destroyed$),
  );

  constructor(public http: HttpClient) {
    super();
  }

  ngOnInit() {
    const toDate = d3.timeWeek.ceil(new Date());
    const fromDate = d3.timeWeek.offset(toDate, -10);
    this.range$.next([fromDate, toDate]);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    const weekRowHeight = 80;
    const weekRowStep = 100;

    const {width, height} = this.el.nativeElement.getBoundingClientRect();
    const margin = {top: 40, right: 40, bottom: 40, left: 40};

    const now = new Date();
    const week = d3.timeWeek.floor(now);
    const weekRows = 10;

    const totalHeight = weekRowStep * weekRows;

    const g = this.svg.append('g');

    const callout = (s) => {

    };
    const bisector = d3.bisector((d: any) => d.date).left;

    this.data$.pipe(withLatestFrom(this.range$)).subscribe(([data, range]: any) => {
      const xScale = d3.scaleLinear().domain([0, 10]).range([weekRowHeight, 0]);

      const bisect = mx => {
        const date = xScale.invert(mx);
        const index = bisector(data, date, 1);
        const a = data[index - 1];
        const b = data[index];
        return b && (date - a.date > b.date - date) ? b : a;
      };


      const yScale = d3.scaleTime()
        .range([margin.top, totalHeight + margin.bottom])
        .domain(range);

      const line = d3.line().curve(d3.curveStep).y((d: any) => xScale(d.shifts.length));

      g.selectAll('g').data(Array.from(group(
        data.map(({date, ...r}) => ({ ...r, date: new Date(date) })),
        (d: any) => stringifyDate(d3.timeWeek.floor(d.date))
      )), d => d[0]).join(
        enter => enter.append('g').call(s => s.append('path')
          .attr('fill', 'lightgrey')
          .attr('stroke', 'black')
        )
      )
      .each(function(d) {
        const date = unstringifyDate(d[0]);
        const s = d3.select(this)
          .attr('transform', `translate(0,${yScale(date)})`);

        const domain = [date, d3.timeWeek.offset(date, 1)];
        const scale = d3.scaleTime()
          .domain(domain)
          .range([margin.left, width - margin.right]);

        d[1].unshift({...d[1][0], shifts: []});
        d[1].push({...d[1][d[1].length - 1], shifts: []});
        s.select('path').attr('d', line.x((dd: any) => scale(dd.date))(d[1]));
      }).sort((a, b) => d3.ascending(a[0], b[0]));

      g.on('touchmove mousemove', function() {
        const {date, value} = bisect(d3.mouse(this)[0]);

        // tooltip.attr("transform", `translate(${x(date)},${y(value)})`)

        });
      });

  }

}

function unstringifyDate(s): Date {
  const [y, m, d] = s.split('-').map(ss => parseInt(ss, 10));
  return new Date(y, m - 1, d);
}

function stringifyDate(date: Date): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
}
