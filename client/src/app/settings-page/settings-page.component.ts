import { HostListener, OnDestroy, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { UserService } from '../user.service';


@Component({
  selector: 'app-settings-page',
  template: `
    <app-page-title>
      <a routerLink="/settings">Settings</a>
    </app-page-title>
    <form [formGroup]="form" (submit)="saveEditing()">
      <section>
        <header>
          <h1>General</h1>
          <ul>
            <li>
              <button mat-stroked-button *ngIf="!editing" (click)="startEditing()"><mat-icon>edit</mat-icon> Edit</button>
            </li>
            <ng-container *ngIf="editing">
              <li>
                  <button mat-button (click)="cancelEditing()"><mat-icon>delete</mat-icon> Cancel</button>
              </li>
              <li>
                  <button mat-flat-button color="primary" type="submit"><mat-icon>save</mat-icon> Save</button>
              </li>
            </ng-container>
          </ul>
        </header>
        <div class="grid" [class.editing]="editing">
          <p>email</p>
          <p>
            <input matInput type="email" placeholder="(none)" formControlName="email"/>
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
              <mat-chip
                *ngFor="let item of form.get('user_roles').value"
                [value]="item.role.id"
                [matTooltip]="item.role.description">
                {{item.role.name}}
              </mat-chip>
            </mat-chip-list>
          </p>
        </div>
      </section>
      <mat-divider></mat-divider>
    </form>
  `,
  styleUrls: ['../base.scss', './settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit, OnDestroy {


  editing = false;

  user$ = this.userService.user$;

  lastValue;

  form = this.fb.group({
    email: ['someone@example.com'],
    username: ['someone'],
    user_roles: [],
    color: ['#1f78b4'],
  });

  constructor(public fb: FormBuilder, public userService: UserService) { }

  ngOnInit(): void {
    this.form.disable();
    this.user$.subscribe(user => {
      console.log('user', user);
      const { email, username, user_roles, color } = user;
      this.lastValue = {email, username, user_roles, color};
      this.form.setValue(this.lastValue);
    });
  }

  ngOnDestroy() {
    if (this.editing) {
      this.cancelEditing();
    }
  }

  startEditing() {
    this.editing = true;
    this.form.enable();
  }

  saveEditing() {
    if (this.form.valid) {
      this.editing = false;
      this.form.disable();
    }
  }

  cancelEditing() {
    this.editing = false;
    this.form.reset(this.lastValue);
  }
}
