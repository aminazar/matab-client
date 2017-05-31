import {Injectable, isDevMode} from '@angular/core';
import {RestService} from "./rest.service";
import {Router} from "@angular/router";
import {MessageService} from "./message.service";
import {Observable, ReplaySubject} from "rxjs";
import {SocketService} from "./socket.service";
import {CONSTS} from "./const";

@Injectable()
export class AuthService {
    private authStream = new ReplaySubject<boolean>(1);
    public user = '';
    public userType = '';
    auth$: Observable<boolean> = this.authStream.asObservable();
    originBeforeLogin = '/';
    public display_name = '';

    constructor(private restService: RestService, private router: Router, private messageService: MessageService, private internalSocket: SocketService) {
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

                    // TODO if statement is temporary. it should be fixed later on server

                    if (this.router.url !== CONSTS.WL_ROUTE)
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
                    if (isDevMode())
                        console.log(err);
                })
    }

    private afterLogin(res) {
        let data = res.json();
        this.user = data.user;
        this.userType = data.userType;
        this.display_name = data.display_name;
        this.authStream.next(true);
        this.internalSocket.initSocket(this.userType, this.user);
        if (this.userType === 'doctor')
            this.internalSocket.send({
                cmd: 'send',
                target: ['admin', 'user'],
                msg: {
                    msgType: 'Login',
                    text: `${this.display_name} logged in.`,
                },
            });

        if (this.userType === 'admin' || this.userType === 'user')
            this.internalSocket.onMessage(msg => {
                if (msg.msgType === "Login")
                    this.messageService.warn(msg.text);
                if (msg.msgType === "Patient Dismissed")
                    this.messageService.popup(msg.text, msg.msgType)
            });
    }

    logOff() {
        this.restService.call('logout')
            .subscribe(() => {
                    this.messageService.message(`${this.user} logged out.`);
                    this.user = '';
                    this.userType = '';
                    this.authStream.next(false);
                    this.router.navigate(['login']);
                    this.internalSocket.ngOnDestroy();
                },
                err => {
                    this.messageService.error(err);
                    if (isDevMode())
                        console.log(err);
                });
    }
}
