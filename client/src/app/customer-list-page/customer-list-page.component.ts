import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subject } from 'rxjs';
import { takeUntil, pluck } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-customer-list-page',
  template: `
  <app-page-title>
    <a routerLink="/customers">Customers</a>
  </app-page-title>
  <header>
    <h1>Customers</h1>
    <p>These are customers.</p>
  </header>
  <mat-table [dataSource]="dataSource" matSort>
    <ng-container matColumnDef="order_id">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Order </mat-header-cell>
      <mat-cell *matCellDef="let cell"><a [routerLink]="['/orders', cell.id]"> {{cell.order_id}} </a></mat-cell>
    </ng-container>
    <ng-container matColumnDef="part">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Part </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.part}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="po">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Purchase Order </mat-header-cell>
      <mat-cell *matCellDef="let cell"><a [routerLink]="['/orders', cell.po]"> {{cell.po}} </a></mat-cell>
    </ng-container>
    <ng-container matColumnDef="customer">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Customer </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.customer}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="description">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Description </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.description}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="price">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Price </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.price}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="qty_order">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Qty Ordered </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.qty_order}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="qty_ship">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Qty Shipped </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.qty_ship}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="ship_date">
      <mat-header-cell mat-sort-header *matHeaderCellDef> Date Shipped </mat-header-cell>
      <mat-cell *matCellDef="let cell"> {{cell.ship_date}} </mat-cell>
    </ng-container>
    <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
    <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
  </mat-table>
  `,
  styleUrls: ['../base.scss', './customer-list-page.component.scss']
})
export class CustomerListPageComponent implements OnInit {
  displayedColumns = ['customer'];

  query = gql`
    query BQuery {
      customer_order_counts {
        customer
        sum
      }
    }
  `;

  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  query$ = this.apollo.query({query: this.query});

  constructor(public apollo: Apollo) { }

  ngOnInit(): void {
  }

}
