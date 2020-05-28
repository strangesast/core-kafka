import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { sameValueValidator } from '../validators';
import { Subject, empty } from 'rxjs';
import { refCount, publishBehavior, catchError, finalize, delay, exhaustMap, map, filter, takeUntil, tap, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';


import { UserService } from '../user.service';


@Component({
  selector: 'app-create-account-page',
  template: `
  <form [formGroup]="form" (submit)="submit$.next()">
    <h1>Create Account</h1>
    <ng-container formGroupName="name">
      <mat-form-field appearance="outline">
        <mat-label>Name</mat-label>
        <input matInput type="text" placeholder="John Doe" formControlName="first">
        <mat-error *ngIf="hasError('name.first', 'required')">Name is required.</mat-error>
      </mat-form-field>
    </ng-container>
    <mat-form-field appearance="outline">
      <mat-label>Username</mat-label>
      <input matInput type="text" placeholder="username" formControlName="username" appPropertyValidator="username">
      <mat-hint *ngIf="form.controls['username'].valid && !form.controls['username'].pending">Username is available.</mat-hint>
      <mat-error *ngIf="hasError('username', 'custom')">Username is not available.</mat-error>
      <mat-error *ngIf="hasError('username', 'required')">Username is required.</mat-error>
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Email</mat-label>
      <input matInput type="email" placeholder="email" formControlName="email" appPropertyValidator="email">
      <mat-error *ngIf="hasError('email', 'email')">Email is invalid.</mat-error>
      <mat-error *ngIf="hasError('email', 'custom')">Email is not available.</mat-error>
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Password</mat-label>
      <input matInput type="password" placeholder="password" formControlName="password">
      <mat-error *ngIf="hasError('password', 'required')">Password is required.</mat-error>
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Verify Password</mat-label>
      <input matInput placeholder="password_verify" type="password" formControlName="passwordVerify">
      <mat-error *ngIf="hasError('passwordVerify', 'sameValue')">Passwords do not match.</mat-error>
    </mat-form-field>
    <div class="controls">
      <div
        [matTooltip]="form.invalid ? 'Items above need to be fixed' : 'Create account'"
        [matTooltipShowDelay]="form.invalid ? 100 : 1000">
        <button
          mat-stroked-button
          [disabled]="complete || form.invalid || loading"
          aria-label="Submit account form"
          type="submit">
          Create
        </button>
      </div>
      <a mat-button queryParamsHandling="preserve" [routerLink]="['/login']">Use Existing Account</a>
    </div>
  </form>
  `,
  styleUrls: ['../login-base.scss', './create-account-page.component.scss']
})
export class CreateAccountPageComponent implements OnInit, OnDestroy {
  form = (() => {
    const form = this.fb.group({
      name: this.fb.group({
        first: ['', Validators.required],
        middle: [''],
        last: [''],
      }),
      email: ['', Validators.email],
      username: ['', Validators.required],
      password: ['', Validators.required],
      passwordVerify: [''],
    });

    const validator = sameValueValidator(form.controls.password);
    form.controls.passwordVerify.setValidators([validator]);
    return form;
  })();

  submit$ = new Subject();
  destroyed$ = new Subject();

  redirect$ = this.activatedRoute.queryParams.pipe(
    map(v => v && v.redirect || '/'),
    publishBehavior('/'),
    refCount(),
  );

  error: string;
  loading = false;
  complete = false;

  constructor(
    public fb: FormBuilder,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public service: UserService,
    public snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.submit$.pipe(
      map(() => this.form),
      filter(form => form.valid),
      map(form => form.value),
      tap(() => this.form.disable()),
      exhaustMap(payload => this.service.create(payload).pipe(
        exhaustMap(() => {
          this.complete = true;
          this.snackBar.open('Account created.', '', { duration: 2000 });
          return this.redirect$.pipe(
            delay(1000),
            tap(redirect => this.router.navigateByUrl(redirect)),
          );
        }),
        catchError(err => {
          this.error = 'error';
          return empty().pipe(delay(1000), finalize(() => {
            this.form.enable();
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

  public hasError = (controlName: string, errorName: string) => {
    const control = this.form.get(controlName);
    return control.hasError(errorName);
  }
}
