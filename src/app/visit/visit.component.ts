import {Component, OnInit} from '@angular/core';
import {RestService} from "../rest.service";
import {PatientService} from "../patient.service";
import {AuthService} from "../auth.service";

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

  constructor(private restService: RestService, private patientService: PatientService, private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe((auth) =>this.isDoctor = auth && this.authService.userType === 'doctor');
    this.refresh();
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

  private endVisit(uid, pid) {
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

  private refresh() {
    this.restService.get('active-visits').subscribe(
      data => {
        this.visits = [];
        data.forEach(r => this.visits.push(r));
        this.getPatientId();
        this.restService.get('doctors').subscribe(
          drs => {
            this.doctors = drs.filter(r => !this.visits.find(s => s.did === r.uid));
            this.allBusy = this.doctors.length === 0;
          }
        )
      }
    );
  }

  private checkState() {
    this.sendEnabled = this.doctor !== null && this.pageNumber !== null && this.notebookNumber !== null;
  }

  private send() {
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
