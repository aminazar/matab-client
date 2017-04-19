import {Component, OnInit} from '@angular/core';
import {FileUploader} from "ng2-file-upload";
import {PatientService} from "../patient.service";
import {RestService} from "../rest.service";
let URL = '/api/scans/';
@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit{
  public uploader:FileUploader;
  public hasBaseDropZoneOver:boolean = true;
  private enabled: boolean=false;
  private pid: any;
  private documents = [];
  private dis = {};
  constructor(private restService:RestService, private patientService:PatientService){}
  ngOnInit(): void {
    this.patientService.pid$.subscribe(pid=>{
      this.uploader = new FileUploader({url:URL + pid});
      this.pid = pid;
      this.refresh();
      this.enabled = true;
    });
  }
  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
  remove(did) {
    this.dis[did] = true;
    this.restService.delete('document',did).subscribe(
      ()=>{
        this.documents.splice(this.documents.findIndex(r=>r.did===did),1);
        delete(this.dis[did]);
      },
      err => {
        console.log(err);
        delete(this.dis[did]);
      }
    );
  }
  refresh(){
    this.restService.get(`patient-documents/${this.pid}`).subscribe(
      data => {
        this.documents = [];
        data.filter(r=>r.vid===null).forEach(r=>this.documents.push(r));
      });
  }
}