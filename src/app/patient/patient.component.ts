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
  private filteredNameCode:Observable<any>;
  private patientsNameCode: Array<any> = [];
  private filteredPatient: any;
  private isFiltered: boolean;
  constructor(private restService:RestService, private messageService:MessageService,private patientService:PatientService) { }

  ngOnInit() {
    this.restService.get('patient').subscribe(
      data => {
        console.log(data);
        data.forEach(row=>this.patients.push(row));
        this.refreshPatientsDropDown();
      });

    this.filteredNameCode = this.patientModelCtrl.valueChanges
      .startWith(null)
      .map((nameCode) => this.filterPatients(nameCode));

    this.filteredNameCode.subscribe(
      (data) => {
        if (data.length === 1) {
          this.filteredPatient = this.patients[this.patientsNameCode.findIndex(r=>r===data[0])];
          this.patientService.newPatient(this.filteredPatient);
          this.isFiltered = true;
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
}
