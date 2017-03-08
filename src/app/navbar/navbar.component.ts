import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

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
  private auth: boolean;
  private user: string;
  private isAdmin: boolean;

  constructor(private authService: AuthService, private router:Router) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe(auth => {
      this.auth = auth;
      this.user = this.authService.user;
      this.isAdmin = auth && this.authService.userType  === 'admin';
    })
  }

  logout() {
    this.authService.logOff();
  }
}
