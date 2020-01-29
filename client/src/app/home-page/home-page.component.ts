import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  template: `
  <app-side-bar></app-side-bar>
  <router-outlet></router-outlet>
  `,
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
