import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Agenda } from './agenda';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private url = 'rest/agenda'; // Base URL del backend

  constructor(private http: HttpClient) { }

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/${id}`);
  }

  save(agenda: Agenda): Observable<DataPackage> {
    return agenda.id
      ? this.http.put<DataPackage>(this.url, agenda)
      : this.http.post<DataPackage>(this.url, agenda);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  search(term: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/search/${term}`);
  }

  // --- Métodos adicionales útiles ---

  // Obtener agendas por médico
  byMedico(medicoId: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/medico/${medicoId}`);
  }

  // Obtener agendas por especialidad
  byEspecialidad(especialidadId: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/especialidad/${especialidadId}`);
  }

  // Obtener agendas por centro de atención
  byCentro(centroId: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/centro/${centroId}`);
  }

  // Cambiar estado de una agenda (ejemplo)
  cambiarEstado(id: number, estado: string): Observable<DataPackage> {
    return this.http.patch<DataPackage>(`${this.url}/${id}/estado`, { estado });
  }

  // Obtener todas las agendas (sin paginar)
  getAll(): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/all`);
  }



  // Método para obtener eventos generados desde el backend
  obtenerEventos(esquemaTurnoId: number, semanas: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/eventos?esquemaTurnoId=${esquemaTurnoId}&semanas=${semanas}`);
  }
  obtenerTodosLosEventos(semanas: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/eventos/todos?semanas=${semanas}`);
  }

  asignarTurno(turnoId: number, pacienteId: number): Observable<any> {
    return this.http.post(`${this.url}/asignar-turno`, { turnoId, pacienteId });
  }

}