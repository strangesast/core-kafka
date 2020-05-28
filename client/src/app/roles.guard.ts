import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {
  constructor(public service: UserService, public router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.service.user$.pipe(
      map(data => data.user?.roles.some(role => next.data.roles.includes(role))),
      tap(authenticated => {
        if (!authenticated) {
          this.router.navigate(['/login']);
        }
      }),
    );
  }
}
