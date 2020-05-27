import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { UserService } from '../user.service';

@Component({
  selector: 'app-login-page',
  template: `
  <form [formGroup]="form" (submit)="submit()">
    <h1>Login</h1>
    <mat-form-field appearance="outline">
      <mat-label>Username</mat-label>
      <input matInput placeholder="username" formControlName="username">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Password</mat-label>
      <input matInput placeholder="password" formControlName="password">
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
  error: string;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    public fb: FormBuilder,
    public service: UserService,
    public router: Router,
  ) { }

  ngOnInit(): void {
  }

  submit() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.service.login(this.form.value).subscribe(
        v => console.log(v),
        error => this.error = error,
        () => {
          // this.router.navigate()
        }
      );
    }
  }

}
