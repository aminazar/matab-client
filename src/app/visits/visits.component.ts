import {Component, OnInit} from '@angular/core';
import {VisitService} from "../visit.service";
import {PatientService} from "../patient.service";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.css']
})
export class VisitsComponent implements OnInit {
  collapsed = false;

  constructor(private vs: VisitService, private auth:AuthService) {
  }

  change(e) {
    this.collapsed = e.collapsed;
  }

  ngOnInit() {
    if (this.vs.currentVisit) {
      this.collapsed = true;
    }
  }

}
