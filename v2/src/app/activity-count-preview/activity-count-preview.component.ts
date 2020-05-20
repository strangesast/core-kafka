import { ViewChild, ElementRef, Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { deserialize } from 'bson';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap, switchMap, map } from 'rxjs/operators';
import * as d3 from 'd3';

@Component({
  selector: 'app-activity-count-preview',
  template: `<svg [attr.viewBox]="viewBox" #svg></svg>`,
  styleUrls: ['./activity-count-preview.component.scss']
})
export class ActivityCountPreviewComponent implements OnInit, OnDestroy, AfterViewInit {
  width = 40;
  height = 12;

  get viewBox() {
    return `0 0 ${this.width} ${this.height}`;
  }

  @ViewChild('svg') svg: ElementRef;

  yScale = d3.scaleLinear().range([this.height, 0]);
  xScale = d3.scaleTime().range([0, this.width]);

  line = d3.line().curve(d3.curveStep)
    .x((d: any) => this.xScale(d.date))
    .y((d: any) => this.yScale(d.count));

  constructor(public http: HttpClient) { }

  destroy$ = new Subject();

  now$ = new BehaviorSubject(new Date());

  data$: Observable<{data: {count: number, date: Date}[]}> = this.now$.pipe(switchMap(now => {
    const maxDate = now;
    const minDate = d3.timeHour.offset(maxDate, -6);
    const params = {
      minDate: minDate.toISOString(),
      maxDate: maxDate.toISOString(),
    };
    const headers = {Accept: 'application/bson'};

    return this.http.get(`/api/data/weekly`, {headers, params, responseType: 'arraybuffer'}).pipe(
      map(b => deserialize(new Uint8Array(b))),
    );
  }));

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const svg = d3.select(this.svg.nativeElement);
    const path1 = svg.append('path').attr('fill', 'none').attr('stroke', 'black');
    const path2 = svg.append('path').attr('fill', 'lightgrey');
    this.data$.pipe(
      takeUntil(this.destroy$),
      tap(v => {
        let { data } = v;
        data.sort((a, b) => d3.ascending(a.date, b.date));
        data = [...data, {date: new Date(), count: data[data.length - 1].count}];

        const d2 = [{count: 0, date: data[0].date}, ...data, {count: 0, date: data[data.length - 1].date}];

        let domain: [any, any];
        domain = d3.extent(data, e => e.date);
        this.xScale.domain(domain);

        domain = [0, 12];
        this.yScale.domain(domain);
        path1.attr('d', this.line(data as any[]));
        path2.attr('d', this.line(d2 as any[]));
      }),
    ).subscribe();
  }
}
