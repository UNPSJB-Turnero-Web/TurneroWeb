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

  onAsociarMedico(): void {
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

  medicoYaAsociado(): boolean {
    if (!this.medicoSeleccionado) return false;
    return this.staffMedicoCentro.some(staff => 
      staff.medico?.id === this.medicoSeleccionado!.id
    );
  }

  verDisponibilidadesStaff(staff: StaffMedico): DisponibilidadMedico[] {
    if (!staff.id) return [];
    return this.disponibilidadesStaff[staff.id] || [];
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
    return disponibilidades.filter(disponibilidad => 
      disponibilidad.horarios?.some(horario => horario.dia === dia)
    );
  }

  /**
   * Obtiene los horarios de una disponibilidad para un día específico
   */
  getHorariosPorDia(disponibilidad: DisponibilidadMedico, dia: string): any[] {
    if (!disponibilidad.horarios) return [];
    return disponibilidad.horarios.filter(horario => horario.dia === dia);
  }
}
