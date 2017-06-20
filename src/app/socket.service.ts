import {Injectable, isDevMode} from '@angular/core';
import { QueueingSubject } from 'queueing-subject'
import { WebSocketService } from 'angular2-websocket-service'
import {Observable, Subscription} from "rxjs";

@Injectable()
export class SocketService {
  private socketOutput: Observable<any>; // outputStream
  private socketInput: QueueingSubject<any>; // inputStream
  private subscriptions:Subscription[] = [];

  constructor(private socket: WebSocketService) { }

  public initSocket(userType, user) {
    if(this.socketOutput)
      this.ngOnDestroy();

    let url = new URL(window.location.href);
    this.socketOutput = this.socket.connect(
      `ws://${url.hostname}:3001/${userType}/${user}`,
      this.socketInput = new QueueingSubject<any>()
    ).share();
    this.onMessage(msg=>{
      if(isDevMode())
        console.log("socket logger:",msg)
    });
  }

  public send(data) {
    if(this.socketInput)
      this.socketInput.next(JSON.stringify(data));
  }

  public onMessage(callback) {
    if(this.socketOutput)
      this.subscriptions.push(this.socketOutput.subscribe(callback));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(r=>r.unsubscribe());
  }
}
