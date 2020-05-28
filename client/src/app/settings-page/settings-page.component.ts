import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-settings-page',
  template: `
    <app-page-title>
      <a routerLink="/settings">Settings</a>
    </app-page-title>
    <header>
      <h1>Account Settings</h1>
      <ul>
        <li>
          <button mat-icon-button><mat-icon>edit</mat-icon></button>
        </li>
      </ul>
    </header>
    <form [formGroup]="form">
      <section>
        <h2>General</h2>
        <p>email</p>
        <p>
          <input matInput type="email" formControlName="email"/>
        </p>
        <p>username</p>
        <p>
          <input matInput type="text" formControlName="username"/>
        </p>
        <p>color</p>
        <p>
          <app-color-input formControlName="color"></app-color-input>
        </p>
        <p>roles</p>
        <p>
          <mat-chip-list>
            <mat-chip *ngFor="let role of form.get('roles').value" [value]="role.id">{{role.name}}</mat-chip>
          </mat-chip-list>
        </p>
      </section>
      <mat-divider></mat-divider>
    </form>
  `,
  styleUrls: ['../base.scss', './settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {
  form = this.fb.group({
    email: ['someone@example.com'],
    username: ['someone'],
    roles: [[{id: 'isAdmin', name: 'Administrator', description: ''}, {id: 'isPaidHourly', name: 'Paid Hourly', description: ''}]],
    color: ['#1f78b4'],
  });

  constructor(public fb: FormBuilder) { }

  ngOnInit(): void {
    this.form.disable();
  }

}
