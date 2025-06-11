import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turno } from './turno';
import { DataPackage } from '../data.package';
import { TurnoAuditInfo, AuditFilter } from '../audit/audit-log';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private url = 'rest/turno';

  constructor(private http: HttpClient) {}

  /** Obtiene todos los turnos */
  all(): Observable<DataPackage<Turno[]>> {
    return this.http.get<DataPackage<Turno[]>>(this.url);
  }

  /** Obtiene un turno por ID */
  get(id: number): Observable<DataPackage<Turno>> {
    return this.http.get<DataPackage<Turno>>(`${this.url}/${id}`);
  }

  /** Crea un nuevo turno */
  create(turno: Turno): Observable<DataPackage<Turno>> {
    return this.http.post<DataPackage<Turno>>(this.url, turno);
  }

  /** Actualiza un turno existente */
  update(id: number, turno: Turno): Observable<DataPackage<Turno>> {
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}`, turno);
  }

  /** Elimina un turno por ID */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /** Paginación de turnos */
  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }

  /** Búsqueda de turnos */
  search(term: string): Observable<DataPackage<Turno[]>> {
    return this.http.get<DataPackage<Turno[]>>(`${this.url}/search/${term}`);
  }

  /** Obtiene los turnos de un paciente específico */
  getByPacienteId(pacienteId: number): Observable<DataPackage<Turno[]>> {
    return this.http.get<DataPackage<Turno[]>>(`${this.url}/paciente/${pacienteId}`);
  }

  /** Cancela un turno */
  cancelar(id: number): Observable<DataPackage<Turno>> {
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/cancelar`, {});
  }

  /** Confirma un turno */
  confirmar(id: number): Observable<DataPackage<Turno>> {
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/confirmar`, {});
  }

  /** Reagenda un turno */
  reagendar(id: number, nuevosDatos: any): Observable<DataPackage<Turno>> {
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/reagendar`, nuevosDatos);
  }

  // ===== AUDIT-SPECIFIC METHODS =====

  /** Obtiene turnos con filtros para auditoría */
  getTurnosForAudit(filter: AuditFilter): Observable<DataPackage<TurnoAuditInfo[]>> {
    let params = new HttpParams();
    
    if (filter.dateFrom) {
      params = params.set('fechaDesde', filter.dateFrom.toISOString());
    }
    if (filter.dateTo) {
      params = params.set('fechaHasta', filter.dateTo.toISOString());
    }
    if (filter.centroId) {
      params = params.set('centroAtencionId', filter.centroId.toString());
    }
    if (filter.especialidadId) {
      params = params.set('especialidadId', filter.especialidadId.toString());
    }
    if (filter.staffMedicoId) {
      params = params.set('medicoId', filter.staffMedicoId.toString());
    }
    if (filter.action) {
      params = params.set('action', filter.action);
    }
    if (filter.turnoId) {
      params = params.set('turnoId', filter.turnoId.toString());
    }

    return this.http.get<DataPackage<TurnoAuditInfo[]>>(`${this.url}/audit`, { params });
  }

  /** Obtiene información detallada de auditoría para un turno específico */
  getTurnoAuditInfo(id: number): Observable<DataPackage<TurnoAuditInfo>> {
    return this.http.get<DataPackage<TurnoAuditInfo>>(`${this.url}/${id}/audit`);
  }

  /** Actualiza un turno con audit trail */
  updateWithAudit(id: number, turno: Turno, reason: string): Observable<DataPackage<Turno>> {
    const auditData = {
      turno: turno,
      auditReason: reason,
      userId: localStorage.getItem('userName') || 'Unknown User'
    };
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/audit`, auditData);
  }

  /** Resuelve un conflicto en un turno */
  resolveConflict(turnoId: number, resolution: any): Observable<DataPackage<any>> {
    return this.http.post<DataPackage<any>>(`${this.url}/${turnoId}/resolve-conflict`, resolution);
  }

  /** Obtiene estadísticas de turnos para el dashboard de auditoría */
  getAuditStats(filter: AuditFilter): Observable<DataPackage<any>> {
    let params = new HttpParams();
    
    if (filter.dateFrom) {
      params = params.set('fechaDesde', filter.dateFrom.toISOString());
    }
    if (filter.dateTo) {
      params = params.set('fechaHasta', filter.dateTo.toISOString());
    }
    if (filter.centroId) {
      params = params.set('centroAtencionId', filter.centroId.toString());
    }

    return this.http.get<DataPackage<any>>(`${this.url}/audit/stats`, { params });
  }

  /** Exporta turnos para auditoría */
  exportTurnosForAudit(filter: AuditFilter, format: 'csv' | 'pdf'): Observable<Blob> {
    let params = new HttpParams();
    
    if (filter.dateFrom) {
      params = params.set('fechaDesde', filter.dateFrom.toISOString());
    }
    if (filter.dateTo) {
      params = params.set('fechaHasta', filter.dateTo.toISOString());
    }
    if (filter.centroId) {
      params = params.set('centroAtencionId', filter.centroId.toString());
    }
    if (filter.especialidadId) {
      params = params.set('especialidadId', filter.especialidadId.toString());
    }
    if (filter.staffMedicoId) {
      params = params.set('medicoId', filter.staffMedicoId.toString());
    }
    if (filter.action) {
      params = params.set('action', filter.action);
    }
    params = params.set('format', format);

    return this.http.get(`${this.url}/audit/export`, { 
      params, 
      responseType: 'blob' 
    });
  }
}
