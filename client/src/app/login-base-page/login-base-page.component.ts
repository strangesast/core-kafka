import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { first, tap, map, refCount, publishBehavior } from 'rxjs/operators';

@Component({
  selector: 'app-login-base-page',
  template: `
  <mat-toolbar>
    <app-brand></app-brand>
    <button *ngIf="(redirect$ | async) != '/'" mat-stroked-button (click)="back()">Back</button>
  </mat-toolbar>
  <router-outlet></router-outlet>
  `,
  styleUrls: ['./login-base-page.component.scss']
})
export class LoginBasePageComponent implements OnInit {
  redirect$ = this.activatedRoute.queryParams.pipe(
    map(v => v && v.redirect || '/'),
    publishBehavior('/'),
    refCount(),
  );

  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
  }

  back() {
    this.redirect$.pipe(first())
      .subscribe(value => this.router.navigateByUrl(value));
  }
}
