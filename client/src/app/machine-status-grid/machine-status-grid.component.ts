import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, pluck } from 'rxjs/operators';

const query = gql`
  subscription {
    machine_execution_state(distinct_on: machine_id, order_by: {machine_id: asc, timestamp: desc}) {
      machine_id
      timestamp
      value
    }
  }
`;


@Component({
  selector: 'app-machine-status-grid',
  template: `
  <div *ngFor="let each of data$ | async" [ngClass]="each.value.toLowerCase()">
    <h1>{{each.machine_id}}</h1>
    <p>Since {{each.timestamp | date:'short'}}</p>
  </div>
  `,
  styleUrls: ['./machine-status-grid.component.scss']
})
export class MachineStatusGridComponent implements OnInit {

  data$ = this.apollo.subscribe({query}).pipe(
    pluck('data', 'machine_execution_state'),
    map((arr: any[]) => arr.map(({machine_id, timestamp, value}) => ({
      value,
      machine_id,
      timestamp: new Date(timestamp.endsWith('+00:00') ? timestamp.slice(0, -6) + 'Z' : timestamp),
    }))),
  );

  constructor(public apollo: Apollo) {}

  ngOnInit(): void {
  }

}
