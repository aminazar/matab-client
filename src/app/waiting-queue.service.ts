import {Injectable, isDevMode} from '@angular/core';
import {RestService} from "./rest.service";
import {MessageService} from "./message.service";
import {Observable, ReplaySubject} from "rxjs";
import {SocketService} from "./socket.service";
import {Http, Response, URLSearchParams} from "@angular/http";
import {WebSocketService} from 'angular2-websocket-service'
import {isUndefined} from "util";
import moment = require("moment");
import {Subscription} from "rxjs/Subscription";

@Injectable()
export class WaitingQueueService {
    public waitingQueue = [];
    private waitingQueueSource = new ReplaySubject<any>();
    waitingQueue$ = this.waitingQueueSource.asObservable();
    private socketSub: Subscription;

    constructor(private restService: RestService, private socketService: SocketService) {
    }


    public init() {
        this.getWaitingList();

        this.socketSub = this.socketService.getPatientMessages().subscribe((message: any) => {

            console.log(message);


            if (message.cmd == SocketService.NEW_VISIT_CMD) {

                this.waitingQueue.push(message.msg);

            } else if (message.cmd === SocketService.DISMISS_CMD) {

                this.waitingQueue = this.waitingQueue.filter(w => w.pid !== message.msg.pid);
                this.waitingQueue.filter(w => w.did === message.msg.did && w.priority > 0).forEach(w => {

                    w.priority --;

                    if (w.priority === 0)
                        w.vid = message.msg.vid
                });

            } else if (message.cmd == SocketService.REFER_VISIT_CMD) {


                let referred_waiting = this.waitingQueue.filter(w => w.vid === message.msg.refer_vid)[0];
                referred_waiting.did = message.msg.to_did;
                referred_waiting.doctor = message.msg.to_doctor;

                this.waitingQueue.filter(w => w.did === message.msg.from_did && w.priority > 0).forEach(w => {

                    w.priority --;

                    if (w.priority === 0)
                        w.vid = message.msg.vid
                });

                // as referred patient is already in to_did list, the list length is >= 1
                if (this.waitingQueue.filter(w => w.did === message.msg.to_did).length > 1) {
                    this.waitingQueue.filter(w => w.did === message.msg.to_did && w.priority > 0).forEach(w => {

                        w.priority ++;
                    });

                    referred_waiting.priority = 1;
                    referred_waiting.vid = null;

                } else {
                    referred_waiting.priority = 0;
                    referred_waiting.vid = message.msg.refer_vid;
                }


            }
            this.updateObservable();

            console.log('after ===> ', JSON.stringify(this.waitingQueue));

        });

    }

    /**
     *
     * @param callBack is used when afterCall function must be called after list is received
     */
    getWaitingList(callBack: any = () => {}) {

        this.restService.get('get-waiting-list').subscribe(data => {
                this.waitingQueue = [];
                data.forEach(d => {
                    this.waitingQueue.push(d);

                });

                console.log(JSON.stringify(this.waitingQueue));

                this.updateObservable();

                callBack();

            },
            err => console.log(err)
        );
    }

    addPatientToQueue(data: any) {

        this.restService.insert('waiting', data).subscribe((data) => {

            },
            err => console.log(err)
        );
    }


    public dismissVisit(did, pid) {
        this.restService.update('end-visit/' + pid, did, {}).subscribe(() => {

            },
            err => {
                console.log(err);
            }
        )

    }


    public referPatient(data) {

        this.restService.update('refer-visit/', null, data).subscribe(() => {

            },
            err => {
                console.log(err);
            }
        )
    }


    private updateObservable() {
        this.waitingQueueSource.next(this.waitingQueue);
    }

    ngOnDestroy() {
        this.socketSub.unsubscribe();
    }

}
