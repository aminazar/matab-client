import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {SocketService} from './socket.service';
import {MessageService} from './message.service';
import {Observable, Subject} from 'rxjs';
import {PatientService} from './patient.service';
import {ReplaySubject} from 'rxjs/ReplaySubject';

@Injectable()
export class VisitService {
  currentVisit: any;
  pCardDID: any;
  pCardVID: any;
  pCardPID: any;
  pCardOrigin: any = '';
  socketSub: any;
  visits: any = {};
  doctors: any = [];
  private handleDiff: any;
  private socketMsgStream = new Subject<any>();
  private selectedVisitStream = new ReplaySubject<any>();
  socketMsg$: Observable<any> = this.socketMsgStream.asObservable();
  selectedVisit$: Observable<any> = this.selectedVisitStream.asObservable();
  auth: any = {};

  private visitsSubject = new ReplaySubject<any>();
  private doctorsSubject = new ReplaySubject<any>();
  visits$: Observable<any> = this.visitsSubject.asObservable();
  doctors$: Observable<any> = this.doctorsSubject.asObservable();

  constructor(private rest: RestService, private socket: SocketService, private msg: MessageService, private ps: PatientService) {
    this.handleDiff = {
      INSERT: data => this.addLocalVisit(data),
      UPDATE: data => this.updateLocalVisit(data),
      DELETE: data => this.deleteLocalVisit(data),
      REFER: data => this.referLocalVisit(data),
    };
    this.visits$ = this.visitsSubject.asObservable();
    this.doctors$ = this.doctorsSubject.asObservable();

  }

