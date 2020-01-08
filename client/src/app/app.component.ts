import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <header>
    <a routerLink="/" class="brand">
      <span>CORE</span>
    </a>
    <div>
      <ul class="links">
        <li class="link"><a routerLink="/timesheet">Timesheet</a></li>
      </ul>
      <a class="user-card" routerLink="/user">
        <span class="user-card_icon">
          <span>S</span><span>H</span>
        </span>
        <span class="user-card_name">Steve H.</span>
        <div class="background"></div>
      </a>
    </div>
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
