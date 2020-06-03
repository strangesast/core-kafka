import { ViewChild, ElementRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { throwError, Subject, empty } from 'rxjs';
import {
  timeoutWith,
  ignoreElements,
  publishBehavior,
  refCount,
  finalize,
  delay,
  catchError,
  exhaustMap,
  filter,
  tap,
  map,
  takeUntil,
  take,
} from 'rxjs/operators';

import { UserService } from '../user.service';


@Component({
  selector: 'app-login-page',
  template: `
  <form [formGroup]="form" (submit)="submit$.next()" (focus)="focused$.next()">
    <h1>Login</h1>
    <mat-form-field appearance="outline">
      <mat-label>Username</mat-label>
      <input #username autofocus matInput type="text" placeholder="username" formControlName="username">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Password</mat-label>
      <input #password matInput type="password" placeholder="password" formControlName="password">
    </mat-form-field>
    <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
    <mat-error *ngIf="error">{{error}}</mat-error>
    <div class="controls">
      <div
        [matTooltip]="form.invalid ? 'Items above need to be fixed.' : 'Login to account.'"
        [matTooltipShowDelay]="form.invalid ? 100 : 1000">
        <button
          mat-stroked-button
          [disabled]="complete || form.invalid || loading"
          aria-label="Submit login form"
          type="submit">
          Login
        </button>
      </div>
      <a mat-button queryParamsHandling="preserve" [preserveFragment]="true" [routerLink]="['/login', 'new']">Create Account</a>
    </div>
  </form>
  `,
  styleUrls: ['../login-base.scss', './login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  submit$ = new Subject();
  focused$ = new Subject();
  destroyed$ = new Subject();

  redirect$ = this.activatedRoute.queryParams.pipe(
    map(v => v && v.redirect || '/'),
    publishBehavior('/'),
    refCount(),
  );

  @ViewChild('username')
  username: ElementRef;

  @ViewChild('password')
  password: ElementRef;

  error: string;
  loading = false;
  complete = false;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  user$ = this.service.user$;

  constructor(
    public fb: FormBuilder,
    public service: UserService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.submit$.pipe(
      map(() => this.form),
      filter(form => form.valid),
      map(form => form.value),
      tap(() => {
        this.loading = true;
        this.form.disable();
      }),
      exhaustMap(payload => this.service.login(payload).pipe(
        catchError(err => {
          if (err.status === 401) {
            err = new Error('Invalid username / password.');
          }
          return throwError(err);
        }),
      ).pipe(
        timeoutWith(4000, throwError(new Error('Could not reach server.'))),
        exhaustMap(() => {
          this.loading = false;
          this.complete = true;
          return this.redirect$.pipe(
            delay(1000),
            tap(redirect => this.router.navigateByUrl(redirect)),
          );
        }),
        catchError(err => {
          this.error = err.message || 'error';
          this.loading = false;
          this.form.enable();
          this.form.patchValue({password: ''});
          this.password.nativeElement.focus();

          return this.form.valueChanges.pipe(
            take(1),
            finalize(() => {
              this.error = '';
          }));
        })
      )),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onFocus() {
  }

}
