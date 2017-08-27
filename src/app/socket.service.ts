import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from "rxjs";

@Injectable()
export class SocketService {


  public static readonly LOGIN_CMD: string = 'login';
  public static readonly LOGOUT_CMD: string = 'logout';
  public static readonly DISMISS_CMD: string = 'dismiss';
  public static readonly NEW_VISIT_CMD: string = 'newVisit';
  public static readonly REFER_VISIT_CMD: string = 'referLocalVisit';

  private url = window.location.origin;
  private socketConfig = {
    transports: ['websocket']
  };

  private userSocket;
  private patientSocket;
  private privateSocket;

  private userObservable = new Observable(observer => {
    this.userSocket.on('ans', (data) => {
      observer.next(data);
    });

  });

  private patientObservable = new Observable(observer => {
    this.patientSocket.on('ans', (data) => {
      observer.next(data);
    });

  });

  private privateObservable = new Observable(observer => {
    this.privateSocket.on('ans', data => {
      observer.next(data);
    });
  });

  constructor() {

  }


  public init(userType, userName) {

    this.userSocket = io(this.url + '/user', this.socketConfig);
    this.patientSocket = io(this.url + '/patient', this.socketConfig);
    this.privateSocket = io(`${this.url}/${userType}/${userName}`);
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
