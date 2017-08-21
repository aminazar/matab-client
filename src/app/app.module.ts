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
import {
  MdAutocompleteModule,
  MdButtonModule, MdCardModule, MdCheckboxModule, MdDialogModule, MdIconModule, MdInputModule,
  MdSelectModule,
  MdSnackBarModule,
  MdTabsModule,
  MdToolbarModule
} from '@angular/material';
import 'hammerjs';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FocusDirective} from './focus.directive';
import {MessageService} from './message.service';
import {DeletePatientDialog, PatientIndexComponent} from './patient/patient-index.component';
import {UploaderComponent} from './uploader/uploader.component';
import {PatientComponent} from './patient/patient.component';
import {PatientService} from './patient.service';
import { DoctorPortalComponent } from './doctor-portal/doctor-portal.component';
import {FileUploadModule} from 'ng2-file-upload';
import { JalaliDateInputComponent } from './jalali-date-input/jalali-date-input.component';
import {SocketService} from './socket.service';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { KeysPipe } from './keys.pipe';
import {VisitService} from './visit.service';
import {DragDropModule, PanelModule} from 'primeng/primeng';
import { VisitsComponent } from './visits/visits.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { PcardComponent } from './pcard/pcard.component';
import { DoctorPanelComponent } from './doctor-panel/doctor-panel.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import {PatientInfoComponent} from "./doctor-portal/patient-info.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    FocusDirective,
    PatientIndexComponent,
    PatientInfoComponent,
    UploaderComponent,
    PatientComponent,
    DoctorPortalComponent,
    JalaliDateInputComponent,
    ModalDialogComponent,
    DeletePatientDialog,
    KeysPipe,
    VisitsComponent,
    PcardComponent,
    DoctorPanelComponent,
    AdminPanelComponent,
  ],
  imports: [
    FileUploadModule,
    BrowserModule,
    BrowserAnimationsModule,
    MdInputModule,
    MdButtonModule,
    MdToolbarModule,
    MdSnackBarModule,
    MdIconModule,
    MdTabsModule,
    MdCardModule,
    MdCheckboxModule,
    MdAutocompleteModule,
    MdDialogModule,
    MdSelectModule,
    FormsModule,
    HttpModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    PanelModule,
    DragDropModule,
    RouterModule.forRoot([
      {path: '', component: HomeComponent, pathMatch: 'full', canActivate: [LoggedInGuard] },
      {path: 'login', component: LoginComponent},
      {path: 'patient', component: PatientComponent, canActivate: [LoggedInGuard]},
      {path: 'scans', component: UploaderComponent, canActivate: [LoggedInGuard]},
      {path: 'doctorPortal', component: DoctorPortalComponent, canActivate: [LoggedInGuard]},
      {path: 'visits', component: VisitsComponent, canActivate: [LoggedInGuard]}
    ]),
  ],
  providers: [AuthService, RestService, LoggedInGuard, MessageService,PatientService, SocketService, VisitService],
  bootstrap: [AppComponent],
  entryComponents: [ModalDialogComponent, DeletePatientDialog],
})
export class AppModule {
}
