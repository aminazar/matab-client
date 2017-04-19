import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-patient-view',
  templateUrl: './patient-view.component.html',
  styleUrls: ['./patient-view.component.css']
})
export class PatientViewComponent implements OnInit {
  @Input() patientData:any;
  constructor() { }

  ngOnInit() {
  }

}
