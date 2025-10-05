import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Paciente } from "./paciente";
import { DataPackage } from "../data.package";
import { ResultsPage } from "../results-page";

@Injectable({
  providedIn: "root",
})
export class PacienteService {
  private url = "rest/pacientes";

  constructor(private http: HttpClient) {}

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

  /** Crea un nuevo paciente por administrador */
  createByAdmin(paciente: Paciente): Observable<DataPackage<Paciente>> {
    return this.http.post<DataPackage<Paciente>>(
      `${this.url}/create-by-admin`,
      paciente
    );
  }

  /** Crea un nuevo paciente por operador */
  createByOperator(paciente: Paciente): Observable<DataPackage<Paciente>> {
    return this.http.post<DataPackage<Paciente>>(
      `${this.url}/create-by-operator`,
      paciente
    );
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
    return this.http.get<DataPackage<ResultsPage>>(
      `${this.url}/page?page=${page - 1}&size=${size}`
    );
  }

  /**
   * Obtiene pacientes paginados con búsqueda, filtros y ordenamiento avanzados
   * @param page Número de página (1-based, se convierte a 0-based para el backend)
   * @param size Tamaño de página
   * @param filters Objeto con filtros opcionales: nombreApellido (busca en nombre O apellido), documento, email
   * @param sortBy Campo por el cual ordenar (opcional)
   * @param sortDir Dirección del ordenamiento: 'asc' o 'desc' (default: 'asc')
   * @returns Observable con DataPackage<ResultsPage>
   */
  byPageAdvanced(
    page: number,
    size: number,
    filters?: {
      nombreApellido?: string;
      documento?: string;
      email?: string;
    },
    sortBy?: string,
    sortDir: 'asc' | 'desc' = 'asc'
  ): Observable<DataPackage<ResultsPage>> {
    // Construir query parameters
    const params = new URLSearchParams();

    // Paginación (convertir de 1-based a 0-based)
    params.append('page', (page - 1).toString());
    params.append('size', size.toString());

    // Filtros opcionales
    if (filters) {
      if (filters.nombreApellido?.trim()) {
        // Enviar el parámetro unificado nombreApellido
        params.append('nombreApellido', filters.nombreApellido.trim());
      }
      if (filters.documento?.trim()) {
        params.append('documento', filters.documento.trim());
      }
      if (filters.email?.trim()) {
        params.append('email', filters.email.trim());
      }
    }

    // Ordenamiento
    if (sortBy?.trim()) {
      params.append('sortBy', sortBy.trim());
      params.append('sortDir', sortDir);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.url}/page?${queryString}` : `${this.url}/page`;

    return this.http.get<DataPackage<ResultsPage>>(url);
  }
  /** Búsqueda de pacientes */
  search(term: string): Observable<DataPackage<Paciente[]>> {
    return this.http.get<DataPackage<Paciente[]>>(`${this.url}/search/${term}`);
  }

  /** Verifica si un paciente existe por DNI */
  existsByDni(dni: number): Observable<boolean> {
    return this.http
      .get<DataPackage<boolean>>(`${this.url}/existsByDni/${dni}`)
      .pipe(map((res) => res.data || false));
  }

  /** Busca un paciente por DNI */
  findByDni(dni: number): Observable<DataPackage<Paciente>> {
    return this.http.get<DataPackage<Paciente>>(`${this.url}/dni/${dni}`);
  }

  /** Busca un paciente por email y obtiene su ID */
  findByEmail(email: string): Observable<DataPackage<{ pacienteId: number }>> {
    return this.http.get<DataPackage<{ pacienteId: number }>>(
      `${this.url}/by-email/${email}`
    );
  }

  getObrasSociales(): Observable<
    DataPackage<{ id: number; nombre: string; codigo: string }[]>
  > {
    return this.http.get<
      DataPackage<{ id: number; nombre: string; codigo: string }[]>
    >(`rest/obra-social`);
  }

  /**
   * Sincronización automática del usuario actual como paciente.
   * 
   * Este método garantiza que el usuario autenticado tenga un registro en la tabla pacientes,
   * permitiendo que usuarios multi-rol (MÉDICO, OPERADOR, ADMINISTRADOR) puedan operar
   * en el dashboard de pacientes y sacar turnos.
   * 
   * Características:
   * - Idempotente: puede llamarse múltiples veces sin crear duplicados
   * - Busca por DNI o email del usuario autenticado
   * - Crea registro solo si no existe
   * - Retorna el pacienteId correspondiente
   * 
   * @returns Observable con el pacienteId y datos básicos del paciente sincronizado
   */
  syncCurrentUserAsPaciente(): Observable<DataPackage<{
    pacienteId: number;
    nombre: string;
    apellido: string;
    email: string;
    dni: number;
    sincronizado: boolean;
  }>> {
    return this.http.get<DataPackage<{
      pacienteId: number;
      nombre: string;
      apellido: string;
      email: string;
      dni: number;
      sincronizado: boolean;
    }>>(`${this.url}/sync-current-user`);
  }
}
