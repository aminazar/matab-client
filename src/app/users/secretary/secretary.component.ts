import { Component, OnInit } from '@angular/core';

//import {HttpService} from "../../http.service";
import {RestService} from "../../rest.service";

import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray
} from "@angular/forms";
import 'rxjs/add/operator/startWith';

import { Observable } from "rxjs/Rx";



@Component({
  selector: 'app-secretary',
  templateUrl: './secretary.component.html',
  styleUrls: ['./secretary.component.css']
})
export class SecretaryComponent implements OnInit {
  ngOnInit() {
  }

  secretaryFormGroup: FormGroup;

  pids = ['111', '123', '234'];
  filteredPids:any;
  pidControl: FormControl;
  doctors = [
    {value: 'doc0', viewValue: 'Mandegar'},
    {value: 'doc1', viewValue: 'Alavian'},
    {value: 'doc2', viewValue: 'Zarif'}
  ];


  constructor(private restService : RestService, private formBuilder: FormBuilder) {
    this.secretaryFormGroup = formBuilder.group({
      'patientID': [''/*, [ Validators.required, this.pidValidator ]*/ ],
      'patientName': ['', Validators.required],
      'doctorName': [''],
      'notebookNumber': [''],
      'pageNumber': ['']
    });

    this.secretaryFormGroup.statusChanges.subscribe(
        (data: any) => {
          //console.log("status:"+data);
          console.log(this.secretaryFormGroup.status);
        }
    );

    this.pidControl = new FormControl();
    this.filteredPids = this.pidControl.valueChanges
        .startWith(null)
        .map(name => this.filterPids(name));
  }


  /*setpids(){ this.pids = ['111', '123', '234']; }*/
  filterPids(val : string)
  {
    //this.setpids();
    return val ? this.pids.filter((s) => new RegExp( val ,'gi').test(s) ) : this.pids;
  }

  pidValidator(control: FormControl) {
    //search in DB and fill inputs if exist!
    console.log("pidValidator!"+control.value);

    return null;//success
  }
  onAddPatient(formValues)
  {
      this.restService.update('addPatient', null, formValues).subscribe(
          data => console.log(data),
          error => console.log(error)
      );

    //console.log(this.secretaryFormGroup.controls['patientID'].value);
    console.log(formValues);

  }

}
