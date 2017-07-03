/**
 * Created by Amin on 27/09/2016.
 */
import {Injectable} from '@angular/core';
import {CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {AuthService} from "../auth.service";
import {Observable} from "rxjs/Observable";

@Injectable()

export class LoggedInGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

       return this.authService.auth$.map(
            (val: boolean) => {
                if (!val) {
                    this.authService.originBeforeLogin = state.url;
                    this.router.navigate(['login']);
                    return false;
                }
                return true;

            });
    }
}
