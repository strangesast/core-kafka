import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  template: `
  <form [formGroup]="form">
    <mat-form-field appearance="outline">
      <mat-label>Username</mat-label>
      <input matInput placeholder="username">
      <mat-icon matSuffix>sentiment_very_satisfied</mat-icon>
      <mat-hint>Hint</mat-hint>
    </mat-form-field>
  </form>
  `,
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  form = this.fb.group({
    username: ['', Validators.required],
  });

  constructor(public fb: FormBuilder) { }

  ngOnInit() {
  }

}
