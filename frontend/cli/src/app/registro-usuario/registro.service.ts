import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';

// Interfaz para los datos de registro que espera el backend
export interface PacienteRegistroDTO {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  password: string;
  obraSocialId?: number; // Opcional
}

// Interfaz para el paciente registrado (respuesta del backend)
export interface PacienteDTO {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  fechaAlta: string;
  obraSocial?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private readonly apiUrl = 'rest/pacientes';

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo paciente en el sistema
   * @param datos Datos del paciente a registrar
   * @returns Observable con la respuesta del servidor
   */
  registrarPaciente(datos: PacienteRegistroDTO): Observable<DataPackage<PacienteDTO>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<DataPackage<PacienteDTO>>(`${this.apiUrl}/register`, datos, { headers });
  }

  /**
   * Verifica si un email ya está registrado
   * @param email Email a verificar
   * @returns Observable con la respuesta
   */
  verificarEmail(email: string): Observable<DataPackage<boolean>> {
    return this.http.get<DataPackage<boolean>>(`${this.apiUrl}/verificar-email?email=${email}`);
  }

  /**
   * Verifica si un DNI ya está registrado
   * @param dni DNI a verificar
   * @returns Observable con la respuesta
   */
  verificarDni(dni: string): Observable<DataPackage<boolean>> {
    return this.http.get<DataPackage<boolean>>(`${this.apiUrl}/verificar-dni?dni=${dni}`);
  }
}
