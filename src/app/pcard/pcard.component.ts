import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
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
export class PcardComponent implements OnInit {
  name = '';
  _v: any = {};
  hasVisit = true;
  emgy = false;
  vip = false;
  nocardio = false;
  draggable = false;
  startTime = moment();
  activeVisit = true;
  pageNumber: number;
  notebookNumber: number;
  referredBy = '';
  waitingTimerColor;
  private timerInterval;
  timer = '';
  @Input() selected = false;

  @Input()
  get value() {
    return this._v;
  }

  set value(data) {
    this._v = data;
    this.activeVisit = data.start_time && !data.ent_time;
    this.hasVisit = !!data.vid;
    this.emgy = !!data.emgy;
    this.vip = !!data.vip;
    this.nocardio = !!data.nocardio;
    this.startTime = data.start_time ? data.start_time : data.waiting_start;
    this.name = data.firstname + ' ' + data.surname;
    this.referredBy = data.referred_by;
  }

  constructor() {
  }

  ngOnInit() {
    this.timerInterval = setInterval(() => {
      let diff = moment().diff(this.startTime, 'seconds');
      let hour = Math.floor(diff / 3600);
      this.waitingTimerColor = hour >= 4 ? 'red' : hour >= 2 ? 'yellow' : 'white';
      let minute = Math.floor((diff - hour * 3600) / 60);
      let second = diff % 60;
      this.timer = `${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
    }, 1000);
  }

  dragStart(e, pc) {
    console.log(e, pc);
  }

  dragEnd(e, pc) {
    console.log(e, pc);
  }
}
