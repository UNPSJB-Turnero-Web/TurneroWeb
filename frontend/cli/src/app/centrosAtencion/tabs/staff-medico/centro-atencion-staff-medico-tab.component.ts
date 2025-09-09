import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StaffMedico } from '../../../staffMedicos/staffMedico';
import { Medico } from '../../../medicos/medico';
import { Especialidad } from '../../../especialidades/especialidad';
import { DisponibilidadMedico } from '../../../disponibilidadMedicos/disponibilidadMedico';
import { DisponibilidadModalComponent } from './disponibilidad-modal.component';

@Component({
  selector: 'app-centro-atencion-staff-medico-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centro-atencion-staff-medico-tab.component.html',
  styleUrls: ['./centro-atencion-staff-medico-tab.component.css']
})
export class CentroAtencionStaffMedicoTabComponent implements OnInit {
  @Input() staffMedicoCentro: StaffMedico[] = [];
  @Input() medicosDisponiblesParaAsociar: Medico[] = [];
  @Input() medicoSeleccionado: Medico | null = null;
  @Input() especialidadSeleccionada: Especialidad | null = null;
  @Input() especialidadesMedico: Especialidad[] = [];
  @Input() mensajeStaff: string = '';
  @Input() tipoMensajeStaff: string = '';
  @Input() staffMedicoExpandido: { [staffMedicoId: number]: boolean } = {};
  @Input() disponibilidadesStaff: { [staffMedicoId: number]: DisponibilidadMedico[] } = {};

  @Output() medicoSeleccionadoChange = new EventEmitter<Medico | null>();
  @Output() especialidadSeleccionadaChange = new EventEmitter<Especialidad | null>();
  @Output() medicoSeleccionado$ = new EventEmitter<void>();
  @Output() asociarMedico = new EventEmitter<void>();
  @Output() desasociarMedico = new EventEmitter<StaffMedico>();
  @Output() toggleStaffMedicoExpansion = new EventEmitter<StaffMedico>();
  @Output() agregarDisponibilidad = new EventEmitter<StaffMedico>();
  @Output() gestionarDisponibilidadAvanzada = new EventEmitter<StaffMedico>();
  @Output() crearNuevaDisponibilidad = new EventEmitter<StaffMedico>();
  @Output() disponibilidadCreada = new EventEmitter<DisponibilidadMedico>();

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  onMedicoSeleccionado(): void {
    this.medicoSeleccionadoChange.emit(this.medicoSeleccionado);
    this.medicoSeleccionado$.emit();
  }

  onEspecialidadSeleccionada(): void {
    console.log('Especialidad seleccionada en hijo:', this.especialidadSeleccionada);
    this.especialidadSeleccionadaChange.emit(this.especialidadSeleccionada);
  }

  onAsociarMedico(): void {
    console.log('onAsociarMedico clicked - medicoSeleccionado:', this.medicoSeleccionado);
    console.log('onAsociarMedico clicked - especialidadSeleccionada:', this.especialidadSeleccionada);
    console.log('Emitiendo evento asociarMedico...');
    this.asociarMedico.emit();
  }

  onDesasociarMedico(staff: StaffMedico): void {
    this.desasociarMedico.emit(staff);
  }

  onToggleStaffMedicoExpansion(staff: StaffMedico): void {
    this.toggleStaffMedicoExpansion.emit(staff);
  }

  onAgregarDisponibilidad(staff: StaffMedico): void {
    this.agregarDisponibilidad.emit(staff);
  }

  onGestionarDisponibilidadAvanzada(staff: StaffMedico): void {
    this.gestionarDisponibilidadAvanzada.emit(staff);
  }

  onCrearNuevaDisponibilidad(staff: StaffMedico): void {
    this.abrirModalDisponibilidad(staff);
  }

  /**
   * Abre el modal para crear una nueva disponibilidad
   */
  abrirModalDisponibilidad(staff: StaffMedico): void {
    const modalRef = this.modalService.open(DisponibilidadModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    // Pasar el staff médico al modal
    modalRef.componentInstance.staffMedico = staff;

    // Manejar el resultado del modal
    modalRef.result.then(
      (nuevaDisponibilidad: DisponibilidadMedico) => {
        if (nuevaDisponibilidad) {
          // Emitir evento para que el componente padre actualice las disponibilidades
          this.disponibilidadCreada.emit(nuevaDisponibilidad);
        }
      },
      (dismissed) => {
        // Modal fue cancelado o cerrado sin guardar
        console.log('Modal de disponibilidad cerrado sin guardar');
      }
    );
  }

  /**
   * Abre el modal para editar una disponibilidad existente
   */
  abrirModalEditarDisponibilidad(staff: StaffMedico): void {
    // Buscar la disponibilidad existente del staff médico
    const disponibilidadesExistentes = this.verDisponibilidadesStaff(staff);
    
    if (disponibilidadesExistentes.length > 0) {
      // Si tiene disponibilidades, abrir modal en modo edición con la primera disponibilidad
      const disponibilidadParaEditar = disponibilidadesExistentes[0];
      
      const modalRef = this.modalService.open(DisponibilidadModalComponent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });

      // Pasar datos al modal
      modalRef.componentInstance.staffMedico = staff;
      modalRef.componentInstance.disponibilidadExistente = disponibilidadParaEditar;

      // Manejar el resultado del modal
      modalRef.result.then(
        (disponibilidadActualizada: DisponibilidadMedico) => {
          if (disponibilidadActualizada) {
            // Emitir evento para que el componente padre actualice las disponibilidades
            this.disponibilidadCreada.emit(disponibilidadActualizada);
          }
        },
        (dismissed) => {
          console.log('Modal de edición de disponibilidad cerrado sin guardar');
        }
      );
    } else {
      // Si no tiene disponibilidades, abrir modal en modo creación
      this.abrirModalDisponibilidad(staff);
    }
  }

