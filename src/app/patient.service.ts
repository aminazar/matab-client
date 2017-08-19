import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from "rxjs";
import * as moment from 'moment';


@Injectable()
export class PatientService {
  _selectedPid: any;
  public pid: number;
  public firstname: string;
  public surname: string;
  public id_number: string;
  public contact_details: any = {};
  private pidStream = new ReplaySubject<number>(1);
  public pid$: Observable<number> = this.pidStream.asObservable();
  public dob = {year: null, month: null, day: null, gd: null};
  private visitCache = [];
  pageNumber: number;
  notebookNumber: number;
  private _tpList = [];

  constructor() {
  }

  get selectedCard() {
    return this._selectedPid;
  }

  set selectedCard(pid) {
    if (pid === this._selectedPid) {
      this._selectedPid = null;
    } else {
      this._selectedPid = pid;
    }
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

  visitCachePush(data: any, sharingInfo = {}) {
    if (!this.visitCacheFind(data.vid)) {
      this.visitCache.push(data);
      data.sharingInfo = sharingInfo;
    }
  }

  visitCacheFind(vid) {
    return this.visitCache.find(r => r.vid === vid);
  }

  visitCacheSelectorData() {
    return {
      display: this.visitCache.map(r => {
        return {
          text: `${moment(r.started_at).format('HH:mm')} ${r.patient.firstname} ${r.patient.surname}`,
          sharingInfo: r.sharingInfo
        }
      }),
      values: this.visitCache.map(r => r.vid),
    }
  }

  initTPList() {
    let tpList = JSON.parse(localStorage.getItem('tp_list'));
    let currentDate = moment().format('YYYY-MM-DD');

    if (tpList !== null && tpList !== undefined) {
      if (!(currentDate in tpList)) {
        let object = {};
        object[currentDate] = [];
        localStorage.setItem('tp_list', JSON.stringify(object));
        this._tpList = [];
      } else {
        this._tpList = tpList[currentDate];
      }

      //Clear the previous dates if exist
      for (let key of Object.keys(tpList)) {
        if (key !== currentDate)
          delete tpList[key];
      }
    }
    else
      localStorage.setItem('tp_list', JSON.stringify({}));
  }

  getTPList() {
    return this._tpList;
  }

  private modifyTPList(patientData: any) {
    let currentDate = moment().format('YYYY-MM-DD');
    let tpObject = JSON.parse(localStorage.getItem('tp_list'));
    if (tpObject) {
      if (tpObject[currentDate] && tpObject[currentDate].find(el => el.pid === patientData.pid))
        this.updateTPList(patientData, tpObject, currentDate);
      else
        this.insertToTPList(patientData, tpObject, currentDate);
    }
  }

  private insertToTPList(patientData: any, tpObject, date) {
    if (tpObject) {
      this._tpList = tpObject[date];
      this._tpList.push(patientData);
      localStorage.setItem('tp_list', JSON.stringify(tpObject));
    }
  }

  private updateTPList(patientData: any, tpObject, date) {
    if (tpObject) {
      this._tpList = tpObject[date];
      let targetPatient = this._tpList.find(el => el.pid === patientData.pid);
      targetPatient.firstname = patientData.firstname;
      targetPatient.surname = patientData.surname;
      targetPatient.dob = patientData.dob;
      targetPatient.id_number = patientData.id_number;
      targetPatient.contact_details = patientData.contact_details;
      targetPatient.pageNumber = null;
      targetPatient.notebookNumber = null;
      localStorage.setItem('tp_list', JSON.stringify(tpObject));
    }
  }
}