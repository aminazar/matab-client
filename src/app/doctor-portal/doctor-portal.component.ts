import { Component, OnInit } from '@angular/core';
import {RestService} from "../rest.service";
import {PatientService} from "../patient.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-doctor-portal',
  templateUrl: './doctor-portal.component.html',
  styleUrls: ['./doctor-portal.component.css']
})
export class DoctorPortalComponent implements OnInit {
  firstname = "";
  surname: "";
  documents=[];
  notFound: boolean = true;
  paperId: any;
  startTime: any;
  vid: any;
  pid: number;
  selectedIndex:number;
  referredBy;
  dob;
  cd;
  isVip: boolean = false;
  age: any;

  constructor(private restService:RestService,private patientService:PatientService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.restService.get('my-visit').subscribe(
      data => {
        this.notFound = false;
        this.firstname = data.patient.firstname;
        this.surname = data.patient.surname;
        this.startTime = data.start_time;
        this.paperId = data.paper_id;
        this.vid = data.vid;
        this.pid = data.pid;
        this.patientService.newPatient(data.patient);
        this.documents = data.documents;
        this.documents.forEach(doc=>{
          let url = new URL(window.location.href);
          doc.fileName = `${this.firstname} ${this.surname} - ` + (doc.vid ? `Comments by ${doc.display_name} at `: '') + doc.description;
          doc.source = this.sanitizer.bypassSecurityTrustResourceUrl(url.origin.replace('4200','3000') + `/assets/ViewerJS/?zoom=page-width&title=${doc.fileName}#/documents/${doc.local_addr.split('/').splice(-2,2).join('/')}`);
          console.log(doc.source)
        });
        this.dob = data.patient.dob.year+ '/' + data.patient.dob.month + '/' +data.patient.dob.day;
        this.referredBy = data.patient.contact_details.referredBy ? data.patient.contact_details.referredBy : '*';
        this.cd = data.patient.contact_details;
        this.isVip = data.patient.contact_details.vip;
      },
      err => {console.log(err);this.notFound = true;}
    )
  }

  endVisit() {
    this.restService.insert('end-visit/' + this.pid,{}).subscribe(
      () => {
        this.refresh();
      },
      err => {console.log('endVisit error:',err);}
    )
  }

  tabChanged(){}
}
