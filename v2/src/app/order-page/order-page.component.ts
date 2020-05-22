import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-order-page',
  template: `
  <ng-container *ngIf="order$ | async as order; else loading">
    <app-page-title>
      <a [routerLink]="['/orders']">Orders</a> / <a [routerLink]="['/orders', order.id]">{{order.name}}</a>
    </app-page-title>
    <header>
      <h1>{{order.name}}</h1>
      <p>This is an order.</p>
    </header>
  </ng-container>
  <ng-template #loading>Loading...</ng-template>
  `,
  styleUrls: ['../base.scss', './order-page.component.scss']
})
export class OrderPageComponent implements OnInit {
  order$ = this.route.params.pipe(
    pluck('id'),
    switchMap(id => {
      return of({id, name: id.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')});
    })
  );

  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

}
