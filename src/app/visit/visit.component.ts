import {Component, OnInit, OnDestroy} from '@angular/core';
import {RestService} from "../rest.service";
import {PatientService} from "../patient.service";
import {AuthService} from "../auth.service";
import * as moment from "moment";
import {SocketService} from "../socket.service";
import {Subscription} from "rxjs";
import {SafService} from "../saf.service";

@Component({
  selector: 'app-visit',
  templateUrl: './visit.component.html',
  styleUrls: ['./visit.component.css']
})
export class VisitComponent implements OnInit,OnDestroy {
  visits = [];
  waitings = [];
  pid: number;
  x;
  enabled: boolean;
  currentVisit = [];
  currentWaiting = [];
  isVisitingOrWaiting: boolean;
  isWaiting: boolean;
  isVisiting: boolean;
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
  private pidSub: Subscription;

  constructor(private restService: RestService, private patientService: PatientService, private authService: AuthService, private socket:SocketService, private safService:SafService) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe((auth) =>this.isDoctor = auth && this.authService.userType === 'doctor');
    this.refresh();
    this.socket.onMessage(msg=>{
      if(msg.msgType==="Patient Dismissed"){
        this.visits = this.visits.filter(r=>r.pid!==msg.pid);
        this.doctors = this.doctors.concat(this.allDoctors.filter(r=>r.display_name===msg.dr_name));
        this.canGo = true;
        this.currentVisit = [];
      }
    });
  }


  private getPatientId() {
    this.pidSub = this.patientService.pid$.subscribe(pid => {
      this.pid = pid;
      this.enabled = true;
      this.currentVisit = this.visits.filter(r => r.pid === this.pid);
      this.currentWaiting = this.waitings.filter(r=> r.pid === this.pid);
      this.isVisiting = this.currentVisit.length>0;
      this.isWaiting = this.currentWaiting.length>0;
      this.isVisitingOrWaiting = this.isVisiting || this.isWaiting;
      this.canGo = !this.isVisitingOrWaiting ||(this.currentVisit.length>0 && this.authService.display_name === this.currentVisit[0].display_name);
      this.isCurrentDoctorVisit = this.canGo && this.currentVisit.length>0;
      if (this.isCurrentDoctorVisit) {
        this.pageNumber = this.currentVisit[0].paper_id % 101 + 1;
        this.notebookNumber = Math.floor(this.currentVisit[0].paper_id / 101 ) + 1;
        this.paperDisabled = true;
      }
      else {
        this.notebookNumber = this.patientService.notebookNumber;
        this.pageNumber = this.patientService.pageNumber;
      }
    })
  }

  endVisit(uid, pid) {
    this.restService.update('end-visit/' + pid, uid, {}).subscribe(
        () => {
          let ind = this.visits.findIndex(r => r.pid === pid && r.did === uid);
          this.socket.send({
            cmd: 'send',
            target: ['doctor/'+this.allDoctors.filter(r=>r.uid===this.visits[ind].did)[0].name],
            msg:{
              msgType: 'Patient Dismissed by Admin',
              text: `${moment().format('HH:mm')}: Visit of "${this.visits[ind].firstname} ${this.visits[ind].surname}" was ended by the admin.`,
            }
          });
          this.visits.splice(this.visits[ind], 1);
          this.refresh();
        },
        err => {
          console.log(err);
        }
    )
  }

  refresh() {
    this.waitings = [];
    let a = this.safService.safWatingForVisit;
    for (let key in a) {
      for (var x = 0; x < a[key].length; x++) {
        this.waitings.push(a[key][x]);
      }
    }
    this.restService.get('active-visits').subscribe(
        data => {
          this.visits = [];
          data.forEach(r => this.visits.push(r));
          setInterval(() => this.visits.forEach(r => r.duration = moment.duration(moment().diff(r.start_time)).humanize()), 1000);
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
    );
  }



  send() {
    if( this.visits.filter(r => r.did === this.doctor).length ===0 ) {
      this.restService.insert('visit', {
        did: this.doctor,
        page_number: this.pageNumber,
        notebook_number: this.notebookNumber,
        pid: this.pid,
      }).subscribe(
          () => {
            this.socket.send({
              cmd: 'send',
              target: ['doctor/' + this.allDoctors.filter(r => r.uid === this.doctor)[0].name],
              msg: {
                msgType: "New visit",
                text: `${moment().format('HH:mm')}: New patient "${this.patientService.firstname} ${this.patientService.surname}" is sent to you for visit.`
              }
            });
            if (this.currentVisit.length && this.authService.display_name === this.currentVisit[0].display_name) { //referral by doctor
              this.endVisit(this.currentVisit[0].did, this.currentVisit[0].pid);
            }
            else
              this.refresh();
          },
          err => console.log(err)
      )
    }
    else{
      let data = {
        did : this.doctor,
        pid : this.pid,
        page_num : this.pageNumber,
        note_num : this.notebookNumber,
        firstname : this.patientService.firstname,
        surname : this.patientService.surname,
        waite_start_time : moment().format('HH:mm'),
        display_name: this.allDoctors.filter(r=>r.uid === this.doctor)[0].display_name,
      };
      this.safService.addPatientToSaf(data,()=>{
        this.waitings.push(data);
        if(this.currentVisit.length && this.authService.display_name === this.currentVisit[0].display_name) { //referral by doctor
          this.endVisit(this.currentVisit[0].did, this.currentVisit[0].pid);
        }
        else
          this.refresh();
      });
    }
  }

  updateDoctorsDropDown() {
    if (this.currentVisit.length && this.authService.display_name === this.currentVisit[0].display_name) { //referral by doctor
      this.doctors = this.allDoctors.filter(r => r.display_name!=this.authService.display_name)
    }
    else
      this.doctors = this.allDoctors;
    this.allBusy  = this.allDoctors.filter(r => !this.visits.find(s => s.did === r.uid)).length === 0 ? true : false;
  }


  checkState() {
      this.sendEnabled = this.doctor !== null && this.pageNumber !== null && this.notebookNumber !== null;
      if(this.sendEnabled) {
          this.patientService.notebookNumber = this.notebookNumber;
          this.patientService.pageNumber = this.pageNumber;
      }
  }

  ngOnDestroy(){
    this.pidSub.unsubscribe();
  }
}
