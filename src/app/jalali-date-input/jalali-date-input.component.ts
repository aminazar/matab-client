import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import * as moment from 'moment';
@Component({
  selector: 'app-jalali-date-input',
  templateUrl: './jalali-date-input.component.html',
  styleUrls: ['./jalali-date-input.component.css']
})
export class JalaliDateInputComponent implements OnInit {
  year:number;
  month:number;
  day:number;
  date:any;
  @Input() isInput = true;
  @Input()
  set inDate(inp:any){
    this.year = inp && inp.year ? inp.year : null;
    this.month= inp && inp.month ? inp.month : null;
    this.day = inp && inp.day ? inp.day : null;
    this.date = inp && inp.gd ? moment(inp.gd) : null;
  }
  get inDate(){
    return {year:this.year,month:this.month,day:this.day}
  }

  @Output() inDateChange = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  calcDate(){
    this.inDateChange.emit(this.inDate);
  }

}
