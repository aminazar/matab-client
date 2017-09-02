import {Component, OnInit} from '@angular/core';
import {VisitService} from "../visit.service";
import {PatientService} from "../patient.service";
import {AuthService} from "../auth.service";
import {SocketService} from "../socket.service";

@Component({
  selector: 'app-visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.css']
})
export class VisitsComponent implements OnInit {
  userType: any = '';
  currentVisit: any = null;
  collapsed = false;
  socketConnect = false;

  doctors: any[] = [];

  constructor(private vs: VisitService, private auth: AuthService, private socket: SocketService) {
  }

  change(e) {
    this.collapsed = e.collapsed;
  }

  ngOnInit() {
    this.vs.selectedVisit$.subscribe(() => {
      this.currentVisit = this.vs.currentVisit;
      if (this.currentVisit) {
        this.collapsed = true;
      }
    });

    this.auth.auth$.subscribe(() => this.userType = this.auth.userType);

    this.vs.doctors$.subscribe(doctors => {
      this.doctors = Array.from(doctors);
    });

    this.socket.patientConnect$.subscribe(state => this.socketConnect = state);
  }

}
