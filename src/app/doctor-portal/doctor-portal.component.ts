import {Component, OnInit, Input} from '@angular/core';
import {RestService} from "../rest.service";
import {PatientService} from "../patient.service";
import {DomSanitizer} from "@angular/platform-browser";
import {SocketService} from "../socket.service";
import {AuthService} from "../auth.service";
import * as moment from 'moment';
import {MessageService} from "../message.service";
import {SafService} from "../saf.service";

@Component({
  selector: 'app-doctor-portal',
  templateUrl: './doctor-portal.component.html',
  styleUrls: ['./doctor-portal.component.css']
})
export class DoctorPortalComponent implements OnInit {
  private _vid: number;
  @Input()
  set externalVid(n:number){
    this._vid = n;
    this.refresh(null,this.patientService.visitCacheFind(n));
  };

  get externalVid(){
    return this._vid;
  }

  firstname = "";
  surname: "";
  documents=[];
  notFound: boolean = true;
  paperId: any;
  startTime: any;
  vid: any;
  pid: number;
  selectedIndex:number;
  waitings = [];

  constructor(private restService:RestService,private patientService:PatientService, private sanitizer: DomSanitizer, private socket:SocketService,private authService:AuthService, private messageService:MessageService,  private safService:SafService) { }

  ngOnInit() {
    if(!this.externalVid) {
      this.refresh();
      this.socket.onMessage(msg => {
        if (msg.msgType === "Comments saved") {
          msg.sd.description = moment().format('HH:mm ddd DDMMMYY');
          msg.sd.display_name = this.authService.display_name;
          this.documents.splice(0, 0, this.prepareDocsForDisplay(msg.sd));
          this.messageService.message(msg.text);
        }
        else {
          this.messageService.popup(msg.text, msg.msgType, msg.msgType === "New patient", userResponse => this.refresh(userResponse));
        }
        }
      );
    }
  }

  refresh(userResponse="OK",loadedData=null) {
    let load = data => {
      this.notFound = false;
      this.firstname = data.patient.firstname;
      this.surname = data.patient.surname;
      this.startTime = data.start_time;
      this.paperId = data.paper_id;
      this.vid = data.vid;
      this.pid = data.pid;
      this.patientService.newPatient(data.patient);
      this.patientService.visitCachePush(data);
      this.documents = data.documents.map(doc=>this.prepareDocsForDisplay(doc));
      if(userResponse==="Cancel")
        this.endVisit();
    };

    if(loadedData!==null) {
      load(loadedData);
    }
    else {
      this.restService.get('my-visit').subscribe(load,
        err => {
          console.log(err);
          this.notFound = true;
        }
      )
    }
  }

  private prepareDocsForDisplay(doc) {
    let url = new URL(window.location.href);
    doc.fileName = `${this.firstname} ${this.surname} - ` + (doc.vid ? `Comments by ${doc.display_name} at ` : '') + doc.description;
    doc.source = this.sanitizer.bypassSecurityTrustResourceUrl(url.origin.replace('4200', '3000') + `/assets/ViewerJS/?zoom=page-width&title=${doc.fileName}#/documents/${doc.local_addr.split('/').splice(-2, 2).join('/')}`);
    return doc;
  }

  endVisit() {
    this.waitings = [];
    let a = this.safService.safWaitingForVisit;
    for (let key in a) {
      for (var x = 0; x < a[key].length; x++) {
        this.waitings.push(a[key][x]);
      }
    }
    this.restService.insert('end-visit/' + this.pid,{}).subscribe(         //put
      () => {
        this.socket.send({
          cmd: 'send',
          target: ['admin','user'],
          msg: {
            msgType:'Patient Dismissed',
            text: `${moment().format('HH:mm')}: ${this.authService.display_name} dismissed "${this.firstname} ${this.surname}".`,
            pid: this.pid,
            dr_name: this.authService.display_name,
          },

        });
        let waitingsForCurrentUid = this.waitings.filter(el=>el.did === this.authService.uid);
        if(waitingsForCurrentUid.length>0) {
          var priorities = waitingsForCurrentUid.map(el=>el.priority);
          var firstPriority = Math.min(...priorities);
          var firstWaiting = waitingsForCurrentUid.filter(el => el.priority===firstPriority.toString());
          if(firstWaiting.length===1) {
            this.sendPatientToDoctorFromSaf(firstWaiting[0]);
          }
        }
        else {
          this.messageService.message(`You are free!!`);
          this.refresh();
        }
      },
      err => {console.log('endVisit error:',err);}
    )
  }

  sendPatientToDoctorFromSaf(obj){
    let firstWaitingInd =  this.waitings.findIndex(el => el===obj);
    // if( this.visits.filter(r => r.did === obj.did).length ===0 ) {
      this.restService.insert('visit', {
        did: obj.did,
        page_number: obj.page_num,
        notebook_number: obj.note_num,
        pid: obj.pid,
      }).subscribe(
          () => {
            this.restService.delete('waitingSaf/',obj.pid).subscribe(()=>{
              this.safService.popPatientFromSaf(obj.did,obj.pid);
              this.waitings.splice(firstWaitingInd,1);
            });
            // this.socket.send({
            //   cmd: 'send',
            //   target: ['doctor/' + this.allDoctors.filter(r => r.uid === obj.did)[0].name],
            //   msg: {
            //     msgType: "New visit",
            //     text: `${moment().format('HH:mm')}: New patient "${obj.firstname} ${obj.surname}" is sent to you for visit.`
            //   }
            // });
            this.refresh();
            this.messageService.message(`${obj.firstname} ${obj.surname} is sent to you from SAF.`);
          },
          err => console.log(err)
      )
    // }
  }

  tabChanged(){}
}
