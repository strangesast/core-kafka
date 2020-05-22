import { Input, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-timeclock-table',
  template: `
  <mat-table [dataSource]="dataSource" matSort>
    <ng-container matColumnDef="employee.name">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Name </mat-header-cell>
      <mat-cell *matCellDef="let cell"><a [routerLink]="['/people', cell.employee.id]"> {{cell.employee.name}} </a></mat-cell>
    </ng-container>
    <ng-container matColumnDef="start">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Start </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.start | date:'shortTime'}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="end">
      <mat-header-cell mat-sort-header *matHeaderCellDef> End </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.end | date:'shortTime'}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="duration">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Total </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.duration | duration}} </mat-cell>
    </ng-container>
    <!--
    <ng-container matColumnDef="weekly_total">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Weekly Total </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.weekly_total}} </mat-cell>
    </ng-container>
    -->
    <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
    <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
  </mat-table>
  <!--<mat-paginator [hidePageSize]="true"></mat-paginator>-->
  `,
  styleUrls: ['./timeclock-table.component.scss']
})
export class TimeclockTableComponent implements OnInit {
  @Input()
  dataSource: MatTableDataSource<any>;

  displayedColumns = ['employee.name', 'start', 'end', 'duration'];

  constructor() { }

  ngOnInit(): void {
  }
}
