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
  @Output() newAddedPatient = new EventEmitter<any>();

  addIsDisabledFlag = true;
  private patientInfo = {
        firstname : '',
        surname : '',
        id_number : ''
      };
  cd = {
    referredBy:"",
    surgeon:"",
    surgeryHospital:"",
    surgeryDate:{year:null,month:null,day:null},
    angiographer:"",
    angioDate:{year:null,month:null,day:null},
    vip: false,
  };
  dob={year:null,month:null,day:null};
  private pid: number;
  @Input()
  set patientData(data:any){
    this.pid = data.pid;
    this.patientInfo.firstname = data.firstname;
    this.patientInfo.firstname = data.surname;
    this.patientInfo.id_number= data.id_number;
    this.dob = data.dob;
    this.cd = data.contact_details;
  }
  get patientData():any{
    return {
      firstname: this.patientInfo.firstname,
      surname: this.patientInfo.firstname,
      id_number: this.patientInfo.id_number,
      dob: this.dob,
      contact_details: this.cd,
    }
  }
  constructor(private restService: RestService,private messageService : MessageService,private patientService:PatientService) { }

  ngOnInit() {
  }

  addNewPatientIndex(){
    this.restService.insert('patient',this.patientData).subscribe(
        (data) => {
          //Adding new patient to patient table
          let newData ={
            pid : data,
            firstname : this.patientInfo.firstname,
            surname : this.patientInfo.surname,
            id_number : this.patientInfo.id_number
          };
          let name = this.patientInfo.firstname +' '+ this.patientInfo.surname;
          this.blankForm();
          this.patientService.newPatient(newData);
          this.newAddedPatient.emit(newData);
          this.messageService.message(`'${name}' is added to units as a new patient`);
        },
        (error) => {
          this.messageService.error(error);
          this.blankForm();
          this.messageService.message(`Invalid data`);
          if(isDevMode())
            console.log(error);
        }
    );
  }

  updatePatient() {

  }

  private blankForm() {
    this.patientInfo.firstname = '';
    this.patientInfo.surname = '';
    this.patientInfo.id_number = '';
    this.cd = {
      referredBy: "",
      surgeon: "",
      surgeryHospital: "",
      surgeryDate: {year: null, month: null, day: null},
      angiographer: "",
      angioDate: {year: null, month: null, day: null},
      vip: false,
    };
    this.dob = {year: null, month: null, day: null};
    this.addIsDisabledFlag = true;
  }

  isReadyToAddPatient(){
    if(this.patientData.firstname !== '' && this.patientData.surname !== '' && this.patientData.id_number !=='')
      this.addIsDisabledFlag = false;
    else
      this.addIsDisabledFlag = true;
  }
}
