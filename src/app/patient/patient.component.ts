import { Component, OnInit } from '@angular/core';
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";
import {PatientService} from "../patient.service";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  patients:any[] = [];
  patientModelCtrl:FormControl = new FormControl();
  filteredNameCode:Observable<any>;
  patientsNameCode: Array<any> = [];
  filteredPatient: any;
  isFiltered: boolean;
  toUpdate = false;
  constructor(private restService:RestService, private messageService:MessageService,private patientService:PatientService) { }

  ngOnInit() {
    this.restService.get('patient').subscribe(
      data => {
        data.forEach(row=>this.patients.push(row));
        this.refreshPatientsDropDown();
      });

    this.filteredNameCode = this.patientModelCtrl.valueChanges
      .startWith(null)
      .map((nameCode) => this.filterPatients(nameCode));

    this.patientService.pid$.subscribe(pid => {
      if(!this.isFiltered) {
        let ind = this.patients.findIndex(r => r.pid == pid);
        this.patients[ind].firstname = this.patientService.firstname;
        this.patients[ind].surname = this.patientService.surname;
        this.patients[ind].id_number = this.patientService.id_number;
        this.patientsNameCode[ind] = `${this.patients[ind].firstname} ${this.patients[ind].surname} - ${this.patients[ind].id_number}`;
        this.patientModelCtrl.setValue(this.patientsNameCode[ind]);
        this.patientModelCtrl.markAsTouched();
      }
    });

    this.filteredNameCode.subscribe(
      (data) => {
        if (data.length === 1) {
          this.filteredPatient = this.patients[this.patientsNameCode.findIndex(r=>r===data[0])];
          this.restService.get(`patient-full-data/${this.filteredPatient.pid}`).subscribe(
            data => {
              this.patientService.newPatient(data[0]);
              this.filteredPatient=data[0];
              this.isFiltered = true;
              this.toUpdate = false;
            })
        }
        else{
          this.isFiltered = false;
        }
      },
      (err) => {
        console.log(err.message);
      }
    );
  }

  toUpdateChange(data) {
    this.toUpdate = data !== false;
    if(!this.toUpdate)
      this.isFiltered = true;
    if(this.toUpdate) {
      this.isFiltered=false;
      if(data!==true)
        this.patientService.newPatient(data);
    }
  }

  private refreshPatientsDropDown() {
    this.patientsNameCode = [];
    this.patients.forEach(el => this.patientsNameCode.push(`${el.firstname} ${el.surname} - ${el.id_number}`));
  }

  filterPatients(val: string) {
    return val ? this.patientsNameCode.filter((p) => new RegExp(val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi').test(p)) : this.patientsNameCode;
  }

  showPatientsList($event) {
    if (this.patientModelCtrl.value === null)
      this.patientModelCtrl.setValue('');
    else {
      $event.target.select();
    }
  }
  addNewPatient(data){
    this.patients.push(data);
    this.refreshPatientsDropDown();
    this.isFiltered=false;
    this.patientService.newPatient(data);
  }
}
