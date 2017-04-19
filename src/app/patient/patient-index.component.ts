import {Component, OnInit, ViewChild, isDevMode, EventEmitter} from '@angular/core';
import {Input, Output} from "@angular/core/src/metadata/directives";
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";
import {PatientService} from "../patient.service";

@Component({
  selector: 'app-patient-index',
  templateUrl: './patient-index.component.html',
  styleUrls: ['./patient-index.component.css']
})
export class PatientIndexComponent implements OnInit {
  @ViewChild('fname') fname;
  @ViewChild('sname') sname;
  @ViewChild('idnumber') idnumber;
  @Output() newAddedPatient = new EventEmitter<any>();

  private addIsDisabledFlag = true;
  private patientInfo = {
        firstname : '',
        surname : '',
        id_number : ''
      };

  constructor(private restService: RestService,private messageService : MessageService,private patientService:PatientService) { }

  ngOnInit() {
  }

  addNewPatientIndex(){
    this.patientInfo.firstname = this.fname.nativeElement.value;
    this.patientInfo.surname = this.sname.nativeElement.value;
    this.patientInfo.id_number = this.idnumber.nativeElement.value;
    this.restService.insert('patient',this.patientInfo).subscribe(
        (data) => {
          //Adding new patient to patient table
          let newData ={
            pid : data,
            firstname : this.patientInfo.firstname,
            surname : this.patientInfo.surname,
            id_number : this.patientInfo.id_number
          }
          let name = this.patientInfo.firstname +' '+ this.patientInfo.surname;
          this.fname.nativeElement.value = '';
          this.sname.nativeElement.value = '';
          this.idnumber.nativeElement.value = '';
          this.addIsDisabledFlag = true;
          this.patientService.newPatient(newData);
          this.newAddedPatient.emit(newData);
          this.messageService.message(`'${name}' is added to units as a new patient`);
        },
        (error) => {
          this.messageService.error(error);
          this.messageService.message(`Invalid data`);
          if(isDevMode())
            console.log(error);
        }
    );
  }
  isReadyToAddPatient(){
    if(this.fname.nativeElement.value!=='' && this.sname.nativeElement.value!=='' && this.idnumber.nativeElement.value!=='')
      this.addIsDisabledFlag = false;
    else
      this.addIsDisabledFlag = true;
  }
}
