///<reference path='login/logged-in.guard.ts'/>
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {NavbarComponent} from './navbar/navbar.component';
import {HomeComponent} from './home/home.component';
import {AuthService} from './auth.service';
import {RestService} from './rest.service';
import {LoggedInGuard} from './login/logged-in.guard';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '@angular/material';
import 'hammerjs';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FocusDirective} from './focus.directive';
import {MessageService} from './message.service';
import {PatientIndexComponent} from './patient/patient-index.component';
import {UploaderComponent} from './uploader/uploader.component';
import {PatientComponent} from './patient/patient.component';
import {PatientService} from './patient.service';
import { PatientViewComponent } from './patient/patient-view.component';
import { DoctorPortalComponent } from './doctor-portal/doctor-portal.component';
import {FileUploadModule} from 'ng2-file-upload';
import { JalaliDateInputComponent } from './jalali-date-input/jalali-date-input.component';
import { PatientInfoComponent } from './doctor-portal/patient-info.component';
import {SocketService} from './socket.service';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { KeysPipe } from './keys.pipe';
import {VisitService} from './visit.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    FocusDirective,
    PatientIndexComponent,
    UploaderComponent,
    PatientComponent,
    PatientViewComponent,
    DoctorPortalComponent,
    JalaliDateInputComponent,
    PatientInfoComponent,
    ModalDialogComponent,
    KeysPipe,
  ],
  imports: [
    FileUploadModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    FlexLayoutModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      {path: '', component: HomeComponent, pathMatch: 'full', canActivate: [LoggedInGuard] },
      {path: 'login', component: LoginComponent},
      {path: 'patient', component: PatientComponent, canActivate: [LoggedInGuard]},
      {path: 'scans', component: UploaderComponent, canActivate: [LoggedInGuard]},
      {path: 'doctorPortal', component: DoctorPortalComponent, canActivate:[LoggedInGuard]},
    ]),
  ],
  providers: [AuthService, RestService, LoggedInGuard, MessageService,PatientService, SocketService, VisitService],
  bootstrap: [AppComponent],
  entryComponents: [ModalDialogComponent],
})
export class AppModule {
}
