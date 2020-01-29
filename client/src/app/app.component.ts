import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <header>
    <a routerLink="/" class="brand">
      <span>CORE</span>
    </a>
    <app-search></app-search>
    <div>
      <!--
      <ul class="links">
        <li class="link"><a routerLink="/timesheet">Timesheet</a></li>
      </ul>
      -->
      <a mat-flat-button color="primary" routerLink="/login">Login</a>
    </div>
  </header>
  <app-side-bar></app-side-bar>
  <div class="container">
    <router-outlet></router-outlet>
  </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'CORE';
}
