import { Injectable } from '@angular/core';
import { Turno } from './turno';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

  private turnosUrl = 'rest/turnos';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.turnosUrl);
  }

  get(code: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.turnosUrl}/code/${code}`);
  }

  save(turno: Turno): Observable<DataPackage> {
    return turno.id 
    ? this.http.put<DataPackage>(this.turnosUrl, turno)
    : this.http.post<DataPackage>(this.turnosUrl, turno);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.turnosUrl}/code/${code}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.turnosUrl}/page?page=${page-1}&size=${size}`);
  }

  search(searchTerm: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.turnosUrl}/search/${searchTerm}`);
  }
}
