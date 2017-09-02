import {Component, OnDestroy, OnInit, ViewChildren} from '@angular/core';
import {VisitService} from "../visit.service";
import {AuthService} from "../auth.service";
import * as moment from 'moment';
import {RestService} from "../rest.service";
import {SocketService} from "../socket.service";
import {Subscription} from "rxjs/Subscription";
import {isUndefined} from "util";
@Component({
  selector: 'app-notifier',
  templateUrl: './notifier.component.html',
  styleUrls: ['./notifier.component.css']
})
export class NotifierComponent implements OnInit, OnDestroy {
  allUsers: any;
  publicConnection: Subscription;
  panes: any;
  selectedIndex: number;
  connection: Subscription;
  collapsed = true;
  users = [];
  enabled = false;
  text = null;
  activeIndex = 0;
  @ViewChildren('pane') panels;

  get namespace() {
    let au = this.users[this.activeIndex];
    return (au.is_doctor ? 'doctor' : 'admin') + '/' + au.name;
  }

  constructor(private vs: VisitService, private auth: AuthService, private rest: RestService, private socket: SocketService) {
  }

  ngOnInit() {
    this.auth.auth$.subscribe(auth => {
      if (auth) {
        this.enabled = true;
        this.vs.doctors$.subscribe(doctors => {
          this.allUsers = doctors.concat([{display_name: 'Matab', name: 'all', is_doctor: false}, {
            display_name: 'Admin',
            name: 'admin',
            is_doctor: false,
            uid: 1,
          }]);
          this.users = this.allUsers.filter(d => +d.uid !== +this.auth.userId);
          this.users.forEach(r => r.chats = []);
          this.panels.changes.subscribe(() => this.panes = this.panels._results.map(r => r.nativeElement));
        });

        this.publicConnection = this.socket.getPatientMessages().subscribe((msg: any) => this.receiveMessage(msg, true));
        this.connection = this.socket.getPrivateMessages().subscribe((msg: any) => this.receiveMessage(msg));
      } else {
        this.ngOnDestroy();
        this.enabled = false;
      }
    });
  }

  private receiveMessage(msg, isPublic = false) {
    try {
      msg = JSON.parse(msg.msg);
    } catch (e) {
      console.warn('could not parse JSON of private socket');
    }
    console.log('msg received', msg)
    if (msg.msgType === 'chat') {
      let i = this.users.findIndex(r => (isPublic && r.uid === undefined) || (!isPublic && +r.uid === +msg.sender));
      if (i !== -1) {
        let chat: any = {
          sender: msg.sender,
          time: moment(msg.data.time).format('HH:mm'),
          text: msg.data.text,
          fa: msg.data.fa,
        };
        if (isPublic) {
          let j = this.allUsers.findIndex(r => +r.uid === +msg.sender);
          chat.display_name = this.allUsers[j].display_name;
        }
        this.users[i].chats.push(chat);

        if (msg.data.fa === 'bell') {
          try {
            let bell: any = document.getElementById('bell');
            bell.play();
          } catch (e) {
            console.error(e);
          }
        }
        this.collapsed = false;
        this.selectedIndex = i;
        this.activeIndex = i;
        this.scrollToEnd();
      }
    }
  }

  toggle(e) {
    this.collapsed = e.collapsed;
  }

  sendText() {
    this.send({text: this.text, time: new Date()});
  }

  private send(data) {
    if (this.text || data.fa) {
      let uid = this.users[this.activeIndex].uid;
      this.rest.update('chat', this.namespace, data).subscribe(
        () => {
          let i = this.users.findIndex(r => +r.uid === +uid);
          if (i !== -1) {
            this.users[i].chats.push({
              sender: this.auth.userId,
              time: moment().format('HH:mm'),
              text: this.text,
              fa: data.fa,
            });
            this.text = null;
            this.scrollToEnd();
          }
        },
        err => console.warn('data send error:', err)
      );
    }
  }

  private scrollToEnd() {
    setTimeout(() => {
      let pane = this.panes[this.activeIndex];
      pane.scrollTop = pane.scrollHeight;
    }, 100);
  }

  sendBell() {
    this.send({fa: 'bell', time: new Date()});
  }

  changeTab(e) {
    this.activeIndex = e.index;
    this.selectedIndex = null;
  }

  ngOnDestroy() {
    if (this.connection) {
      this.connection.unsubscribe();
    }
    if (this.publicConnection) {
      this.publicConnection.unsubscribe();
    }
  }
}
