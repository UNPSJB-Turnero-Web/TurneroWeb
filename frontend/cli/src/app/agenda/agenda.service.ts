import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Agenda } from './agenda';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private url = 'rest/agenda';

  constructor(private http: HttpClient) {}

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/${id}`);
  }

  save(agenda: Agenda): Observable<DataPackage> {
    return agenda.id
      ? this.http.put<DataPackage>(this.url, agenda)
      : this.http.post<DataPackage>(this.url, agenda);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  search(term: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/search/${term}`);
  }
}