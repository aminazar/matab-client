import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as moment from 'moment';
import {VisitService} from "../visit.service";
import {MessageService} from "../message.service";
import {Subscription} from "rxjs/Subscription";
import {isUndefined} from "util";
import {AuthService} from "../auth.service";

const padZero = (num, pad = 2) => {
  let ret = Array(pad);
  ret.fill('0');
  ('' + num).split('').reverse().forEach((c, i) => ret[pad - 1 - i] = c);
  return ret.join('');
};

@Component({
  selector: 'app-pcard',
  templateUrl: './pcard.component.html',
  styleUrls: ['./pcard.component.css']
})
export class PcardComponent implements OnInit, OnDestroy {
  socketSub: Subscription;
  dummyDate: any;
  endTime: any = '';
  endVisitDisabled: boolean = false;
  name = '';
  _v: any = {};
  hasVisit = true;
  emgy = false;
  vip = false;
  nocardio = false;
  startTime = moment();
  activeVisit = true;
  pageNumber: number;
  notebookNumber: number;
  referredBy = '';
  waitingTimerColor;
  private timerInterval;
  timer = '';
  selected = false;
  currentDropLocation = ''; // 0 is Admin Panel, each location in doctor panel is did + '_' + loc, where loc = 0 for queue, 1 for active visit and 2 for past visit

  @Input()
  get value() {
    return this._v;
  }

  set value(data) {
    this._v = data;
    this.activeVisit = data.start_time && !data.end_time;
    this.hasVisit = !!data.vid;
    this.emgy = !!data.emgy;
    this.vip = !!data.vip;
    this.nocardio = !!data.nocardio;
    this.startTime = data.start_time ? data.start_time : data.start_waiting;
    this.name = data.firstname + ' ' + data.surname;
    this.referredBy = data.referee_visit ? this.vs.findDoctorDisplayNameByVID(data.referee_visit) : null;
    this.currentDropLocation = this.hasVisit ? this.activeVisit ? data.did + '_1' : data.end_time ? data.did + '_2' : data.did + '_0' : null;
    this.endTime = data.end_time ? moment(data.end_time).format('HH:mm') : '';
  }

  constructor(private vs: VisitService, private msg: MessageService, private auth: AuthService) {
  }

  ngOnInit() {
    if (!this.value.end_time) {
      this.timerInterval = setInterval(() => {
        this.calcTimer();
      }, 1000);
    } else {
      this.calcTimer();
    }

    this.socketSub = this.vs.socketMsg$.subscribe(msg => {
      if (Object.keys(msg.msg) && Object.keys(msg.msg)[0]) {
        let vid = Object.keys(msg.msg)[0];
        let data = msg.msg[vid];
        if (msg.cmd === 'UPDATE' && +this.value.vid === +vid) {
          for (let key in this.value) {
            if (isUndefined(data[key])) {
              data[key] = this.value[key];
            }
          }
          this.value = data;
        }
      }
    });

    this.vs.selectedVisit$.subscribe(
      sv => {
        if (this.hasVisit) {
          if (+sv !== +this.value.vid) {
            this.selected = false;
          } else {
            this.selected = true;
          }
        }
      });
  }

  ngOnDestroy() {
    this.socketSub.unsubscribe();
  }

  private calcTimer(endTime = this.value.end_time ? this.value.end_time : null) {
    let end = endTime ? moment(endTime) : moment();
    let diff = end.diff(moment(this.startTime), 'seconds');
    let hour = Math.floor(diff / 3600);
    this.waitingTimerColor = hour >= 4 ? 'red' : hour >= 2 ? 'yellow' : 'white';
    let minute = Math.floor((diff - hour * 3600) / 60);
    let second = diff % 60;
    this.timer = `${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
  }

  dragStart() {
    if (!this.hasVisit && (!this.pageNumber || !this.notebookNumber)) {
      this.msg.warn('Cannot make visit - Page Number and/or Notebook number is blank');
      this.vs.startDrag(null, null);
    } else {
      if (!this.hasVisit) {
        this.currentDropLocation = this.pageNumber + '_' + this.notebookNumber;
      }
      this.vs.startDrag(this.currentDropLocation, this.value.pid, this.value.did, this.value.vid);
    }
  }

  endVisit() {
    if (this.hasVisit && this.activeVisit) {
      if (this.auth.userType !== 'doctor' || +this.auth.userId === +this.value.did) {
        this.endVisitDisabled = true;
        this.vs.endVisit(this.value.vid).subscribe(
          () => {
            this.endVisitDisabled = false;
            clearInterval(this.timerInterval);
            this.calcTimer(new Date());
            this.endTime = moment().format('HH:mm');
          },
          err => console.error('Failed to end visit:', this.value.vid, err)
        );
      } else {
        this.msg.warn('You cannot end visits of other doctors.');
      }
    }
  }

  vipChecked() {
    this.vs.vipChecked(this.value.vid, this.vip).subscribe(
      () => {
      },
      err => {
        console.warn('error in checking VIP', err);
        this.vip = !this.vip;
      }
    );
  }

  emgyChecked() {
    this.vs.emgyChecked(this.value.vid, this.emgy).subscribe(
      () => {
      },
      err => {
        console.warn('error in checking emgy', err);
        this.emgy = !this.emgy;
      }
    );
  }

  nocChecked() {
    this.vs.nocardioChecked(this.value.vid, this.nocardio).subscribe(
      () => {
      },
      err => {
        console.warn('error in checking nocardio', err);
        this.nocardio = !this.nocardio;
      }
    );
  }

  select() {
    if (this.hasVisit) {
      this.selected = !this.selected;
      if (this.selected) {
        this.vs.selectVisit(this.value.vid);
      } else {
        this.vs.unselectVist();
      }
    }
  }
}
