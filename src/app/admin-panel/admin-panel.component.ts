import { Component, OnInit } from '@angular/core';
import {PatientService} from "../patient.service";
import {VisitService} from "../visit.service";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  tpList: any[];
  constructor(private ps: PatientService, private vs: VisitService) { }

  ngOnInit() {
    this.tpList = this.ps.getTPList().filter( p => {
      for (let key in this.vs.visits) {
        if (+this.vs.visits[key].pid === +p.pid) {
          return false;
        }
      }
      return true;
    });
  }

  drop(destination) {
    this.vs.endDrag(destination);
  }
}
