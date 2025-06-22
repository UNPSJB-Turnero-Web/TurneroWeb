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
    // Obtener información del usuario actual
    const userRole = localStorage.getItem('userRole');
    let currentUser = 'UNKNOWN';
    
    if (userRole === 'PACIENTE') {
      const patientDNI = localStorage.getItem('patientDNI');
      currentUser = `PACIENTE_${patientDNI || 'UNKNOWN'}`;
    } else if (userRole === 'ADMIN') {
      currentUser = 'ADMIN';
    } else if (userRole === 'MEDICO') {
      currentUser = 'MEDICO';
    }
    
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/cancelar`, { usuario: currentUser });
  }

  /** Confirma un turno */
  confirmar(id: number): Observable<DataPackage<Turno>> {
    // Obtener información del usuario actual
    const userRole = localStorage.getItem('userRole');
    let currentUser = 'UNKNOWN';
    
    if (userRole === 'PACIENTE') {
      const patientDNI = localStorage.getItem('patientDNI');
      currentUser = `PACIENTE_${patientDNI || 'UNKNOWN'}`;
    } else if (userRole === 'ADMIN') {
      currentUser = 'ADMIN';
    } else if (userRole === 'MEDICO') {
      currentUser = 'MEDICO';
    }
    
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/confirmar`, { usuario: currentUser });
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
    return this.http.get<DataPackage<any[]>>(`rest/audit/statistics`);
  }

  /** Obtiene estadísticas del dashboard de auditoría */
  getDashboardStatistics(): Observable<DataPackage<any>> {
    return this.http.get<DataPackage<any>>(`rest/audit/dashboard`);
  }

  /** Obtiene logs recientes del sistema */
  getRecentAuditLogs(): Observable<DataPackage<AuditLog[]>> {
    return this.http.get<DataPackage<AuditLog[]>>(`rest/audit/recent`);
  }

  // === MÉTODOS DE CONSULTA AVANZADA ===

  /** Búsqueda avanzada con filtros múltiples */
  searchWithFilters(filter: TurnoFilter): Observable<DataPackage<any>> {
    console.log('🔍 DEBUG Frontend - Filtro original:', filter);
    
    // Convertir fechas al formato esperado por el backend (dd-MM-yyyy)
    const convertedFilter = this.convertDateFormat(filter);
    
    console.log('🔍 DEBUG Frontend - Filtro convertido:', convertedFilter);
    
    return this.http.post<DataPackage<any>>(`${this.url}/search`, convertedFilter);
  }

  /** Convierte fechas del formato ISO (yyyy-MM-dd) al formato del backend (dd-MM-yyyy) */
  private convertDateFormat(filter: TurnoFilter): TurnoFilter {
    const convertedFilter = { ...filter };
    
    if (convertedFilter.fechaDesde) {
      const original = convertedFilter.fechaDesde;
      convertedFilter.fechaDesde = this.formatDateForBackend(convertedFilter.fechaDesde as any);
      console.log(`📅 DEBUG fechaDesde: ${original} → ${convertedFilter.fechaDesde}`);
    }
    
    if (convertedFilter.fechaHasta) {
      const original = convertedFilter.fechaHasta;
      convertedFilter.fechaHasta = this.formatDateForBackend(convertedFilter.fechaHasta as any);
      console.log(`📅 DEBUG fechaHasta: ${original} → ${convertedFilter.fechaHasta}`);
    }
    
    if (convertedFilter.fechaExacta) {
      const original = convertedFilter.fechaExacta;
      convertedFilter.fechaExacta = this.formatDateForBackend(convertedFilter.fechaExacta as any);
      console.log(`📅 DEBUG fechaExacta: ${original} → ${convertedFilter.fechaExacta}`);
    }
    
    return convertedFilter;
  }

  /** Convierte una fecha de formato yyyy-MM-dd a dd-MM-yyyy */
  private formatDateForBackend(dateString: string | any): string {
    if (!dateString) return dateString;
    
    console.log(`🔧 formatDateForBackend input: "${dateString}" (type: ${typeof dateString})`);
    
    // Convertir a string si es un Date object
    let dateStr = dateString;
    if (dateString instanceof Date) {
      dateStr = dateString.toISOString().split('T')[0]; // yyyy-MM-dd
      console.log(`🔧 Date object convertido a: ${dateStr}`);
    } else if (typeof dateString === 'object' && dateString.toString) {
      dateStr = dateString.toString();
      console.log(`🔧 Object convertido a string: ${dateStr}`);
    } else {
      dateStr = String(dateString);
    }
    
    // Si ya está en el formato correcto (dd-MM-yyyy), no hacer nada
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
      console.log(`✅ Ya está en formato dd-MM-yyyy: ${dateStr}`);
      return dateStr;
    }
    
    // Si está en formato ISO (yyyy-MM-dd), convertir
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = dateStr.split('-');
      const converted = `${parts[2]}-${parts[1]}-${parts[0]}`; // dd-MM-yyyy
      console.log(`🔄 Convertido de yyyy-MM-dd a dd-MM-yyyy: ${dateStr} → ${converted}`);
      return converted;
    }
    
    // Si es una fecha completa ISO, extraer solo la fecha
    if (dateStr.includes('T')) {
      const datePart = dateStr.split('T')[0];
      const parts = datePart.split('-');
      const converted = `${parts[2]}-${parts[1]}-${parts[0]}`; // dd-MM-yyyy
      console.log(`🔄 Convertido de ISO completo a dd-MM-yyyy: ${dateStr} → ${converted}`);
      return converted;
    }
    
    console.log(`⚠️ No se pudo convertir la fecha: ${dateStr}`);
    return dateStr; // Retornar sin cambios si no se puede procesar
  }

  /** Método público para testing de conversión de fechas */
  public testFormatDateForBackend(dateString: string | any): string {
    return this.formatDateForBackend(dateString);
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
    const convertedFilter = this.convertDateFormat(filter);
    return this.http.post<DataPackage<Turno[]>>(`${this.url}/filters/simple`, convertedFilter);
  }

  // === MÉTODOS DE EXPORTACIÓN ===

  /** Exporta turnos a CSV (descarga archivo) */
  exportToCSVDownload(filter: TurnoFilter): Observable<Blob> {
    // Usar POST en lugar de GET para enviar filtros complejos
    const convertedFilter = this.convertDateFormat(filter);
    return this.http.post(`rest/turno/export/csv`, convertedFilter, { responseType: 'blob' });
  }

  /** Exporta turnos a PDF (descarga archivo) */
  exportToPDFDownload(filter: TurnoFilter): Observable<Blob> {
    // Usar POST en lugar de GET para enviar filtros complejos
    const convertedFilter = this.convertDateFormat(filter);
    return this.http.post(`rest/turno/export/pdf`, convertedFilter, { responseType: 'blob' });
  }

  /** Exporta turnos a PDF usando GET (alternativo) */
  exportToPDFDownloadGET(filter: TurnoFilter): Observable<Blob> {
    const params: any = {};
    if (filter.estado) params.estado = filter.estado;
    if (filter.fechaDesde) params.fechaDesde = this.formatDateForBackend(filter.fechaDesde);
    if (filter.fechaHasta) params.fechaHasta = this.formatDateForBackend(filter.fechaHasta);
    if (filter.pacienteId) params.pacienteId = filter.pacienteId;
    if (filter.staffMedicoId) params.staffMedicoId = filter.staffMedicoId;
    if (filter.centroId) params.centroId = filter.centroId;
    if (filter.nombrePaciente) params.nombrePaciente = filter.nombrePaciente;
    if (filter.nombreMedico) params.nombreMedico = filter.nombreMedico;
    if (filter.nombreCentro) params.nombreCentro = filter.nombreCentro;
    return this.http.get(`rest/turno/export/pdf`, { params, responseType: 'blob' });
  }

  /** Obtiene estadísticas para exportación */
  getExportStatistics(filter: TurnoFilter): Observable<DataPackage<any>> {
    const convertedFilter = this.convertDateFormat(filter);
    return this.http.post<DataPackage<any>>(`rest/export/turnos/statistics`, convertedFilter);
  }

  // === MÉTODOS DE GESTIÓN CON AUDITORÍA ===

  /** Cancela un turno con motivo */
  cancelarConMotivo(id: number, motivo: string): Observable<DataPackage<Turno>> {
    // Obtener información del usuario actual
    const userRole = localStorage.getItem('userRole');
    let currentUser = 'UNKNOWN';
    
    if (userRole === 'PACIENTE') {
      const patientDNI = localStorage.getItem('patientDNI');
      currentUser = `PACIENTE_${patientDNI || 'UNKNOWN'}`;
    } else if (userRole === 'ADMIN') {
      currentUser = 'ADMIN';
    } else if (userRole === 'MEDICO') {
      currentUser = 'MEDICO';
    }
    
    return this.http.put<DataPackage<Turno>>(`${this.url}/${id}/cancelar`, { 
      motivo: motivo,
      usuario: currentUser 
    });
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

  // === MÉTODOS DE CAMBIO DE ESTADO ===

  /** Cambia el estado de un turno */
  updateEstado(turnoId: number, nuevoEstado: string, motivo?: string, usuario?: string): Observable<DataPackage<Turno>> {
    // Si se proporciona usuario específico, usarlo; si no, detectar automáticamente
    let currentUser = usuario;
    
    if (!currentUser) {
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'PACIENTE') {
        const patientDNI = localStorage.getItem('patientDNI');
        currentUser = `PACIENTE_${patientDNI || 'UNKNOWN'}`;
      } else if (userRole === 'ADMIN' || userRole === 'admin') {
        currentUser = 'ADMIN';
      } else if (userRole === 'MEDICO') {
        currentUser = 'MEDICO';
      } else {
        // Fallback para dashboard de auditoría u otros casos
        currentUser = 'ADMIN';
      }
    }
    
    const body = {
      estado: nuevoEstado,
      motivo: motivo || '',
      usuario: currentUser
    };
    
    return this.http.put<DataPackage<Turno>>(`${this.url}/${turnoId}/estado`, body);
  }

  /** Obtiene los estados válidos para un turno */
  getValidNextStates(turnoId: number): Observable<DataPackage<string[]>> {
    return this.http.get<DataPackage<string[]>>(`${this.url}/${turnoId}/estados-validos`);
  }

}