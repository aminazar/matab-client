import {Component, OnInit} from '@angular/core';
import {VisitService} from "../visit.service";
import {AuthService} from "../auth.service";
import * as moment from 'moment';
import {RestService} from "../rest.service";
import {SocketService} from "../socket.service";
@Component({
  selector: 'app-notifier',
  templateUrl: './notifier.component.html',
  styleUrls: ['./notifier.component.css']
})
export class NotifierComponent implements OnInit {
  selectedIndex: number;
  connection: any;
  collapsed = true;
  users = [];
  enabled = false;
  text = null;
  activeIndex = 0;

  get namespace() {
    let au = this.users[this.activeIndex];
    return au.userType + '/' + au.user;
  }

  constructor(private vs: VisitService, private auth: AuthService, private rest: RestService, private socket: SocketService) {
  }

  ngOnInit() {
    this.auth.auth$.subscribe(auth => {
      this.enabled = auth;
      this.vs.doctors$.subscribe(doctors => {
        this.users = doctors.filter(d => +d.uid !== +this.auth.userId);
        this.users = [{display_name: 'Matab', user: 'all', userType: 'all'}].concat(this.users.concat([{display_name: 'Admin', user: 'admin', userType: 'admin'}]));
        this.users.forEach(r => r.chats = []);
      });

      this.connection = this.socket.getPrivateMessages().subscribe((msg: any) => {
        try {
          msg = JSON.parse(msg.msg);
        } catch (e) {
          console.warn('could not parse JSON of private socket');
        }
        if (msg.msgType === 'chat') {
          let i = this.users.findIndex(r => +r.uid === msg.uid);
          if (i !== -1) {
            this.users[i].chats.push({
              sender: this.users[i].user,
              time: moment(msg.data.time).format('HH:mm'),
              text: msg.data.text,
              fa: msg.data.fa,
            });
            this.collapsed = false;
            this.selectedIndex = i;
          }
        }
      });
    });
  }

  toggle(e) {
    this.collapsed = e.collapsed;
  }

  sendText() {
    if (this.text) {
      this.rest.update('chat/', this.namespace, {text: this.text, time: new Date()}).subscribe(
        () => console.log('text sent ok'),
        err => console.warn('text send error:', err)
      );
    }
  }

  sendBell() {
    this.rest.update('chat/', this.namespace, {fa: 'bell', time: new Date()}).subscribe(
      () => console.log('bell sent ok'),
      err => console.warn('bell send error:', err)
    );
  }

  changeTab(e) {
    this.activeIndex = e.index;
  }

  ngOnDestroy() {
    if (this.connection) {
      this.connection.unsubscribe();
    }
  }
}
