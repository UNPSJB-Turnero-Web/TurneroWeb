import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turno, TurnoFilter, AuditLog } from './turno';
import { DataPackage } from '../data.package';

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

  // Nuevos métodos para gestionar días excepcionales usando Agenda
  
  /** Crea un día excepcional genérico */
  crearDiaExcepcional(params: any): Observable<DataPackage<any>> {
    return this.http.post<DataPackage<any>>(`rest/agenda/dia-excepcional`, params);
  }
  
  /** Marca un día como feriado para todo el sistema */
  marcarFeriado(fecha: string, esquemaTurnoId: number, descripcion: string): Observable<DataPackage<any>> {
    const params = {
      fecha,
      // Para feriados no enviamos esquemaTurnoId (será null en backend)
      descripcion,
      tipoAgenda: 'FERIADO'
    };
    return this.http.post<DataPackage<any>>(`rest/agenda/dia-excepcional`, params);
  }

  /** Configura mantenimiento para un consultorio */
  configurarMantenimiento(fecha: string, esquemaTurnoId: number, descripcion: string, 
                         horaInicio?: string, horaFin?: string): Observable<DataPackage<any>> {
    const params = {
      fecha,
      esquemaTurnoId,
      descripcion,
      tipoAgenda: 'MANTENIMIENTO',
      horaInicio,
      horaFin
    };
    return this.http.post<DataPackage<any>>(`rest/agenda/dia-excepcional`, params);
  }

  /** Configura atención especial para una fecha específica */
  configurarAtencionEspecial(fecha: string, esquemaTurnoId: number, descripcion: string,
                           horaInicio: string, horaFin: string): Observable<DataPackage<any>> {
    const params = {
      fecha,
      esquemaTurnoId,
      descripcion,
      tipoAgenda: 'ATENCION_ESPECIAL',
      horaInicio,
      horaFin
    };
    return this.http.post<DataPackage<any>>(`rest/agenda/dia-excepcional`, params);
  }



  /** Obtiene días excepcionales por rango de fechas */
  getDiasExcepcionales(fechaInicio: string, fechaFin: string, centroId?: number): Observable<DataPackage<any[]>> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    
    if (centroId) {
      params = params.set('centroId', centroId.toString());
    }

    return this.http.get<DataPackage<any[]>>(`rest/agenda/dias-excepcionales`, { params });
  }

  /** Valida disponibilidad considerando días excepcionales y sanitización */
  validarDisponibilidad(fecha: string, horaInicio: string, consultorioId: number, 
                       staffMedicoId: number): Observable<DataPackage<{disponible: boolean, motivo?: string}>> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('horaInicio', horaInicio)
      .set('consultorioId', consultorioId.toString())
      .set('staffMedicoId', staffMedicoId.toString());

    return this.http.get<DataPackage<{disponible: boolean, motivo?: string}>>(`rest/agenda/validar-disponibilidad`, { params });
  }

  /** Elimina un día excepcional */
  eliminarDiaExcepcional(agendaId: number): Observable<DataPackage<any>> {
    return this.http.delete<DataPackage<any>>(`rest/agenda/dia-excepcional/${agendaId}`);
  }

  /** Actualiza un día excepcional existente */
  actualizarDiaExcepcional(configId: number, params: any): Observable<DataPackage<any>> {
    return this.http.put<DataPackage<any>>(`rest/agenda/dia-excepcional/${configId}`, params);
  }

  // === MÉTODOS DE AUDITORÍA ===

  /** Obtiene el historial de auditoría de un turno */
  getAuditHistory(turnoId: number): Observable<DataPackage<AuditLog[]>> {
    return this.http.get<DataPackage<AuditLog[]>>(`${this.url}/${turnoId}/audit`);
  }

  /** Obtiene el historial de auditoría paginado */
  getAuditHistoryPaged(turnoId: number, page: number, size: number): Observable<DataPackage<any>> {
    const params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString());
    return this.http.get<DataPackage<any>>(`${this.url}/${turnoId}/audit/paged`, { params });
  }

  /** Verifica la integridad del historial de auditoría */
  verifyAuditIntegrity(turnoId: number): Observable<DataPackage<{isValid: boolean}>> {
    return this.http.get<DataPackage<{isValid: boolean}>>(`${this.url}/${turnoId}/audit/verify`);
  }

  /** Obtiene estadísticas generales de auditoría */
  getAuditStatistics(): Observable<DataPackage<any[]>> {
    return this.http.get<DataPackage<any[]>>(`${this.url}/audit/statistics`);
  }

  /** Obtiene logs recientes del sistema */
  getRecentAuditLogs(): Observable<DataPackage<AuditLog[]>> {
    return this.http.get<DataPackage<AuditLog[]>>(`${this.url}/audit/recent`);
  }

  // === MÉTODOS DE CONSULTA AVANZADA ===

  /** Búsqueda avanzada con filtros múltiples */
  searchWithFilters(filter: TurnoFilter): Observable<DataPackage<any>> {
    return this.http.post<DataPackage<any>>(`${this.url}/search`, filter);
  }

  /** Búsqueda por texto simple */
  searchByText(searchText: string, page: number = 0, size: number = 20, 
               sortBy: string = 'fecha', sortDirection: string = 'ASC'): Observable<DataPackage<any>> {
    const params = new HttpParams()
      .set('q', searchText || '')
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);
    
    return this.http.get<DataPackage<any>>(`${this.url}/search`, { params });
  }

  /** Filtros simples (sin paginación) */
  searchWithSimpleFilters(filter: TurnoFilter): Observable<DataPackage<Turno[]>> {
    return this.http.post<DataPackage<Turno[]>>(`${this.url}/filters/simple`, filter);
  }

  // === MÉTODOS DE EXPORTACIÓN ===

  /** Exporta turnos a CSV */
  exportToCSV(filter: TurnoFilter): Observable<string> {
    return this.http.post(`rest/export/turnos/csv`, filter, { responseType: 'text' });
  }

  /** Exporta turnos a HTML para PDF */
  exportToHTML(filter: TurnoFilter): Observable<string> {
    return this.http.post(`rest/export/turnos/html`, filter, { responseType: 'text' });
  }

  /** Exporta turnos a PDF */
  exportToPDF(filter: TurnoFilter): Observable<string> {
    return this.http.post(`rest/export/turnos/pdf`, filter, { responseType: 'text' });
  }

  /** Obtiene estadísticas para exportación */
  getExportStatistics(filter: TurnoFilter): Observable<DataPackage<any>> {
    return this.http.post<DataPackage<any>>(`rest/export/turnos/statistics`, filter);
  }

  // === MÉTODOS DE GESTIÓN CON AUDITORÍA ===

  /** Cancela un turno con motivo */
  cancelarConMotivo(id: number, motivo: string): Observable<DataPackage<Turno>> {
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/cancelar`, { motivo });
  }

  /** Confirma un turno con usuario */
  confirmarConUsuario(id: number, usuario?: string): Observable<DataPackage<Turno>> {
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/confirmar`, { usuario });
  }

  /** Reagenda un turno con motivo y usuario */
  reagendarConAuditoria(id: number, nuevosDatos: any, motivo: string, usuario?: string): Observable<DataPackage<Turno>> {
    const payload = { ...nuevosDatos, motivo, usuario };
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/reagendar`, payload);
  }

}