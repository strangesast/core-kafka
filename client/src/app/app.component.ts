import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <header>
    <span class="brand">CORE</span>
    <div>
      <ul class="links">
        <li class="link"><a routerLink="/timesheet">Timesheet</a></li>
      </ul>
      <div class="user-card">
        <span class="user-card_icon">
          <span>S</span><span>H</span>
        </span>
        <span class="user-card_name">Steve H.</span>
        <div class="background"></div>
      </div>
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
