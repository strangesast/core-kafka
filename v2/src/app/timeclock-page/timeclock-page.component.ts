import { ViewChild, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
// import { MatPaginator } from '@angular/material/paginator';


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
  <mat-toolbar>
    <span>Timeclock</span>
  </mat-toolbar>
  <header>
    <h1>3 Clocked In <small>(As of 15:00)</small></h1>
    <p>34 Total Hours Today</p>
  </header>
  <div class="controls">
    <div class="window-controller">
      <button mat-icon-button><mat-icon>chevron_left</mat-icon></button>
      <span>{{ window?.start | date }} - {{ window?.end | date }}</span>
      <button mat-icon-button><mat-icon>chevron_right</mat-icon></button>
    </div>
    <mat-button-toggle-group [(ngModel)]="activeView">
      <mat-button-toggle value="timeline" aria-label="Timeline" title="Timeline">
        <mat-icon>clear_all</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="table" aria-label="Table" title="Table">
        <mat-icon>view_list</mat-icon>
      </mat-button-toggle>
    </mat-button-toggle-group>
  </div>
  <ng-container [ngSwitch]="activeView">
    <mat-table [dataSource]="dataSource" matSort *ngSwitchCase="'table'">
      <ng-container matColumnDef="name">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Name </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/people', cell.id]"> {{cell.name}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="start">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Start </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.start}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="end">
        <mat-header-cell mat-sort-header *matHeaderCellDef> End </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.end}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="total">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Total </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.total}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="weekly_total">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Weekly Total </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.weekly_total}} </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
    <!--<mat-paginator [hidePageSize]="true"></mat-paginator>-->
  </ng-container>
  `,
  styleUrls: ['../base.scss', './timeclock-page.component.scss'],
})
export class TimeclockPageComponent implements OnInit {
  // @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  activeView = 'table';
  displayedColumns = ['name', 'start', 'end', 'total', 'weekly_total'];
  window = {start: new Date(), end: new Date()};
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
