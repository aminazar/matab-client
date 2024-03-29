import { Component, OnInit } from '@angular/core';
import {PatientService} from '../patient.service';
import {VisitService} from '../visit.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  tpList: any[];
  constructor(private ps: PatientService, private vs: VisitService) { }

  ngOnInit() {
    this.calcTPList();
    this.ps.tpListChange$.subscribe(() => this.calcTPList());
  }

  private calcTPList() {
    this.tpList = this.ps.tpList.filter(p => {
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
