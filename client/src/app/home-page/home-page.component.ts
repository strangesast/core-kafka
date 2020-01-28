import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  template: `
  <router-outlet></router-outlet>
  `,
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
