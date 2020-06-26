import { ViewChild, Injectable, Input, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subject, ReplaySubject } from 'rxjs';
import { multicast, refCount, pluck, tap, map, takeUntil } from 'rxjs/operators';


const query = gql`
  subscription {
    machines {
      state(limit: 1, order_by: {machine_id: asc, timestamp: desc}) {
        value
        timestamp
        offset
      }
      name
      manufacturer
      id
      description
      capabilities
      type
    }
  }
`;


enum MachineStatus {
  Unknown = 'unknown',
  Active = 'active',
  Interrupted = 'interrupted',
  Stopped = 'stopped',
  Unavailable = 'unavailable',
}

interface Record {
  id: string;
  name: string;
}

@Component({
  selector: 'app-machines-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/machines']">Machines</a>
  </app-page-title>
  <header>
    <h1>3+ Machines Active</h1>
    <p>4% Utilization this Week <a [routerLink]="['/machine-status']">Status Page</a></p>
  </header>
  <div class="controls">
    <span class="flex-spacer"></span>
    <mat-button-toggle-group>
      <mat-button-toggle value="map" [routerLink]="['./map']" aria-label="Shop Map">
        <mat-icon>map</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="list" [routerLink]="['./list']" aria-label="List">
        <mat-icon>list</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="grid" [routerLink]="['./grid']" aria-label="Grid">
        <mat-icon>view_module</mat-icon>
      </mat-button-toggle>
    </mat-button-toggle-group>
  </div>
  <router-outlet></router-outlet>
  `,
  styleUrls: ['../base.scss', './machines-page.component.scss'],
})
export class MachinesPageComponent {}


@Component({
  selector: 'app-machines-base',
  template: ``,
})
class MachinesBaseComponent implements OnDestroy {
  destroyed$ = new Subject();

  data$ = this.apollo.subscribe({query}).pipe(
    pluck('data', 'machines'),
    takeUntil(this.destroyed$),
    multicast(new ReplaySubject(1)),
    refCount(),
  );

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  constructor(public route: ActivatedRoute, public apollo: Apollo) {}
}


@Component({
  selector: 'app-machines-map',
  template: `<app-map-viewer [machines]=""></app-map-viewer>`,
})
export class MachinesMapComponent extends MachinesBaseComponent {}

@Component({
  selector: 'app-machines-list',
  template: `
  <mat-table [dataSource]="dataSource" matSort>
    <ng-container matColumnDef="name">
      <mat-cell *matCellDef="let cell">
        <a [routerLink]="['/machines', cell.id]"> {{cell.name}} </a>
      </mat-cell>
    </ng-container>
    <ng-container matColumnDef="manufacturer">
      <mat-cell *matCellDef="let cell"> {{cell.manufacturer}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="description">
      <mat-cell *matCellDef="let cell"> {{cell.description}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="type">
      <mat-cell *matCellDef="let cell"> {{cell.type}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="state">
      <mat-cell *matCellDef="let cell"> {{cell.state.length > 0 ? cell.state[0].value : null}} </mat-cell>
    </ng-container>
    <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
  </mat-table>
  <!--<mat-paginator [hidePageSize]="true"></mat-paginator>-->
  `,
})
export class MachinesListComponent extends MachinesBaseComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'manufacturer', 'type', 'state'];

  @ViewChild(MatSort)
  sort: MatSort;

  dataSource = new MatTableDataSource();

  ngOnInit() {
    this.data$.subscribe((data: any[]) => {
      this.dataSource.data = data;
    });
  }
}

@Component({
  selector: 'app-machines-grid',
  template: `
  <div class="grid">
    <a *ngFor="let each of data$ | async" [routerLink]="['/machines', each.machine_id]">
      <span class="status" [ngClass]="(each.state.length > 0 ? each.state[0].value : 'unknown').toLowerCase()">{{each.state.length > 0 ? each.state[0].value : 'unknown'}}</span>
      <span class="title">{{each.name}}</span>
    </a>
  </div>
  `,
})
export class MachinesGridComponent extends MachinesBaseComponent {}
