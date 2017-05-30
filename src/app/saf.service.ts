import {Injectable,isDevMode} from '@angular/core';
import {Component, OnInit, Input} from '@angular/core';
import {RestService} from "./rest.service";
import {Router} from "@angular/router";
import {MessageService} from "./message.service";
import {Observable, ReplaySubject} from "rxjs";
import {SocketService} from "./socket.service";
import {Http, Response, URLSearchParams} from "@angular/http";
import {WebSocketService} from 'angular2-websocket-service'
import {isUndefined} from "util";
import moment = require("moment");
import {Subject} from "rxjs/Subject";

@Injectable()
export class SafService{
  public safWatingForVisit = {};

  private safWaitingSource = new Subject<any>();

  safWaitingReceived = this.safWaitingSource.asObservable();

  constructor(private restService: RestService,private http: Http, private socket: WebSocketService, private messageService:MessageService) {
    this.restService.get('waitingSaf').subscribe( data => {
          this.safWatingForVisit = {};
          data.forEach( d => {
            if(isUndefined(this.safWatingForVisit[d.did])){
              this.safWatingForVisit[d.did] = [];
            };
            this.safWatingForVisit[d.did].push(d);

          });

          this.safWaitingSource.next(this.safWatingForVisit);

        },
        err => console.log(err)
    );
  }



  addPatientToSaf(data:any, callback) {
    this.restService.insert('waitingSaf/',data).subscribe(()=>{
      if(isUndefined(this.safWatingForVisit[data.did])){
        this.safWatingForVisit[data.did] = [];
      };
      this.safWatingForVisit[data.did].push(data);
      callback();
    },
      err => console.log(err)
    );
  }

  popPatientFromSaf(did){
    let doctor_id = did.toString();
  }
}
