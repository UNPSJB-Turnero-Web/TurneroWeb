import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Medico } from './medico';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private medicosUrl = 'rest/medicos';

  constructor(private http: HttpClient) {}

  /** Obtiene todos los médicos */
  getAll(): Observable<DataPackage<Medico[]>> {
    return this.http.get<DataPackage<Medico[]>>(this.medicosUrl);
  }

  /** Consulta un médico por ID */
  getById(id: number): Observable<DataPackage<Medico>> {
    return this.http.get<DataPackage<Medico>>(`${this.medicosUrl}/${id}`);
  }

  /** Alias para getById - usado por el dashboard */
  findById(id: number): Observable<Medico> {
    return new Observable(observer => {
      this.getById(id).subscribe({
        next: (response) => {
          if (response && response.data) {
            observer.next(response.data);
          } else {
            observer.error('Médico no encontrado');
          }
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /** Crea un nuevo médico */
  create(medico: Medico): Observable<DataPackage<Medico>> {
    return this.http.post<DataPackage<Medico>>(this.medicosUrl, medico);
  }

  /** Actualiza un médico existente */
  update(id: number, medico: Medico): Observable<DataPackage<Medico>> {
    return this.http.put<DataPackage<Medico>>(`${this.medicosUrl}/${id}`, medico);
  }

  /** Elimina un médico */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.medicosUrl}/${id}`);
  }

  /** Busca médicos por término */
  search(term: string): Observable<DataPackage<Medico[]>> {
    return this.http.get<DataPackage<Medico[]>>(`${this.medicosUrl}/search/${term}`);
  }

  /** Busca un médico por matrícula */
  findByMatricula(matricula: string): Observable<DataPackage<Medico>> {
    return this.http.get<DataPackage<Medico>>(`${this.medicosUrl}/matricula/${matricula}`);
  }

  /** Paginación */
  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.medicosUrl}/page?page=${page - 1}&size=${size}`);
  }
}
