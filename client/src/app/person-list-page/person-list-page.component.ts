import { ViewChild, Component, OnInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface Record {
  id: string;
  name: string;
}

@Component({
  selector: 'app-person-list-page',
  template: `
  <app-page-title>
    <a routerLink="/people">People</a>
  </app-page-title>
  <mat-table [dataSource]="dataSource" matSort>
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
  `,
  styleUrls: ['../base.scss', './person-list-page.component.scss']
})
export class PersonListPageComponent implements OnInit {
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumns = ['name'];
  dataSource: MatTableDataSource<Record>;

  constructor() {
    const data: Record[] = [
      {name: 'Person 1', id: 'person-1'},
      {name: 'Person 1', id: 'person-1'},
      {name: 'Person 1', id: 'person-1'},
      {name: 'Person 1', id: 'person-1'},
      {name: 'Person 1', id: 'person-1'},
      {name: 'Person 1', id: 'person-1'},
      {name: 'Person 1', id: 'person-1'},
      {name: 'Person 1', id: 'person-1'},
    ];
    this.dataSource = new MatTableDataSource(data);
  }

  ngOnInit(): void {
  }

}
