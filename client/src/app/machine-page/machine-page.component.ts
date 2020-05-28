import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

interface Record {
  id: string;
  name: string;
}

@Component({
  selector: 'app-machine-page',
  template: `
  <ng-container *ngIf="machine$ | async as machine; else loading">
    <app-page-title>
      <a routerLink="/machines">Machines</a> / <a [routerLink]="['/machines', machine.id]">{{machine.name}}</a>
    </app-page-title>
    <header>
      <h1>{{machine.name}}</h1>
      <p>4% Utilization this Week</p>
    </header>
    <mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="order">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Order </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/orders', cell.order]"> {{cell.order}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="part">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Part </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/people', cell.part]"> {{cell.part}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="qty">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Qty </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.qty}} </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
    <mat-paginator [hidePageSize]="true"></mat-paginator>
  </ng-container>
  <ng-template #loading>Loading...</ng-template>
  `,
  styleUrls: ['../base.scss', './machine-page.component.scss']
})
export class MachinePageComponent implements OnInit {
  machine$ = this.route.params.pipe(
    pluck('id'),
    switchMap(id => {
      return of({id, name: id.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')});
    })
  );

  displayedColumns = ['order', 'part', 'qty'];
  dataSource: MatTableDataSource<any>;

  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

}
