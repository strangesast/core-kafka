import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings-page',
  template: `
    <app-page-title>
      <a routerLink="/settings">Settings</a>
    </app-page-title>
    <header>
      <h1>Account Settings</h1>
    </header>
  `,
  styleUrls: ['../base.scss', './settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
