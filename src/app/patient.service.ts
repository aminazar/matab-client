import {Injectable, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from "rxjs";

@Injectable()
export class PatientService{
  public pid:number;
  public firstname:string;
  public surname:string;
  public id_number:string;
  public contact_details:any={};
  private pidStream = new ReplaySubject<number>(1);
  public pid$:Observable<number> = this.pidStream.asObservable();
  public dob = {year: null, month: null, day: null};
  constructor() {}

  newPatient(data:any) {
    this.pid = data.pid;
    this.firstname = data.firstname;
    this.surname = data.surname;
    this.dob = data.dob;
    this.id_number = data.id_number;
    this.contact_details = data.contact_details;
    this.pidStream.next(this.pid);
  }
}