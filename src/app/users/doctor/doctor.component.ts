import { Component, OnInit, OnDestroy } from '@angular/core';

import {SocketService} from '../../socket.service';

import { Observable, BehaviorSubject} from "rxjs";
import * as io from 'socket.io-client';


@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css']
})
export class DoctorComponent implements OnInit , OnDestroy{
  constructor(private socketService : SocketService ){
  }
  //private url = "localhost:3000";
  //private socket;// = io(this.url);
  private patientNoteBookNumber: number = 0;
  private patientPageNumber : number = 0;
  connection;

  ngOnInit() {
    this.connection = this.socketService.getPagesInfo().subscribe(

        function( msg ){

          console.log(msg);

          for(var key in msg)
          {
            if(key == "N")//NoteBookNumber
            {
              this.patientNoteBookNumber = msg[key];
            }else if(key == "P")//PageNumber
            {
              this.patientPageNumber = msg[key];

            }
            else
              console.log("this id is not used!")
          }
        }
    );
  }



  ngOnDestroy()
  {
    this.connection.unsubscribe();
  }
}
