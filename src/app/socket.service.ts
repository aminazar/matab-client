
import {Observable} from "rxjs";
import * as io from 'socket.io-client';
import {Injectable} from "@angular/core";

@Injectable()
export class SocketService{
  private url = 'http://localhost:3000';
  private socket;

  sendMessage(msg)
  {
    //this.socket = io(this.url);

    this.socket.emit('get-message',msg ,function (serverData) {
      console.log("clientSide_"+serverData);
    });
    //this.socket.emit('add-msg',msg);
  }

  getPagesInfo()
  {
    console.log("getPagesInfo!");
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      //this.socket.emit('doctor');
      this.socket.on('pageInfoMsg', function(data) {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

}
