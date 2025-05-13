import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Consultorio } from './consultorio';

@Injectable({
  providedIn: 'root'
})
export class ConsultorioService {
  private consultoriosUrl = 'rest/consultorios';

  constructor(private http: HttpClient) {}

  /** Obtiene todos los consultorios */
  getAll(): Observable<DataPackage<Consultorio[]>> {
    return this.http.get<DataPackage<Consultorio[]>>(this.consultoriosUrl);
  }

  /** Consulta un consultorio por ID */
  getById(id: number): Observable<DataPackage<Consultorio>> {
    return this.http.get<DataPackage<Consultorio>>(`${this.consultoriosUrl}/${id}`);
  }

  /** Crea un nuevo consultorio */
  create(consultorio: Consultorio): Observable<DataPackage<Consultorio>> {
    return this.http.post<DataPackage<Consultorio>>(this.consultoriosUrl, consultorio);
  }

  /** Actualiza un consultorio existente */
  update(id: number, consultorio: Consultorio): Observable<DataPackage<Consultorio>> {
    return this.http.put<DataPackage<Consultorio>>(`${this.consultoriosUrl}/${id}`, consultorio);
  }

  /** Elimina un consultorio */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.consultoriosUrl}/${id}`);
  }

  /** Lista los consultorios de un Centro de Atención específico */
  listByCentro(centroNombre: string): Observable<DataPackage<Consultorio[]>> {
    return this.http.get<DataPackage<Consultorio[]>>(
      `${this.consultoriosUrl}/${encodeURIComponent(centroNombre)}/listar`
    );
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.consultoriosUrl}/page?page=${page-1}&size=${size}`);
  }
}