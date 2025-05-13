import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Consultorio } from './consultorio';

@Injectable({
  providedIn: 'root'
})
export class ConsultorioService {
  private baseUrl = 'rest/consultorios';

  constructor(private http: HttpClient) {}

  /** Obtiene todos los consultorios */
  getAll(): Observable<DataPackage<Consultorio[]>> {
    return this.http.get<DataPackage<Consultorio[]>>(this.baseUrl);
  }

  /** Consulta un consultorio por ID */
  getById(id: number): Observable<DataPackage<Consultorio>> {
    return this.http.get<DataPackage<Consultorio>>(`${this.baseUrl}/${id}`);
  }

  /** Crea un nuevo consultorio */
  create(consultorio: Consultorio): Observable<DataPackage<Consultorio>> {
    return this.http.post<DataPackage<Consultorio>>(this.baseUrl, consultorio);
  }

  /** Actualiza un consultorio existente */
  update(id: number, consultorio: Consultorio): Observable<DataPackage<Consultorio>> {
    return this.http.put<DataPackage<Consultorio>>(`${this.baseUrl}/${id}`, consultorio);
  }

  /** Elimina un consultorio */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Lista los consultorios de un Centro de Atención específico */
  listByCentro(centroNombre: string): Observable<DataPackage<Consultorio[]>> {
    return this.http.get<DataPackage<Consultorio[]>>(
      `${this.baseUrl}/${encodeURIComponent(centroNombre)}/listar`
    );
  }
  getPage(page: number, size: number): Observable<{content: Consultorio[], totalElements: number}> {
    return this.http.get<{content: Consultorio[], totalElements: number}>(`/rest/consultorios/page?page=${page}&size=${size}`);
  }
  
}