import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';
import { AgendaService } from '../agenda/agenda.service';
import { DiasExcepcionalesService } from '../agenda/dias-excepcionales.service';

interface SlotDisponible {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  staffMedicoId: number;
  staffMedicoNombre: string;
  staffMedicoApellido: string;
  especialidadStaffMedico: string;
  consultorioId: number;
  consultorioNombre: string;
  centroId: number;
  nombreCentro: string;
}

@Component({
  selector: 'app-paciente-reagendar-turno',
  imports: [CommonModule, FormsModule],
  templateUrl: './paciente-reagendar-turno.component.html', 
  styleUrl: './paciente-reagendar-turno.component.css',
})
export class PacienteReagendarTurnoComponent implements OnInit {
  turnoId: number = 0;
  currentTurno: Turno | null = null;
  slotsDisponibles: SlotDisponible[] = [];
  slotsPorFecha: { [fecha: string]: SlotDisponible[] } = {};
  fechasOrdenadas: string[] = [];
  slotSeleccionado: SlotDisponible | null = null;
  isProcessing: boolean = false;
  isLoadingSlots: boolean = false;
  errorMessage: string = '';
  motivoReagendamiento: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private turnoService: TurnoService,
    private agendaService: AgendaService,
    private diasExcepcionalesService: DiasExcepcionalesService
  ) {}

  ngOnInit() {
    // Cargar días excepcionales primero
    this.cargarDiasExcepcionales();
    
    this.route.params.subscribe(params => {
      this.turnoId = +params['id'];
      this.cargarTurnoActual();
    });
  }

  cargarDiasExcepcionales() {
    // Para este componente, usamos el método original ya que obtenerSlotsDisponiblesPorMedico
    // no incluye información completa de días excepcionales como obtenerTodosLosEventos
    // Pero primero intentamos obtener desde la cache del servicio
    const fechaActual = new Date();
    const fechaInicio = new Date(fechaActual);
    fechaInicio.setDate(fechaInicio.getDate() - 7);
    const fechaFin = new Date(fechaActual);
    fechaFin.setDate(fechaFin.getDate() + (4 * 7));
    
    this.diasExcepcionalesService.cargarDiasExcepcionales(
      fechaInicio.toISOString().split('T')[0],
      fechaFin.toISOString().split('T')[0]
    ).subscribe({
      next: (response) => {
        this.diasExcepcionalesService.actualizarDiasExcepcionales(response.data || []);
      },
      error: (error) => {
        console.error('Error al cargar días excepcionales:', error);
        this.diasExcepcionalesService.actualizarDiasExcepcionales([]);
      }
    });
  }

  cargarTurnoActual() {
    this.turnoService.get(this.turnoId).subscribe({
      next: (dataPackage: DataPackage<Turno>) => {
        this.currentTurno = dataPackage.data;
        console.log('Turno cargado para reagendar:', this.currentTurno);
        
        // Cargar slots disponibles del mismo médico
        if (this.currentTurno?.staffMedicoId) {
          this.cargarSlotsDisponibles(this.currentTurno.staffMedicoId);
        }
      },
      error: (error) => {
        console.error('Error cargando turno:', error);
        this.errorMessage = 'No se pudo cargar la información del turno.';
      }
    });
  }

  cargarSlotsDisponibles(staffMedicoId: number) {
    this.isLoadingSlots = true;
    this.errorMessage = '';

    this.agendaService.obtenerSlotsDisponiblesPorMedico(staffMedicoId, 4).subscribe({
      next: (response: any) => {
        // El backend devuelve un Response object con data
        const slots = response.data || response;
        
        this.slotsDisponibles = slots.filter((slot: any) => {
          // Filtrar slots que no sean el turno actual
          if (!this.currentTurno) return true;
          
          const currentDateTime = new Date(`${this.currentTurno.fecha}T${this.currentTurno.horaInicio}`);
          const slotDateTime = new Date(`${slot.fecha}T${slot.horaInicio}`);
          return slotDateTime.getTime() !== currentDateTime.getTime();
        });
        
        console.log('Slots disponibles cargados:', this.slotsDisponibles);
        this.agruparSlotsPorFecha();
        this.isLoadingSlots = false;
      },
      error: (error: any) => {
        console.error('Error cargando slots disponibles:', error);
        this.errorMessage = 'No se pudieron cargar los horarios disponibles.';
        this.isLoadingSlots = false;
      }
    });
  }

  agruparSlotsPorFecha() {
    this.slotsPorFecha = {};
    
    // Agrupar slots por fecha
    this.slotsDisponibles.forEach(slot => {
      if (!this.slotsPorFecha[slot.fecha]) {
        this.slotsPorFecha[slot.fecha] = [];
      }
      this.slotsPorFecha[slot.fecha].push(slot);
    });
    
    // Ordenar fechas y horarios dentro de cada fecha
    this.fechasOrdenadas = Object.keys(this.slotsPorFecha).sort();
    
    // Ordenar por médico y luego por horarios dentro de cada fecha
    Object.keys(this.slotsPorFecha).forEach(fecha => {
      this.slotsPorFecha[fecha].sort((a, b) => {
        // Primero agrupar por médico (nombre completo)
        const medicoA = `${a.staffMedicoNombre} ${a.staffMedicoApellido}`;
        const medicoB = `${b.staffMedicoNombre} ${b.staffMedicoApellido}`;
        
        if (medicoA !== medicoB) {
          return medicoA.localeCompare(medicoB);
        }
        
        // Si es el mismo médico, ordenar por hora
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    });
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    };
    return fechaObj.toLocaleDateString('es-ES', options);
  }

  seleccionarSlot(slot: SlotDisponible) {
    // Verificar si el slot específico está afectado por una excepción usando el servicio centralizado
    if (this.slotAfectadoPorExcepcion(slot)) {
      // Obtener información detallada de la afectación usando métodos centralizados
      const informacion = this.diasExcepcionalesService.getInformacionAfectacionSlot(slot);
      if (informacion) {
        alert(`Este horario no está disponible por ${informacion.tipo}. Por favor, selecciona otro horario.`);
      } else {
        alert('Este horario no está disponible. Por favor, selecciona otro horario.');
      }
      return;
    }

    this.slotSeleccionado = slot;
    console.log('Slot seleccionado:', slot);
  }

  cancelarSeleccion() {
    this.slotSeleccionado = null;
    this.motivoReagendamiento = '';
  }

  confirmarReagendamiento() {
    if (!this.currentTurno || !this.slotSeleccionado) return;

    // Validar motivo
    if (!this.motivoReagendamiento || this.motivoReagendamiento.trim().length < 5) {
      this.errorMessage = 'Debe ingresar un motivo de al menos 5 caracteres para reagendar el turno';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    // Preparar los datos del reagendamiento
    const reagendamientoData = {
      fecha: this.slotSeleccionado.fecha,
      horaInicio: this.slotSeleccionado.horaInicio,
      horaFin: this.slotSeleccionado.horaFin,
      staffMedicoId: this.slotSeleccionado.staffMedicoId,
      consultorioId: this.slotSeleccionado.consultorioId,
      motivo: this.motivoReagendamiento.trim(),
      usuario: `PACIENTE_${this.currentTurno.pacienteId}`
    };

    // Usar el endpoint específico de reagendamiento que modifica el turno existente
    this.turnoService.reagendar(this.turnoId, reagendamientoData).subscribe({
      next: (response) => {
        console.log('Turno reagendado exitosamente:', response);
        this.isProcessing = false;
        
        alert(`Turno reagendado exitosamente!\n\nNueva fecha: ${this.formatDate(this.slotSeleccionado!.fecha)}\nHorario: ${this.slotSeleccionado!.horaInicio} - ${this.slotSeleccionado!.horaFin}\nMédico: ${this.slotSeleccionado!.staffMedicoNombre} ${this.slotSeleccionado!.staffMedicoApellido}`);
        
        this.router.navigate(['/paciente-dashboard']);
      },
      error: (error) => {
        console.error('Error al reagendar turno:', error);
        this.isProcessing = false;
        
        let errorMessage = 'No se pudo reagendar el turno. Por favor, intenta nuevamente.';
        if (error.error && error.error.status_text) {
          errorMessage += ': ' + error.error.status_text;
        }
        this.errorMessage = errorMessage;
      }
    });
  }

  reintentar() {
    this.errorMessage = '';
    if (this.currentTurno?.staffMedicoId) {
      this.cargarSlotsDisponibles(this.currentTurno.staffMedicoId);
    }
  }

  formatDate(dateString: string): string {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month es 0-indexed
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateShort(dateString: string): string {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month es 0-indexed
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  formatDayOfWeek(dateString: string): string {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month es 0-indexed
    return date.toLocaleDateString('es-ES', {
      weekday: 'long'
    });
  }

  goBack() {
    this.router.navigate(['/paciente-dashboard']);
  }

  // Métodos para manejo de días excepcionales
  esDiaExcepcional(fecha: string): boolean {
    return this.diasExcepcionalesService.esDiaExcepcional(fecha);
  }

  // Verificar si un slot específico está afectado por excepciones - Delegado al servicio centralizado
  slotAfectadoPorExcepcion(slot: SlotDisponible): boolean {
    return this.diasExcepcionalesService.slotAfectadoPorExcepcion(slot);
  }

  getTipoExcepcion(fecha: string): 'FERIADO' | 'ATENCION_ESPECIAL' | 'MANTENIMIENTO' | null {
    return this.diasExcepcionalesService.getTipoExcepcion(fecha);
  }

  getDescripcionExcepcion(fecha: string): string | null {
    return this.diasExcepcionalesService.getDescripcionExcepcion(fecha);
  }

  getIconoExcepcion(fecha: string): string {
    const tipo = this.getTipoExcepcion(fecha);
    switch (tipo) {
      case 'FERIADO':
        return '🏛️';
      case 'MANTENIMIENTO':
        return '🔧';
      case 'ATENCION_ESPECIAL':
        return '⭐';
      default:
        return '⚠️';
    }
  }

  getTipoExcepcionLabel(fecha: string): string {
    const tipo = this.getTipoExcepcion(fecha);
    switch (tipo) {
      case 'FERIADO':
        return 'Feriado';
      case 'MANTENIMIENTO':
        return 'Mantenimiento';
      case 'ATENCION_ESPECIAL':
        return 'Atención Especial';
      default:
        return 'Excepcional';
    }
  }
}
