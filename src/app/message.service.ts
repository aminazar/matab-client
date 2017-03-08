import { Injectable } from '@angular/core';
import {Subject, Observable} from "rxjs";
import {Response, ResponseOptions} from "@angular/http";

@Injectable()
export class MessageService {
  private errStream = new Subject<Response>();
  err$:Observable<Response> = this.errStream.asObservable();
  private msgStream = new Subject<string>();
  msg$:Observable<string> = this.msgStream.asObservable();
  private warningStream = new Subject<string>();
  warn$:Observable<string> = this.warningStream.asObservable();

  error(err:Response){
    err = this.changeToUnderstandableMessage(err);
    let ro = new ResponseOptions();
    let errMsg = '';
    try {
      if(err.json().Message)
        errMsg = err.json().Message;
      else if(typeof err.json().Message === "object")
        errMsg = '';
    }
    catch (e) {
      errMsg = err.text();
    }
    ro.body = errMsg;
    let newErr = new Response(ro);
    newErr.statusText = err.statusText;
    newErr.status = err.status;
    this.errStream.next(newErr);
  }

  message(msg:string){
    this.msgStream.next(msg);
  }

  warn(msg:string){
    this.warningStream.next(msg);
  }
  constructor() { }

  changeToUnderstandableMessage(msg: any): Response{
    let data = msg._body;

    let resOptions = new ResponseOptions();
    if(data) {
      if (data.indexOf('foreign key constraint') !== -1) {
        resOptions.body = 'Can not delete this item because other data items depend on it.';
        let res = new Response(resOptions);
        res.statusText = 'Data Integrity Error';
        return res;
      }
      else if (data.indexOf('duplicate key value') !== -1) {
        let n = 'constraint "';
        let constraint = data.substring(data.indexOf(n) + n.length, data.indexOf('_key"')).replace(/\_/g, ' ');
        resOptions.body = `Can not add this item because same "${constraint}" already exists.`;
        let res = new Response(resOptions);
        res.statusText = 'Data Integrity Error';
        return res;
      }
      else if (data.indexOf('null value') !== -1 && data.indexOf('not-null constraint') !== -1) {
        let n = 'in column "';
        let constraint = data.substring(data.indexOf(n) + n.length, data.indexOf('" violates')).replace(/\_/g, ' ');
        resOptions.body = `The "${constraint}" field cannot be blank.`;
        let res = new Response(resOptions);
        res.statusText = 'Data Integrity Error';
        return res;
      }
      else
        return msg;
    }
    return new Response(resOptions);
  }
}
