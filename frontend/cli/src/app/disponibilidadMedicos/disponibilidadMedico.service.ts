import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DisponibilidadMedico } from './disponibilidadMedico';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadMedicoService {
  private url = 'rest/disponibilidades-medico';

  constructor(private http: HttpClient) { }

  /** Obtiene todas las disponibilidades */
  all(): Observable<DataPackage<DisponibilidadMedico[]>> {
    return this.http.get<DataPackage<DisponibilidadMedico[]>>(this.url);
  }

  /** Obtiene una disponibilidad por ID */
  get(id: number): Observable<DataPackage<DisponibilidadMedico>> {
    return this.http.get<DataPackage<DisponibilidadMedico>>(`${this.url}/${id}`);
  }

  /** Crea una nueva disponibilidad */
  create(disponibilidad: DisponibilidadMedico): Observable<DataPackage<DisponibilidadMedico>> {
    return this.http.post<DataPackage<DisponibilidadMedico>>(this.url, disponibilidad);
  }

  /** Actualiza una disponibilidad existente */
  update(id: number, disponibilidad: DisponibilidadMedico): Observable<DataPackage<DisponibilidadMedico>> {
    return this.http.put<DataPackage<DisponibilidadMedico>>(`${this.url}/${id}`, disponibilidad);
  }

  /** Elimina una disponibilidad por ID */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /** Disponibilidades por staff médico */
  byStaffMedico(staffMedicoId: number): Observable<DataPackage<DisponibilidadMedico[]>> {
    return this.http.get<DataPackage<DisponibilidadMedico[]>>(`${this.url}/staffMedico/${staffMedicoId}`);
  }
  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page-1}&size=${size}`);
  }

  /** Resetear todas las disponibilidades */
  reset(): Observable<any> {
    return this.http.post(`${this.url}/reset`, {});
  }
}