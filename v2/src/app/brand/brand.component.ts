import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-brand',
  template: `
  <a routerLink="/" class="brand">
    <span>CORE</span>
    <!--
    <svg><use href="/assets/logo.svg#logo"/></svg>
    -->
  </a>
  `,
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
