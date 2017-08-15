import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {SocketService} from './socket.service';
import {MessageService} from './message.service';

@Injectable()
export class VisitService {
  socketSub: any;
  visits: any = {};
  private handleDiff: any;

  constructor(private rest: RestService, private socket: SocketService, private msg: MessageService) {
    this.handleDiff = {
      INSERT: data => this.addVisit(data),
      UPDATE: data => this.updateVisit(data),
      DELETE: data => this.deleteVisit(data),
      REFER: data => this.referVisit(data),
    };
  }

  getVisits() {
    this.rest.get('visits')
      .subscribe(
        data => this.visits = data,
        err => console.error('failed in initializing visits service. Could not get all visits', err)
      );
  }

  initSocketSub(userType, userId) {
    this.getVisits();
    if (!this.socketSub) {
      this.socketSub = this.socket.getPatientMessages().subscribe(
        (message: any) => {
          console.log(message);
          if (this.handleDiff[message.cmd]) {
            this.handleDiff[message.cmd](message.msg);
          } else {
            console.error(`Unknown socket command: ${message.cmd}`);
          }
        }
      );
    }
  }

  addVisit(diff) {
    for (let key in diff) {
      if (!this.visits[key]) {
        this.visits[key] = diff[key];
        console.log(`visit ${key} is added`);
      } else {
        console.error(`AddVisit error: vid=${key} is already added!`);
      }
    }
  }

  updateVisit(diff) {
    for (let key in diff) {
      if (!this.visits[key]) {
        console.error(`UpdateVisit error: vid=${key} is not in data!`);
      } else {
        for (let vkey in diff[key]) {
          if (diff[key].hasOwnProperty(vkey)) {
            this.visits[key][vkey] = diff[key][vkey];
            console.log(`${vkey} updated in visit ${key} to ${diff[key][vkey]}`);
          }
        }
      }
    }
  }

  deleteVisit(diff) {
    for (let key in diff) {
      if (!this.visits[key]) {
        console.error(`DeleteVisit error: vid=${key} is not in data!`);
      } else {
        delete this.visits[key];
        console.log(`visit ${key} is deleted`);
      }
    }
  }

  referVisit(diff) {
    for (let key in diff) {
      if (this.visits[key]) {
        console.error(`ReferVisit error: vid=${key} is already in data!`);
      } else {
        let oldVisit = diff[key].referee_visit;
        this.visits[key] = diff[key];
        this.visits[oldVisit].end_time = new Date();
        console.log(`Referral: visit ${oldVisit} is marked as ended, new referral visit ${key} is added`);
      }
    }
  }
}
