import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from "rxjs";

@Injectable()
export class SocketService {


    public static readonly LOGIN_CMD : string = 'login';
    public static readonly DISMISS_CMD : string = 'dismiss';
    public static readonly NEW_VISIT_CMD: string = 'newVisit';

    private url = 'http://localhost:3000';
    private socketConfig = {
        transports: ['websocket']
    };

    private userSocket;
    private patientSocket;

    private userObservable = new Observable(observer => {
        this.userSocket.on('message', (data) => {
            observer.next(data);
        });
        return () => {
            this.userSocket.disconnect();
        };
    });

    private patientObservable = new Observable(observer => {
        this.patientSocket.on('message', (data) => {
            observer.next(data);
        });
        return () => {
            this.patientSocket.disconnect();
        };
    });


    constructor() {

    }


    public init() {

        this.userSocket = io(this.url + '/user', this.socketConfig);
        this.patientSocket = io(this.url + '/patient', this.socketConfig);

    }


    /**
     * socket.broadcast.emit() behaves similar to io.sockets.emit ,
     * but instead of emitting to all connected sockets it will emit to all connected socket except the one it is being called on.
     * @param message
     */


    sendUserMessage(message) {
        this.userSocket.emit('message', message);
    }


    sendPatientMessage(message) {
        this.userSocket.emit('message', message);
    }


    getUserMessages() {

        return this.userObservable;
    }

    getPatientMessages() {

        return this.patientObservable;
    }


}
