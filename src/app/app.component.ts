import {Component, OnInit} from '@angular/core';
import {MessageService} from "./message.service";
import {LoggedInGuard} from "./login/logged-in.guard";  //add some code
import {MdSnackBar, MdSnackBarConfig} from "@angular/material";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';
  showError = false;
  error: string;

  constructor(private loggedInGuard: LoggedInGuard,private messageService: MessageService, public snackBar: MdSnackBar) {       //add some code
  }

  ngOnInit(): void {
    this.messageService.err$.subscribe(
      err => {
        this.showError = true;
        this.error = `${err.statusText}: ${err.text()}`;
      }
    );
    this.messageService.msg$.subscribe(
      msg => {
        this.showError = false;
        this.snackBar.open(msg, 'x', <MdSnackBarConfig>{duration: 3000, extraClasses: ['snackBar']}); //change some code
      }
    );
    this.messageService.warn$.subscribe(
      msg => {
        this.snackBar.open(msg, 'x', <MdSnackBarConfig>{duration: 3000, extraClasses: ['warnBar']});  //change some code
      }
    )
  }

  closeError() {
    this.showError = false;
  }
}
