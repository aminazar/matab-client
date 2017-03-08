import {Component, OnInit} from '@angular/core';
import {MessageService} from "./message.service";
import {MdSnackBar} from "@angular/material";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';
  private showError = false;
  private error: string;

  constructor(private messageService: MessageService, public snackBar: MdSnackBar) {
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
        this.snackBar.open(msg, 'x', {duration: 3000, extraClasses: ['snackBar']});
      }
    );
    this.messageService.warn$.subscribe(
      msg => {
        this.snackBar.open(msg, 'x', {duration: 3000, extraClasses: ['warnBar']});
      }
    )
  }

  closeError() {
    this.showError = false;
  }
}
