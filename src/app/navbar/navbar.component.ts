import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../auth.service";
import {NavigationEnd, Router} from "@angular/router";
import {PatientService} from "../patient.service";
import {MessageService} from "../message.service";
import {MdSnackBar, MdSnackBarConfig} from "@angular/material";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  auth = false;
  private user: string;
  private isAdmin: boolean;
  private isDoctor: boolean;
  private pid: number;
  private firstname: string;
  private surname: string;
  private idNumber: string;
  private display_name: string;
  nav_visible: boolean;
  tabs = [];
  showError = false;
  error: string;

  constructor(private authService: AuthService,
              private router: Router,
              private patientService: PatientService,
              private messageService: MessageService,
              public snackBar: MdSnackBar) {
  }

  ngOnInit() {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.router.url !== '/wl' && this.router.url !== '/login') {
          this.nav_visible = true;
        } else {
          this.nav_visible = false;
        }
      }
    });

    this.authService.auth$.subscribe(auth => {
      this.auth = auth;

      if (auth) {
        this.user = this.authService.user;
        this.isAdmin = auth && this.authService.userType === 'admin';
        this.isDoctor = auth && this.authService.userType === 'doctor';
        this.display_name = this.authService.display_name;
        let url = this.authService.originBeforeLogin;
        setTimeout(() => this.router.navigate([url !== null  && url !== '/' ? url : this.isAdmin ? 'patient' : 'visits']), 2000);
        this.calcTabs();
      }

    });

    this.patientService.pid$.subscribe(pid => {
      this.pid = pid;
      this.firstname = this.patientService.firstname;
      this.surname = this.patientService.surname;
      this.idNumber = this.patientService.id_number;
      this.calcTabs();
    })

    this.messageService.err$.subscribe(
      err => {
        this.showError = true;
        this.error = `${err.statusText}: ${err.text()}`;
      }
    );
    this.messageService.msg$.subscribe(
      msg => {
        this.showError = false;
        this.snackBar.open(msg, 'x', <MdSnackBarConfig>{duration: 3000, extraClasses: ['snackBar']});
      }
    );
    this.messageService.warn$.subscribe(
      msg => {
        this.snackBar.open(msg, 'x', <MdSnackBarConfig>{duration: 3000, extraClasses: ['warnBar']});
      }
    )
  }

  isActive(instruction: any[]): boolean {
    return this.router.isActive(this.router.createUrlTree(instruction), true);
  }

  closeError() {
    this.showError = false;
  }

  calcTabs() {
    if (this.isDoctor) {
      this.tabs = [
        {path: 'visits', label: 'Visits'},
      ];
    } else {
      this.tabs = [
        {
          path: 'patient',
          label: `Patient${!this.pid ? 's' : ': '}`
        },
        {path: 'scans', label: 'Scans'},
        {path: 'visits', label: 'Visits'}
      ];
    }
  }

  logout() {
    this.authService.logOff();
  }
}
