import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Bordero } from './bordero';

@Injectable({
  providedIn: 'root',
})
export class BorderoService {
  private url = 'rest/bordero';

  constructor(private http: HttpClient) {}

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/${id}`);
  }
  save(bordero: Bordero): Observable<DataPackage> {
    return bordero.id
      ? this.http.put<DataPackage>(this.url, bordero)
      : this.http.post<DataPackage>(this.url, bordero);
  }
  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}