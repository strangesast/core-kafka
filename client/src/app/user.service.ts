import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { concat, from, Observable, BehaviorSubject } from 'rxjs';
import { exhaustMap, pluck, map, tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserLoginPayload, UserLoginResult, UserCreatePayload, User } from './models';

import { logout, login } from './user.actions';

const OneUserQuery = gql`
  query OneUserQuery($id: Int!) {
    users_by_pk(id: $id) {
      color
      email
      id
      username
      user_roles {
        role {
          id
          description
          name
        }
      }
      employees(limit: 1, where: {user_id: {_eq: $id}}) {
        id
        first_name
        last_name
        middle_name
        code
      }
    }
  }
`;

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
    return this.apollo.query({query: OneUserQuery, variables: {id: userId}}).pipe(
      map((result: any) => {
        return result.data.users_by_pk;
        // const {color, email, user_roles, username, id} = ;
        // const roles = user_roles.reduce((acc, {role}) => ({...acc, [role.id]: role}), {});
        // const user = {username, email, color, name: {first: first_name, middle: middle_name, last: last_name}, roles};
        // return user;
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

  hasRole(user: User, roleId: string) {
    return user.user_roles.some(({role}) => role.id === roleId);
  }
}
