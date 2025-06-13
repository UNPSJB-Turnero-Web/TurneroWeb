import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultorioDistribucionService {
  private baseUrl = '/api/agenda';

  constructor(private http: HttpClient) { }

  /**
   * Optimiza la distribución de consultorios para un centro médico
   * 
   * @param centroId ID del centro médico
   * @param fecha Fecha opcional para la optimización (por defecto la fecha actual)
   * @returns Mapa de asignaciones (staffMedicoId -> consultorioId)
   */
  optimizarDistribucion(centroId: number, fecha?: Date): Observable<Record<number, number>> {
    let url = `${this.baseUrl}/centro/${centroId}/optimizar-consultorios`;
    
    if (fecha) {
      // Formato ISO YYYY-MM-DD para la fecha
      const fechaStr = fecha.toISOString().split('T')[0];
      url += `?fecha=${fechaStr}`;
    }
    
    return this.http.post<Record<number, number>>(url, {});
  }

  /**
   * Resuelve conflictos de consultorios para una especialidad específica
   * 
   * @param centroId ID del centro médico
   * @param especialidadId ID de la especialidad
   * @param fecha Fecha opcional para resolver conflictos (por defecto la fecha actual)
   * @returns Mensaje de confirmación
   */
  resolverConflictos(centroId: number, especialidadId: number, fecha?: Date): Observable<string> {
    let url = `${this.baseUrl}/centro/${centroId}/especialidad/${especialidadId}/resolver-conflictos`;
    
    if (fecha) {
      // Formato ISO YYYY-MM-DD para la fecha
      const fechaStr = fecha.toISOString().split('T')[0];
      url += `?fecha=${fechaStr}`;
    }
    
    return this.http.post<string>(url, {});
  }
}
