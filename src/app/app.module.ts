///<reference path="login/logged-in.guard.ts"/>
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
import {PatientIndexComponent} from './patient/patient-index.component';
import {FileSelectDirective, FileDropDirective} from 'ng2-file-upload/ng2-file-upload';
import {UploaderComponent} from './uploader/uploader.component';
import {PatientComponent} from './patient/patient.component';
import {PatientService} from "./patient.service";
import { PatientViewComponent } from './patient/patient-view.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    FocusDirective,
    PatientIndexComponent,
    FileSelectDirective,
    FileDropDirective,
    UploaderComponent,
    PatientComponent,
    PatientViewComponent,
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
      {path: 'patient', component: PatientComponent, canActivate: [LoggedInGuard]},
      {path: 'scans', component: UploaderComponent, canActivate: [LoggedInGuard]},
    ]),
  ],
  providers: [AuthService, RestService, LoggedInGuard, MessageService,PatientService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
