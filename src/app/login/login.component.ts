import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username;
  password;
  loginEnabled = false;

  onChange(){
    this.loginEnabled = this.username && this.password;
  }
  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  ifEnterLogin(e){
    if(e.keyCode===13)
      this.userLogin();
  }
  userLogin(){
    this.authService.logIn(this.username, this.password);
  }
}
