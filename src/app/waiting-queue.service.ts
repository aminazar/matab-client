import {Injectable, isDevMode} from '@angular/core';
import {RestService} from "./rest.service";
import {MessageService} from "./message.service";
import {Observable, ReplaySubject} from "rxjs";
import {SocketService} from "./socket.service";
import moment = require("moment");
import {Subscription} from "rxjs/Subscription";

@Injectable()
export class WaitingQueueService {
    public waitingQueue = [];
    private waitingQueueSource = new ReplaySubject<any>();
    waitingQueue$ = this.waitingQueueSource.asObservable();
    private socketSub: Subscription;

    private userType;
    private userId ;

    constructor(private restService: RestService,
                private socketService: SocketService,
                private messageService: MessageService) {
    }


    public init(userType, userId) {

        this.userType = userType;
        this.userId = userId;

        this.getWaitingList();

        this.socketSub = this.socketService.getPatientMessages().subscribe((message: any) => {

            if (message.cmd == SocketService.NEW_VISIT_CMD) {

                this.waitingQueue.push(message.msg);


                if (userType === 'admin' || userType === 'user') {
                    if (message.msg.vid)
                        this.messageService.message(`${message.msg.firstname} ${message.msg.surname} is now visiting by ${message.msg.doctor}.`);
                    else
                        this.messageService.message(`${message.msg.firstname} ${message.msg.surname} is sent to ${message.msg.doctor} waiting list.`);
                }

            } else if (message.cmd === SocketService.DISMISS_CMD) {

                this.waitingQueue = this.waitingQueue.filter(w => w.pid !== message.msg.pid);
                this.waitingQueue.filter(w => w.did === message.msg.did && w.priority > 0).forEach(w => {

                    w.priority--;

                    if (w.priority === 0)
                        w.vid = message.msg.vid
                });

                if (userType === 'admin' ||userType === 'user' || (userType === 'doctor' && message.msg.did === userId))

                    this.messageService.message(`patient is dismissed.`);


            } else if (message.cmd == SocketService.REFER_VISIT_CMD) {


                let referred_waiting = this.waitingQueue.filter(w => w.vid === message.msg.refer_vid)[0];
                referred_waiting.did = message.msg.to_did;
                referred_waiting.doctor = message.msg.to_doctor;

                this.waitingQueue.filter(w => w.did === message.msg.from_did && w.priority > 0).forEach(w => {

                    w.priority--;

                    if (w.priority === 0)
                        w.vid = message.msg.vid
                });

                // as referred patient is already in to_did list, the list length is >= 1
                if (this.waitingQueue.filter(w => w.did === message.msg.to_did).length > 1) {
                    this.waitingQueue.filter(w => w.did === message.msg.to_did && w.priority > 0).forEach(w => {

                        w.priority++;
                    });

                    referred_waiting.priority = 1;
                    referred_waiting.vid = null;

                } else {
                    referred_waiting.priority = 0;
                    referred_waiting.vid = message.msg.refer_vid;
                }

                if (userType === 'admin' ||userType === 'user' || (userType === 'doctor' && message.msg.from_did === userId))
                    this.messageService.message(`patient is referred to ${message.msg.to_doctor}.`);

                if (userType === 'doctor' && message.msg.to_did === userId)
                    this.messageService.popup(`new patient is referred to you`, 'Refer Message' , false);

            }
            this.updateObservable();
        });

    }

    /**
     *
     * @param callBack is used when afterCall function must be called after list is received
     */
    getWaitingList(callBack: any = () => {
    }) {

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

}
