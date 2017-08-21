import {Component, OnInit} from '@angular/core';
import {MessageService} from "./message.service";
import {LoggedInGuard} from "./login/logged-in.guard";  //add some code
import {MdSnackBar, MdSnackBarConfig} from "@angular/material";
import {AuthService} from "./auth.service";
import {PatientService} from "./patient.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
  }

}
