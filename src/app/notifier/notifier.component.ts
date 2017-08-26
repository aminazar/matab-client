import {Component, OnInit} from '@angular/core';
import {VisitService} from "../visit.service";
import {AuthService} from "../auth.service";
import * as moment from 'moment';
@Component({
  selector: 'app-notifier',
  templateUrl: './notifier.component.html',
  styleUrls: ['./notifier.component.css']
})
export class NotifierComponent implements OnInit {
  collapsed = true;
  users = [];
  enabled = false;

  constructor(private vs: VisitService, private auth: AuthService) {
  }

  ngOnInit() {
    this.auth.auth$.subscribe(auth => {
      this.enabled = auth;
      this.vs.doctors$.subscribe(doctors => {
        this.users = doctors.filter(d => +d.uid !== +this.auth.userId);
        this.users = this.users.concat([{display_name: 'Admin'}, {display_name: 'Matab'}]);
        this.users.forEach(r => r.chats = [{sender:'drhaji', time: moment().format('HH:mm'), text:'test test test' }, {sender:'drali', time: moment().format('HH:mm'), text:'test test test 1s asf af a afsd a asfd a af a afdsaf adsf asfd asdfcs' },
        {sender:'drali', time: moment().format('HH:mm'), text:'test test test 1s asf af a afsd a asfd a af a afdsaf adsf asfd asdfcs' },
          {sender:'drali', time: moment().format('HH:mm'), text:'test test test 1s asf af a afsd a asfd a af a afdsaf adsf asfd asdfcs' },
          {sender:'drali', time: moment().format('HH:mm'), text:'test test test 1s asf af a afsd a asfd a af a afdsaf adsf asfd asdfcs' },
          {sender:'drali', time: moment().format('HH:mm'), text:'test test test 1s asf af a afsd a asfd a af a afdsaf adsf asfd asdfcs' },
          {sender:'drali', time: moment().format('HH:mm'), text:'test test test 1s asf af a afsd a asfd a af a afdsaf adsf asfd asdfcs' },
          {sender:'drmandegar', time: moment().format('HH:mm'), fa:'bell', text:''},
          {sender:'drmandegar', time: moment().format('HH:mm'), fa:'smile-o', text:''}]);
      });
    });
  }

  toggle(e) {
    this.collapsed = e.collapsed;
  }
}
