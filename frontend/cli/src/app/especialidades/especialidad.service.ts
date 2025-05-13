// src/app/play-type/play-type.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Especialidad } from './especialidad';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private url = 'rest/especialidad';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.url);
  }

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/${id}`);
  }

  save(especialidad: Especialidad): Observable<DataPackage> {
    return especialidad.id
      ? this.http.put<DataPackage>(this.url, especialidad)
      : this.http.post<DataPackage>(this.url, especialidad);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }

  search(term: string): Observable<DataPackage<Especialidad[]>> {
    return this.http.get<DataPackage<Especialidad[]>>(`${this.url}/search/${term}`);
  }
}
