import { Injectable } from '@angular/core';
import { Resolve, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { pluck, mapTo, map, tap } from 'rxjs/operators';


const query = gql`
  query($id: Int!) {
    employees_by_pk(id: $id) {
      first_name
      last_name
      middle_name
    }
  }
`;


const personQuery = gql`
  query ($ln: String = "", $fn: String = "") {
    employees(where: {_and: {first_name: {_ilike: $fn}, last_name: {_ilike: $ln}}}) {
      id
      code
      color
      first_name
      hire_date
      last_modified
      last_name
      middle_name
      user_id
    }
  }
`;


@Injectable({
  providedIn: 'root'
})
export class PersonPageGuard implements CanActivate, Resolve<any> {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const { id: s } = next.params;
    const id = parseInt(s, 10);
    if (!isNaN(id)) {
      return this.apollo.query({query, variables: {id}}).pipe(
        pluck('data', 'employees_by_pk'),
        tap((v: any) => {
          if (v != null) {
            this.router.navigate(['/people', [v.first_name, v.last_name].map(ss => ss.toLowerCase()).join('-')], { replaceUrl: true });
          }
        }),
        mapTo(false),
      );
    } else {
    }
    return true;
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const { id } = route.params;
    const [fn, ln] = id.split('-').map(s => `%${s}%`);
    return this.apollo.query({query: personQuery, variables: {fn, ln}}).pipe(
      pluck('data', 'employees'),
      map(employees => employees[0]),
    );
  }

  constructor(public router: Router, public apollo: Apollo) {}
}
