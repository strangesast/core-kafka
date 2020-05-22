import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { publishBehavior, refCount } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  template: `
  <mat-toolbar>
    <app-brand></app-brand>
    <button mat-stroked-button (click)="back()">Back</button>
  </mat-toolbar>
  <section>
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
        <a mat-button type="button">Create Account</a>
      </div>
    </form>
  </section>
  `,
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  route$ = this.activatedRoute.queryParams.pipe(publishBehavior(null), refCount());

  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

  back() {
    const {value} = this.route$.source as BehaviorSubject<Params>;
    this.router.navigateByUrl(value?.redirect || '/');
  }

}
