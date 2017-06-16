import {Component, OnInit, OnDestroy} from '@angular/core';
import {RestService} from "../rest.service";
import {PatientService} from "../patient.service";
import {AuthService} from "../auth.service";
import * as moment from "moment";
import {SocketService} from "../socket.service";
import {Subscription} from "rxjs";
import {WaitingQueueService} from "../waiting-queue.service";
import {current} from "codelyzer/util/syntaxKind";

@Component({
    selector: 'app-visit',
    templateUrl: './visit.component.html',
    styleUrls: ['./visit.component.css']
})
export class VisitComponent implements OnInit, OnDestroy {
    visits = [];
    waiting = [];
    pid: number;
    enabled: boolean;
    currentVisit;
    currentWaiting = [];
    isVisitingOrWaiting: boolean;
    isWaiting: boolean;
    isVisiting: boolean;
    canGo: boolean;
    doctors = [];
    did = null;
    pageNumber: number = null;
    notebookNumber: number = null;
    sendEnabled = false;
    allBusy = false;
    paperDisabled: boolean = false;
    isCurrentDoctorVisit = false;
    isDoctor: boolean;
    private allDoctors: any;
    private pidSub: Subscription;

    constructor(private restService: RestService, private patientService: PatientService, private authService: AuthService, private socket: SocketService, private waitingQueueService: WaitingQueueService) {

    }

    ngOnInit() {


        // console.log('Ng Init...');

        this.authService.auth$.subscribe((auth) => this.isDoctor = auth && this.authService.userType === 'doctor');
        // this.refresh();
        this.socket.onMessage(msg => {
            if (msg.msgType === "Patient Dismissed") {
                this.visits = this.visits.filter(r => r.pid !== msg.pid);
                this.doctors = this.doctors.concat(this.allDoctors.filter(r => r.display_name === msg.dr_name));
                this.canGo = true;
                this.currentVisit = [];
            }
        });

        if (this.waitingQueueService.waitingQueue.length > 0) {

            console.log('Waiting Queue: ', this.waitingQueueService.waitingQueue);
            this.init(this.waitingQueueService.waitingQueue);
        }
        else {

            this.refresh();

        }
        this.waitingQueueService.waitingQueueObservable.subscribe((data) => {

            // console.log('next is done on subscription');
            this.init(data);

        });
    }

    private init(waitingQueue) {
        this.visits = waitingQueue.filter(r => r.priority === '0');
        // console.log('visits:', this.visits);

        this.waiting = waitingQueue.filter(r => r.priority !== '0');
        // console.log('waiting:', this.waiting);

        setInterval(() => this.visits.forEach(r => r.duration = moment.duration(moment().diff(r.start_time)).humanize()), 0);

        this.getPatientId();

        if (this.allDoctors)
            this.updateDoctorsDropDown();
        else {
            this.restService.get('doctors').subscribe(
                drs => {
                    this.allDoctors = drs;
                    this.updateDoctorsDropDown();
                });
        }
    }

    private getPatientId() {
        this.pidSub = this.patientService.pid$.subscribe(pid => {
            this.pid = pid;
            this.enabled = true;
            this.currentVisit = this.visits.filter(r => (r.pid === this.pid && r.doctor === this.authService.display_name))[0];
            // console.log('current visit: ', this.currentVisit);
            this.currentWaiting = this.waiting.filter(r => r.doctor === this.authService.display_name);
            // console.log('current waiting: ', this.currentWaiting);
            this.isVisiting = this.currentVisit != null;
            this.isWaiting = this.currentWaiting.length > 0;
            this.isVisitingOrWaiting = this.isVisiting || this.isWaiting;
            this.canGo = !this.isVisitingOrWaiting || (this.currentVisit != null && this.authService.display_name === this.currentVisit.doctor);
            this.isCurrentDoctorVisit = this.canGo && this.currentVisit != null;
            if (this.isCurrentDoctorVisit) {
                this.pageNumber = this.currentVisit.paper_id % 101 + 1;
                this.notebookNumber = Math.floor(this.currentVisit.paper_id / 101) + 1;
                this.paperDisabled = true;
            }
            else {
                this.notebookNumber = this.patientService.notebookNumber;
                this.pageNumber = this.patientService.pageNumber;
            }
        })
    }

    refresh() {
        this.waitingQueueService.getWaitingList(() => {
        });
    }


    send() {

        if (this.authService.userType === 'doctor') {
            this.referPatient();
            return;
        }

        this.waitingQueueService.addPatientToQueue({
                did: this.did,
                page_num: this.pageNumber,
                note_num: this.notebookNumber,
                pid: this.pid,
            }, () => {

                this.socket.send({
                    cmd: 'send',
                    target: ['doctor/' + this.allDoctors.filter(r => r.uid === this.did)[0].name],
                    msg: {
                        msgType: "New visit",
                        text: `${moment().format('HH:mm')}: New patient "${this.patientService.firstname} ${this.patientService.surname}" is sent to you for visit.`
                    }
                });
                this.refresh();
            }
        )


    }

    private referPatient() {
        if (this.currentVisit != null && this.authService.display_name === this.currentVisit.doctor) { //referral by doctor

            // this.waitingQueueService.dismissVisit(this.currentVisit[0].did, this.currentVisit[0].pid, () => {
            //
            //     let ind = this.visits.findIndex(r => r.pid === this.currentVisit[0].pid && r.did === this.currentVisit[0].did);
            //     this.socket.send({
            //         cmd: 'send',
            //         target: ['doctor/' + this.allDoctors.filter(r => r.uid === this.visits[ind].did)[0].name],
            //         msg: {
            //             msgType: 'Patient Dismissed by Admin',
            //             text: `${moment().format('HH:mm')}: Visit of "${this.visits[ind].firstname} ${this.visits[ind].surname}" was ended by the admin.`,
            //         }
            //     });
            // this.visits.splice(this.visits[ind], 1);
            // this.refresh();
            // });
            // return;

            this.waitingQueueService.referPatient({
                from_did: this.currentVisit.did,
                to_did: this.did,
                pid: this.pid
            }, () => {
                this.updateDoctorsDropDown();


            });

            return;

        }
    }

    dismissVisit(did, pid) {

        this.waitingQueueService.dismissVisit(did, pid);
    }

    updateDoctorsDropDown() {

        // if (this.currentVisit != null && this.authService.display_name === this.currentVisit.doctor) { //referral by doctor
        //     this.doctors = this.allDoctors.filter(r => r.display_name != this.authService.display_name)
        // }

        if (this.authService.userType === 'doctor') {
            this.doctors = this.allDoctors.filter(r => r.display_name != this.authService.display_name)
        }
        else
            this.doctors = this.allDoctors;

        this.allBusy = this.allDoctors.filter(r => !this.visits.find(s => s.did === r.uid)).length === 0 ? true : false;

    }


    checkState() {
        this.sendEnabled = this.did != null && this.pageNumber != null && this.notebookNumber != null;
        if (this.sendEnabled) {
            this.patientService.notebookNumber = this.notebookNumber;
            this.patientService.pageNumber = this.pageNumber;
        }
    }

    ngOnDestroy() {
        this.pidSub.unsubscribe();
    }
}
