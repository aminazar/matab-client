import {Component, OnInit} from '@angular/core';
import {RestService} from "../rest.service";
import {PatientService} from "../patient.service";
import {AuthService} from "../auth.service";
import * as moment from "moment";
import {SocketService} from "../socket.service";

@Component({
  selector: 'app-visit',
  templateUrl: './visit.component.html',
  styleUrls: ['./visit.component.css']
})
export class VisitComponent implements OnInit {
  visits = [];
  pid: number;
  enabled: boolean;
  currentVisit = [];
  canGo: boolean;
  doctors = [];
  doctor = null;
  pageNumber: number = null;
  notebookNumber: number = null;
  sendEnabled = false;
  allBusy = false;
  paperDisabled: boolean = false;
  isCurrentDoctorVisit = false;
  isDoctor:boolean;
  private allDoctors: any;

  constructor(private restService: RestService, private patientService: PatientService, private authService: AuthService, private socket:SocketService) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe((auth) =>this.isDoctor = auth && this.authService.userType === 'doctor');
    this.refresh();
    this.socket.onMessage(msg=>{
      if(msg.msgType==="Patient Dismissed"){
        this.visits = this.visits.filter(r=>r.pid!==msg.pid);
        this.doctors.concat(this.allDoctors.filter(r=>r.display_name===msg.dr_name));
        this.canGo = true;
        this.currentVisit = [];
      }
    });
  }

  private getPatientId() {
    this.patientService.pid$.subscribe(pid => {
      this.pid = pid;
      this.enabled = true;
      this.currentVisit = this.visits.filter(r => r.pid === this.pid);
      this.canGo = this.currentVisit.length === 0 || this.authService.display_name === this.currentVisit[0].display_name;
      this.isCurrentDoctorVisit = this.canGo && this.currentVisit.length>0;
      if (this.isCurrentDoctorVisit) {
        this.pageNumber = this.currentVisit[0].paper_id % 101 + 1;
        this.notebookNumber = Math.floor(this.currentVisit[0].paper_id / 101 ) + 1;
        this.paperDisabled = true;
      }
    })
  }

  endVisit(uid, pid) {
    this.restService.update('end-visit/' + pid, uid, {}).subscribe(
      () => {
        this.visits.splice(this.visits.findIndex(r => r.pid === pid && r.did === uid), 1);
        this.refresh();
      },
      err => {
        console.log(err);
      }
    )
  }

  refresh() {
    this.restService.get('active-visits').subscribe(
      data => {
        this.visits = [];
        data.forEach(r => this.visits.push(r));
        setInterval(()=>this.visits.forEach(r=>r.duration = moment.duration(moment().diff(r.start_time)).humanize()),1000);
        this.getPatientId();
        if(this.allDoctors)
          this.updateDoctorsDropDown();
        else {
          this.restService.get('doctors').subscribe(
            drs => {
              this.allDoctors = drs;
              this.updateDoctorsDropDown();
            });
        }
      }
    );
  }

  updateDoctorsDropDown() {
    this.doctors = this.allDoctors.filter(r => !this.visits.find(s => s.did === r.uid));
    this.allBusy = this.doctors.length === 0;
  }

  checkState() {
    this.sendEnabled = this.doctor !== null && this.pageNumber !== null && this.notebookNumber !== null;
  }

  send() {
    this.restService.insert('visit', {
      did: this.doctor,
      page_number: this.pageNumber,
      notebook_number: this.notebookNumber,
      pid: this.pid,
    }).subscribe(
      () => {
        if (this.currentVisit.length && this.authService.display_name === this.currentVisit[0].display_name) { //referral by doctor
          this.endVisit(this.currentVisit[0].did, this.currentVisit[0].pid)
        }
        else
          this.refresh();
      },
      err => console.log(err)
    )
  }
}