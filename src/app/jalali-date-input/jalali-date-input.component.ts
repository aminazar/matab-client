import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-jalali-date-input',
  templateUrl: './jalali-date-input.component.html',
  styleUrls: ['./jalali-date-input.component.css']
})
export class JalaliDateInputComponent implements OnInit {
  year:number;
  month:number;
  day:number;
  @Input() isInput = true;
  @Input()
  set inDate(inp:any){
    this.year = inp.year;
    this.month= inp.month;
    this.day = inp.day;
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