  private getLocalVisits() {
    this.rest.get('visits')
      .subscribe(
        data => {
          this.visits = data;
          this.visitsSubject.next(this.visits);
          let found = this.findMyVisit();
          if (found) {
            this.selectVisit(found.vid);
          }
        },
        err => console.error('failed in initializing visits service. Could not get all visits', err)
      );
    this.rest.get('doctors')
      .subscribe(
        data => {
          this.doctors = data;
          this.doctorsSubject.next(this.doctors);
        },
        err => console.error('failed in initializing visits service, could not get all doctors', err)
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
            this.socketMsgStream.next(message);
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
        this.ps.modifyTPList(diff[key], true);
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
        this.visits[key] = {};
        for (let key2 in this.visits[oldVisit]) {
          this.visits[key][key2] = this.visits[oldVisit][key2];
        }
        this.visits[key].start_waiting = new Date();
        this.visits[key].start_time = null;
        this.visits[key].end_time = null;
        this.visits[key].did = diff[key].did;
        this.visits[key].referee_visit = oldVisit;
        this.visits[oldVisit].end_time = new Date();
        console.log(`Referral: visit ${oldVisit} is marked as ended, new referral visit ${key} is added`);
      }
    }
  }

  findDoctorDisplayNameByDID(did) {
    let found = this.doctors.find(dr => +dr.uid === +did);
    if (!found) {
      console.error('No doctor is found with did=', did);
    }
    return found ? found.display_name : '';
  }

  findDoctorDisplayNameByVID(vid) {
    let found = this.visits[vid];
    if (!found) {
      console.error('no visit is found by vid=', vid);
    }
    return found ? this.findDoctorDisplayNameByDID(found.did) : '';
  }

  startDrag(origin, pid, did = null, vid = null) {
    console.log('start drag', {origin: origin, pid: pid, did: did, vid: vid});
    this.pCardOrigin = origin;
    this.pCardPID = pid;
    this.pCardVID = vid;
    this.pCardDID = did;
  }

  endDrag(destination) {
    console.log('end drag', destination);
    if (this.pCardOrigin) {
      if (this.pCardOrigin !== destination) {
        let did, loc;
        [did, loc] = destination.split('_');
        if (!this.pCardVID) { // Card has no visit, so it is in Admin Panel
          if (!isNaN(+did)) { // Valid Doctor is assigned
            let pageNumber, notebookNumber;
            [pageNumber, notebookNumber] = this.pCardOrigin.split('_');
            if (+loc === 2) { // Dropped in past visits, not allowed
              this.msg.warn('Cannot move visit to past visits');
              this.resetPCard();
            } else if (+loc === 1) { // Dropped as the current visit
              if (this.noRepeatedPaperID(+did, +this.pCardPID, +pageNumber, +notebookNumber)) {
                this.startImmediateVisit(did, this.pCardPID, +pageNumber, +notebookNumber).subscribe(
                  () => {
                    this.msg.message('New visit');
                    this.ps.modifyTPList({pid: this.pCardPID}, true);
                  },
                  err => console.warn('Error in creating new visit: ', err)
                );
              } else {
                this.msg.warn(`Page ${pageNumber} of notebook ${notebookNumber} is already sent to ${this.findDoctorDisplayNameByDID(+did)} today.`);
                this.resetPCard();
              }
            } else if (+loc === 0) { // Dropped in the queue
              if (this.noRepeatedPaperID(+did, +this.pCardPID, +pageNumber, +notebookNumber)) {
                this.startWaiting(did, this.pCardPID, +pageNumber, +notebookNumber).subscribe(
                  () => {
                    this.msg.message('New waiting');
                    this.ps.modifyTPList({pid: this.pCardPID}, true);
                  },
                  err => console.warn('Error in creating new visit: ', err)
                );
              } else {
                this.msg.warn(`Page ${pageNumber} of notebook ${notebookNumber} is already sent to ${this.findDoctorDisplayNameByDID(+did)} today.`);
                this.resetPCard();
              }
            }
          } else {
            this.msg.warn('Cannot find destination doctor');
          }
        } else { // Card is already a visit
          let originLoc, originDID;
          [originDID, originLoc] = this.pCardOrigin.split('_');
          if (+did) {
            if (+did === +this.pCardDID) {
              if (this.auth.userType === 'doctor' && +this.auth.uid !== +this.pCardDID) {
                this.msg.warn('You cannot change queue of other doctors, only admin can do this.');
                this.resetPCard();
              } else if (+loc === 2) {
                this.msg.warn('You cannot move visit to past');
                this.resetPCard();
              } else if (+originLoc === 0 && +loc === 1) {
                this.startVisit(this.pCardVID).subscribe(
                  () => this.msg.message('New visit'),
                  err => console.warn('Error in creating new visit: ', err)
                );
              } else if (+originLoc === 1 && +loc === 0) {
                this.undoVisit(this.pCardVID).subscribe(
                  () => this.msg.message('Undoing visit'),
                  err => console.warn('Error in undoing visit: ', err)
                );
              } else if (+originLoc === 2 && +loc === 0) {
                let paperId = this.visits[this.pCardVID].paper_id;
                let pageNumber = this.visits[this.pCardVID].page_number ? this.visits[this.pCardVID].page_number : Math.floor(paperId / 101) + 1;
                let notebookNumber = this.visits[this.pCardVID].notebook_number ? this.visits[this.pCardVID].notebook_number : paperId % 101 + 1;
                this.startWaiting(did, this.pCardPID, pageNumber, notebookNumber).subscribe(
                  () => this.msg.message('New Waiting'),
                  err => console.warn('Error in creating new visit: ' + err)
                );
              } else if (+originLoc === 2 && +loc === 1) {
                let paperId = this.visits[this.pCardVID].paper_id;
                let pageNumber = this.visits[this.pCardVID].page_number ? this.visits[this.pCardVID].page_number : Math.floor(paperId / 101) + 1;
                let notebookNumber = this.visits[this.pCardVID].notebook_number ? this.visits[this.pCardVID].notebook_number : paperId % 101 + 1;
                this.startImmediateVisit(did, this.pCardPID, pageNumber, notebookNumber).subscribe(
                  () => this.msg.message('New Waiting'),
                  err => console.warn('Error in creating new visit: ' + err)
                );
              }
            } else {
              if (+loc === 1) {
                if (+originLoc === 2) {// creating new visit from past
                  let paperId = this.visits[this.pCardVID].paper_id;
                  let pageNumber = this.visits[this.pCardVID].page_number ? this.visits[this.pCardVID].page_number : Math.floor(paperId / 101) + 1;
                  let notebookNumber = this.visits[this.pCardVID].notebook_number ? this.visits[this.pCardVID].notebook_number : paperId % 101 + 1;
                  this.startImmediateVisit(did, this.pCardPID, pageNumber, notebookNumber).subscribe(
                    () => this.msg.message('New Waiting'),
                    err => console.warn('Error in creating new visit: ' + err)
                  );
                }
                else if (+originLoc === 1) {
                  this.msg.warn('You cannot remove a visit after it started');
                  this.resetPCard();
                } else { // Not permitted
                  this.msg.warn('You should first put the patient in the queue');
                  this.resetPCard();
                }
              } else if (+loc === 2) {
                this.msg.warn('You cannot move visit to past');
                this.resetPCard();
              } else {
                if (+originLoc === 0) {
                  this.changeQueue(this.pCardVID, did).subscribe(
                    () => this.msg.message('Changing queue'),
                    err => console.warn('Error in changing queue: ', err)
                  );
                } else if (+originLoc === 1) { // Referral
                  this.refer(this.pCardVID, +did).subscribe(
                    () => this.msg.message('New referral'),
                    err => console.warn('Error in creating new referral: ', err)
                  );
                } else if (+originLoc === 2) {
                  let paperId = this.visits[this.pCardVID].paper_id;
                  let pageNumber = this.visits[this.pCardVID].page_number ? this.visits[this.pCardVID].page_number : Math.floor(paperId / 101) + 1;
                  let notebookNumber = this.visits[this.pCardVID].notebook_number ? this.visits[this.pCardVID].notebook_number : paperId % 101 + 1;
                  this.startWaiting(did, this.pCardPID, pageNumber, notebookNumber).subscribe(
                    () => this.msg.message('New Waiting'),
                    err => console.warn('Error in creating new visit: ' + err)
                  );
                }
              }
            }
          } else { // Dropping into admin, did ===0
            if (+originLoc === 0) {
              let patientData = this.visits[this.pCardVID];
              delete patientData.vid;
              delete patientData.did;
              delete patientData.start_waiting;
              if (patientData.paper_id !== undefined) {
                patientData.notebook_number = Math.floor(patientData.paper_id / 101) + 1;
                patientData.page_number = patientData.paper_id % 101 + 1;
                delete patientData.paper_id;
              }
              this.removeWaiting(this.pCardVID).subscribe(
                () => {
                  this.msg.message('Removing patient from queue');
                  this.ps.modifyTPList(patientData);
                },
                err => console.warn('Error in removing patient from queue', err)
              );
            } else {
              this.msg.warn('You cannot remove a visit after it started');
              this.resetPCard();
            }
          }
        }
      } else {
        this.msg.message('No Change')
      }
    }
  }

  private resetPCard() {
    this.pCardVID = this.pCardDID = this.pCardPID = this.pCardOrigin = null;
  }

  getVisit(vid): Observable<any> {
    return this.rest.get('visit/' + vid);
  }

  startImmediateVisit(did, pid, pageNumber, notebookNumber): Observable<any> {
    return this.rest.insert(`immediate-visit/${did}/${pid}`, {
      page_number: pageNumber,
      notebook_number: Math.abs(notebookNumber) // Added to give a way of cheating unique paper id restriction
    });
  }

  startWaiting(did, pid, pageNumber, notebookNumber): Observable<any> {
    return this.rest.insert(`waiting/${did}/${pid}`, {
      page_number: pageNumber,
      notebook_number: Math.abs(notebookNumber) // Added to give a way of cheating unique paper id restriction
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
    return this.rest.update(`emgy-checked/${vid}`, value ? '1' : '0');
  }

  vipChecked(vid, value): Observable<any> {
    return this.rest.update(`vip-checked/${vid}`, value ? '1' : '0');
  }

  nocardioChecked(vid, value): Observable<any> {
    return this.rest.update(`nocardio-checked/${vid}`, value ? '1' : '0');
  }

  selectVisit(vid) {
    this.getVisit(vid).subscribe(
      data => {
        this.currentVisit = data;
        this.selectedVisitStream.next(vid);
      },
      err => console.warn('could not get visit with vid', vid, err)
    );
  }

  unselectVist() {
    this.currentVisit = null;
    if (this.auth.userType === 'doctor') {
      let found = this.findMyVisit();
      if (found) {
        this.currentVisit = found;
        this.selectedVisitStream.next(found.vid);
      }
    }
    this.selectedVisitStream.next(null);
  }

  private findMyVisit() {
    return Object.keys(this.visits).map(r => this.visits[r]).find(r => r.did === this.auth.uid && r.start_time && !r.end_time);
  }

  private noRepeatedPaperID(did, pid, pageNumber, notebookNumber) {
    return Object.keys(this.visits)
        .map(r => this.visits[r])
        .filter(r => +r.did === did)
        .filter(r => (+r.page_number === pageNumber && +r.notebook_number === notebookNumber && +r.pid !== pid) || (r.paper_id + '' === ((notebookNumber - 1) * 101 + pageNumber - 1) + ''))
        .length === 0;
  }
}
