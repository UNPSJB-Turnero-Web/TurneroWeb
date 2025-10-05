import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Medico } from './medico';
import { ResultsPage } from '../results-page';

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

  /** Crea un nuevo médico por administrador */
  createByAdmin(medico: Medico): Observable<DataPackage<Medico>> {
    return this.http.post<DataPackage<Medico>>(
      `${this.medicosUrl}/create-by-admin`,
      medico
    );
  }

  /** Crea un nuevo médico por operador */
  createByOperador(medico: Medico): Observable<DataPackage<Medico>> {
    return this.http.post<DataPackage<Medico>>(
      `${this.medicosUrl}/create-by-operador`,
      medico
    );
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

  /** Busca un médico por email */
  findByEmail(email: string): Observable<DataPackage<Medico>> {
    return this.http.get<DataPackage<Medico>>(`${this.medicosUrl}/email/${encodeURIComponent(email)}`);
  }

  /** Paginación */
  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.medicosUrl}/page?page=${page - 1}&size=${size}`);
  }

  /**
   * Búsqueda paginada avanzada con filtros y ordenamiento
   * @param page Número de página (0-based)
   * @param size Tamaño de página
   * @param nombre Filtro por nombre (opcional)
   * @param especialidad Filtro por especialidad (opcional)
   * @param estado Filtro por estado (activo/inactivo, opcional)
   * @param sortBy Campo para ordenar (opcional)
   * @param sortDir Dirección del ordenamiento (asc/desc, opcional)
   * @returns Observable con DataPackage<Page<Medico>>
   */
  findByPage(
    page: number,
    size: number,
    nombre?: string,
    especialidad?: string,
    estado?: string,
    sortBy?: string,
    sortDir?: string
  ): Observable<DataPackage<ResultsPage>> {
    // Construir query string con parámetros opcionales
    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('size', size.toString());

    if (nombre && nombre.trim()) {
      params.append('nombre', nombre.trim());
    }

    if (especialidad && especialidad.trim()) {
      params.append('especialidad', especialidad.trim());
    }

    if (estado && estado.trim()) {
      params.append('estado', estado.trim());
    }

    if (sortBy && sortBy.trim()) {
      params.append('sortBy', sortBy.trim());
    }

    if (sortDir && sortDir.trim()) {
      params.append('sortDir', sortDir.trim());
    }

    const url = `${this.medicosUrl}/page?${params.toString()}`;

    return this.http.get<DataPackage<ResultsPage>>(url);
  }
}
