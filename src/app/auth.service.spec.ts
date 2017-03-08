/* tslint:disable:no-unused-variable */

import {TestBed, async, inject, getTestBed} from '@angular/core/testing';
import {RestService} from './rest.service';
import {MockBackend, MockConnection} from "@angular/http/testing";
import {
  BaseRequestOptions, Http, XHRBackend, HttpModule, Response, ResponseOptions,
  RequestMethod
} from "@angular/http";
import {FormsModule} from "@angular/forms";
import {AuthService} from './auth.service';
import {MaterialModule} from "@angular/material";
import {HomeComponent} from './home/home.component';
import {Router, RouterModule} from "@angular/router";
import {MessageService} from "./message.service";

class RouterStub {
  navigateByUrl(url: string) {
    return url;
  }

  navigate(url: string) {
    return url;
  }
}

class MSStub {
  error(res) {
    console.log('ERR:', res);
  }

  message(res) {
    console.log(res);
  }

  warn(res) {
    console.log('WARNING:', res)
  }

  changeToUnderstandableMessage(res){
    return res;
  }
}

describe('Service: Auth', () => {
  let mockBackend: MockBackend, restService: RestService, authService: AuthService, router: any;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        RestService,
        AuthService,
        MockBackend,
        BaseRequestOptions,
        {provide: MessageService, useClass: MSStub },
        {provide: Router, useClass: RouterStub},
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }
        }
      ],
      declarations: [HomeComponent],
      imports: [
        FormsModule,
        HttpModule,
        MaterialModule.forRoot(),
        RouterModule,
      ],
    });

    TestBed.compileComponents();
    mockBackend = getTestBed().get(MockBackend);
    restService = getTestBed().get(RestService);
    authService = getTestBed().get(AuthService);
    router = getTestBed().get(Router);
  }));

  it('should be injected', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it(`should call login with HTTP`, async(() => {
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        expect(connection.request.url).toBe('/api/login');
        expect(connection.request.method).toBe(RequestMethod.Post);
        let body = JSON.parse(connection.request.text());
        expect(body.username).toBe('testUser');
        expect(body.password).toBe('testPwd');
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: `{"user":"testUser","userType":"branch"}`
        })));
      });
    authService.auth$.subscribe(auth => {
      expect(auth).toBeTruthy();
      expect(authService.user).toBe("testUser");
      expect(authService.userType).toBe("branch");
    });
    authService.logIn('testUser', 'testPwd');
  }));
  it(`should not login where HTTP responds with error`, async(() => {
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        connection.mockError(new Error("Invalid Password"));
      });
    authService.auth$.subscribe(auth => expect(auth).toBeFalsy());
    authService.logIn('testUser', 'testPwd');
  }));

  it(`should do login/logout`, async(() => {
    let i = 0;
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        if (i++) {
          expect(connection.request.url).toBe('/api/logout');
          expect(connection.request.method).toBe(RequestMethod.Get);
        }
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: `{"user":"testUser","userType":"branch"}`
        })));
      });
    authService.auth$.subscribe(auth => i === 2 ? expect(auth).toBeFalsy() : expect(auth).toBeTruthy());
    authService.logIn('testUser', 'testPwd');
    authService.logOff();
  }));
});
