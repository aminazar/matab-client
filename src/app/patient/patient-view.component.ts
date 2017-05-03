import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-patient-view',
  templateUrl: './patient-view.component.html',
  styleUrls: ['./patient-view.component.css']
})
export class PatientViewComponent implements OnInit {
  @Input() patientData:any;
  @Output() updateAsked = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  enableUpdate(){
    this.updateAsked.emit(false);
  }
}
