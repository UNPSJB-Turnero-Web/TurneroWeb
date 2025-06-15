import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { DataPackage } from '../data.package';

export interface DiaExcepcional {
  id?: number;
  fecha: string;
  tipoAgenda: 'FERIADO' | 'ATENCION_ESPECIAL' | 'MANTENIMIENTO';
  descripcion?: string;
  apertura?: string;
  cierre?: string;
  centroId?: number;
  centroNombre?: string;
  consultorioId?: number;
  consultorioNombre?: string;
  esquemaTurnoId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DiasExcepcionalesService {
  private diasExcepcionales = new BehaviorSubject<DiaExcepcional[]>([]);
  public diasExcepcionales$ = this.diasExcepcionales.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Carga días excepcionales para el calendario
   * Carga las próximas 4 semanas desde la fecha actual
   */
  cargarDiasExcepcionalesParaCalendario(): void {
    const fechaActual = new Date();
    const fechaInicio = new Date(fechaActual);
    fechaInicio.setDate(fechaInicio.getDate() - 7); // Una semana hacia atrás

    const fechaFin = new Date(fechaActual);
    fechaFin.setDate(fechaFin.getDate() + (4 * 7)); // 4 semanas hacia adelante

    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
    const fechaFinStr = fechaFin.toISOString().split('T')[0];

    console.log('Cargando días excepcionales desde:', fechaInicioStr, 'hasta:', fechaFinStr);

    this.cargarDiasExcepcionales(fechaInicioStr, fechaFinStr).subscribe({
      next: (response) => {
        console.log('Días excepcionales del backend:', response.data);
        this.actualizarDiasExcepcionales(response.data || []);
      },
      error: (error) => {
        console.error('Error al cargar días excepcionales para calendario:', error);
        // Inicializar con array vacío si falla el backend
        this.actualizarDiasExcepcionales([]);
      }
    });
  }

  /**
   * Carga días excepcionales por rango de fechas
   */
  cargarDiasExcepcionales(fechaInicio: string, fechaFin: string, centroId?: number): Observable<DataPackage<DiaExcepcional[]>> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    
    if (centroId) {
      params = params.set('centroId', centroId.toString());
    }

    return this.http.get<DataPackage<DiaExcepcional[]>>('rest/agenda/dias-excepcionales', { params });
  }

  /**
   * Actualiza la cache local de días excepcionales
   */
  actualizarDiasExcepcionales(dias: DiaExcepcional[]): void {
    this.diasExcepcionales.next(dias);
  }

  /**
   * Obtiene todos los días excepcionales para una fecha específica
   */
  getDiasExcepcionalesPorFecha(fecha: string): DiaExcepcional[] {
    const dias = this.diasExcepcionales.value;
    return dias.filter(dia => dia.fecha === fecha);
  }

  /**
   * Verifica si una fecha es feriado
   */
  esFeriado(fecha: string): boolean {
    const dias = this.diasExcepcionales.value;
    return dias.some(dia => dia.fecha === fecha && dia.tipoAgenda === 'FERIADO');
  }

  /**
   * Verifica si una fecha es día de mantenimiento
   */
  esMantenimiento(fecha: string): boolean {
    const dias = this.diasExcepcionales.value;
    return dias.some(dia => dia.fecha === fecha && dia.tipoAgenda === 'MANTENIMIENTO');
  }

  /**
   * Verifica si una fecha es día de atención especial
   */
  esAtencionEspecial(fecha: string): boolean {
    const dias = this.diasExcepcionales.value;
    return dias.some(dia => dia.fecha === fecha && dia.tipoAgenda === 'ATENCION_ESPECIAL');
  }

  /**
   * Verifica si una fecha es un día excepcional
   */
  esDiaExcepcional(fecha: string): boolean {
    const dias = this.diasExcepcionales.value;
    return dias.some(dia => dia.fecha === fecha);
  }

  /**
   * Obtiene el tipo de excepción para una fecha específica
   */
  getTipoExcepcion(fecha: string): 'FERIADO' | 'ATENCION_ESPECIAL' | 'MANTENIMIENTO' | null {
    const dias = this.diasExcepcionales.value;
    const dia = dias.find(dia => dia.fecha === fecha);
    return dia ? dia.tipoAgenda : null;
  }

  /**
   * Obtiene la descripción del día excepcional
   */
  getDescripcionExcepcion(fecha: string): string | null {
    const dias = this.diasExcepcionales.value;
    const dia = dias.find(dia => dia.fecha === fecha);
    return dia ? dia.descripcion || '' : null;
  }

  /**
   * Obtiene la clase CSS para una fecha según su tipo de excepción
   */
  getClaseDia(fecha: string): string {
    if (this.esFeriado(fecha)) {
      return 'dia-feriado';
    }
    if (this.esMantenimiento(fecha)) {
      return 'dia-mantenimiento';
    }
    if (this.esAtencionEspecial(fecha)) {
      return 'dia-atencion-especial';
    }
    if (this.esDiaExcepcional(fecha)) {
      return 'dia-excepcional';
    }
    return '';
  }
}
