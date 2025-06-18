import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { DataPackage } from '../data.package';
import { DiaExcepcional } from './diaExcepcional';

@Injectable({
  providedIn: 'root'
})
export class DiasExcepcionalesService {
  private diasExcepcionales = new BehaviorSubject<DiaExcepcional[]>([]);
  public diasExcepcionales$ = this.diasExcepcionales.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Extrae información de días excepcionales de los eventos del calendario.
   * Esto evita hacer una request separada ya que los eventos ya contienen esta información.
   */
  extraerDiasExcepcionalesDeEventos(eventos: any[]): void {
    const diasExcepcionales: DiaExcepcional[] = [];
    const fechasProcesadas = new Set<string>();

    eventos.forEach(evento => {
      // Skip si ya procesamos esta fecha
      if (fechasProcesadas.has(evento.fecha)) {
        return;
      }

      // Verificar si es un evento excepcional
      if (evento.titulo && (
        evento.titulo.includes('FERIADO') || 
        evento.titulo.includes('MANTENIMIENTO') || 
        evento.titulo.includes('ATENCION_ESPECIAL')
      )) {
        let tipo: 'FERIADO' | 'MANTENIMIENTO' | 'ATENCION_ESPECIAL';
        let descripcion = '';

        // Extraer tipo y descripción del título
        if (evento.titulo.includes('FERIADO')) {
          tipo = 'FERIADO';
          descripcion = evento.titulo.replace('FERIADO:', '').trim();
        } else if (evento.titulo.includes('MANTENIMIENTO')) {
          tipo = 'MANTENIMIENTO';
          descripcion = evento.titulo.replace('MANTENIMIENTO:', '').trim();
        } else if (evento.titulo.includes('ATENCION_ESPECIAL')) {
          tipo = 'ATENCION_ESPECIAL';
          descripcion = evento.titulo.replace('ATENCION_ESPECIAL:', '').trim();
        } else {
          return; // No es un tipo reconocido
        }

        const diaExcepcional: DiaExcepcional = {
          fecha: evento.fecha,
          tipo: tipo,
          descripcion: descripcion,
          apertura: tipo !== 'FERIADO' ? evento.horaInicio : undefined,
          cierre: tipo !== 'FERIADO' ? evento.horaFin : undefined,
          centroId: evento.centroId,
          centroNombre: evento.nombreCentro,
          consultorioId: evento.consultorioId,
          consultorioNombre: evento.consultorioNombre,
          medicoId: evento.staffMedicoId,
          medicoNombre: evento.staffMedicoNombre,
          medicoApellido: evento.staffMedicoApellido,
          especialidad: evento.especialidadStaffMedico,
          activo: true
        };

        diasExcepcionales.push(diaExcepcional);
        fechasProcesadas.add(evento.fecha);
      }
    });

    console.log('Días excepcionales extraídos de eventos:', diasExcepcionales);
    this.actualizarDiasExcepcionales(diasExcepcionales);
  }

  /**
   * DEPRECADO: Usa extraerDiasExcepcionalesDeEventos() en su lugar
   * Carga días excepcionales para el calendario
   */
  cargarDiasExcepcionalesParaCalendario(): void {
    console.warn('cargarDiasExcepcionalesParaCalendario() está deprecado. Usa extraerDiasExcepcionalesDeEventos() en su lugar.');
    // Inicializar con array vacío - la información vendrá de los eventos
    this.actualizarDiasExcepcionales([]);
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
    return dias.some(dia => dia.fecha === fecha && dia.tipo === 'FERIADO');
  }

  /**
   * Verifica si una fecha es día de mantenimiento
   */
  esMantenimiento(fecha: string): boolean {
    const dias = this.diasExcepcionales.value;
    return dias.some(dia => dia.fecha === fecha && dia.tipo === 'MANTENIMIENTO');
  }

  /**
   * Verifica si una fecha es día de atención especial
   */
  esAtencionEspecial(fecha: string): boolean {
    const dias = this.diasExcepcionales.value;
    return dias.some(dia => dia.fecha === fecha && dia.tipo === 'ATENCION_ESPECIAL');
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
    return dia ? dia.tipo : null;
  }

