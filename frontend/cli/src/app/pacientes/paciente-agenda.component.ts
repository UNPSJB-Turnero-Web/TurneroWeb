import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarModule, CalendarEvent, CalendarView } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Services
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-paciente-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule
  ],
  template: `
    <div class="container-fluid mt-4">
      <!-- HEADER -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="banner-paciente-agenda">          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="header-text">
              <h1>Mis Turnos Médicos</h1>
              <p>Visualiza todos tus turnos programados</p>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- FILTROS JERÁRQUICOS -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="filtros-card">
            <div class="filtros-header">
              <span class="filtros-icon">📋</span>
              <h3>Filtros de Visualización</h3>
            </div>
            
            <div class="filtros-body">
              <div class="filtros-actions">
                <button 
                  type="button" 
                  class="btn btn-paciente-primary" 
                  (click)="cargarTurnosPaciente()"
                  [disabled]="isLoadingTurnos">
                  <i class="fas fa-refresh"></i>
                  {{ isLoadingTurnos ? 'Cargando...' : 'Actualizar Turnos' }}
                </button>
                <button 
                  type="button" 
                  class="btn btn-paciente-secondary" 
                  (click)="irASolicitarTurno()">
                  <i class="fas fa-plus"></i>
                  Solicitar Nuevo Turno
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CALENDARIO DE TURNOS DISPONIBLES -->
      <div class="row" *ngIf="showCalendar">
        <div class="col-12">
          <div class="calendar-card">
            <div class="calendar-header">
              <div class="d-flex justify-content-between align-items-center">
                <h3><i class="fas fa-calendar-alt"></i> Mis Turnos Programados</h3>
                <div class="calendar-navigation">
                  <button 
                    type="button" 
                    class="btn btn-nav" 
                    (click)="previousWeek()">
                    <i class="fas fa-chevron-left"></i> Anterior
                  </button>
                  <span class="current-period">
                    {{ viewDate | date: 'MMMM yyyy' }}
                  </span>
                  <button 
                    type="button" 
                    class="btn btn-nav" 
                    (click)="nextWeek()">
                    Siguiente <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="calendar-body">
              <mwl-calendar-week-view
                [viewDate]="viewDate"
                [events]="turnosDelPaciente"
                [hourSegments]="4"
                [dayStartHour]="7"
                [dayEndHour]="20"
                (eventClicked)="onTurnoSelected($event)">
              </mwl-calendar-week-view>
            </div>
          </div>
        </div>
      </div>

      <!-- MENSAJE CUANDO NO HAY TURNOS -->
      <div class="row" *ngIf="showCalendar && turnosDelPaciente.length === 0">
        <div class="col-12">
          <div class="no-turnos-card">
            <div class="no-turnos-content">
              <i class="fas fa-calendar-times"></i>
              <h4>No tienes turnos programados</h4>
              <p>No se encontraron turnos asignados a tu nombre.</p>
              <p>¿Deseas solicitar un nuevo turno?</p>
              <button class="btn btn-paciente-primary" (click)="irASolicitarTurno()">
                <i class="fas fa-plus"></i>
                Solicitar Turno
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL CONFIRMAR TURNO -->
      <div *ngIf="showConfirmModal" class="modal-overlay" (click)="closeConfirmModal()">
        <div class="modal-content paciente-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4><i class="fas fa-calendar-check"></i> Detalles del Turno</h4>
            <button type="button" class="btn-close" (click)="closeConfirmModal()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="turno-details">
              <div class="detail-item">
                <strong>Especialidad:</strong> {{ selectedTurno?.meta?.especialidad }}
              </div>
              <div class="detail-item">
                <strong>Médico:</strong> {{ selectedTurno?.meta?.medico }}
              </div>
              <div class="detail-item">
                <strong>Centro:</strong> {{ selectedTurno?.meta?.centro }}
              </div>
              <div class="detail-item">
                <strong>Consultorio:</strong> {{ selectedTurno?.meta?.consultorio }}
              </div>
              <div class="detail-item">
                <strong>Fecha:</strong> {{ selectedTurno?.start | date: 'EEEE, dd MMMM yyyy' }}
              </div>
              <div class="detail-item">
                <strong>Horario:</strong> {{ selectedTurno?.start | date: 'HH:mm' }} - {{ selectedTurno?.end | date: 'HH:mm' }}
              </div>
              <div class="detail-item" *ngIf="selectedTurno?.meta?.estado">
                <strong>Estado:</strong> 
                <span class="estado-badge" [class]="'estado-' + selectedTurno?.meta?.estado?.toLowerCase()">
                  {{ selectedTurno?.meta?.estado }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-paciente-secondary" 
              (click)="closeConfirmModal()">
              Cerrar
            </button>
            <button 
              type="button" 
              class="btn btn-paciente-primary" 
              (click)="irASolicitarTurno()">
              <i class="fas fa-plus"></i>
              Solicitar Nuevo Turno
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* HEADER */
    .banner-paciente-agenda {
      background: linear-gradient(135deg, var(--pacientes-gradient));
      color: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .header-icon {
      font-size: 3rem;
      opacity: 0.9;
    }

    .header-text h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .header-text p {
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    /* FILTROS CARD */
    .filtros-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .filtros-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .filtros-icon {
      font-size: 1.5rem;
    }

    .filtros-header h3 {
      margin: 0;
      font-weight: 600;
    }

    .filtros-body {
      padding: 2rem;
    }

    /* STEPS */
    .filtro-step {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border-radius: 10px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .filtro-step.active {
      border-color: var(--pacientes-primary);
      background: rgba(var(--pacientes-primary-rgb), 0.05);
    }

    .filtro-step.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .step-number {
      background: var(--pacientes-primary);
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .step-header h4 {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }

    .form-control-paciente {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control-paciente:focus {
      outline: none;
      border-color: var(--pacientes-primary);
      box-shadow: 0 0 0 0.2rem rgba(var(--pacientes-primary-rgb), 0.25);
    }

    .loading-indicator {
      margin-top: 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    /* ACCIONES */
    .filtros-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-paciente-primary {
      background: var(--pacientes-gradient);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-paciente-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(var(--pacientes-primary-rgb), 0.3);
    }

    .btn-paciente-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-paciente-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    /* SELECCIÓN CARD */
    .seleccion-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-left: 4px solid var(--pacientes-primary);
    }

    .seleccion-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .seleccion-header h4 {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }

    .seleccion-body {
      padding: 1.5rem;
    }

    .seleccion-item {
      margin-bottom: 0.5rem;
      padding: 0.5rem 0;
    }

    /* CALENDARIO */
    .calendar-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .calendar-header {
      background: linear-gradient(135deg, var(--pacientes-gradient));
      color: white;
      padding: 1.5rem;
    }

    .calendar-header h3 {
      margin: 0;
      font-weight: 600;
    }

    .calendar-navigation {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-nav {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: background 0.3s ease;
    }

    .btn-nav:hover {
      background: rgba(255,255,255,0.3);
    }

    .current-period {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .calendar-body {
      padding: 1rem;
    }

    /* NO TURNOS */
    .no-turnos-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      padding: 3rem;
      text-align: center;
    }

    .no-turnos-content i {
      font-size: 4rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .no-turnos-content h4 {
      color: #495057;
      margin-bottom: 1rem;
    }

    .no-turnos-content p {
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }

    .paciente-modal {
      background: white;
      border-radius: 15px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: between;
      align-items: center;
    }

    .modal-header h4 {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #adb5bd;
      margin-left: auto;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .turno-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .detail-item {
      margin-bottom: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    /* ESTADO BADGES */
    .estado-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-confirmado {
      background: #d4edda;
      color: #155724;
    }

    .estado-pendiente {
      background: #fff3cd;
      color: #856404;
    }

    .estado-cancelado {
      background: #f8d7da;
      color: #721c24;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .header-text h1 {
        font-size: 2rem;
      }

      .filtros-actions {
        flex-direction: column;
      }

      .calendar-navigation {
        flex-direction: column;
        gap: 0.5rem;
      }

      .paciente-modal {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class PacienteAgendaComponent implements OnInit {
  // Estados de carga
  isLoadingTurnos = false;
  isConfirming = false;

  // Calendario
  viewDate = new Date();
  showCalendar = false;
  turnosDelPaciente: CalendarEvent[] = []; // Para mostrar los turnos reales del paciente

  // Modal de confirmación
  showConfirmModal = false;
  selectedTurno: CalendarEvent | null = null;

  constructor(
    private turnoService: TurnoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarTurnosPaciente();
  }

  cargarTurnosPaciente() {
    const pacienteId = localStorage.getItem('pacienteId');
    if (!pacienteId) {
      console.error('No se encontró ID del paciente');
      this.router.navigate(['/home']);
      return;
    }

    this.isLoadingTurnos = true;
    this.turnoService.getByPacienteId(parseInt(pacienteId)).subscribe({
      next: (dataPackage) => {
        const turnos = dataPackage.data || [];
        this.turnosDelPaciente = turnos.map(turno => this.convertirTurnoAEvento(turno));
        this.showCalendar = true;
        this.isLoadingTurnos = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando turnos del paciente:', error);
        this.isLoadingTurnos = false;
        this.showCalendar = true; // Mostrar calendario vacío
      }
    });
  }

  private convertirTurnoAEvento(turno: Turno): CalendarEvent {
    const fechaInicio = new Date(`${turno.fecha}T${turno.horaInicio}`);
    const fechaFin = new Date(`${turno.fecha}T${turno.horaFin}`);

    // Colores basados en el estado del turno
    let color = { primary: '#007bff', secondary: '#e3f2fd' }; // Por defecto
    switch (turno.estado?.toLowerCase()) {
      case 'confirmado':
        color = { primary: '#28a745', secondary: '#d4edda' };
        break;
      case 'pendiente':
        color = { primary: '#ffc107', secondary: '#fff3cd' };
        break;
      case 'cancelado':
        color = { primary: '#dc3545', secondary: '#f8d7da' };
        break;
    }

    return {
      start: fechaInicio,
      end: fechaFin,
      title: `${turno.especialidadStaffMedico || 'Consulta'} - ${turno.staffMedicoNombre} ${turno.staffMedicoApellido}`,
      color: color,
      meta: {
        turnoId: turno.id,
        especialidad: turno.especialidadStaffMedico,
        medico: `${turno.staffMedicoNombre} ${turno.staffMedicoApellido}`,
        centro: turno.nombreCentro,
        consultorio: turno.consultorioNombre,
        estado: turno.estado,
        fecha: turno.fecha,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin
      }
    };
  }

  irASolicitarTurno() {
    this.router.navigate(['/pacientes/solicitar-turno']);
  }

  // Navegación del calendario
  previousWeek() {
    const newDate = new Date(this.viewDate);
    newDate.setDate(newDate.getDate() - 7);
    this.viewDate = newDate;
  }

  nextWeek() {
    const newDate = new Date(this.viewDate);
    newDate.setDate(newDate.getDate() + 7);
    this.viewDate = newDate;
  }

  onTurnoSelected(event: any) {
    this.selectedTurno = event.event;
    this.showConfirmModal = true;
  }

  // Actualizar método para manejar turnos del paciente (no confirmación de disponibles)
  confirmarTurno() {
    // En lugar de confirmar, mostrar detalles o permitir cancelar
    this.closeConfirmModal();
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.selectedTurno = null;
    this.isConfirming = false;
  }
}
