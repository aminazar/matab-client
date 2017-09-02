import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from "rxjs";
import {ReplaySubject} from "rxjs/ReplaySubject";

@Injectable()
export class SocketService {


  public static readonly LOGIN_CMD: string = 'login';
  public static readonly LOGOUT_CMD: string = 'logout';
  public static readonly DISMISS_CMD: string = 'dismiss';
  public static readonly NEW_VISIT_CMD: string = 'newVisit';
  public static readonly REFER_VISIT_CMD: string = 'referLocalVisit';

  private url = window.location.origin.replace('4200', '3000');
  private socketConfig = {
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10
  };

  private userSocket;
  private patientSocket;
  private privateSocket;

  private userObservable: Observable<any>;
  private patientObservable: Observable<any>;
  private privateObservable: Observable<any>;
  private patientConnectionStream = new ReplaySubject<any>();
  patientConnect$ = this.patientConnectionStream.asObservable();

  constructor() {
  }

  public init(userType, userName) {
    this.userSocket = io(this.url + '/user', this.socketConfig);
    this.userObservable = new Observable(observer => {
      this.userSocket.on('ans', (data) => {
        observer.next(data);
      });
    });

    this.patientSocket = io(this.url + '/patient', this.socketConfig);
    this.patientObservable = new Observable(observer => {
      this.patientSocket.on('ans', (data) => {
        observer.next(data);
      });
    });
    this.userSocket.on('connect', () => {
      this.patientConnectionStream.next(true);
    });
    this.userSocket.on('disconnect', () => {
      this.patientConnectionStream.next(false);
    });
    this.privateSocket = io(`${this.url}/${userType}/${userName}`);
    this.privateObservable = new Observable(observer => {
      this.privateSocket.on('ans', data => {
        observer.next(data);
      });
    });
  }

  sendUserMessage(message) {
    this.userSocket.emit('req', message);
  }


  sendPatientMessage(message) {
    this.patientSocket.emit('req', message);
  }


  getUserMessages() {
    return this.userObservable;
  }

  getPatientMessages() {
    return this.patientObservable;
  }

  getPrivateMessages() {
    return this.privateObservable;
  }

  disconnect() {
    this.userSocket.disconnect();
    this.patientSocket.disconnect();
    this.privateSocket.disconnect();
  }

}
