import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseGraphComponent } from '../base-graph/base-graph.component';
import { takeUntil } from 'rxjs/operators';
import * as d3 from 'd3';
import { group } from 'd3-array';


@Component({
  selector: 'app-machine-cycle-analysis-graph',
  template: `<svg #svg></svg>`,
  styleUrls: ['../base-graph/base-graph.component.scss'],
})
export class MachineCycleAnalysisGraphComponent extends BaseGraphComponent implements OnInit, AfterViewInit {
  data$ = this.http.get(`/api/data/recent-data`).pipe(takeUntil(this.destroyed$));

  constructor(public http: HttpClient) {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    this.data$.subscribe((data: any[]) => {
      const groups = (group as any)(data.map(({machine_id, offset, property, r, timestamp, value}) => ({
        machine_id,
        property,
        value,
        offset: parseInt(offset, 10),
        r: parseInt(r, 10),
        timestamp: new Date(timestamp),
      })), d => d.machine_id, d => d.r, d => d.property);

      const {width, height} = this.el.nativeElement.getBoundingClientRect();

      const margin = {top: 40, left: 40, right: 40, bottom: 40};
      const eachHeight = 100;
      const eachWidth = width / groups.size;
      const padding = 80;

      const keys = ['Xload', 'Zload', 'S1load'];
      const colors = (Object as any).fromEntries(keys.map((k, i) => ([k, d3.schemeSet1[i]])));

      const legendHeight = 20;

      this.svg.style('height', `${eachHeight * 20 + margin.top + legendHeight + margin.bottom}px`);

      this.svg.append('g').selectAll('g').data(Object.entries(colors)).join(
        s => s.append('g').attr('transform', (d, i) => `translate(${100 * i},${legendHeight / 2})`).call(ss => {
          ss.append('rect').attr('width', legendHeight).attr('height', legendHeight).attr('fill', (d: any) => d[1]);
          ss.append('text').attr('alignment-baseline', 'middle').attr('y', legendHeight / 2).attr('x', 24);
        })
        .call(ss => ss.select('text').text(d => d[0]))
      );

      const g = this.svg.append('g').attr('transform', `translate(0,${40})`);
      g.selectAll('g.machine').data(Array.from(groups), d => d[0])
        .join(s => s.append('g').classed('machine', true).call(ss => ss.append('text')
          .attr('text-anchor', 'middle')
          .attr('x', eachWidth / 2)
          .attr('y', 20))
        )
        .call(s => s.select('text').text(dd => dd[0]))
        .attr('transform', (d, i) => `translate(${(eachWidth) * i},0)`)
        .selectAll('g.cycle').data(d => Array.from(d[1]).sort((a, b) => a[0] > b[0] ? 1 : -1))
        .join(s => s.append('g').classed('cycle', true).call(ss => ss.append('text').attr('alignment-baseline', 'hanging').text(d => `Cycle ${d[0]}`)))
        .attr('transform', (d, i) => `translate(0,${eachHeight * i + margin.top})`)
        .each(function(d: any) {
          const s = d3.select(this);
          const extent = (d3.extent as any)(Array.from(d[1]).reduce((acc: any, dd: any) => acc.concat(dd[1]), []), dd => dd.timestamp);
          const xScale = d3.scaleTime().domain(extent).range([padding / 2, eachWidth - padding / 2]);

          s.selectAll('path').data(Array.from(d[1]).filter(dd => dd[0].endsWith('load')), dd => dd[0]).join(ss => ss.append('path')
            .attr('stroke', dd => colors[dd[0]])
            .attr('fill', 'none')
            .attr('class', dd => dd[0])
          ).each(function(dd: any) {
            const ss = d3.select(this);
            const arr = dd[1].map(ddd => ({...ddd, value: parseValue(ddd.property, ddd.value)}));
            const yExtent = d3.extent(arr, (ddd: any) => ddd.value) as any;
            const yScale = d3.scaleLinear().domain(yExtent).range([80, 0]);
            const line = d3.line().x((ddd: any) => xScale(ddd.timestamp)).y((ddd: any) => yScale(ddd.value));

            ss.attr('d', line(arr));
          });
        });
        // .selectAll('g.property').data(d => Array.from(d[1])).join(s => s.append('g').classed('property', true));
    });
  }
}

function parseValue(property: string, value: string) {
  switch (property) {
    case 'Zload':
    case 'Xload':
    case 'S1load':
      return parseInt(value, 10);
    default:
      return value;
  }
}
