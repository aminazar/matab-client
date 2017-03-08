/* tslint:disable:no-unused-variable */

import {TestBed, async, ComponentFixture, getTestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {NavbarComponent} from "./navbar/navbar.component";
import {HomeComponent} from "./home/home.component";
import {Router} from "@angular/router";
import {RouterTestingModule} from "@angular/router/testing";
import {LoginComponent} from "./login/login.component";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "@angular/material";
import {HttpModule, BaseRequestOptions, Http, XHRBackend} from "@angular/http";
import {AuthService} from "./auth.service";
import {RestService} from "./rest.service";
import {LoggedInGuard} from "./login/logged-in.guard";
import {MessageService} from "./message.service";
import {MockBackend} from "@angular/http/testing";

describe('App: Burgista Internal Delivery', () => {
  let app : AppComponent;
  let fixture : ComponentFixture<AppComponent>;
  let mockBackend: MockBackend, restService: RestService, authService: AuthService, router: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        LoginComponent,
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MaterialModule.forRoot(),
        RouterTestingModule.withRoutes([
          {path: '',      component: HomeComponent, pathMatch: 'full'},
          {path: 'login', component: LoginComponent}
        ]),
        ReactiveFormsModule,
      ],
      providers: [
        RestService,
        AuthService,
        MockBackend,
        BaseRequestOptions,
        MessageService,
        LoggedInGuard,
        // {provide: Router, useClass: RouterStub},
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }
        },
      ]
    })
      .compileComponents();

    mockBackend = getTestBed().get(MockBackend);
    restService = getTestBed().get(RestService);
    authService = getTestBed().get(AuthService);
    router = getTestBed().get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have as title 'app works!'`, () => {
    expect(app.title).toEqual('app works!');
  });
});
