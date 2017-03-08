/**
 * Created by Amin on 27/09/2016.
 */
import {Injectable} from '@angular/core';
import {CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {AuthService} from "../auth.service";

@Injectable()

export class LoggedInGuard implements CanActivate {
  private isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.auth$.subscribe(
    (val: boolean) => {
      this.isLoggedIn = val;
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.isLoggedIn) {
      this.authService.originBeforeLogin = state.url;
      this.router.navigate(['login']);
    }
    return this.isLoggedIn;
  }
}
