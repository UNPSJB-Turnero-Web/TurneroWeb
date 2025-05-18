import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { StaffMedico } from './staffmedico';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root'
})
export class StaffMedicoService {
  private url = 'rest/staff-medico';

  constructor(private http: HttpClient) { }

  /** Obtiene todos los staff médicos */
  all(): Observable<DataPackage<StaffMedico[]>> {
    return this.http.get<DataPackage<StaffMedico[]>>(this.url);
  }

  /** Obtiene un staff médico por ID */
  get(id: number): Observable<DataPackage<StaffMedico>> {
    return this.http.get<DataPackage<StaffMedico>>(`${this.url}/${id}`);
  }

  /** Crea un nuevo staff médico */
  create(staffMedico: StaffMedico): Observable<DataPackage<StaffMedico>> {
    return this.http.post<DataPackage<StaffMedico>>(this.url, staffMedico);
  }

  /** Actualiza un staff médico existente */
  update(id: number, staffMedico: StaffMedico): Observable<DataPackage<StaffMedico>> {
    return this.http.put<DataPackage<StaffMedico>>(`${this.url}/${id}`, staffMedico);
  }

  /** Elimina un staff médico por ID */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

    /** Paginación de especialidades */
  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }


  /** Búsqueda de staff médicos */
  search(term: string): Observable<DataPackage<StaffMedico[]>> {
    return this.http.get<DataPackage<StaffMedico[]>>(`${this.url}/search/${term}`);
  }

 /** Staff médicos asociados a un centro de atención */
getByCentroAtencion(centroId: number): Observable<DataPackage<StaffMedico[]>> {
  return this.http.get<DataPackage<StaffMedico[]>>(`${this.url}/centrosAtencion/${centroId}/staffMedico`);
}

  /** Staff médicos NO asociados a un centro de atención */
  getDisponibles(centroId: number): Observable<StaffMedico[]> {
    return this.http.get<any>(`${this.url}/centrosAtencion/${centroId}/staff/disponibles`)
      .pipe(
        map(res => res.data || [])
      );
  }

  /** Asociar staff médico a centro de atención */
  asociar(centroId: number, staffMedicoId: number) {
    return this.http.post(`${this.url}/centrosAtencion/${centroId}/staff/${staffMedicoId}`, {});
  }

  /** Desasociar staff médico de centro de atención */
  desasociar(centroId: number, staffMedicoId: number) {
    return this.http.delete(`${this.url}/centrosAtencion/${centroId}/staff/${staffMedicoId}`);
  }
}