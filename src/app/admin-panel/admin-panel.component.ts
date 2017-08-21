import { Component, OnInit } from '@angular/core';
import {PatientService} from "../patient.service";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  tpList: any[];
  constructor(private ps: PatientService) { }

  ngOnInit() {
    this.tpList = this.ps.getTPList();
  }

}
