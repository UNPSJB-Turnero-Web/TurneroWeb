import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';

export interface HistorialTurnoDTO {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;

  // Información del paciente
  pacienteId: number;
  nombrePaciente: string;
  apellidoPaciente: string;
  dniPaciente: number;
  emailPaciente: string;
  telefonoPaciente: string;

  // Información del médico
  staffMedicoId: number;
  staffMedicoNombre: string;
  staffMedicoApellido: string;
  especialidadStaffMedico: string;

  // Información del consultorio y centro
  consultorioId: number;
  consultorioNombre: string;
  centroId: number;
  nombreCentro: string;
  direccionCentro: string;

  // Observaciones y estados
  observaciones: string;
  asistio?: boolean;
  // fechaRegistroAsistencia?: string;
  performedBy: string;
  updatedAt: string;
  motivoCancelacion?: string;
  motivoReagendamiento?: string;
}

export interface HistorialFilter {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private readonly url = 'rest/turno/historial';

  constructor(private http: HttpClient) { }

  getHistorialTurnosPaginado(
    pacienteId: number,
    page: number = 0,
    size: number = 10,
    filtro?: HistorialFilter
  ): Observable<DataPackage<{
    content: HistorialTurnoDTO[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
  }>> {

    // 🔥 CAMBIO CRÍTICO: Construir params paso a paso
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // 🔥 CORRECCIÓN: Agregar filtros SOLO si tienen valor y NO están vacíos
    if (filtro) {
      console.log('🔍 Service: Procesando filtros:', filtro);

      if (filtro.fechaDesde && filtro.fechaDesde.trim() !== '') {
        params = params.set('fechaDesde', filtro.fechaDesde);
        console.log('   ✅ Agregando fechaDesde:', filtro.fechaDesde);
      }

      if (filtro.fechaHasta && filtro.fechaHasta.trim() !== '') {
        params = params.set('fechaHasta', filtro.fechaHasta);
        console.log('   ✅ Agregando fechaHasta:', filtro.fechaHasta);
      }

      // 🎯 CRÍTICO: Verificar que estado tenga valor Y no sea vacío
      if (filtro.estado && filtro.estado.trim() !== '') {
        params = params.set('estado', filtro.estado.trim().toUpperCase());
        console.log('   ✅ Agregando estado:', filtro.estado.trim().toUpperCase());
      } else {
        console.log('   ℹ️ Sin filtro de estado (mostrando todos)');
      }
    }

    // 🔥 CAMBIO CRÍTICO: Usar el endpoint /filtrado
    const endpoint = `${this.url}/${pacienteId}/filtrado`;

    console.log('📡 Service: Llamando a:', endpoint);
    console.log('📡 Service: Con params:', params.toString());

    return this.http.get<DataPackage<{
      content: HistorialTurnoDTO[];
      totalPages: number;
      totalElements: number;
      currentPage: number;
    }>>(endpoint, { params });
  }

  getHistorialTurnoById(turnoId: number): Observable<DataPackage<HistorialTurnoDTO>> {
    return this.http.get<DataPackage<HistorialTurnoDTO>>(`${this.url}/detalle/${turnoId}`);
  }
}