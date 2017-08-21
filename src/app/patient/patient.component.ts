import {Component, OnInit, OnDestroy} from '@angular/core';
import {RestService} from "../rest.service";
import {MessageService} from "../message.service";
import {PatientService} from "../patient.service";
import {FormControl} from "@angular/forms";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit,OnDestroy {
  patientData: any;
  patients:any[] = [];
  patientModelCtrl:FormControl = new FormControl();
  filteredNameCode:Observable<any>;
  patientsNameCode: Array<any> = [];
  filteredPatient: any;
  isFiltered = false;
  toUpdate = false;
  private pidSub: Subscription;
  constructor(private restService:RestService, private messageService:MessageService,private patientService:PatientService) { }

  ngOnInit() {
    this.filteredNameCode = this.patientModelCtrl.valueChanges
      .startWith(null)
      .map((nameCode) => this.filterPatients(nameCode));

    this.filteredNameCode.subscribe(
      (data) => {
        if (data.length === 1 && !this.isFiltered) {
          let temp = this.patients[this.patientsNameCode.findIndex(r=>r===data[0])];
          if(temp!==this.filteredPatient) {
            this.filteredPatient = temp;
            this.restService.get(`patient-full-data/${this.filteredPatient.pid}`).subscribe(
              data => {
                if(this.patientService.pid !== data[0].pid)
                  this.patientService.newPatient(data[0]);
                this.filteredPatient = data[0];
                this.isFiltered = true;
                this.toUpdate = false;
              })
          }
        }
        else {
          this.isFiltered = false;
        }
      },
      (err) => {
        console.log(err.message);
      }
    );

    this.restService.get('patient').subscribe(
      data => {
        data.forEach(row=>this.patients.push(row));
        this.refreshPatientsDropDown();
        this.pidSub = this.patientService.pid$.subscribe(pid => {
          if(!this.isFiltered) {
            let ind = this.patients.findIndex(r => r.pid == pid);

            if(ind !== -1){
              this.patients[ind].firstname = this.patientService.firstname;
              this.patients[ind].surname = this.patientService.surname;
              this.patients[ind].id_number = this.patientService.id_number;
              this.patientsNameCode[ind] = `${this.patients[ind].firstname} ${this.patients[ind].surname} - ${this.patients[ind].id_number}`;
              this.patientModelCtrl.setValue(this.patientsNameCode[ind]);
              this.patientModelCtrl.markAsTouched();
            }
          }
        });
      });
  }

  toUpdateChange(data) {
    this.toUpdate = data !== false;
    if(!this.toUpdate)
      this.isFiltered = true;
    if(this.toUpdate) {
      this.isFiltered=false;
      if(data!==true) {
        this.patientService.newPatient(data);
        this.patientData = data;
      }
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
    this.patientData = data;
  }

  ngOnDestroy() {
    this.pidSub.unsubscribe();
  }

  deletePatient(patientData){
    this.patients = this.patients.filter(el => el.pid !== patientData.pid);
    this.isFiltered = false;
    this.toUpdate = false;

    //Remove patient from patientsNameCode list
    let tmpNameCode = `${patientData.firstname} ${patientData.surname} - ${patientData.id_number}`;
    this.patientsNameCode = this.patientsNameCode.filter(el => el !== tmpNameCode);

    this.patientModelCtrl.setValue('');
    this.patientService.clearPatient();
    this.patientData = {};
  }
}
