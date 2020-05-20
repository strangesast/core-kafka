import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-person-page',
  template: `
  <ng-container *ngIf="person$ | async as person">
    <mat-toolbar>
      <span><a routerLink="/people">People</a> / <a [routerLink]="['/people', person.id]">{{person.id}}</a></span>
    </mat-toolbar>
    <header>
      <h1>{{person.name}}</h1>
      <p>4% Utilization this Week</p>
    </header>
  </ng-container>
  <ng-template #loading>Loading...</ng-template>
  `,
  styleUrls: ['../base.scss', './person-page.component.scss']
})
export class PersonPageComponent implements OnInit {
  person$ = this.route.params.pipe(pluck('id'), switchMap(id => of({id})));

  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

}
