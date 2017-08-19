import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {SocketService} from './socket.service';
import {MessageService} from './message.service';
import {Observable} from 'rxjs';

@Injectable()
export class VisitService {
  socketSub: any;
  visits: any = {};
  doctors: any = {};
  private handleDiff: any;

  constructor(private rest: RestService, private socket: SocketService, private msg: MessageService) {
    this.handleDiff = {
      INSERT: data => this.addLocalVisit(data),
      UPDATE: data => this.updateLocalVisit(data),
      DELETE: data => this.deleteLocalVisit(data),
      REFER: data => this.referLocalVisit(data),
    };
  }

  private getLocalVisits() {
    this.rest.get('visits')
      .subscribe(
        data => this.visits = data,
        err => console.error('failed in initializing visits service. Could not get all visits', err)
      );
    this.rest.get('doctors')
      .subscribe(
        data => this.doctors = data,
        err  => console.error('failed in initializing visits service, could not get all doctors', err)
      );
  }

  initSocketSub(userType, userId) {
    this.getLocalVisits();
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

  private addLocalVisit(diff) {
    for (let key in diff) {
      if (!this.visits[key]) {
        this.visits[key] = diff[key];
        console.log(`visit ${key} is added`);
      } else {
        console.error(`AddVisit error: vid=${key} is already added!`);
      }
    }
  }

  private updateLocalVisit(diff) {
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

  private deleteLocalVisit(diff) {
    for (let key in diff) {
      if (!this.visits[key]) {
        console.error(`DeleteVisit error: vid=${key} is not in data!`);
      } else {
        delete this.visits[key];
        console.log(`visit ${key} is deleted`);
      }
    }
  }

  private referLocalVisit(diff) {
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

  getVisit(vid): Observable<any> {
    return this.rest.getWithParams('visit', {vid: vid});
  }

  startImmediateVisit(did, pid, pageNumber, notebookNumber): Observable<any> {
    return this.rest.insert(`immediate-visit/${did}/${pid}`, {
      page_number: pageNumber,
      notebook_number: notebookNumber
    });
  }

  startWaiting(did, pid, pageNumber, notebookNumber): Observable<any> {
    return this.rest.insert(`waiting/${did}/${pid}`, {
      page_number: pageNumber,
      notebook_number: notebookNumber
    });
  }

  startVisit(vid): Observable<any> {
    return this.rest.insert(`visit/${vid}`);
  }

  changeQueue(vid, did): Observable<any> {
    return this.rest.update(`queue/${vid}`, did);
  }

  removeWaiting(vid): Observable<any> {
    return this.rest.delete(`waiting`, vid);
  }

  refer(vid, did): Observable<any> {
    return this.rest.update(`refer/${vid}`, did);
  }

  endVisit(vid): Observable<any> {
    return this.rest.update(`end-visit`, vid);
  }

  undoVisit(vid): Observable<any> {
    return this.rest.update(`undo-visit`, vid);
  }

  emgyChecked(vid, value): Observable<any> {
    return this.rest.update(`emgy-checked/${vid}`, value ? 1 : 0);
  }

  vipChecked(vid, value): Observable<any> {
    return this.rest.update(`vip-checked/${vid}`, value ? 1 : 0);
  }

  nocardioChecked(vid, value): Observable<any> {
    return this.rest.update(`nocardio-checked/${vid}`, value ? 1 : 0);
  }
}
