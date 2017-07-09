import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {PatientService} from "../patient.service";
import * as moment from 'moment';
// import DurationConstructor = moment.unitOfTime.DurationConstructor;

@Component({
  selector: 'app-patient-info',
  templateUrl: './patient-info.component.html',
  styleUrls: ['./patient-info.component.css']
})
export class PatientInfoComponent implements OnInit {
  @Input() dob;

  private _cd: any;
  @Input()
  set contactDetails(data){
    this._cd=data;
    this.refreshDetails();
  };
  get contactDetails(){
    return this._cd;
  }
  surgeon="";
  hospital="";
  surgeryDate="";
  angiographer="";
  angioDate="";
  referredBy="";
  surname: string;
  firstname: string;
  isVip: boolean;
  age: any;
  @Output() updateAsked = new EventEmitter<any>();

  constructor(private patientService:PatientService) { }

  ngOnInit() {
    this.patientService.pid$.subscribe(pid=>{
      this.firstname = this.patientService.firstname;
      this.surname = this.patientService.surname;
      this.contactDetails= this.patientService.contact_details;
      this.dob = [this.patientService.dob.year, this.patientService.dob.month,this.patientService.dob.day].join('/');
      this.age = this.patientService.dob.gd ? this.calcAge(moment().diff(moment(this.patientService.dob.gd))) : null;
      if(this.patientService.contact_details) {
        this.referredBy = this.patientService.contact_details.referredBy ? this.patientService.contact_details.referredBy : '-';
        this.isVip = this.patientService.contact_details.vip;
      }
      this.refreshDetails();
    });
  }

  private refreshDetails() {
    if(this.contactDetails) {
      this.surgeon = this.contactDetails.surgeon ? this.contactDetails.surgeon : '-';
      this.hospital = this.contactDetails.surgeryHospital ? this.contactDetails.surgeryHospital : '-';
      this.surgeryDate = this.contactDetails.surgeryDate && this.contactDetails.surgeryDate.year ? this.contactDetails.surgeryDate.year + '/' + this.contactDetails.surgeryDate.month + '/' + this.contactDetails.surgeryDate.day : '-';
      this.angiographer = this.contactDetails.angiographer ? this.contactDetails.angiographer : '-';
      this.angioDate = this.contactDetails.angioDate && this.contactDetails.angioDate.year ? this.contactDetails.angioDate.year + '/' + this.contactDetails.angioDate.month + '/' + this.contactDetails.angioDate.day : '-';
      this.referredBy = this.contactDetails.referredBy ? this.contactDetails.referredBy : '-';
      if(!this.dob) this.dob="-";
      }
  }

  private calcAge(gd: any, asTime:"years"|"months"|"weeks"|"days" = 'years') {
    let arr:Array<"years"|"months"|"weeks"|"days"> = ['years','months','weeks','days'];
    let currAT = arr.findIndex(r=>r===asTime);
    let diff = moment.duration(gd,currAT>0?arr[currAT-1]:null).as(asTime);
    return `${Math.floor(diff)?Math.floor(diff) + ' ' + asTime:''} ${currAT + 1 < arr.length ? this.calcAge(diff - Math.floor(diff),arr[currAT + 1]):''}`
  }

  enableUpdate(){
    this.updateAsked.emit(true);
  }
}
