import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-brand',
  template: `
  <a routerLink="/" class="brand">
    <!--
    <span>CORE</span>
    -->
    <svg><use href="/assets/logo.svg#logo"/></svg>
  </a>
  `,
  styles: [`
    :host, :host > a {
      display: flex;
      align-items: center;
    }
    :host a {
      color: inherit;
      text-decoration: none;
    }
    :host svg {
      width: 200px;
      height: 21px;
    }
  `],
})
export class BrandComponent {}
