import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject, Subject } from 'rxjs';
import { refCount, publishBehavior, shareReplay, map, takeUntil, switchMap, pluck } from 'rxjs/operators';


interface Record {
  id: string;
  name: string;
}

@Component({
  selector: 'app-order-list-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/orders']">Orders</a> / <a [routerLink]="['/orders', 'historical']">List</a>
  </app-page-title>
  <header>
    <h1>Historical Orders</h1>
  </header>
  <div class="controls">
    <!--
    <ul>
      <li><a [routerLink]="['/customers']">Customers</a></li>
    </ul>
    -->
    <mat-chip-list>
      <mat-chip *ngFor="let param of paramsList$ | async"
        [removable]="true"
        (removed)="removeParam(param.key)">
        {{param.key}} = {{param.value}}
        <mat-icon matChipRemove>cancel</mat-icon>
      </mat-chip>
    </mat-chip-list>
    <form [formGroup]="searchForm" class="search-form">
      <mat-form-field floatLabel="never" appearance="standard">
        <mat-icon matPrefix>search</mat-icon>
        <mat-label>Search...</mat-label>
        <input matInput type="text" formControlName="search">
        <button
          mat-button
          *ngIf="searchForm.get('search').value"
          matSuffix
          mat-icon-button
          aria-label="Clear"
          (click)="searchForm.get('search').reset()">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </form>
  </div>
  <div class="table-container">
    <mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="order_id" sticky>
        <mat-header-cell mat-sort-header *matHeaderCellDef> Order </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/orders', cell.id]"> {{cell.order_id}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="part" sticky>
        <mat-header-cell mat-sort-header *matHeaderCellDef> Part </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/orders', 'historical']" [queryParams]="{part: cell.part}"> {{cell.part}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="po">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Purchase Order </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/orders', cell.po]"> {{cell.po}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="customer">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Customer </mat-header-cell>
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/customers', cell.customer]"> {{cell.customer}} </a></mat-cell>
      </ng-container>
      <ng-container matColumnDef="description">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Description </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.description}} </mat-cell>
      </ng-container>
      <ng-container matColumnDef="price">
        <mat-header-cell mat-sort-header *matHeaderCellDef> Unit Price </mat-header-cell>
        <mat-cell *matCellDef="let cell"> {{cell.price | currency}} </mat-cell>
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
      <mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
    <mat-paginator></mat-paginator>
  </div>
  `,
  styleUrls: ['../base.scss', './order-list-page.component.scss']
})
export class OrderListPageComponent implements OnInit, OnDestroy {
  displayedColumns = [
    // 'order_id',
    'part',
    // 'part_customer',
    'po',
    'customer',
    'description',
    'price',
    'qty_order',
    'qty_ship',
    'ship_date',
  ];

  dataSource: MatTableDataSource<Record> = new MatTableDataSource();

  searchForm = this.fb.group({
    search: [''],
  });

  destroyed$ = new Subject();

  params$ = this.route.queryParams.pipe(publishBehavior({}), refCount());

  paramsList$ = this.params$.pipe(map(q => Object.entries(q).map(([key, value]) => ({key, value}))));

  query$ = this.params$.pipe(switchMap(q => this.apollo.query(buildQuery(q))), pluck('data'));

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public fb: FormBuilder,
    public apollo: Apollo,
  ) {}

  removeParam(paramKey: string) {
    const current = (this.params$.source as BehaviorSubject<any>).value;
    if (paramKey in current) {
      const queryParams = {...current};
      delete queryParams[paramKey];
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams,
        });
    }
  }

  ngOnInit(): void {
    this.query$.pipe(takeUntil(this.destroyed$))
      .subscribe((data: any) => this.dataSource.data = data.shipping);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}

function buildQuery(q: {[key: string]: string}) {
  const limit = 20;
  const orderBy = {ship_date: 'desc_nulls_last'};
  if ('part' in q) {
    // const where = Object.entries(q).reduce((acc, [k, v]) => ({...acc, [k]: {_eq: v}}), {});
    return {
      query: gql`
        query CQuery($part: String) {
          shipping(limit: 20, order_by: {ship_date: desc_nulls_last}, where: {part: {_eq: $part}}) {
            id
            order_id
            part
            part_customer
            po
            customer
            description
            price
            qty_order
            qty_ship
            ship_date
          }
        }
      `,
      variables: {
        part: q.part,
      },
    };
  }
  return {
    query: gql`
      query AQuery {
        shipping(limit: 20, order_by: {ship_date: desc_nulls_last}) {
          id
          order_id
          part
          part_customer
          po
          customer
          description
          price
          qty_order
          qty_ship
          ship_date
        }
      }`,
  };
}
