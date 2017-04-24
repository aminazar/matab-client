import {Component, OnInit, Input} from '@angular/core';

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

  constructor() { }

  ngOnInit() {
    this.refreshDetails();
  }

  private refreshDetails() {
    if(this.contactDetails) {
      this.surgeon = this.contactDetails.surgeon ? this.contactDetails.surgeon : '-';
      this.hospital = this.contactDetails.surgeryHospital ? this.contactDetails.surgeryHospital : '-';
      this.surgeryDate = this.contactDetails.surgeryDate ? this.contactDetails.surgeryDate.year + '/' + this.contactDetails.surgeryDate.month + '/' + this.contactDetails.surgeryDate.day : '-';
      this.angiographer = this.contactDetails.angiographer ? this.contactDetails.angiographer : null;
      this.angioDate = this.contactDetails.angioDate ? this.contactDetails.angioDate.year + '/' + this.contactDetails.angioDate.month + '/' + this.contactDetails.angioDate.day : '-';
      this.referredBy = this.contactDetails.referredBy ? this.contactDetails.referredBy : '-';
      if(!this.dob) this.dob="-";
    }
  }

}
