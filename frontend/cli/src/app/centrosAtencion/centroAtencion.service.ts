import { Injectable } from '@angular/core';
import { CentroAtencion } from './centroAtencion';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CentroAtencionService {

  private centrosAtencionUrl = 'rest/centrosAtencion';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.centrosAtencionUrl);
  }

  get(code: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.centrosAtencionUrl}/code/${code}`);
  }

  save(centroAtencion: CentroAtencion): Observable<DataPackage> {
    console.log('Objeto enviado al backend:', centroAtencion); // Agrega este log para verificar
    return centroAtencion.id 
      ? this.http.put<DataPackage>(this.centrosAtencionUrl, centroAtencion)
      : this.http.post<DataPackage>(this.centrosAtencionUrl, centroAtencion);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.centrosAtencionUrl}/code/${code}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.centrosAtencionUrl}/page?page=${page-1}&size=${size}`);
  }

  search(searchTerm: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.centrosAtencionUrl}/search/${searchTerm}`);
  }
}