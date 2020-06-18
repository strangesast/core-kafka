import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

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
    <ng-container *ngSwitchCase="'grid'">
      <div class="grid">
        <a *ngFor="let machine of machines" [routerLink]="['/machines', machine.id]">
          <span class="status" [ngClass]="machine.status">{{printMachineStatus(machine.status)}}</span>
          <span class="title">{{machine.name}}</span>
        </a>
      </div>
    </ng-container>
    <ng-container *ngSwitchCase="'big-list'">
    </ng-container>

    <!--<mat-paginator [hidePageSize]="true"></mat-paginator>-->
  </ng-container>
  `,
  styleUrls: ['../base.scss', './machines-page.component.scss'],
})
export class MachinesPageComponent implements OnInit {
  activeView = 'map';
  displayedColumns: string[] = ['name'];

  dataSource: MatTableDataSource<Record>;

  machines = [
    { id: 'doosan-2600sy',     name: 'Doosan 2600SY', status: MachineStatus.Unknown },
    { id: 'doosan-gt2100m',    name: 'Doosan GT2100M' , status: MachineStatus.Unknown},
    { id: 'hardinge-cobra-42', name: 'Hardinge Cobra 42', status: MachineStatus.Unknown},
    { id: 'hardinge-cobra-65', name: 'Hardinge Cobra 65', status: MachineStatus.Unknown},
    { id: 'hardinge-gx1600',   name: 'Hardinge Cobra GX1600', status: MachineStatus.Unknown},
    { id: 'samsung-mcv50',     name: 'Samsung MCV50', status: MachineStatus.Unknown},
    { id: 'samsung-mcv660',    name: 'Samsung MCV660', status: MachineStatus.Unknown},
    { id: 'samsung-sl45',      name: 'Samsung SL45', status: MachineStatus.Unknown},
  ];

  constructor()  {
    const data: Record[] = [
      {id: 'unknown', name: 'Machine (testing)'},
    ];
    this.dataSource = new MatTableDataSource(data);
  }

  ngOnInit(): void {
  }

  printMachineStatus(status: MachineStatus) {
    switch (status) {
      case MachineStatus.Active: return 'Active';
      case MachineStatus.Unavailable: return 'Unavailable';
      case MachineStatus.Stopped: return 'Stopped';
      case MachineStatus.Interrupted: return 'Interrupted';
      default:
        return 'Unknown';
    }
  }

}
