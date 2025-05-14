// src/app/play-type/play-type.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from './especialidad';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private url = 'rest/especialidades';

  constructor(private http: HttpClient) {}

  /** Obtiene todas las especialidades */
  all(): Observable<DataPackage<Especialidad[]>> {
    return this.http.get<DataPackage<Especialidad[]>>(this.url);
  }

  /** Obtiene una especialidad por ID */
  get(id: number): Observable<DataPackage<Especialidad>> {
    return this.http.get<DataPackage<Especialidad>>(`${this.url}/${id}`);
  }

  /** Crea una nueva especialidad */
  create(especialidad: Especialidad): Observable<DataPackage<Especialidad>> {
    return this.http.post<DataPackage<Especialidad>>(this.url, especialidad);
  }

  /** Actualiza una especialidad existente */
  update(id: number, especialidad: Especialidad): Observable<DataPackage<Especialidad>> {
    return this.http.put<DataPackage<Especialidad>>(`${this.url}/${id}`, especialidad);
  }

  /** Elimina una especialidad por ID */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /** Paginación de especialidades */
  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }


  /** Búsqueda de especialidades */
  search(term: string): Observable<DataPackage<Especialidad[]>> {
    return this.http.get<DataPackage<Especialidad[]>>(`${this.url}/search/${term}`);
  }
}
