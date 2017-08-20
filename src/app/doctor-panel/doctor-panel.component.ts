import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {VisitService} from '../visit.service';
import {PatientService} from '../patient.service';
import {Subscription} from "rxjs/Subscription";

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
    this.extractVisits();

    this.socketSub = this.vs.socketMsg$.subscribe(msg => {
      if (Object.keys(msg.msg) && Object.keys(msg.msg)[0]) {
        let vid = Object.keys(msg.msg)[0];
        let data = msg.msg[vid];
        if (msg.cmd !== 'UPDATE' && this.visits[vid] || (msg.cmd === 'INSERT' && +this.did === +data.did)
          || (msg.cmd === 'REFER' && this.currentPCard && +data.referee_visit === +this.currentPCard.vid)) {
          this.extractVisits();
        }
      }
    });
  }

  private extractVisits() {
    this.pastPCards = [];
    this.queuePCards = [];
    this.currentPCard = null;
    this.visits = {};
    Object.keys(this.vs.visits).forEach(vid => {
      let v = this.vs.visits[vid];
      v.vid = vid;
      this.visits[vid] = v;
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

  ngOnDestroy() {
    this.socketSub.unsubscribe();
  }

  //
  //   this.vs.socketMsg$.subscribe(
  //     msg => {
  //       let vid = Object.keys(msg.msg)[0];
  //       let data = msg.msg[vid];
  //       data.vid = +vid;
  //       if (this.handleDiff[msg.cmd]) {
  //         this.handleDiff[msg.cmd](data);
  //       }
  //     }
  //   );
  // }
  //
  // insertVisit(data) {
  //   if (data.did && +data.did === +this.did) {
  //     if (data.start_time) {
  //       if (data.end_time) {
  //         this.pastPCards.push(data);
  //       } else {
  //         this.currentPCard.push(data);
  //       }
  //     } else {
  //       this.queuePCards.push(data);
  //     }
  //   }
  // }
  //
  // updateVisit(data) {
  //   if (data.did && +data.did === +this.did) {
  //     if (data.start_time) {
  //       if (data.end_time) {
  //         let found = this.pastPCards.find(row => +row.vid === +data.vid);
  //         if (found) {
  //           for (let key in data) {
  //             found[key] = data[key];
  //           }
  //         }
  //       } else {
  //         let found = this.currentPCard.find(row => +row.vid === +data.vid);
  //         if (found) {
  //           for (let key in data) {
  //             found[key] = data[key];
  //           }
  //         }
  //       }
  //     } else {
  //       this.queuePCards.push(data);
  //     }
  //   }
  // }

  drop(destination) {
    this.vs.endDrag(destination);
  }
}
