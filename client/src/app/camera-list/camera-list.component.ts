import { Output, EventEmitter, Input, Component, OnInit, HostBinding } from '@angular/core';
import { group, animateChild, query, trigger, style, state, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-camera-list',
  template: `
  <mat-toolbar>
    <span>Camera List</span>
    <button
      mat-icon-button
      (click)="toggle()">
      <mat-icon [@rotated]="expanded === 'expanded' ? 'active' : 'inactive'">expand_less</mat-icon>
    </button>
  </mat-toolbar>
  <mat-table [dataSource]="cameras">
    <ng-container matColumnDef="name">
      <mat-header-cell *matHeaderCellDef> Name </mat-header-cell>
      <mat-cell *matCellDef="let element"> {{element.name}} </mat-cell>
    </ng-container>
    <ng-container matColumnDef="description">
      <mat-header-cell *matHeaderCellDef> Description </mat-header-cell>
      <mat-cell *matCellDef="let element"> {{element.description}} </mat-cell>
    </ng-container>
    <mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></mat-header-row>
    <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
  </mat-table>
  <div class="controls">
    <button mat-stroked-button (click)="new()"><mat-icon>add</mat-icon> New</button>
  </div>
  `,
  styleUrls: ['./camera-list.component.scss'],
  animations: [
    trigger('expand', [
      state('collapsed', style({height: '64px', minHeight: '0'})),
      state('expanded', style({height: '400px'})),
      transition('expanded <=> collapsed', [
        group([
          query('@rotated', [animateChild()]),
          animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
        ]),
      ]),
    ]),
    trigger('rotated', [
      state('active', style({transform: 'rotate(180deg)'})),
      state('inactive', style({transform: 'rotate(0)'})),
      transition('* => *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CameraListComponent implements OnInit {
  @HostBinding('@expand')
  expanded = 'collapsed';

  displayedColumns: string[] = ['name', 'description'];

  @Input()
  cameras: any[] = [];

  @Output()
  create = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  toggle() {
    this.expanded = this.expanded === 'expanded' ? 'collapsed' : 'expanded';
  }

  new() {
    const id = this.cameras.length > 0 ? this.cameras[this.cameras.length - 1].id + 1 : 0;
    this.create.emit({
      id,
      name: `Camera ${id + 1}`,
      description: '',
      color: 'blue',
      aov: 53,
      x: 200,
      y: 200,
      rot: 0,
      radius: 100,
    });
  }
}
