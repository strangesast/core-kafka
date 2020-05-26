import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-card',
  template: `
    <a class="user-card" routerLink="/user">
      <span class="user-card_icon">
        <span>S</span><span>H</span>
      </span>
      <span class="user-card_name">Steve H.</span>
      <div class="background"></div>
    </a>
  `,
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
