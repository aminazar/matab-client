import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {NavbarComponent} from './navbar/navbar.component';
import {HomeComponent} from './home/home.component';
import {AuthService} from "./auth.service";
import {RestService} from "./rest.service";
import {LoggedInGuard} from "./login/logged-in.guard";
import {RouterModule} from "@angular/router";
import {MaterialModule} from "@angular/material";
import 'hammerjs';
import {FlexLayoutModule} from "@angular/flex-layout";
import {FocusDirective} from './focus.directive';
import {MessageService} from "./message.service";

import { DoctorComponent } from './users/doctor/doctor.component';
import { SecretaryComponent } from './users/secretary/secretary.component';

import { SocketService } from './socket.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    FocusDirective,
    DoctorComponent,
    SecretaryComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    FlexLayoutModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      {path: '', component: HomeComponent, pathMatch: 'full'},
      {path: 'login', component: LoginComponent},
      {path: 'secretary', component: SecretaryComponent},
      {path: 'doctor', component: DoctorComponent},
    ]),
  ],
  providers: [AuthService, RestService, LoggedInGuard, MessageService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
