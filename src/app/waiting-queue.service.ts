import {Injectable, isDevMode} from '@angular/core';
import {RestService} from "./rest.service";
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
    private socketObserver;

    constructor(private restService: RestService, private socketService: SocketService) {
    }


    public init(){
        this.getWaitingList();

       this.socketObserver =  this.socketService.getPatientMessages().subscribe( (message:any) => {

            if (message.cmd === SocketService.DISMISS_CMD) {
                this.waitingQueue = this.waitingQueue.filter(r => r.pid !== message.msg.pid);
                this.updateObservable();

            }

        });


    }

    /**
     *
     * @param callBack is used when afterCall function must be called after list is received (e.g: referVisit)
     */
    getWaitingList(callBack:any=()=>{}) {

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


    public dismissVisit(did, pid, callback) {
        this.restService.update('end-visit/' + pid, did, {}).subscribe(
            () => {

                this.waitingQueue = this.waitingQueue.filter(w => w.pid !== pid);
                this.waitingQueue.filter(w => w.did === did).forEach(w => {
                    if (w.priority > 0)
                       w.priority = (w.priority -1).toString();
                });

                this.updateObservable();

                callback();
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

    public informDoctorNewPatient(doctorName , firstname , surname){

        this.socketService.sendPatientMessage({
            cmd: SocketService.NEW_VISIT_CMD,
            msg: {
                text: `${moment().format('HH:mm')}: New patient "${firstname} ${surname}" is sent to you for visit.`
            }
        });


    }

    public informDoctorDismissPatient(pid, firstname, surname, doctorName ){
        this.socketService.sendPatientMessage({
            cmd: SocketService.DISMISS_CMD,
            msg: {
                text: `${moment().format('HH:mm')}: ${doctorName} dismissed "${firstname} ${surname}".`,
                pid: pid,
                dr_name: doctorName,
            },
        });

    }


    private updateObservable() {

        this.waitingQueueSource.next(this.waitingQueue);
    }

    ngOnDestroy() {
        this.socketObserver.unsubscribe();
    }

}