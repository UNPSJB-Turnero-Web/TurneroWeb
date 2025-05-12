import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultorio } from './consultorio';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root',
})
export class ConsultorioService {
  private apiUrl = '/consultorios';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DataPackage<Consultorio[]>> {
    return this.http.get<DataPackage<Consultorio[]>>(this.apiUrl);
  }

  getById(id: number): Observable<DataPackage<Consultorio>> {
    return this.http.get<DataPackage<Consultorio>>(`${this.apiUrl}/${id}`);
  }

  create(consultorio: Consultorio): Observable<DataPackage<Consultorio>> {
    return this.http.post<DataPackage<Consultorio>>(this.apiUrl, consultorio);
  }

  update(id: number, consultorio: Consultorio): Observable<DataPackage<Consultorio>> {
    return this.http.put<DataPackage<Consultorio>>(`${this.apiUrl}/${id}`, consultorio);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchByCentro(centroNombre: string): Observable<DataPackage<Consultorio[]>> {
    return this.http.get<DataPackage<Consultorio[]>>(`${this.apiUrl}/byCentro/${centroNombre}`);
  }
}
