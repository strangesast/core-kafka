import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subject } from 'rxjs';
import { tap, pluck, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-active-orders-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/orders']">Orders</a>
  </app-page-title>
  <header>
    <h1>Active Orders</h1>
    <ul>
      <li><a [routerLink]="['/orders', 'historical']">Historical</a></li>
    </ul>
  </header>
  <mat-table [dataSource]="dataSource" matSort>
    <ng-container matColumnDef="part">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Part Name </mat-header-cell>
      <mat-cell *matCellDef="let cell"><a [routerLink]="['/parts', cell.part]"> {{cell.part}} </a></mat-cell>
    </ng-container>
    <ng-container matColumnDef="description">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Description </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.description}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="customer">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Customer </mat-header-cell>
      <mat-cell *matCellDef="let cell"><a [routerLink]="['/customers', cell.customer]"> {{cell.customer}} </a></mat-cell>
    </ng-container>
    <ng-container matColumnDef="date">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Date </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.date}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="qty">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Qty </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.qty}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="qty_note">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Qty Note </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.qty_note}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="sos">
      <mat-header-cell mat-sort-header *matHeaderCellDef> SOs </mat-header-cell>
      <mat-cell *matCellDef="let cell" class="list"><a [routerLink]="['/']" *ngFor="let so of cell.sos">{{so}}</a></mat-cell>
    </ng-container>
    <mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></mat-header-row>
    <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
  </mat-table>
  `,
  styleUrls: ['../base.scss', './active-orders-page.component.scss']
})
export class ActiveOrdersPageComponent implements OnInit, OnDestroy {
  query = gql`
    query ScheduleQuery {
      schedule {
        col
        customer
        date
        description
        part
        qty
        readystate
        qty_note
        sos
      }
    }
  `;
  displayedColumns = ['part', 'description', 'customer', 'date', 'qty', 'qty_note', 'sos'];

  dataSource = new MatTableDataSource();
  destroyed$ = new Subject();
  data$ = this.apollo.query({query: this.query}).pipe(pluck('data'));

  constructor(
    public apollo: Apollo,
  ) {}


  ngOnInit(): void {
    this.data$.pipe(
      takeUntil(this.destroyed$),
      pluck('schedule'),
    ).subscribe((data: any[]) =>
      this.dataSource.data = data);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
