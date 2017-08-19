import {Component, Input, OnInit} from '@angular/core';
import {VisitService} from "../visit.service";
import {PatientService} from "../patient.service";

@Component({
  selector: 'app-doctor-panel',
  templateUrl: './doctor-panel.component.html',
  styleUrls: ['./doctor-panel.component.css']
})
export class DoctorPanelComponent implements OnInit {
  pastPCards: any[] = [];
  queuePCards: any[] = [];
  currentPCard: any = null;
  @Input() did;

  constructor(private vs: VisitService, private ps: PatientService) {
  }

  ngOnInit() {
    Object.keys(this.vs.visits).forEach(vid => {
      let v = this.vs.visits[vid];
      if (+v.did === +this.did) {
        if (v.start_time) {
          if (v.end_time) {
            this.pastPCards.push(v);
          } else {
            this.currentPCard = v;
          }
        } else {
          this.queuePCards.push(v);
        }
      }
    });
  }

  dropVisit(e) {
    console.log(e);
  }

  dropWaiting() {

  }
}
