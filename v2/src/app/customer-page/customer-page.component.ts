import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';


@Component({
  selector: 'app-customer-page',
  template: `
  <ng-container *ngIf="customer$ | async as customer; else loading">
    <app-page-title>
      <a routerLink="/customers">Customers</a> / <a [routerLink]="['/customers', customer.id]">{{customer.name}}</a>
    </app-page-title>
    <header>
      <h1>{{customer.name}}</h1>
    </header>
  </ng-container>
  <ng-template #loading>Loading...</ng-template>
  `,
  styleUrls: ['../base.scss', './customer-page.component.scss']
})
export class CustomerPageComponent implements OnInit {
  customer$ = this.route.params.pipe(
    pluck('id'),
    switchMap(id => {
      return of({id, name: id.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')});
    })
  );

  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

}