  /**
   * Obtiene todas las excepciones de un día específico
   */
  getExcepcionesDelDia(fecha: string): Array<{
    tipo: 'FERIADO' | 'ATENCION_ESPECIAL' | 'MANTENIMIENTO';
    descripcion?: string;
    horaInicio?: string;
    horaFin?: string;
  }> {
    const dias = this.diasExcepcionales.value;
    const excepcionesDelDia = dias.filter(dia => dia.fecha === fecha);
    
    return excepcionesDelDia.map(dia => ({
      tipo: dia.tipo,
      descripcion: dia.descripcion,
      horaInicio: dia.apertura,
      horaFin: dia.cierre
    }));
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

  /**
   * Método centralizado para verificar si un slot específico está afectado por excepciones
   * Elimina duplicación de código entre componentes
   */
  slotAfectadoPorExcepcion(slot: { fecha: string; horaInicio: string; horaFin: string }): boolean {
    const excepcionesDelDia = this.getExcepcionesDelDia(slot.fecha);
    
    if (!excepcionesDelDia || excepcionesDelDia.length === 0) {
      return false;
    }

    for (const excepcion of excepcionesDelDia) {
      // Los feriados afectan todo el día
      if (excepcion.tipo === 'FERIADO') {
        return true;
      }

      // Para mantenimiento y atención especial, verificar horarios específicos
      if ((excepcion.tipo === 'MANTENIMIENTO' || excepcion.tipo === 'ATENCION_ESPECIAL') && 
          excepcion.horaInicio && excepcion.horaFin) {
        
        const inicioSlotMinutos = this.convertirHoraAMinutos(slot.horaInicio);
        const finSlotMinutos = this.convertirHoraAMinutos(slot.horaFin);
        const inicioExcepcionMinutos = this.convertirHoraAMinutos(excepcion.horaInicio);
        const finExcepcionMinutos = this.convertirHoraAMinutos(excepcion.horaFin);

        // Verificar si hay superposición entre el slot y la excepción
        if (inicioSlotMinutos < finExcepcionMinutos && finSlotMinutos > inicioExcepcionMinutos) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Obtiene información detallada sobre por qué un slot está afectado
   */
  getInformacionAfectacion(slot: { fecha: string; horaInicio: string; horaFin: string }): {
    afectado: boolean;
    tipo?: 'FERIADO' | 'MANTENIMIENTO' | 'ATENCION_ESPECIAL';
    descripcion?: string;
    mensaje?: string;
  } {
    const excepcionesDelDia = this.getExcepcionesDelDia(slot.fecha);
    
    if (!excepcionesDelDia || excepcionesDelDia.length === 0) {
      return { afectado: false };
    }

    for (const excepcion of excepcionesDelDia) {
      // Los feriados afectan todo el día
      if (excepcion.tipo === 'FERIADO') {
        return {
          afectado: true,
          tipo: 'FERIADO',
          descripcion: excepcion.descripcion,
          mensaje: `Este día es feriado${excepcion.descripcion ? ': ' + excepcion.descripcion : ''}`
        };
      }

      // Para mantenimiento y atención especial, verificar horarios específicos
      if ((excepcion.tipo === 'MANTENIMIENTO' || excepcion.tipo === 'ATENCION_ESPECIAL') && 
          excepcion.horaInicio && excepcion.horaFin) {
        
        const inicioSlotMinutos = this.convertirHoraAMinutos(slot.horaInicio);
        const finSlotMinutos = this.convertirHoraAMinutos(slot.horaFin);
        const inicioExcepcionMinutos = this.convertirHoraAMinutos(excepcion.horaInicio);
        const finExcepcionMinutos = this.convertirHoraAMinutos(excepcion.horaFin);

        // Verificar si hay superposición entre el slot y la excepción
        if (inicioSlotMinutos < finExcepcionMinutos && finSlotMinutos > inicioExcepcionMinutos) {
          const tipoLabel = excepcion.tipo === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Atención Especial';
          return {
            afectado: true,
            tipo: excepcion.tipo,
            descripcion: excepcion.descripcion,
            mensaje: `Este horario no está disponible por ${tipoLabel}${excepcion.descripcion ? ': ' + excepcion.descripcion : ''}`
          };
        }
      }
    }

    return { afectado: false };
  }

  /**
   * Determina el estado y mensaje para mostrar en un slot
   */
  getEstadoSlot(slot: { 
    fecha: string; 
    horaInicio: string; 
    horaFin: string; 
    ocupado?: boolean;
    titulo?: string;
    enMantenimiento?: boolean;
  }): {
    disponible: boolean;
    estado: 'DISPONIBLE' | 'OCUPADO' | 'FERIADO' | 'MANTENIMIENTO' | 'ATENCION_ESPECIAL' | 'NO_DISPONIBLE';
    mensaje: string;
    clase: string;
  } {
    // Si está ocupado por un turno, no está disponible
    if (slot.ocupado) {
      return {
        disponible: false,
        estado: 'OCUPADO',
        mensaje: 'Ocupado',
        clase: 'ocupado'
      };
    }

    // Verificar excepciones
    const afectacion = this.getInformacionAfectacion(slot);
    if (afectacion.afectado) {
      return {
        disponible: false,
        estado: afectacion.tipo!,
        mensaje: afectacion.mensaje!,
        clase: afectacion.tipo!.toLowerCase().replace('_', '-')
      };
    }

    // Verificar campos específicos del slot
    if (slot.enMantenimiento) {
      return {
        disponible: false,
        estado: 'MANTENIMIENTO',
        mensaje: 'En mantenimiento',
        clase: 'mantenimiento'
      };
    }

    // Si tiene título específico que no sea "Disponible", analizarlo
    if (slot.titulo && slot.titulo !== 'Disponible' && !slot.titulo.startsWith('Ocupado')) {
      if (slot.titulo.includes('FERIADO')) {
        return {
          disponible: false,
          estado: 'FERIADO',
          mensaje: slot.titulo,
          clase: 'feriado'
        };
      }
      if (slot.titulo.includes('MANTENIMIENTO')) {
        return {
          disponible: false,
          estado: 'MANTENIMIENTO',
          mensaje: slot.titulo,
          clase: 'mantenimiento'
        };
      }
      if (slot.titulo.includes('ATENCION_ESPECIAL')) {
        return {
          disponible: true, // Atención especial puede estar disponible para turnos especiales
          estado: 'ATENCION_ESPECIAL',
          mensaje: slot.titulo,
          clase: 'atencion-especial'
        };
      }
    }

    // Por defecto, disponible
    return {
      disponible: true,
      estado: 'DISPONIBLE',
      mensaje: 'Disponible',
      clase: 'disponible'
    };
  }

  /**
   * Función auxiliar para convertir "HH:mm" a minutos desde medianoche
   */
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }
}
