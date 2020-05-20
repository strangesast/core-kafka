import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    <mat-toolbar>
      <span><a routerLink="/machines">Machines</a> / <a [routerLink]="['/machines', machine.id]">{{machine.name}}</a></span>
    </mat-toolbar>
    <header>
      <h1>{{machine.name}}</h1>
      <p>4% Utilization this Week</p>
    </header>
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

  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
    console.log(this.route);
  }

}
