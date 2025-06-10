import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarModule, CalendarEvent, CalendarView } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';

// Services
import { TurnoService } from '../turnos/turno.service';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { AgendaService } from '../agenda/agenda.service';
import { Turno } from '../turnos/turno';
import { Especialidad } from '../especialidades/especialidad';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
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
          <div class="banner-paciente-agenda">
            <div class="header-content">
              <div class="header-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="header-text">
                <h1>Turnos Disponibles</h1>
                <p>Busca y reserva turnos médicos disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTROS DE TURNOS -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="filtros-card">
            <div class="filtros-header">
              <span class="filtros-icon">🔍</span>
              <h3>Filtrar Turnos Disponibles</h3>
            </div>
            
            <div class="filtros-body">
              <!-- Filtro por Especialidad (Obligatorio) -->
              <div class="filtro-step" [class.active]="especialidadSeleccionada">
                <div class="step-header">
                  <div class="step-number">1</div>
                  <h4>Especialidad <span class="required">*</span></h4>
                </div>
                <select 
                  class="form-control-paciente"
                  [(ngModel)]="especialidadSeleccionada"
                  (change)="onEspecialidadChange()"
                  [disabled]="isLoadingEspecialidades">
                  <option value="">Seleccione una especialidad</option>
                  <option *ngFor="let especialidad of especialidades" [value]="especialidad.nombre">
                    {{ especialidad.nombre }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingEspecialidades">
                  <i class="fas fa-spinner fa-spin"></i> Cargando especialidades...
                </div>
              </div>

              <!-- Filtro por Staff Médico (Opcional) -->
              <div class="filtro-step" 
                   [class.active]="staffMedicoSeleccionado"
                   [class.disabled]="!especialidadSeleccionada">
                <div class="step-header">
                  <div class="step-number">2</div>
                  <h4>Médico (Opcional)</h4>
                </div>
                <select 
                  class="form-control-paciente"
                  [(ngModel)]="staffMedicoSeleccionado"
                  (change)="onStaffMedicoChange()"
                  [disabled]="!especialidadSeleccionada || isLoadingStaffMedicos">
                  <option value="">Todos los médicos</option>
                  <option *ngFor="let staff of staffMedicos" [value]="staff.id">
                    {{ staff.medico?.nombre }} {{ staff.medico?.apellido }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingStaffMedicos">
                  <i class="fas fa-spinner fa-spin"></i> Cargando médicos...
                </div>
              </div>

              <!-- Filtro por Centro de Atención (Opcional) -->
              <div class="filtro-step" 
                   [class.active]="centroAtencionSeleccionado"
                   [class.disabled]="!especialidadSeleccionada">
                <div class="step-header">
                  <div class="step-number">3</div>
                  <h4>Centro de Atención (Opcional)</h4>
                </div>
                <select 
                  class="form-control-paciente"
                  [(ngModel)]="centroAtencionSeleccionado"
                  (change)="onCentroAtencionChange()"
                  [disabled]="!especialidadSeleccionada || isLoadingCentros">
                  <option value="">Todos los centros</option>
                  <option *ngFor="let centro of centrosAtencion" [value]="centro.id">
                    {{ centro.nombre }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingCentros">
                  <i class="fas fa-spinner fa-spin"></i> Cargando centros...
                </div>
              </div>

              <!-- Filtros aplicados -->
              <div class="filtros-aplicados" *ngIf="especialidadSeleccionada">
                <h5>Filtros aplicados:</h5>
                <div class="filter-tags">
                  <span class="filter-tag">
                    <i class="fas fa-stethoscope"></i>
                    {{ especialidadSeleccionada }}
                    <button type="button" (click)="limpiarEspecialidad()">×</button>
                  </span>
                  <span class="filter-tag" *ngIf="staffMedicoSeleccionado">
                    <i class="fas fa-user-md"></i>
                    {{ getStaffMedicoNombre(staffMedicoSeleccionado) }}
                    <button type="button" (click)="limpiarStaffMedico()">×</button>
                  </span>
                  <span class="filter-tag" *ngIf="centroAtencionSeleccionado">
                    <i class="fas fa-hospital"></i>
                    {{ getCentroAtencionNombre(centroAtencionSeleccionado) }}
                    <button type="button" (click)="limpiarCentroAtencion()">×</button>
                  </span>
                  <button type="button" class="btn btn-clear-filters" (click)="limpiarTodosFiltros()">
                    <i class="fas fa-times"></i> Limpiar filtros
                  </button>
                </div>
              </div>

              <!-- Acciones -->
              <div class="filtros-actions">
                <button 
                  type="button" 
                  class="btn btn-paciente-primary" 
                  (click)="cargarTurnosConFiltros()"
                  [disabled]="!especialidadSeleccionada || isLoadingTurnos">
                  <i class="fas fa-search"></i>
                  {{ isLoadingTurnos ? 'Buscando...' : 'Buscar Turnos Disponibles' }}
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
                <h3><i class="fas fa-calendar-alt"></i> Turnos Disponibles</h3>
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
                [events]="turnosDisponibles"
                [hourSegments]="4"
                [dayStartHour]="7"
                [dayEndHour]="20"
                (eventClicked)="onTurnoDisponibleSelected($event)">
              </mwl-calendar-week-view>
            </div>
          </div>
        </div>
      </div>

      <!-- MENSAJE CUANDO NO HAY TURNOS -->
      <div class="row" *ngIf="showCalendar && turnosDisponibles.length === 0">
        <div class="col-12">
          <div class="no-turnos-card">
            <div class="no-turnos-content">
              <i class="fas fa-calendar-times"></i>
              <h4>No hay turnos disponibles</h4>
              <p>No se encontraron turnos disponibles con los filtros seleccionados.</p>
              <p>Intenta cambiar los filtros o seleccionar otra fecha.</p>
              <button class="btn btn-paciente-primary" (click)="limpiarTodosFiltros()">
                <i class="fas fa-filter"></i>
                Cambiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL RESERVAR TURNO -->
      <div *ngIf="showBookingModal" class="modal-overlay" (click)="closeBookingModal()">
        <div class="modal-content paciente-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4><i class="fas fa-calendar-plus"></i> Reservar Turno</h4>
            <button type="button" class="btn-close" (click)="closeBookingModal()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="turno-details">
              <div class="detail-item">
                <strong>Especialidad:</strong> {{ selectedTurnoDisponible?.meta?.especialidad }}
              </div>
              <div class="detail-item">
                <strong>Médico:</strong> {{ selectedTurnoDisponible?.meta?.medico }}
              </div>
              <div class="detail-item">
                <strong>Centro:</strong> {{ selectedTurnoDisponible?.meta?.centro }}
              </div>
              <div class="detail-item">
                <strong>Consultorio:</strong> {{ selectedTurnoDisponible?.meta?.consultorio }}
              </div>
              <div class="detail-item">
                <strong>Fecha:</strong> {{ selectedTurnoDisponible?.start | date: 'EEEE, dd MMMM yyyy' }}
              </div>
              <div class="detail-item">
                <strong>Horario:</strong> {{ selectedTurnoDisponible?.start | date: 'HH:mm' }} - {{ selectedTurnoDisponible?.end | date: 'HH:mm' }}
              </div>
            </div>
            
            <div class="confirmation-text">
              <p><strong>¿Deseas reservar este turno?</strong></p>
              <p>Una vez confirmado, el turno quedará reservado a tu nombre.</p>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-paciente-secondary" 
              (click)="closeBookingModal()">
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-paciente-primary" 
              (click)="confirmarReservaTurno()"
              [disabled]="isBooking">
              <i class="fas fa-check"></i>
              {{ isBooking ? 'Reservando...' : 'Confirmar Reserva' }}
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

    /* FILTROS APLICADOS */
    .filtros-aplicados {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--pacientes-primary);
    }

    .filtros-aplicados h5 {
      margin: 0 0 1rem 0;
      color: #495057;
      font-weight: 600;
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .filter-tag {
      background: var(--pacientes-primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .filter-tag button {
      background: rgba(255,255,255,0.3);
      border: none;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }

    .filter-tag button:hover {
      background: rgba(255,255,255,0.5);
    }

    .btn-clear-filters {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-clear-filters:hover {
      background: #c82333;
    }

    .required {
      color: #dc3545;
      font-weight: bold;
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

    /* ACCIONES */
    .filtros-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
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
      justify-content: space-between;
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
      cursor: pointer;
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

    .confirmation-text {
      margin-top: 1rem;
      padding: 1rem;
      background: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .confirmation-text p {
      margin: 0.5rem 0;
      color: #1565c0;
    }

    .confirmation-text p:first-child {
      font-weight: 600;
      color: #0d47a1;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
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
  isLoadingEspecialidades = false;
  isLoadingStaffMedicos = false;
  isLoadingCentros = false;
  isConfirming = false;

  // Filtros
  especialidadSeleccionada = '';
  staffMedicoSeleccionado: number | null = null;
  centroAtencionSeleccionado: number | null = null;

  // Listas para filtros
  especialidades: Especialidad[] = [];
  staffMedicos: StaffMedico[] = [];
  centrosAtencion: CentroAtencion[] = [];

  // Calendario
  viewDate = new Date();
  showCalendar = false;
  turnosDisponibles: CalendarEvent[] = []; // Para mostrar turnos disponibles para reservar
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  semanas: number = 4; // Número de semanas para generar eventos

  // Modal de reserva
  showBookingModal = false;
  selectedTurnoDisponible: CalendarEvent | null = null;
  isBooking = false;

  // Modal de confirmación (mantener para compatibilidad)
  showConfirmModal = false;
  selectedTurno: CalendarEvent | null = null;

  constructor(
    private turnoService: TurnoService,
    private especialidadService: EspecialidadService,
    private staffMedicoService: StaffMedicoService,
    private centroAtencionService: CentroAtencionService,
    private agendaService: AgendaService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarEspecialidades();
  }

  // Cargar especialidades al inicializar
  cargarEspecialidades() {
    this.isLoadingEspecialidades = true;
    this.especialidadService.all().subscribe({
      next: (dataPackage: DataPackage<Especialidad[]>) => {
        this.especialidades = dataPackage.data || [];
        this.isLoadingEspecialidades = false;
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
        this.isLoadingEspecialidades = false;
      }
    });
  }

  // Método llamado cuando cambia la especialidad
  onEspecialidadChange() {
    // Limpiar filtros dependientes
    this.staffMedicoSeleccionado = null;
    this.centroAtencionSeleccionado = null;
    this.staffMedicos = [];
    this.centrosAtencion = [];

    if (this.especialidadSeleccionada) {
      // Cargar staff médicos y centros para la especialidad seleccionada
      this.cargarStaffMedicosPorEspecialidad();
      this.cargarCentrosAtencion();
      // Cargar turnos con la especialidad seleccionada
      this.cargarTurnosConFiltros();
    } else {
      // Si no hay especialidad, ocultar calendario
      this.showCalendar = false;
      this.turnosDisponibles = [];
    }
  }

  // Cargar staff médicos filtrados por especialidad
  cargarStaffMedicosPorEspecialidad() {
    if (!this.especialidadSeleccionada) return;
    
    this.isLoadingStaffMedicos = true;
    this.staffMedicoService.all().subscribe({
      next: (dataPackage: DataPackage<StaffMedico[]>) => {
        // Filtrar staff médicos que tengan la especialidad seleccionada
        this.staffMedicos = (dataPackage.data || []).filter(staff => 
          staff.especialidad?.nombre === this.especialidadSeleccionada
        );
        this.isLoadingStaffMedicos = false;
      },
      error: (error) => {
        console.error('Error cargando staff médicos:', error);
        this.isLoadingStaffMedicos = false;
      }
    });
  }

  // Cargar centros de atención
  cargarCentrosAtencion() {
    this.isLoadingCentros = true;
    this.centroAtencionService.all().subscribe({
      next: (dataPackage: any) => {
        this.centrosAtencion = dataPackage.data || [];
        this.isLoadingCentros = false;
      },
      error: (error) => {
        console.error('Error cargando centros de atención:', error);
        this.isLoadingCentros = false;
      }
    });
  }

  // Método llamado cuando cambia el staff médico
  onStaffMedicoChange() {
    if (this.especialidadSeleccionada && this.events.length > 0) {
      // Solo aplicar filtros si ya tenemos eventos cargados
      this.aplicarFiltrosPaciente();
    }
  }

  // Método llamado cuando cambia el centro de atención
  onCentroAtencionChange() {
    if (this.especialidadSeleccionada && this.events.length > 0) {
      // Solo aplicar filtros si ya tenemos eventos cargados
      this.aplicarFiltrosPaciente();
    }
  } 
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  semanas: number = 4;

  // Modal de reserva
  showBookingModal = false;
  selectedTurnoDisponible: CalendarEvent | null = null;
  isBooking = false;

  constructor(
    private turnoService: TurnoService,
    private especialidadService: EspecialidadService,
    private staffMedicoService: StaffMedicoService,
    private centroAtencionService: CentroAtencionService,
    private agendaService: AgendaService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEspecialidades();
  }

  // Cargar especialidades al inicializar
  cargarEspecialidades() {
    this.isLoadingEspecialidades = true;
    this.especialidadService.all().subscribe({
      next: (dataPackage: DataPackage<Especialidad[]>) => {
        this.especialidades = dataPackage.data || [];
        this.isLoadingEspecialidades = false;
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
        this.isLoadingEspecialidades = false;
      }
    });
  }

  // Método llamado cuando cambia la especialidad
  onEspecialidadChange() {
    // Limpiar filtros dependientes
    this.staffMedicoSeleccionado = null;
    this.centroAtencionSeleccionado = null;
    this.staffMedicos = [];
    this.centrosAtencion = [];

    if (this.especialidadSeleccionada) {
      // Cargar staff médicos y centros para la especialidad seleccionada
      this.cargarStaffMedicosPorEspecialidad();
      this.cargarCentrosAtencion();
      // Cargar turnos con la especialidad seleccionada
      this.cargarTurnosConFiltros();
    } else {
      // Si no hay especialidad, ocultar calendario
      this.showCalendar = false;
      this.turnosDisponibles = [];
    }
  }

  // Cargar staff médicos filtrados por especialidad
  cargarStaffMedicosPorEspecialidad() {
    if (!this.especialidadSeleccionada) return;
    
    this.isLoadingStaffMedicos = true;
    this.staffMedicoService.all().subscribe({
      next: (dataPackage: DataPackage<StaffMedico[]>) => {
        // Filtrar staff médicos que tengan la especialidad seleccionada
        this.staffMedicos = (dataPackage.data || []).filter(staff => 
          staff.especialidad?.nombre === this.especialidadSeleccionada
        );
        this.isLoadingStaffMedicos = false;
      },
      error: (error) => {
        console.error('Error cargando staff médicos:', error);
        this.isLoadingStaffMedicos = false;
      }
    });
  }

  // Cargar centros de atención
  cargarCentrosAtencion() {
    this.isLoadingCentros = true;
    this.centroAtencionService.all().subscribe({
      next: (dataPackage: any) => {
        this.centrosAtencion = dataPackage.data || [];
        this.isLoadingCentros = false;
      },
      error: (error) => {
        console.error('Error cargando centros de atención:', error);
        this.isLoadingCentros = false;
      }
    });
  }

  // Método llamado cuando cambia el staff médico
  onStaffMedicoChange() {
    if (this.especialidadSeleccionada && this.events.length > 0) {
      // Solo aplicar filtros si ya tenemos eventos cargados
      this.aplicarFiltrosPaciente();
    }
  }

  // Método llamado cuando cambia el centro de atención
  onCentroAtencionChange() {
    if (this.especialidadSeleccionada && this.events.length > 0) {
      // Solo aplicar filtros si ya tenemos eventos cargados
      this.aplicarFiltrosPaciente();
    }
  }

  // Cargar turnos con filtros aplicados
  cargarTurnosConFiltros() {
    if (!this.especialidadSeleccionada) {
      this.showCalendar = false;
      return;
    }

    this.isLoadingTurnos = true;
    
    // Usar el servicio de agenda para obtener turnos disponibles reales
    this.cargarTurnosDisponiblesDesdeBackend();
  }

  // Cargar turnos disponibles desde el backend (como admin pero filtrados)
  cargarTurnosDisponiblesDesdeBackend() {
    const semanas = this.semanas;
    this.agendaService.obtenerTodosLosEventos(semanas).subscribe({
      next: (eventosBackend) => {
        // Transformar los eventos del backend en objetos CalendarEvent
        this.events = this.mapEsquemasToEvents(eventosBackend);
        // Aplicar filtros del paciente
        this.aplicarFiltrosPaciente();
        this.showCalendar = true;
        this.isLoadingTurnos = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error al cargar eventos disponibles:', err);
        this.isLoadingTurnos = false;
        // En caso de error, mostrar calendario vacío
        this.turnosDisponibles = [];
        this.showCalendar = true;
      }
    });
  }

  // Mapear eventos del backend a CalendarEvent (similar al admin)
  private mapEsquemasToEvents(eventosBackend: any[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    eventosBackend.forEach(evento => {
      // Validar que el evento tenga los datos necesarios
      if (!evento.fecha || !evento.horaInicio || !evento.horaFin) {
        console.warn('Evento con datos incompletos:', evento);
        return;
      }

      const start = new Date(`${evento.fecha}T${evento.horaInicio}`);
      const end = new Date(`${evento.fecha}T${evento.horaFin}`);

      // Validar que las fechas sean válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Evento con fechas inválidas:', evento);
        return;
      }

      // Solo mostrar slots disponibles (no ocupados)
      if (!evento.ocupado && evento.esSlot) {
        events.push({
          start,
          end,
          title: `${evento.especialidadStaffMedico || 'Disponible'} - Reservar`,
          color: { 
            primary: '#28a745', // Verde para disponible
            secondary: '#d4edda' 
          },
          meta: {
            id: evento.id,
            staffMedicoId: evento.staffMedicoId,
            staffMedicoNombre: evento.staffMedicoNombre,
            staffMedicoApellido: evento.staffMedicoApellido,
            especialidad: evento.especialidadStaffMedico,
            medico: `${evento.staffMedicoNombre} ${evento.staffMedicoApellido}`,
            centro: evento.nombreCentro,
            consultorio: evento.consultorioNombre,
            centroId: evento.centroId,
            consultorioId: evento.consultorioId,
            esSlot: evento.esSlot,
            ocupado: evento.ocupado,
            disponible: true
          }
        });
      }
    });

    return events;
  }

  // Aplicar filtros específicos del paciente
  aplicarFiltrosPaciente() {
    this.turnosDisponibles = this.events.filter(event => {
      // Filtro por especialidad (obligatorio)
      if (this.especialidadSeleccionada && 
          event.meta?.especialidad !== this.especialidadSeleccionada) {
        return false;
      }

      // Filtro por staff médico (opcional)
      if (this.staffMedicoSeleccionado && 
          event.meta?.staffMedicoId !== this.staffMedicoSeleccionado) {
        return false;
      }

      // Filtro por centro de atención (opcional)
      if (this.centroAtencionSeleccionado && 
          event.meta?.centroId !== this.centroAtencionSeleccionado) {
        return false;
      }

      return true;
    });
  }

  // Métodos de limpieza de filtros
  limpiarEspecialidad() {
    this.especialidadSeleccionada = '';
    this.onEspecialidadChange();
  }

  limpiarStaffMedico() {
    this.staffMedicoSeleccionado = null;
    this.onStaffMedicoChange();
  }

  limpiarCentroAtencion() {
    this.centroAtencionSeleccionado = null;
    this.onCentroAtencionChange();
  }

  limpiarTodosFiltros() {
    this.especialidadSeleccionada = '';
    this.staffMedicoSeleccionado = null;
    this.centroAtencionSeleccionado = null;
    this.staffMedicos = [];
    this.centrosAtencion = [];
    this.showCalendar = false;
    this.turnosDisponibles = [];
  }

  // Métodos auxiliares para obtener nombres
  getStaffMedicoNombre(id: number | null): string {
    if (!id) return 'Cualquier médico';
    const staff = this.staffMedicos.find(s => s.id === id);
    return staff ? `${staff.medico?.nombre} ${staff.medico?.apellido}` : 'Médico no encontrado';
  }

  getCentroAtencionNombre(id: number | null): string {
    if (!id) return 'Cualquier centro';
    const centro = this.centrosAtencion.find(c => c.id === id);
    return centro ? centro.nombre : 'Centro no encontrado';
  }

  irASolicitarTurno() {
    this.router.navigate(['/paciente-solicitar-turno']);
  }

  // Navegación del calendario
  previousWeek() {
    const newDate = new Date(this.viewDate);
    newDate.setDate(newDate.getDate() - 7);
    this.viewDate = newDate;
    // Recargar turnos para la nueva semana
    if (this.especialidadSeleccionada) {
      this.cargarTurnosConFiltros();
    }
  }

  nextWeek() {
    const newDate = new Date(this.viewDate);
    newDate.setDate(newDate.getDate() + 7);
    this.viewDate = newDate;
    // Recargar turnos para la nueva semana
    if (this.especialidadSeleccionada) {
      this.cargarTurnosConFiltros();
    }
  }

  // Método para manejar la selección de turno disponible para reservar
  onTurnoDisponibleSelected(event: any) {
    const turnoEvent = event.event;
    
    // Solo permitir reserva si es un slot disponible
    if (turnoEvent.meta?.disponible && !turnoEvent.meta?.ocupado) {
      this.selectedTurnoDisponible = turnoEvent;
      this.showBookingModal = true;
    }
  }

  // Confirmar reserva de turno
  confirmarReservaTurno() {
    if (!this.selectedTurnoDisponible) {
      return;
    }

    // Obtener ID del paciente
    let pacienteId = localStorage.getItem('pacienteId');
    
    if (!pacienteId) {
      const patientDataStr = localStorage.getItem('patientData');
      if (patientDataStr) {
        try {
          const patientData = JSON.parse(patientDataStr);
          pacienteId = patientData.id?.toString();
          if (pacienteId) {
            localStorage.setItem('pacienteId', pacienteId);
          }
        } catch (e) {
          console.error('Error parsing patient data:', e);
        }
      }
    }

    if (!pacienteId) {
      alert('Error: No se pudo identificar al paciente. Por favor, inicie sesión nuevamente.');
      return;
    }

    this.isBooking = true;

    // Crear el DTO del turno siguiendo el mismo patrón que el admin
    const turnoDTO = {
      id: this.selectedTurnoDisponible.meta?.id,
      fecha: this.selectedTurnoDisponible.start.toISOString().substring(0, 10),
      horaInicio: this.selectedTurnoDisponible.start.toISOString().substring(11, 19),
      horaFin: this.selectedTurnoDisponible.end ? this.selectedTurnoDisponible.end.toISOString().substring(11, 19) : '',
      pacienteId: parseInt(pacienteId),
      staffMedicoId: this.selectedTurnoDisponible.meta?.staffMedicoId,
      staffMedicoNombre: this.selectedTurnoDisponible.meta?.staffMedicoNombre,
      staffMedicoApellido: this.selectedTurnoDisponible.meta?.staffMedicoApellido,
      especialidadStaffMedico: this.selectedTurnoDisponible.meta?.especialidad,
      consultorioId: this.selectedTurnoDisponible.meta?.consultorioId,
      consultorioNombre: this.selectedTurnoDisponible.meta?.consultorio,
      centroId: this.selectedTurnoDisponible.meta?.centroId,
      nombreCentro: this.selectedTurnoDisponible.meta?.centro,
      estado: 'PENDIENTE'
    };

    // Usar el mismo endpoint que el admin para asignar turnos
    this.http.post(`/rest/turno/asignar`, turnoDTO).subscribe({
      next: () => {
        alert('¡Turno reservado exitosamente! Se ha confirmado tu cita médica.');
        this.closeBookingModal();
        // Recargar los turnos para actualizar la disponibilidad
        this.cargarTurnosConFiltros();
      },
      error: (err: any) => {
        console.error('Error al reservar el turno:', err);
        alert('No se pudo reservar el turno. Por favor, intenta nuevamente.');
        this.isBooking = false;
      }
    });
  }

  // Cerrar modal de reserva
  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedTurnoDisponible = null;
    this.isBooking = false;
  }
}
