import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { group } from 'd3-array';
import { of, ReplaySubject } from 'rxjs';
import { debounceTime, withLatestFrom, switchMap, takeUntil } from 'rxjs/operators';

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
      return this.http.get(`/api/data/weekly`, {params: {
        fromDate,
        toDate,
        bucketSize: '30',
      }});
    }),
    takeUntil(this.destroyed$),
  );

  constructor(public http: HttpClient) {
    super();
  }

  ngOnInit() {
    const toDate = new Date();
    const fromDate = d3.timeSunday.offset(d3.timeSunday.floor(toDate), -10);
    this.range$.next([fromDate, toDate]);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    const weekRowHeight = 80;
    const weekRowStep = 100;

    let {width, height} = this.el.nativeElement.getBoundingClientRect();
    const margin = {top: 40, right: 40, bottom: 40, left: 40};

    const now = new Date();
    const week = d3.timeSunday.floor(now);
    const weekRows = 10;

    const totalHeight = weekRowStep * weekRows;

    const g = this.svg.append('g');

    const callout = (s) => {

    };
    const bisector = d3.bisector((d: any) => d.date).left;
    const fmt = '%Y-%m-%d';
    const serialize = d3.timeFormat(fmt);
    const deserialize = d3.timeParse(fmt);

    const yScale = d3.scaleTime()
      .range([margin.top, totalHeight + margin.bottom]);

    const line = d3.line().curve(d3.curveStep);

    this.data$.pipe(withLatestFrom(this.range$)).subscribe(([data, range]: any) => {
      const xScale = d3.scaleLinear().domain([0, 10]).range([weekRowHeight, 0]);

      const bisect = mx => {
        const date = xScale.invert(mx);
        const index = bisector(data, date, 1);
        const a = data[index - 1];
        const b = data[index];
        return b && (date - a.date > b.date - date) ? b : a;
      };

      yScale.domain(range);
      line.y((d: any) => xScale(d.shifts.length));

      g.selectAll('g.week').data(Array.from(group(
        data.map(({date, ...r}) => ({ ...r, date: new Date(date) })),
        (d: any) => serialize(d3.timeSunday.floor(d.date)))).map(([key, value]) => {
          if (value.length > 0) {
            value.unshift({...value[0], shifts: []});
            value.push({...value[value.length - 1], shifts: []});
          }
          return [key, value];
        }), d => d[0])
      .join(s => s.append('g').classed('week', true).call(ss => {
        ss.append('path')
          .attr('fill', 'lightgrey')
          .attr('stroke', 'black');
        ss.append('g').classed('scale', true);
      }))
      .each(function(d: [string, any[]]) {
        // TODO: fix this
        const date = deserialize(d[0]);
        const s = d3.select(this)
          .attr('transform', `translate(0,${yScale(date)})`);

        const domain = [date, d3.timeSunday.offset(date, 1)];
        const scale = d3.scaleTime()
          .domain(domain)
          .range([margin.left, width - margin.right]);

        s.select('path').attr('d', line.x((dd: any) => scale(dd.date))(d[1]));

        s.select('.scale').attr('transform', `translate(0,${weekRowHeight})`).call(d3.axisBottom(scale));
      })
      .sort((a: any, b: any) => d3.ascending(a[0], b[0]))
      .on('mouseenter', d => console.log(d));

      g.on('touchmove mousemove', function() {
        const {date, value} = bisect(d3.mouse(this)[0]);

        // tooltip.attr("transform", `translate(${x(date)},${y(value)})`)

        });
      });

    this.resized$.pipe(debounceTime(500)).subscribe(() => {
      ({width, height} = this.el.nativeElement.getBoundingClientRect());
      g.selectAll('g.week').each(function(d) {
        const date = deserialize(d[0]);
        const s = d3.select(this)
          .attr('transform', `translate(0,${yScale(date)})`);

        const domain = [date, d3.timeSunday.offset(date, 1)];
        const scale = d3.scaleTime()
          .domain(domain)
          .range([margin.left, width - margin.right]);

        s.select('path').attr('d', line.x((dd: any) => scale(dd.date))(d[1]));
        s.select('.scale').attr('transform', `translate(0,${weekRowHeight})`).call(d3.axisBottom(scale));

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
