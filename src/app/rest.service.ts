import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams} from "@angular/http";
import "rxjs/add/operator/map";
import {Observable} from "rxjs";

@Injectable()
export class RestService {
  constructor(private http: Http) {
  }

  call(table): Observable<Response> {
    return this.http.get('/api/' + table);
  }

  insert(table, values): Observable<any> {
    return this.http.put('/api/' + table, values).map((data: Response) => data.json());
  }

  get(table): Observable<any> {
    return this.call(table).map((data: Response) => data.json());
  };

  getWithParams(table, values): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    for (let key in values)
      if (values.hasOwnProperty(key))
        params.set(key, values[key]);

    return this.http.get('/api/' + table, {search: params}).map((data: Response) => data.json());
  }

  delete(table, id): Observable<Response> {
    return this.http.delete('/api/' + table + '/' + id);
  }

  update(table, id, values): Observable<Response>{
    return this.http.post('/api/' + table + (id ? '/' + id : ''), values)
  }
}
