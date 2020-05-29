import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { concat, from, Observable, BehaviorSubject } from 'rxjs';
import { exhaustMap, pluck, map, tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

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
  user$ = this.store.pipe(
    select('user'),
    pluck('user'),
  );

  constructor(
    public apollo: Apollo,
    public http: HttpClient,
    public store: Store<any>,
  ) {}

  login(payload: UserLoginPayload) {
    return this.http.post<UserLoginResult>('/api/login', payload).pipe(
      exhaustMap(({token, user}) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return from(this.apollo.getClient().resetStore()).pipe(exhaustMap(() =>
          this.getUser(user.id).pipe(tap(fullUser => {
            this.store.dispatch(login({user: fullUser, token}));
            return fullUser;
          }))
        ));
      }),
    );
  }

  getUser(userId: number): Observable<User> {
    const query = gql`
       query UserQuery {
         users(where: {id: {_eq: ${userId}}}) {
           user_roles {
             role {
               id
               name
               description
             }
           }
           color
           email
           first_name
           id
           last_name
           middle_name
           username
         }
       }
    `;
    return this.apollo.query({query}).pipe(
      map((result: any) => {
        const {color, email, first_name, last_name, middle_name, user_roles, username, id} = result.data.users[0];
        const roles = user_roles.map(({role}) => role);
        const user = {username, email, color, name: {first: first_name, middle: middle_name, last: last_name}, roles};
        return user;
      }),
    );
  }

  reset() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.apollo.getClient().resetStore();
  }

  logout() {
    this.store.dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  create(payload: UserCreatePayload) {
    return this.http.post<UserLoginResult>('/api/user', payload).pipe(
      tap(({token, user}) => this.store.dispatch(login({user, token}))),
    );
  }
}
