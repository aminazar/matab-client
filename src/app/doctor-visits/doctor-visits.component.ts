import { Component, OnInit } from '@angular/core';
import {PatientService} from "../patient.service";

@Component({
  selector: 'app-doctor-visits',
  templateUrl: './doctor-visits.component.html',
  styleUrls: ['./doctor-visits.component.css']
})
export class DoctorVisitsComponent implements OnInit {
  selector: any;
  vid:number;

  constructor(private patientService:PatientService) { }

  ngOnInit() {
    this.selector = this.patientService.visitCacheSelectorData();
  }

  visitChange(data) {
    console.log(data);
    this.vid = data.value;
  }

}
