import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <header>
    <a routerLink="/" class="brand">
      <span>CORE</span>
    </a>
    <app-search></app-search>
    <ul class="links">
      <li><a mat-flat-button color="primary" routerLink="/login">Login</a></li>
    </ul>
  </header>
  <div class="container">
    <router-outlet></router-outlet>
  </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'CORE';
}
