import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { tap, catchError, exhaustMap, map } from 'rxjs/operators';

import { User } from './models';
import { init, login } from './user.actions';

interface UserResponsePayload {
  user: User;
}


@Injectable({
  providedIn: 'root'
})
export class InitGuard implements CanActivate {
  constructor(
    public http: HttpClient,
    public store: Store<any>) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.store.pipe(
        select('user', 'init'),
        exhaustMap(isInitialized => {
          if (isInitialized) {
            return of(isInitialized);
          }
          const token = localStorage.getItem('token');
          if (!token) {
            this.store.dispatch(init());
            return of(true);
          }
          return this.http.get<UserResponsePayload>('/api/user', {headers: {Authorization: `bearer ${token}`}}).pipe(
            map(payload => {
              const user = payload.user;
              this.store.dispatch(login({token, user}));
              return true;
            }),
            catchError(err => {
              localStorage.removeItem('token');
              return of(true);
            }),
            tap(() => this.store.dispatch(init())),
          );
        }),
      );
  }
}
