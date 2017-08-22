import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import * as moment from 'moment';
import {Subject} from 'rxjs/Subject';


@Injectable()
export class PatientService {
  public pid: number;
  public firstname: string;
  public surname: string;
  public id_number: string;
  public contact_details: any = {};
  private pidStream = new ReplaySubject<number>(1);
  public pid$: Observable<number> = this.pidStream.asObservable();
  public dob = {year: null, month: null, day: null, gd: null};
  pageNumber: number;
  notebookNumber: number;
  private tpListStream = new Subject<any>();
  tpListChange$ = this.tpListStream.asObservable();

  constructor() {
    if (!this.tpList.length) {
      this.tpList = [];
    }
  }

  get tpList(): any[]{
    let currentDate = moment().format('YYYY-MM-DD');
    try {
      let data = JSON.parse(localStorage.getItem('tp_list'));
      return data[currentDate] ? data[currentDate] : {};
    } catch (e) {
      console.warn('Failed to get/parse tp_list:', e);
      let saved = {};
      saved[currentDate] = [];
      localStorage.setItem('tp_list', JSON.stringify(saved));
      return [];
    }
  }

  set tpList(data: any[]){
    let currentDate = moment().format('YYYY-MM-DD');
    let saved = {};
    saved[currentDate] = data;
    localStorage.setItem('tp_list', JSON.stringify(saved));
  }

  newPatient(data: any) {
    this.modifyTPList(data);

    this.pid = data.pid;
    this.firstname = data.firstname;
    this.surname = data.surname;
    this.dob = data.dob;
    this.id_number = data.id_number;
    this.contact_details = data.contact_details;
    this.pidStream.next(this.pid);
    this.pageNumber = null;
    this.notebookNumber = null;
  }

  clearPatient() {
    this.pid = null;
    this.firstname = null;
    this.surname = null;
    this.dob = {year: null, month: null, day: null, gd: null};
    this.id_number = null;
    this.contact_details = null;
    this.pidStream.next(this.pid);
    this.pageNumber = null;
    this.notebookNumber = null;
  }

  modifyTPList(patientData: any, shouldDelete = false) {
    if (shouldDelete) {
      this.tpList = this.tpList.filter( r => r.pid !== patientData.pid);
    } else {
      let found = this.tpList.findIndex( r => r.pid === patientData.pid);
      if (found !== -1) {
        this.tpList[found] = patientData;
      } else {
        let temp = this.tpList;
        temp.push(patientData);
        this.tpList = temp;
      }
    }
    this.tpListStream.next();
  }

  updateTPListPageNumber(pid, pageNumber, notebookNumber) {
    let found = this.tpList.findIndex(el => el.pid === pid);
    if (found !== -1) {
      this.tpList[found].pageNumber = pageNumber;
      this.tpList[found].notebookNumber = notebookNumber;
    }
  }
}
