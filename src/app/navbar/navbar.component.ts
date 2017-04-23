import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {PatientService} from "../patient.service";

interface navLink{
  link:string;
  label:string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  auth: boolean;
  private user: string;
  private isAdmin: boolean;
  private isDoctor: boolean;
  private pid: number;
  private firstname: string;
  private surname: string;
  private idNumber: string;

  constructor(private authService: AuthService, private router:Router, private patientService:PatientService) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe(auth => {
      this.auth = auth;
      this.user = this.authService.user;
      this.isAdmin = auth && this.authService.userType  === 'admin';
      this.isDoctor = auth && this.authService.userType === 'doctor';
    });
    this.patientService.pid$.subscribe(pid => {
      this.pid = pid;
      this.firstname = this.patientService.firstname;
      this.surname = this.patientService.surname;
      this.idNumber = this.patientService.id_number;
    })
  }

  logout() {
    this.authService.logOff();
  }
}
