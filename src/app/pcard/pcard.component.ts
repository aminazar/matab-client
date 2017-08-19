import { Component, OnInit } from '@angular/core';
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
  hasVisit = true;
  emgy = false;
  vip = false;
  nocardio = false;
  startTime = moment();
  waitingTimerColor;
  private timerInterval;
  timer = '';
  selected=true;
  constructor() { }

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

}
