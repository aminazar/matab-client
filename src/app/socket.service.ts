import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from "rxjs";

@Injectable()
export class SocketService {


    public static readonly LOGIN_CMD: string = 'login';
    public static readonly DISMISS_CMD: string = 'dismiss';
    public static readonly NEW_VISIT_CMD: string = 'newVisit';
    public static readonly REFER_VISIT_CMD: string = 'referVisit';

    private url = 'http://localhost:3000';
    private socketConfig = {
        transports: ['websocket']
    };

    private userSocket;
    private patientSocket;

    private userObservable = new Observable(observer => {
        this.userSocket.on('ans', (data) => {
            observer.next(data);
        });
        // return () => {
        //     this.userSocket.disconnect();
        // };
    });

    private patientObservable = new Observable(observer => {
        this.patientSocket.on('ans', (data) => {
            console.log('patient socket data received...');
            observer.next(data);
        });
        // return () => {
        //     this.patientSocket.disconnect();
        // };
    });


    constructor() {

    }


    public init() {

        this.userSocket = io(this.url + '/user', this.socketConfig);
        this.patientSocket = io(this.url + '/patient', this.socketConfig);
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

    disconnect() {

        this.userSocket.disconnect();
        this.patientSocket.disconnect();
    }

}
