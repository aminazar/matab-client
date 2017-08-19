import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.css']
})
export class VisitsComponent implements OnInit {
  collapsed = false;
  constructor() { }

  change(e) {
    this.collapsed = e.collapsed;
  }
  ngOnInit() {
  }

}
