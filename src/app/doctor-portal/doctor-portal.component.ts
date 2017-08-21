import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SocketService} from '../socket.service';
import {AuthService} from '../auth.service';
import * as moment from 'moment';
import {MessageService} from '../message.service';
import {VisitService} from "../visit.service";

@Component({
  selector: 'app-doctor-portal',
  templateUrl: './doctor-portal.component.html',
  styleUrls: ['./doctor-portal.component.css']
})
export class DoctorPortalComponent implements OnInit, OnDestroy {
  patientData: any = {};
  private connection;
  private _data: any = {};
  header = 'Personal Information';
  @Input()
  set data(data) {
    this._data = data;
    if (data) {
      this.firstname = data.firstname;
      this.surname = data.surname;
      this.startTime = data.start_time;
      this.paperId = data.paper_id;
      this.vid = data.vid;
      this.pid = data.pid;
      this.documents = data.documents.map(doc => this.prepareDocsForDisplay(doc));
      this.patientData = this.vs.visits[data.vid];
    }
  }

  get data() {
    return this._data;
  }

  firstname = '';
  surname: '';
  documents = [];
  paperId: any;
  startTime: any;
  vid: any;
  pid: number;
  selectedIndex: number;

  constructor(private sanitizer: DomSanitizer, private socket: SocketService, private authService: AuthService, private messageService: MessageService, private vs: VisitService) {
  }

  ngOnInit() {
    this.connection = this.socket.getPrivateMessages().subscribe( (msg: any) => {
      if (msg.msgType === 'Comments saved') {
        msg.sd.description = moment().format('HH:mm ddd DDMMMYY');
        msg.sd.display_name = this.authService.display_name;
        this.documents.splice(0, 0, this.prepareDocsForDisplay(msg.sd));
        this.messageService.message(msg.text);
      }
    });
  }

  private prepareDocsForDisplay(doc) {
    let url = new URL(window.location.href);
    doc.fileName = `${this.firstname} ${this.surname} - ` + (doc.vid ? `Comments by ${doc.display_name} at ` : '') + doc.description;
    doc.source = this.sanitizer.bypassSecurityTrustResourceUrl(url.origin.replace('4200', '3000') + `/assets/ViewerJS/?zoom=page-width&title=${doc.fileName}#/documents/${doc.local_addr.split('/').splice(-2, 2).join('/')}`);
    return doc;
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  toggle(e) {
    this.header = e.collapsed ? `${this.firstname} ${this.surname}` : 'Personal Information';
  }
}
