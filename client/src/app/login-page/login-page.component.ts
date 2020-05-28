import { ViewChild, ElementRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, empty } from 'rxjs';
import { publishBehavior, refCount, finalize, delay, catchError, exhaustMap, filter, tap, map, takeUntil } from 'rxjs/operators';

import { UserService } from '../user.service';

@Component({
  selector: 'app-login-page',
  template: `
  <form [formGroup]="form" (submit)="submit$.next()">
    <h1>Login</h1>
    <mat-form-field appearance="outline">
      <mat-label>Username</mat-label>
      <input #username autofocus matInput type="text" placeholder="username" formControlName="username" (focus)="onFocus()">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Password</mat-label>
      <input #password matInput type="password" placeholder="password" formControlName="password" (focus)="onFocus()">
    </mat-form-field>
    <mat-error *ngIf="error">Invalid username or password</mat-error>
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
  destroyed$ = new Subject();

  redirect$ = this.activatedRoute.queryParams.pipe(
    tap(v => console.log(v && v.redirect || '/')),
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
      tap(() => this.form.disable()),
      exhaustMap(payload => this.service.login(payload).pipe(
        exhaustMap(() => {
          this.complete = true;
          return this.redirect$.pipe(
            delay(1000),
            tap(redirect => this.router.navigateByUrl(redirect)),
          );
        }),
        catchError(err => {
          this.error = 'error';
          return empty().pipe(delay(1000), finalize(() => {
            this.form.enable();
            this.form.patchValue({password: ''});
            this.password.nativeElement.focus();
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
    if (this.error) {
      this.error = '';
    }
  }

}
