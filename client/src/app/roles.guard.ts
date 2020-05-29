import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { pluck, tap, map } from 'rxjs/operators';

import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {
  constructor(public service: UserService, public router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.service.user$.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        if (next.data.roles.length === 0) {
          return true;
        }
        if (!user.roles?.some(role => role in next.data.roles)) {
          this.router.navigate(['/forbidden']);
          return false;
        }
        return true;
      }),
    );
  }
}
