import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Paciente } from './paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private pacientesUrl = 'rest/pacientes';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.pacientesUrl);
  }

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.pacientesUrl}/${id}`);
  }

  save(paciente: Paciente): Observable<DataPackage> {
    return paciente.id
      ? this.http.put<DataPackage>(this.pacientesUrl, paciente)
      : this.http.post<DataPackage>(this.pacientesUrl, paciente);
  }

  remove(id: number): Observable<DataPackage> {
    return this.http.delete<DataPackage>(`${this.pacientesUrl}/${id}`);
  }

  search(term: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.pacientesUrl}/search/${term}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.pacientesUrl}/page?page=${page - 1}&size=${size}`);
  }
}
