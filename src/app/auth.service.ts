import {Injectable,isDevMode} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {RestService} from "./rest.service";
import {Router} from "@angular/router";
import {MessageService} from "./message.service";

@Injectable()
export class AuthService {
  private authStream = new Subject<boolean>();
  public user = '';
  public userType = '';
  auth$ = this.authStream.asObservable();
  originBeforeLogin = '/';

  constructor(private restService: RestService, private router: Router, private messageService:MessageService) {
    this.restService.call('validUser')
      .subscribe(
        res => {
          this.afterLogin(res);
          this.router.navigate(['/']);
          this.messageService.message(`You are already logged in as ${this.user}.`)
        },
        err => {
          if(isDevMode())
            console.log(err);
          this.authStream.next(false);
          this.router.navigate(['login']);
        });
  }

  logIn(username, password) {
    this.restService.update('login', null, {username: username, password: password})
      .subscribe(res => {
          this.afterLogin(res);
          let url = this.originBeforeLogin;
          this.router.navigate([url !== null ? url : '/']);
          this.messageService.message(`${this.user} logged in.`);
        },
        err => {
          this.authStream.next(false);
          this.messageService.error(err);
          if(isDevMode())
            console.log(err);
        })
  }

  private afterLogin(res) {
    let data = res.json();
    this.user = data.user;
    this.userType = data.userType;
    this.authStream.next(true);
  }

  logOff() {
    this.restService.call('logout')
      .subscribe(() => {
          this.messageService.message(`${this.user} logged out.`);
          this.user = '';
          this.userType = '';
          this.authStream.next(false);
          this.router.navigate(['login']);
        },
        err => {
          this.messageService.error(err);
          if(isDevMode())
            console.log(err);
        });
  }
}
