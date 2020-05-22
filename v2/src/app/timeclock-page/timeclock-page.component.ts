import { ViewChild, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';


interface Record {
  name: string;
  start: string;
  end: string;
  total: string;
  weekly_total: string;
}


@Component({
  selector: 'app-timeclock-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/timeclock']">Timeclock</a>
  </app-page-title>
  <header>
    <h1>3 Clocked In <small>(As of 15:00)</small></h1>
    <p>34 Total Hours Today</p>
  </header>
  <div class="controls">
    <app-timeclock-datepicker [(ngModel)]="window"></app-timeclock-datepicker>
    <mat-button-toggle-group [(ngModel)]="activeView">
      <mat-button-toggle value="timeline" aria-label="Timeline" title="Timeline">
        <mat-icon>clear_all</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="table" aria-label="Table" title="Table">
        <mat-icon>list</mat-icon>
      </mat-button-toggle>
    </mat-button-toggle-group>
  </div>
  <ng-container [ngSwitch]="activeView">
    <app-timeclock-table [dataSource]="dataSource" *ngSwitchCase="'table'"></app-timeclock-table>
    <app-timeclock-staggered [dataSource]="dataSource" *ngSwitchCase="'timeline'"></app-timeclock-staggered>
  </ng-container>
  `,
  styleUrls: ['../base.scss', './timeclock-page.component.scss'],
})
export class TimeclockPageComponent implements OnInit {
  // @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  activeView = 'table';
  displayedColumns = ['name', 'start', 'end', 'total', 'weekly_total'];
  window = new Date();
  data = [
    {id: '0', name: 'Person 1', start: '8:00', end: '4:00', total: '8hrs', weekly_total: '16hrs'},
    {id: '0', name: 'Person 1', start: '8:00', end: '4:00', total: '8hrs', weekly_total: '16hrs'},
    {id: '0', name: 'Person 1', start: '8:00', end: '4:00', total: '8hrs', weekly_total: '16hrs'},
    {id: '0', name: 'Person 1', start: '8:00', end: '4:00', total: '8hrs', weekly_total: '16hrs'},
    {id: '0', name: 'Person 1', start: '8:00', end: '4:00', total: '8hrs', weekly_total: '16hrs'},
    {id: '0', name: 'Person 1', start: '8:00', end: '4:00', total: '8hrs', weekly_total: '16hrs'},
    {id: '0', name: 'Person 1', start: '8:00', end: '4:00', total: '8hrs', weekly_total: '16hrs'},
    {id: '0', name: 'Person 1', start: '8:00', end: '4:00', total: '8hrs', weekly_total: '16hrs'},
  ];

  dataSource: MatTableDataSource<Record>;

  constructor() {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngOnInit(): void {
    // this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
