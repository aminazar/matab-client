import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {VisitService} from '../visit.service';
import {PatientService} from '../patient.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-doctor-panel',
  templateUrl: './doctor-panel.component.html',
  styleUrls: ['./doctor-panel.component.css']
})
export class DoctorPanelComponent implements OnInit, OnDestroy {
  visits: {};
  private socketSub: Subscription;
  handleDiff: any = {};
  pastPCards: any[] = [];
  queuePCards: any[] = [];
  currentPCard: any = null;
  @Input() did;

  constructor(private vs: VisitService, private ps: PatientService) {
    ['INSERT', 'UPDATE', 'DELETE', 'REFER'].forEach(cmd => {
      this.handleDiff[cmd] = data => this[cmd.toLowerCase() + 'Visit'](data);
    });
  }

  ngOnInit() {
    this.vs.visits$.subscribe(visits => {
      this.extractVisits();
    });

    this.socketSub = this.vs.socketMsg$.subscribe(msg => {
      if (Object.keys(msg.msg) && Object.keys(msg.msg)[0]) {
        let vid = Object.keys(msg.msg)[0];
        let data = msg.msg[vid];
        if ((msg.cmd !== 'UPDATE' || data.end_time || data.start_time) || this.visits[vid] || +this.did === +data.did
          || (msg.cmd === 'REFER'
          && ((this.currentPCard && +data.referee_visit === +this.currentPCard.vid) || +this.did === +data.did) )) {
          this.extractVisits();
        }
      }
    });
  }

  private extractVisits() {
    this.pastPCards = [];
    this.queuePCards = [];
    this.currentPCard = null;
    let tempVisits = {};
    Object.keys(this.vs.visits).forEach(vid => {
      let v = this.vs.visits[vid];
      v.vid = vid;
      if (+v.did === +this.did) {
        tempVisits[vid] = v;
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
    this.visits = tempVisits;
  }

  ngOnDestroy() {
    this.socketSub.unsubscribe();
  }

  drop(destination) {
    this.vs.endDrag(destination);
  }
}
