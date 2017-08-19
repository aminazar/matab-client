import {Component, OnInit, isDevMode, EventEmitter,Input, Output} from '@angular/core';
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
  firstname = null;
  surname = null;
  id_number = null;
  cd = {
    referredBy:null,
    surgeon:null,
    surgeryHospital:null,
    surgeryDate:{year:null,month:null,day:null},
    angiographer:null,
    angioDate:{year:null,month:null,day:null},
    vip: false,
  };
  dob={year:null,month:null,day:null};
  pid: number;
  @Input()
  set patientData(data:any){
    if(data) {
      this.pid = data.pid;
      this.firstname = data.firstname;
      this.surname = data.surname;
      this.id_number = data.id_number;
      this.dob = data.dob;
      if (data.contact_details)
        for (let key in data.contact_details)
          this.cd[key] = data.contact_details[key];
    }
  }
  get patientData():any{
    return {
      pid: this.pid,
      firstname: this.firstname,
      surname: this.surname,
      id_number: this.id_number,
      dob: this.dob,
      contact_details: this.cd,
    }
  }
  constructor(private restService: RestService,private messageService : MessageService,private patientService:PatientService) { }

  ngOnInit() {
  }

  addNewPatientIndex(){
    this.addIsDisabledFlag = true;
    if(this.pid)
      this.updatePatient();
    else
      this.restService.insert('patient',this.patientData).subscribe(
          (data) => {
            //Adding new patient to patient table
            this.pid = data;
            let name = this.firstname +' '+ this.surname;
            this.newAddedPatient.emit(this.patientData);
            this.messageService.message(`'${name}' is added as a new patient.`);
            this.blankForm();
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
    this.restService.update('patient', this.pid, this.patientData).subscribe(
      () =>{
        let name = this.firstname +' '+ this.surname;
        this.newAddedPatient.emit(this.patientData);
        this.messageService.message(`${name}'s record is updated.`);
        this.blankForm();
      },
      (error) => {
        this.messageService.error(error);
        this.messageService.message(`Invalid data`);
        if(isDevMode())
          console.log(error);
      }
    )
  }

  cancelUpdate() {
    this.newAddedPatient.emit(false);
  }

  private blankForm() {
    this.pid = null;
    this.firstname = null;
    this.surname = null;
    this.id_number = null;
    this.cd = {
      referredBy: null,
      surgeon: null,
      surgeryHospital: null,
      surgeryDate: {year: null, month: null, day: null},
      angiographer: null,
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
