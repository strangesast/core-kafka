import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  template: `
  <form [formGroup]="form">
    <h1>Login</h1>
    <mat-form-field appearance="outline">
      <mat-label>Username</mat-label>
      <input matInput placeholder="username">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Password</mat-label>
      <input matInput placeholder="password">
    </mat-form-field>
    <div class="controls">
      <button mat-stroked-button type="submit">Submit</button>
      <a mat-button queryParamsHandling="preserve" [preserveFragment]="true" [routerLink]="['/login', 'new']">Create Account</a>
    </div>
  </form>
  `,
  styleUrls: ['../login-base.scss', './login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    public fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

}
