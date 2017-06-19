import {Injectable, isDevMode} from '@angular/core';
import {Component, OnInit, Input} from '@angular/core';
import {RestService} from "./rest.service";
import {Router} from "@angular/router";
import {MessageService} from "./message.service";
import {Observable, ReplaySubject} from "rxjs";
import {SocketService} from "./socket.service";
import {Http, Response, URLSearchParams} from "@angular/http";
import {WebSocketService} from 'angular2-websocket-service'
import {isUndefined} from "util";
import moment = require("moment");
import {Subject} from "rxjs/Subject";
import {forEach} from "@angular/router/src/utils/collection";

@Injectable()
export class WaitingQueueService {
    public waitingQueue = [];

    private waitingQueueSource = new ReplaySubject<any>();

    waitingQueueObservable = this.waitingQueueSource.asObservable();

    constructor(private restService: RestService, private http: Http, private socket: WebSocketService, private messageService: MessageService) {

        console.log('waiting service constructed');
        this.getWaitingList(() => {});
    }


    /**
     *
     * @param callBack is used when afterCall function must be called after list is received (e.g: referVisit)
     */
    getWaitingList(callBack) {

        this.restService.get('get-waiting-list').subscribe(data => {
                this.waitingQueue = [];
                data.forEach(d => {
                    this.waitingQueue.push(d);

                });

                this.updateObservable();

                callBack();

            },
            err => console.log(err)
        );
    }

    addPatientToQueue(data: any, callback) {

        this.restService.insert('waiting', data).subscribe((data) => {

                this.waitingQueue.push(data);
                this.updateObservable();
                callback();
            },
            err => console.log(err)
        );
    }


    public dismissVisit(did, pid) {
        this.restService.update('end-visit/' + pid, did, {}).subscribe(
            () => {

                this.waitingQueue = this.waitingQueue.filter(w => w.pid !== pid);
                this.waitingQueue.filter(w => w.did === did).forEach(w => {
                    if (w.priority > 0)
                       w.priority = (w.priority -1).toString();
                });

                this.updateObservable();
            },
            err => {
                console.log(err);
            }
        )

    }


    public referPatient(data , callback) {

        this.restService.update('refer-visit/', null, data).subscribe(
            () => {

                this.getWaitingList(() => {
                    callback();
                });

            },
            err => {
                console.log(err);
            }
        )


    }

    private updateObservable() {

        this.waitingQueueSource.next(this.waitingQueue);
    }

}
