/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, getTestBed } from '@angular/core/testing';
import { RestService } from './rest.service';
import { MockBackend, MockConnection } from "@angular/http/testing";
import {
  BaseRequestOptions, Http, XHRBackend, HttpModule, Response, ResponseOptions,
  RequestMethod
} from "@angular/http";
import { FormsModule } from "@angular/forms";

describe('Service: REST', () => {
  let mockBackend : MockBackend, restService : RestService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        RestService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          deps: [ MockBackend, BaseRequestOptions ],
          useFactory:
            (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
              return new Http(backend, defaultOptions);
            }
        }
      ],
      imports: [
        FormsModule,
        HttpModule
      ],
    });

    TestBed.compileComponents();
    mockBackend = getTestBed().get(MockBackend);
    restService = getTestBed().get(RestService);
  }));

  it('should be injected', inject([RestService], (service: RestService) => {
    expect(service).toBeTruthy();
  }));

  it(`should get data from backend`, async(()=>{
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        // make sure the URL is correct
        expect(connection.request.url).toBe('/api/data');
        expect(connection.request.method).toBe(RequestMethod.Get);
        connection.mockRespond(
          new Response(
            new ResponseOptions({
              body:
                `[{"a":1},{"b":"2"}]`,
            }))
        );
      }
    );

    restService.get('data').subscribe(
      data => {
        expect(data.length).toBe(2);
        expect(data[0].a).toBeDefined();
        expect(data[1].b).toBe('2');
        expect(data[0].a).toBe(1);
      }
    );
  }));

  it(`should get data with URL queries from backend`, async(()=>{
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        // make sure the URL is correct
        expect(connection.request.url).toBe('/api/data?a=1&b=xyz'); //Tricky and unstable: we don't know how the URL parameters are ordered
        expect(connection.request.method).toBe(RequestMethod.Get);
        connection.mockRespond(
          new Response(
            new ResponseOptions({
              body:
                `[{"a":1},{"b":"2"}]`,
            }))
        );
      }
    );

    restService.getWithParams('data', {a:1,b:'xyz'}).subscribe(
      data => {
        expect(data.length).toBe(2);
        expect(data[0].a).toBeDefined();
        expect(data[1].b).toBe('2');
        expect(data[0].a).toBe(1);
      }
    );
  }));

  it(`should put data into backend`, async(()=>{
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        // make sure the URL is correct
        expect(connection.request.url).toBe('/api/data');
        expect(connection.request.method).toBe(RequestMethod.Put);
        let body = connection.request.text();
        expect(JSON.parse(body).a).toBe(1);
        expect(JSON.parse(body).b).toBe("2");
        connection.mockRespond(
          new Response(
            new ResponseOptions({
              body:
                `4`,
            }))
        );
      }
    );

    restService.insert('data',{a:1,b:'2'}).subscribe(
      data => {
        expect(data).toBe(4);
      }
    );
  }));

  it(`should handle insert errors from backend`, async(()=>{
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        // make sure the URL is correct
        expect(connection.request.url).toBe('/api/data');
        let body = connection.request.text();
        expect(connection.request.method).toBe(RequestMethod.Put);
        expect(JSON.parse(body).a).toBe(1);
        expect(JSON.parse(body).b).toBe("2");
        let err = new Error("only admin is allowed to do this");
        connection.mockError(err);
      }
    );

    restService.insert('data',{a:1,b:'2'}).subscribe(
      data => {
        fail("should not be here")
      },
      err => {
        expect(err.message).toBe("only admin is allowed to do this");
      }
    );
  }));

  it(`should delete data from backend`, async(()=>{
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        // make sure the URL is correct
        expect(connection.request.url).toBe('/api/data/2');
        expect(connection.request.method).toBe(RequestMethod.Delete);
        connection.mockRespond(
          new Response(
            new ResponseOptions({
              status: 200,
            }))
        );
      }
    );

    restService.delete('data', 2).subscribe(
      res => {
        expect(res.status).toBe(200);
      }
    );
  }));

  it(`should update data of backend`, async(()=>{
    mockBackend.connections.subscribe(
      (connection: MockConnection) => {
        // make sure the URL is correct
        expect(connection.request.url).toBe('/api/data/3');
        expect(connection.request.method).toBe(RequestMethod.Post);
        let body = connection.request.text();
        expect(JSON.parse(body).a).toBe(1);
        expect(JSON.parse(body).b).toBe("2");
        connection.mockRespond(
          new Response(
            new ResponseOptions({
              status: 200,
            }))
        );
      }
    );

    restService.update('data', 3, {a:1,b:"2"}).subscribe(
      res => {
        expect(res.status).toBe(200);
      }
    );
  }));
});
