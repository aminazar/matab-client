import {Injectable, isDevMode} from '@angular/core';
import {RestService} from './rest.service';
import {Router} from '@angular/router';
import {MessageService} from './message.service';
import {Observable, ReplaySubject} from 'rxjs';
import {SocketService} from './socket.service';
import {Subscription} from 'rxjs/Subscription';
import {VisitService} from './visit.service';
import {PatientService} from "./patient.service";

@Injectable()
export class AuthService {
  private authStream = new ReplaySubject<boolean>(1);
  public user = '';
  public userType = '';
  auth$: Observable<boolean> = this.authStream.asObservable();
  originBeforeLogin = '/';
  public display_name = '';
  public userId = -1;

  private userSocketSub: Subscription;

  constructor(private restService: RestService,
              private router: Router,
              private messageService: MessageService,
              private socketService: SocketService,
              private visitService: VisitService,
              private patientService: PatientService) {
    this.restService.call('validUser')
      .subscribe(
        res => {
          this.afterLogin(res);
          this.messageService.message(`You are already logged in as ${this.user}.`)
        },
        err => {
          if (isDevMode())
            console.log(err);
          this.authStream.next(false);

        });

  }

  logIn(username, password) {
    this.restService.update('login', undefined, {username: username, password: password})
      .subscribe(res => {
          this.afterLogin(res);
          let url = this.originBeforeLogin;
          this.router.navigate([url !== null ? url : '/']);
          this.messageService.message(`${this.user} logged in.`);

        },
        err => {
          this.authStream.next(false);
          this.messageService.error(err);
          if (isDevMode())
            console.log(err);
        })
  }

  private afterLogin(res) {
    let data = res.json();
    this.user = data.user;
    this.userType = data.userType;
    this.display_name = data.display_name;
    this.userId = data.uid;
    this.authStream.next(true);
    this.visitService.auth = data;

    // Initialize tp list for patient list of necessary
    this.patientService.initTPList();


    this.socketService.init();


    if (this.userType === 'doctor')
      this.socketService.sendUserMessage({
        cmd: SocketService.LOGIN_CMD,
        msg: {
          text: `${this.display_name} logged in.`
        }
      });

    if (this.userType === 'admin' || this.userType === 'user')
      this.userSocketSub = this.socketService.getUserMessages().subscribe((message: any) => {
        if (message.cmd === SocketService.LOGIN_CMD || message.cmd === SocketService.LOGOUT_CMD)
          this.messageService.warn(message.msg.text);
      });

    this.visitService.initSocketSub(this.userType, this.userId);


  }

  logOff() {
    this.restService.call('logout')
      .subscribe(() => {
          this.messageService.message(`${this.user} logged out.`);
          this.user = '';
          this.userType = '';
          this.userId = -1;
          this.authStream.next(false);
          this.router.navigate(['login']);

          if (this.userType === 'admin' || this.userType === 'user')
            this.userSocketSub.unsubscribe();

          this.socketService.disconnect();
        },
        err => {
          this.messageService.error(err);
          if (isDevMode())
            console.log(err);
        });
  }


}
