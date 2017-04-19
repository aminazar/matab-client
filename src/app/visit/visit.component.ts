import {Component, OnInit} from '@angular/core';
import {RestService} from "../rest.service";
import {PatientService} from "../patient.service";

@Component({
  selector: 'app-visit',
  templateUrl: './visit.component.html',
  styleUrls: ['./visit.component.css']
})
export class VisitComponent implements OnInit {
  private visits = [];
  private pid: number;
  private enabled: boolean;
  private currentVisit=[];
  private canGo: boolean;
  private doctors = [];
  private doctor=null;
  private pageNumber:number=null;
  private notebookNumber:number=null;
  private sendEnabled = false;
  private allBusy = false;

  constructor(private restService: RestService, private patientService: PatientService) {
  }

  ngOnInit() {
    this.refresh();
  }

  private getPatientId() {
    this.patientService.pid$.subscribe(pid => {
      this.pid = pid;
      this.enabled = true;
      this.currentVisit = this.visits.filter(r=>r.pid===this.pid);
      this.canGo = this.currentVisit.length === 0;
    })
  }

  private refresh() {
    this.restService.get('active-visits').subscribe(
      data => {
        this.visits = [];
        data.forEach(r => this.visits.push(r));
        this.getPatientId();
        this.restService.get('doctors').subscribe(
          drs => {
            this.doctors = drs.filter(r=>!this.visits.find(s=>s.did===r.uid));
            this.allBusy = this.doctors.length === 0;
          }
        )
      }
    );
  }

  private checkState() {
    this.sendEnabled = this.doctor !==null && this.pageNumber !==null && this.notebookNumber !==null;
  }

  private send() {
    this.restService.insert('visit', {
        did: this.doctor,
        page_number:this.pageNumber,
        notebook_number:this.notebookNumber,
        pid: this.pid,
      }).subscribe(
      ()=>this.refresh(),
      err=>console.log(err)
    )
  }
}
