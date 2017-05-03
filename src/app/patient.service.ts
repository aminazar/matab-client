import {Injectable, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from "rxjs";
import * as moment from 'moment';

@Injectable()
export class PatientService{
  public pid:number;
  public firstname:string;
  public surname:string;
  public id_number:string;
  public contact_details:any={};
  private pidStream = new ReplaySubject<number>(1);
  public pid$:Observable<number> = this.pidStream.asObservable();
  public dob = {year: null, month: null, day: null,gd:null};
  private visitCache=[];
  constructor() {}

  newPatient(data:any) {
    this.pid = data.pid;
    this.firstname = data.firstname;
    this.surname = data.surname;
    this.dob = data.dob;
    this.id_number = data.id_number;
    this.contact_details = data.contangct_details;
    this.pidStream.next(this.pid);
  }

  visitCachePush(data:any, sharingInfo = {}) {
    if(!this.visitCacheFind(data.vid)) {
      this.visitCache.push(data);
      data.sharingInfo = sharingInfo;
    }
  }

  visitCacheFind(vid) {
    return this.visitCache.find(r=>r.vid===vid);
  }

  visitCacheSelectorData(){
    return {
      display: this.visitCache.map(r=>{return {text:`${moment(r.started_at).format('HH:mm')} ${r.patient.firstname} ${r.patient.surname}`, sharingInfo: r.sharingInfo}}),
      values: this.visitCache.map(r=>r.vid),
    }
  }
}