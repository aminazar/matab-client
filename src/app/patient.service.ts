import {Injectable, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from "rxjs";

@Injectable()
export class PatientService implements OnInit{
  ngOnInit(): void {
    this.newPatient({
      firstname: 'Amin',
      surname: 'Azarbadegan',
      pid: 1,
      id_number: "2199",
    });
  }
  public pid:number;
  public firstname:string;
  public surname:string;
  public idNumber:string;
  private pidStream = new ReplaySubject<number>();
  public pid$:Observable<number> = this.pidStream.asObservable();
  constructor() {}

  newPatient(data:any) {
    this.pid = data.pid;
    this.firstname = data.firstname;
    this.surname = data.surname;
    this.idNumber = data.id_number;
    this.pidStream.next(this.pid);
  }
}