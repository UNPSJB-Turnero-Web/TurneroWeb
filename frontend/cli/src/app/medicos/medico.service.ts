import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Medico } from './medico';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private medicosUrl = 'rest/medicos';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.medicosUrl);
  }

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.medicosUrl}/${id}`);
  }

  save(medico: Medico): Observable<DataPackage> {
    return medico.id
      ? this.http.put<DataPackage>(this.medicosUrl, medico)
      : this.http.post<DataPackage>(this.medicosUrl, medico);
  }

  remove(id: number): Observable<DataPackage> {
    return this.http.delete<DataPackage>(`${this.medicosUrl}/${id}`);
  }

  search(term: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.medicosUrl}/search/${term}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.medicosUrl}/page?page=${page - 1}&size=${size}`);
  }
}
