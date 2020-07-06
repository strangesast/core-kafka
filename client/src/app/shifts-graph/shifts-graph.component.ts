import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { group } from 'd3-array';
import * as d3 from 'd3';

import { BaseGraphComponent } from '../base-graph/base-graph.component';
import { stringify } from 'querystring';

@Component({
  selector: 'app-shifts-graph',
  template: `<svg #svg></svg>`,
  styleUrls: ['./shifts-graph.component.scss'],
})
export class ShiftsGraphComponent extends BaseGraphComponent implements OnInit, AfterViewInit {
  constructor(public http: HttpClient) {
    super();
  }

  ngOnInit() {}

  ngAfterViewInit() {
    super.ngAfterViewInit();

    this.http.get<{date: string, date_stop: string, date_start: string}[]>(`/api/data/shifts`).pipe(
      map(data => data.map(({date, date_start, date_stop, ...props}) => ({
        date: new Date(date),
        date_start: new Date(date_start),
        date_stop: new Date(date_stop),
        ...props,
      }))),
    ).subscribe(v => {
      const data = Array.from(group(v, d => d.shift_num));
      console.log(data);
    });
  }
}
