import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

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
    <p>4% Utilization this Week</p>
  </header>
  <div class="controls">
    <span class="flex-spacer"></span>
    <mat-button-toggle-group [(ngModel)]="activeView">
      <mat-button-toggle value="map" aria-label="Shop Map">
        <mat-icon>map</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="list" aria-label="List">
        <mat-icon>list</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="grid" aria-label="Grid">
        <mat-icon>view_module</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="big-list" aria-label="Large List">
        <mat-icon>view_agenda</mat-icon>
      </mat-button-toggle>
    </mat-button-toggle-group>
  </div>
  <ng-container [ngSwitch]="activeView">
    <mat-table [dataSource]="dataSource" matSort *ngSwitchCase="'list'">
      <ng-container matColumnDef="name">
        <mat-cell *matCellDef="let cell"><a [routerLink]="['/machines', cell.id]"> {{cell.name}} </a></mat-cell>
      </ng-container>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
    <app-map-viewer *ngSwitchCase="'map'"></app-map-viewer>
    <!--<mat-paginator [hidePageSize]="true"></mat-paginator>-->
  </ng-container>
  `,
  styleUrls: ['../base.scss', './machines-page.component.scss'],
})
export class MachinesPageComponent implements OnInit {
  activeView = 'list';
  displayedColumns: string[] = ['name'];

  dataSource: MatTableDataSource<Record>;

  constructor()  {
    const data: Record[] = [
      {id: 'machine-1', name: 'Machine 1'},
      {id: 'machine-1', name: 'Machine 1'},
      {id: 'machine-1', name: 'Machine 1'},
      {id: 'machine-1', name: 'Machine 1'},
      {id: 'machine-1', name: 'Machine 1'},
      {id: 'machine-1', name: 'Machine 1'},
      {id: 'machine-1', name: 'Machine 1'},
      {id: 'machine-1', name: 'Machine 1'},
    ];
    this.dataSource = new MatTableDataSource(data);
  }

  ngOnInit(): void {
  }

}
