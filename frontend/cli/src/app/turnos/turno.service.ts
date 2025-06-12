import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turno } from './turno';
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

  /** Configura tiempo de sanitización para un esquema de turno */
  configurarSanitizacion(esquemaTurnoId: number, tiempoSanitizacion: number): Observable<DataPackage<any>> {
    return this.http.put<DataPackage<any>>(`rest/agenda/esquema-turno/${esquemaTurnoId}/sanitizacion`, {
      tiempoSanitizacion
    });
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
}