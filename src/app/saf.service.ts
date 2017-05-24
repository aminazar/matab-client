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

@Injectable()
export class SafService{
  public safWaitingForVisit = {};

  constructor(private restService: RestService,private http: Http, private socket: WebSocketService, private messageService:MessageService) {
    this.restService.get('waitingSaf').subscribe( data => {
          this.safWaitingForVisit = {};
          data.forEach( d => {
            if(isUndefined(this.safWaitingForVisit[d.did])){
              this.safWaitingForVisit[d.did] = [];
            };
            this.safWaitingForVisit[d.did].push(d);
          })
        },
        err => console.log(err)
    );
  }


  addPatientToSaf(data:any, callback) {
    this.restService.insert('waitingSaf/',data).subscribe(()=>{
      if(isUndefined(this.safWaitingForVisit[data.did])){
        this.safWaitingForVisit[data.did] = [];
      };
      this.restService.get(`/waitingSaf/${data.pid}/${data.did}`).subscribe( data1 =>{
        this.safWaitingForVisit[data.did].push(data1[0]);
        callback();
      })
    },
      err => console.log(err)
    );
  }

  popPatientFromSaf(did,pid){
    let arr = this.safWaitingForVisit[did];
    let ind = arr.findIndex(el => el.pid===pid);
    this.safWaitingForVisit[did].splice(ind,1);
  }
}
