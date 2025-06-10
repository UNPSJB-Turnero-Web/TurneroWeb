import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Paciente } from './paciente';
import { DataPackage } from '../data.package';
import { ResultsPage } from '../results-page';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private url = 'rest/pacientes';

  constructor(private http: HttpClient) { }

  /** Obtiene todos los pacientes */
  all(): Observable<DataPackage<Paciente[]>> {
    return this.http.get<DataPackage<Paciente[]>>(this.url);
  }

  /** Obtiene un paciente por ID */
  get(id: number): Observable<DataPackage<Paciente>> {
    return this.http.get<DataPackage<Paciente>>(`${this.url}/${id}`);
  }

  /** Crea un nuevo paciente */
  create(paciente: Paciente): Observable<DataPackage<Paciente>> {
    return this.http.post<DataPackage<Paciente>>(this.url, paciente);
  }

  /** Actualiza un paciente existente */
  update(id: number, paciente: Paciente): Observable<DataPackage<Paciente>> {
    return this.http.put<DataPackage<Paciente>>(`${this.url}/${id}`, paciente);
  }

  /** Elimina un paciente por ID */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  byPage(page: number, size: number): Observable<DataPackage<ResultsPage>> {
    return this.http.get<DataPackage<ResultsPage>>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }
  /** Búsqueda de pacientes */
  search(term: string): Observable<DataPackage<Paciente[]>> {
    return this.http.get<DataPackage<Paciente[]>>(`${this.url}/search/${term}`);
  }

  /** Verifica si un paciente existe por DNI */
  existsByDni(dni: number): Observable<boolean> {
    return this.http.get<DataPackage<boolean>>(`${this.url}/existsByDni/${dni}`).pipe(
      map(res => res.data || false)
    );
  }

  /** Busca un paciente por DNI */
  findByDni(dni: number): Observable<DataPackage<Paciente>> {
    return this.http.get<DataPackage<Paciente>>(`${this.url}/dni/${dni}`);
  }

  getObrasSociales(): Observable<DataPackage<{ id: number; nombre: string; codigo: string }[]>> {
    return this.http.get<DataPackage<{ id: number; nombre: string; codigo: string }[]>>(`rest/obra-social`);
  }
}
