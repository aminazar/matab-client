import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-patient-info',
  templateUrl: './patient-info.component.html',
  styleUrls: ['./patient-info.component.css']
})
export class PatientInfoComponent implements OnInit {
  @Input() dob;

  private _cd: any;
  private _value: any = {};

  @Input()
  set contactDetails(data) {
    this._cd = data;
    this.refreshDetails();
  };

  get contactDetails() {
    return this._cd;
  }

  @Input()
  set value(data) {
    if (data) {
      this.firstname = data.firstname;
      this.surname = data.surname;
      this.contactDetails = data.contact_details;
      if (data.dob) {
        this.dob = [data.dob.year, data.dob.month, data.dob.day].join('/');
        this.age = data.dob.gd ? this.calcAge(moment().diff(moment(data.dob.gd))) : null;
      }
      if (data.contact_details) {
        this.referredBy = data.contact_details.referredBy ? data.contact_details.referredBy : '-';
        this.isVip = data.vip;
      }
      this.refreshDetails();
    }
    this._value = data;
  }

  get value() {
    return this._value;
  }

  surgeon = '';
  hospital = '';
  surgeryDate = '';
  angiographer = '';
  angioDate = '';
  referredBy = '';
  referralDescription = '';
  surname: string;
  firstname: string;
  isVip: boolean;
  age: any;
  @Output() updateAsked = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

  private refreshDetails() {
    if (this.contactDetails) {
      this.surgeon = this.contactDetails.surgeon ? this.contactDetails.surgeon : '-';
      this.hospital = this.contactDetails.surgeryHospital ? this.contactDetails.surgeryHospital : '-';
      this.surgeryDate = this.contactDetails.surgeryDate && this.contactDetails.surgeryDate.year ? this.contactDetails.surgeryDate.year + '/' + this.contactDetails.surgeryDate.month + '/' + this.contactDetails.surgeryDate.day : '-';
      this.angiographer = this.contactDetails.angiographer ? this.contactDetails.angiographer : '-';
      this.angioDate = this.contactDetails.angioDate && this.contactDetails.angioDate.year ? this.contactDetails.angioDate.year + '/' + this.contactDetails.angioDate.month + '/' + this.contactDetails.angioDate.day : '-';
      this.referredBy = this.contactDetails.familiar ? this.contactDetails.familiar.via ? this.contactDetails.familiar.via : '-' : '-';
      this.referralDescription = this.contactDetails.familiar ? this.contactDetails.familiar.description ? this.contactDetails.familiar.description : '-' : '-';
      if (!this.dob) this.dob = '-';
    }
  }

  private calcAge(gd: any, asTime: 'years' | 'months' | 'weeks' | 'days' = 'years') {
    let arr: Array<'years' | 'months' | 'weeks' | 'days'> = ['years', 'months', 'weeks', 'days'];
    let currAT = arr.findIndex(r => r === asTime);
    let diff = moment.duration(gd, currAT > 0 ? arr[currAT - 1] : null).as(asTime);
    return `${Math.floor(diff) ? Math.floor(diff) + ' ' + asTime : ''} ${currAT + 1 < arr.length ? this.calcAge(diff - Math.floor(diff), arr[currAT + 1]) : ''}`;
  }

  enableUpdate() {
    this.updateAsked.emit(true);
  }
}
