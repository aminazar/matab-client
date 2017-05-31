import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {PatientService} from "../patient.service";
import {CONSTS} from "../const";

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
  private display_name: string;
  private nav_visible:boolean;



  constructor(private authService: AuthService, private router:Router, private patientService:PatientService) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe(auth => {
      this.auth = auth;

      // TODO if statement is temporary. it must be decided whether wl route needs auth or not.
      if (auth && this.router.url !== CONSTS.WL_ROUTE)
        this.nav_visible = true;
      else
        this.nav_visible = false;

      this.user = this.authService.user;
      this.isAdmin = auth && this.authService.userType  === 'admin';
      this.isDoctor = auth && this.authService.userType === 'doctor';
      this.display_name = this.authService.display_name;
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
