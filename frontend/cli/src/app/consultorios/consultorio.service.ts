import { Injectable } from '@angular/core';
import { Consultorio } from './consultorio';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { HttpClient } from '@angular/common/http';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';

@Injectable({
  providedIn: 'root'
})
export class ConsultorioService {

  private consultoriosUrl = 'rest/consultorios';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.consultoriosUrl);
  }

  get(code: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.consultoriosUrl}/code/${code}`);
  }

  save(consultorio: Consultorio): Observable<DataPackage> {
    return consultorio.id 
      ? this.http.put<DataPackage>(this.consultoriosUrl, consultorio)
      : this.http.post<DataPackage>(this.consultoriosUrl, consultorio);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.consultoriosUrl}/code/${code}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.consultoriosUrl}/page?page=${page-1}&size=${size}`);
  }

  search(searchTerm: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.consultoriosUrl}/search/${searchTerm}`);
  }
}
