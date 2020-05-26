import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subject } from 'rxjs';
import { takeUntil, pluck } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-part-list-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/parts']">Parts</a>
  </app-page-title>
  <header>
    <h1>Parts</h1>
    <p>These are parts.</p>
  </header>
  <div class="table-container">
    <mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="part">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Part Name </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/parts', cell.part]"> {{cell.part}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="sum">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Order Count </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.sum}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="total_ordered_units">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Total Unit Count </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.total_ordered_units}} </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
  </div>
  `,
  styleUrls: ['../base.scss', './part-list-page.component.scss']
})
export class PartListPageComponent implements OnDestroy, OnInit {
  destroyed$ = new Subject();

  query$ = this.apollo.query({
    query: gql`
      query MyQuery {
        part_order_counts(order_by: {sum: desc}) {
          part
          sum
          total_ordered_units
        }
      }
    `
  });

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns = ['part', 'sum', 'total_ordered_units'];

  constructor(public apollo: Apollo) { }

  ngOnInit(): void {
    this.query$.pipe(takeUntil(this.destroyed$))
      .subscribe((response: any) => this.dataSource.data = response.data.part_order_counts);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
