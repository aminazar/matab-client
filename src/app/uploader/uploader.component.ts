import {Component, OnInit} from '@angular/core';
import {FileUploader} from "ng2-file-upload";
import {PatientService} from "../patient.service";
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
  constructor(private patientService:PatientService){}
  ngOnInit(): void {
    this.patientService.pid$.subscribe(pid=>{
      this.uploader = new FileUploader({url:URL + pid});
      this.enabled = true;
    });
  }
  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
}