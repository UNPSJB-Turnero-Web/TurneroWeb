import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { EsquemaTurno } from './esquemaTurno';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root'
})
export class EsquemaTurnoService {
  private url = 'rest/esquema-turno';

  constructor(private http: HttpClient) { }

  /** Obtiene todos los esquemas de turno */
  all(): Observable<DataPackage<EsquemaTurno[]>> {
    return this.http.get<DataPackage<EsquemaTurno[]>>(this.url);
  }

  /** Obtiene un esquema de turno por ID */
  get(id: number): Observable<DataPackage<EsquemaTurno>> {
    return this.http.get<DataPackage<EsquemaTurno>>(`${this.url}/${id}`);
  }

  /** Crea un nuevo esquema de turno */
  create(esquema: EsquemaTurno): Observable<DataPackage<EsquemaTurno>> {
    return this.http.post<DataPackage<EsquemaTurno>>(this.url, esquema);
  }

  /** Actualiza un esquema de turno existente */
  update(id: number, esquema: EsquemaTurno): Observable<DataPackage<EsquemaTurno>> {
    return this.http.put<DataPackage<EsquemaTurno>>(`${this.url}/${id}`, esquema);
  }

  /** Elimina un esquema de turno por ID */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /** Paginación de esquemas de turno */

    byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page-1}&size=${size}`);
  }

  /** Búsqueda de esquemas de turno */
  search(term: string): Observable<DataPackage<EsquemaTurno[]>> {
    return this.http.get<DataPackage<EsquemaTurno[]>>(`${this.url}/search/${term}`);
  }

  /** Esquemas de turno asociados a un centro de atención */
  getByCentroAtencion(centroId: number): Observable<DataPackage<EsquemaTurno[]>> {
    return this.http.get<DataPackage<EsquemaTurno[]>>(`${this.url}/centrosAtencion/${centroId}/esquemas`);
  }

  /** Esquemas de turno disponibles para un centro de atención */
  getDisponibles(centroId: number): Observable<EsquemaTurno[]> {
    return this.http.get<DataPackage<EsquemaTurno[]>>(`${this.url}/centrosAtencion/${centroId}/esquemas/disponibles`)
      .pipe(
        map(res => res.data || [])
      );
  }

  /** Redistribuye consultorios automáticamente para esquemas existentes de un centro */
  redistribuirConsultorios(centroId: number): Observable<DataPackage<any>> {
    return this.http.post<DataPackage<any>>(`${this.url}/centrosAtencion/${centroId}/redistribuir`, {});
  }

  /** Redistribuye consultorios para esquemas de un médico específico */
  redistribuirEsquemasPorMedico(medicoId: number): Observable<DataPackage<any>> {
    return this.http.post<DataPackage<any>>(`${this.url}/medico/${medicoId}/redistribuir`, {});
  }

  /** Obtiene estadísticas de distribución actual */
  getEstadisticasDistribucion(centroId: number): Observable<DataPackage<any>> {
    return this.http.get<DataPackage<any>>(`${this.url}/centrosAtencion/${centroId}/estadisticas-distribucion`);
  }

  /** Obtiene esquemas de turno asociados a un consultorio específico */
  getByConsultorio(consultorioId: number): Observable<DataPackage<EsquemaTurno[]>> {
    // Como el endpoint específico no existe, usamos el endpoint general y filtramos
    return this.all().pipe(
      map(response => ({
        ...response,
        data: (response.data || []).filter(esquema => esquema.consultorioId === consultorioId)
      }))
    );
  }

  /** Valida conflictos de un esquema sin guardarlo - útil para validación en tiempo real */
  validarConflictos(esquema: EsquemaTurno): Observable<DataPackage<any>> {
    return this.http.post<DataPackage<any>>(`${this.url}/validar-conflictos`, esquema);
  }
}