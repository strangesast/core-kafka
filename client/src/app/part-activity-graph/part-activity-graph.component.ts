import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { group } from 'd3-array';
import * as d3 from 'd3';

import { BaseGraphComponent } from '../base-graph/base-graph.component';

@Component({
  selector: 'app-part-activity-graph',
  template: `
  <svg #svg></svg>
  `,
  styleUrls: ['./part-activity-graph.component.scss']
})
export class PartActivityGraphComponent extends BaseGraphComponent implements OnInit, AfterViewInit {
  data$ = this.http.get(`/api/data/part-activity`);

  constructor(public http: HttpClient) {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    this.data$.subscribe((data: any[]) => {
      console.log(data);

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
      console.log(grouped);
    });
  }

}