  medicoYaAsociado(): boolean {
    if (!this.medicoSeleccionado) return false;
    
    // Verificar si el médico tiene especialidades disponibles para asociar
    const result = this.especialidadesMedico.length === 0;
    console.log('medicoYaAsociado check:', {
      medicoSeleccionado: this.medicoSeleccionado?.nombre,
      especialidadesMedico: this.especialidadesMedico,
      especialidadSeleccionada: this.especialidadSeleccionada,
      result: result
    });
    return result;
  }

  /**
   * Verifica si un médico está parcialmente asociado (tiene algunas especialidades asignadas pero no todas)
   */
  medicoParcialmenteAsociado(): boolean {
    if (!this.medicoSeleccionado) return false;
    
    const todasLasEspecialidades = this.medicoSeleccionado.especialidades?.length || 0;
    const especialidadesAsignadas = this.staffMedicoCentro
      .filter(staff => staff.medico?.id === this.medicoSeleccionado!.id)
      .length;
    
    return especialidadesAsignadas > 0 && especialidadesAsignadas < todasLasEspecialidades;
  }

  verDisponibilidadesStaff(staff: StaffMedico): DisponibilidadMedico[] {
    if (!staff.id) return [];
    const resultado = this.disponibilidadesStaff[staff.id] || [];
    
    // Log para debug
    if (staff.medico?.nombre === 'Cecilia') {
      console.log('🔍 Debug disponibilidades Cecilia:', {
        staffId: staff.id,
        disponibilidadesStaff: this.disponibilidadesStaff,
        resultado: resultado
      });
    }
    
    return resultado;
  }

  /**
   * Verifica si un staff médico tiene disponibilidades configuradas
   */
  tieneDisponibilidades(staff: StaffMedico): boolean {
    return this.verDisponibilidadesStaff(staff).length > 0;
  }

  /**
   * Calcula la duración de un horario en horas
   */
  calcularDuracionHorario(horario: any): string {
    if (!horario.horaInicio || !horario.horaFin) return '';
    
    const inicio = new Date(`1970-01-01T${horario.horaInicio}`);
    const fin = new Date(`1970-01-01T${horario.horaFin}`);
    const duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60); // En horas
    
    return `${duracion.toFixed(1)}h`;
  }

  /**
   * Obtiene las disponibilidades de un staff médico para un día específico
   */
  getDisponibilidadesPorDia(staff: StaffMedico, dia: string): DisponibilidadMedico[] {
    const disponibilidades = this.verDisponibilidadesStaff(staff);
    const resultado = disponibilidades.filter(disponibilidad => 
      disponibilidad.horarios?.some(horario => horario.dia === dia)
    );
    
    // Log para debug
    if (staff.medico?.nombre === 'Cecilia' && dia === 'JUEVES') {
      console.log('🔍 Debug Cecilia JUEVES:', {
        staff: staff,
        dia: dia,
        disponibilidades: disponibilidades,
        disponibilidadesConJueves: resultado,
        horariosTotales: disponibilidades.flatMap(d => d.horarios || [])
      });
    }
    
    return resultado;
  }

  /**
   * Obtiene los horarios de una disponibilidad para un día específico
   */
  getHorariosPorDia(disponibilidad: DisponibilidadMedico, dia: string): any[] {
    if (!disponibilidad.horarios) return [];
    return disponibilidad.horarios.filter(horario => horario.dia === dia);
  }

  /**
   * Obtiene la string de horario para mostrar en el calendario simplificado
   */
  getHorarioStringDisponibilidad(horario: any): string {
    if (!horario.horaInicio || !horario.horaFin) return '';
    const inicio = horario.horaInicio.substring(0, 5);
    const fin = horario.horaFin.substring(0, 5);
    return `${inicio}-${fin}`;
  }

  /**
   * Calcula la duración total de disponibilidad en un día
   */
  getDuracionTotalDia(disponibilidad: DisponibilidadMedico, dia: string): string {
    const horarios = this.getHorariosPorDia(disponibilidad, dia);
    if (horarios.length === 0) return '';
    
    let totalMinutos = 0;
    horarios.forEach(horario => {
      if (horario.horaInicio && horario.horaFin) {
        const inicio = new Date(`1970-01-01T${horario.horaInicio}`);
        const fin = new Date(`1970-01-01T${horario.horaFin}`);
        totalMinutos += (fin.getTime() - inicio.getTime()) / (1000 * 60);
      }
    });
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    if (horas > 0 && minutos > 0) {
      return `${horas}h ${minutos}m`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else if (minutos > 0) {
      return `${minutos}m`;
    }
    return '';
  }

  /**
   * Obtiene el total de disponibilidades configuradas para un staff médico
   */
  getTotalDisponibilidades(staff: StaffMedico): number {
    return this.verDisponibilidadesStaff(staff).length;
  }
}
