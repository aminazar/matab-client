import { Component, OnInit } from '@angular/core';
import {RestService} from "../rest.service";
import {PatientService} from "../patient.service";

@Component({
  selector: 'app-doctor-portal',
  templateUrl: './doctor-portal.component.html',
  styleUrls: ['./doctor-portal.component.css']
})
export class DoctorPortalComponent implements OnInit {
  private firstname = "";
  private surname: "";
  private documents: "";
  private notFound: boolean = true;
  private paperId: any;
  private startTime: any;
  private vid: any;
  private pid: number;

  constructor(private restService:RestService,private patientService:PatientService) { }

  ngOnInit() {
    this.refresh();
  }

  private refresh() {
    this.restService.get('my-visit').subscribe(
      data => {
        console.log(data);
        this.firstname = data.patient.firstname;
        this.surname = data.patient.surname;
        this.startTime = data.start_time;
        this.paperId = data.paper_id;
        this.vid = data.vid;
        this.pid = data.pid;
        this.documents = data.documents;
      },
      err => {console.log(err);this.notFound = true;}
    )
  }

}
