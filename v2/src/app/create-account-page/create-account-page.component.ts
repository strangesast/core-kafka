import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-account-page',
  template: `
  <form [formGroup]="form">
    <h1>Create Account</h1>
    <mat-form-field appearance="outline">
      <mat-label>Name</mat-label>
      <input matInput placeholder="John Doe">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Username</mat-label>
      <input matInput placeholder="username">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Password</mat-label>
      <input matInput placeholder="password">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Verify Password</mat-label>
      <input matInput placeholder="password_verify">
    </mat-form-field>

    <div class="controls">
      <button mat-stroked-button type="submit">Create</button>
      <a mat-button queryParamsHandling="preserve" [routerLink]="['/login']">Use Existing Account</a>
    </div>
  </form>
  `,
  styleUrls: ['../login-base.scss', './create-account-page.component.scss']
})
export class CreateAccountPageComponent implements OnInit {
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
