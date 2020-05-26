import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-part-page',
  template: `
  <ng-container *ngIf="part$ | async as part; else loading">
    <app-page-title>
      <a routerLink="/parts">Parts</a> / <a [routerLink]="['/parts', part.id]">{{part.name}}</a>
    </app-page-title>
    <header>
      <h1>{{part.name}}</h1>
      <p>This is a part.</p>
    </header>
  </ng-container>
  <ng-template #loading>Loading...</ng-template>
  `,
  styleUrls: ['../base.scss', './part-page.component.scss']
})
export class PartPageComponent implements OnInit {
  part$ = this.route.params.pipe(
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
