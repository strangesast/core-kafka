import { HostBinding, HostListener, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  template: `
  <input type="text" placeholder="search" (keyup.enter)="focus($event)" (blur)="blur($event)"/>
  `,
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  active = false;

  @HostBinding('class') get classes() {
    return this.active ? 'mat-elevation-z3 active' : '';
  }

  focus() {
    console.log('active');
    this.active = true;
  }

  blur() {
    console.log('inactive');
    this.active = false;
  }

  constructor() { }

  ngOnInit() {
  }

}
