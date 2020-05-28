import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forbidden-page',
  template: `
    <mat-toolbar>
      <app-brand></app-brand>
      <button mat-stroked-button (click)="back()">Back</button>
    </mat-toolbar>
    <section>
      <h1>Forbidden</h1>
    </section>
  `,
  styleUrls: ['../basic.scss'],
})
export class ForbiddenPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  back() {
    history.back();
  }

}
