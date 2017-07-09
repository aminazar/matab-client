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
    private visits = [];
    private pid: number; // is used in admin mode. when admin wants to send patient to doctor visit list
    private enabled: boolean;
    private currentVisit;
    private doctors;
    private did = null; // selected doctor (from drop down) did
    private pageNumber: number = null;
    private notebookNumber: number = null;
    private sendEnabled = false;
    private allBusy = false;
    private paperDisabled: boolean = false;
    private isDoctor: boolean;
    private pidSub: Subscription;
    private authSub: Subscription;
    private waitingQueueSub: Subscription;


    constructor(private restService: RestService, private patientService: PatientService, private authService: AuthService, private waitingQueueService: WaitingQueueService) {

    }

    ngOnInit() {



        this.authSub = this.authService.auth$.subscribe((auth) => this.isDoctor = auth && this.authService.userType === 'doctor');

        this.waitingQueueSub =this.waitingQueueService.waitingQueue$.subscribe((data) => {

            this.visits = data.filter(r => r.vid);
            setInterval(() => this.visits.forEach(r => r.duration = moment.duration(moment().diff(r.start_time)).humanize()), 0);
            this.getCurrentPatient();
        });

        // in admin mode, when new patient is added, it should be updated
        this.pidSub = this.patientService.pid$.subscribe(pid => {
            this.pid = pid;
        });

        if (this.doctors)
            this.updateDoctorsDropDown();
        else {

            this.restService.get('doctors').subscribe(
                drs => {
                    this.doctors = drs;
                    this.updateDoctorsDropDown();
                });
        }

    }

    private getCurrentPatient() {


        this.pid = this.patientService.pid;

        this.enabled = true;
        this.currentVisit = this.visits.filter(r => r.doctor === this.authService.display_name && r.vid)[0];
        // console.log('current visit: ', this.currentVisit);

        if (this.currentVisit) {
            this.pageNumber = this.currentVisit.paper_id % 101 + 1;
            this.notebookNumber = Math.floor(this.currentVisit.paper_id / 101) + 1;
            this.paperDisabled = true;
        }
        else {
            this.notebookNumber = this.patientService.notebookNumber;
            this.pageNumber = this.patientService.pageNumber;
        }

    }

    refresh() {
        this.waitingQueueService.getWaitingList();
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
            }
        )
    }

    private referPatient() {
        if (this.currentVisit != null && this.authService.display_name === this.currentVisit.doctor) { //referral by doctor

            this.waitingQueueService.referPatient({
                from_did: this.currentVisit.did,
                to_did: this.did,
                to_doctor: this.doctors.filter(d => d.uid === this.did)[0].display_name,
                pid: this.currentVisit.pid,
                vid: this.currentVisit.vid

            });

        }
    }


    /**
     * this method is accessible only for admin users
     * @param did
     * @param pid
     * @param firstname
     * @param surname
     * @param doctor
     */
    dismissVisit(did, pid) {

        this.waitingQueueService.dismissVisit(did, pid);
    }

    updateDoctorsDropDown() {

        if (this.authService.userType === 'doctor') {
            this.doctors = this.doctors.filter(r => r.display_name != this.authService.display_name)
        }

    }


    checkState() {
        this.sendEnabled = this.did != null && this.pageNumber != null && this.notebookNumber != null;

        if (this.authService.userType === 'doctor' && !this.currentVisit)
            this.sendEnabled = false;

        if (this.sendEnabled) {
            this.patientService.notebookNumber = this.notebookNumber;
            this.patientService.pageNumber = this.pageNumber;
        }
    }

    ngOnDestroy() {
        this.authSub.unsubscribe();
        this.pidSub.unsubscribe();
        this.waitingQueueSub.unsubscribe();
    }
}
