import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { logout, login } from './user.actions';
import { User } from './models';

interface State {
  user: {
    user: User;
  };
}

interface UserLoginPayload {
  username: string;
  password: string;
}

interface UserCreatePayload {
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  email: string;
  username: string;
  password: string;
}

interface UserLoginResult {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user$ = this.store.pipe(select('user'));

  constructor(
    public http: HttpClient,
    public store: Store<any>,
  ) {}

  login(payload: UserLoginPayload) {
    return this.http.post<UserLoginResult>('/api/login', payload).pipe(
      tap(({token, user}) => {
        this.store.dispatch(login({user, token}));
        localStorage.setItem('token', token);
      }),
    );
  }

  logout() {
    this.store.dispatch(logout());
    localStorage.removeItem('token');
  }

  create(payload: UserCreatePayload) {
    return this.http.post<UserLoginResult>('/api/user', payload).pipe(
      tap(({token, user}) => this.store.dispatch(login({user, token}))),
    );
  }
}
