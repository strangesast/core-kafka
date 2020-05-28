import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  template: `
  <mat-toolbar>
    <app-brand></app-brand>
    <button mat-stroked-button (click)="back()">Back</button>
  </mat-toolbar>
  <section>
    <h1>Not Found</h1>
  </section>
  `,
  styleUrls: ['../basic.scss'],
})
export class NotFoundPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  back() {
    history.back();
  }
}
