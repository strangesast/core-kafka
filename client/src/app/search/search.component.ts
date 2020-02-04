import { HostBinding, HostListener, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  template: `
  <input type="text" placeholder="search" (keyup.enter)="focus($event)" (blur)="blur($event)"/>
  <mat-progress-spinner *ngIf="active" [mode]="active ? 'indeterminate' : 'determinate'" diameter="24"></mat-progress-spinner>
  `,
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  active = false;

  @HostBinding('class') get classes() {
    return this.active ? 'mat-elevation-z2 active' : '';
  }

  focus() {
    this.active = true;
  }

  blur() {
    this.active = false;
  }

  constructor() { }

  ngOnInit() {
  }

}
