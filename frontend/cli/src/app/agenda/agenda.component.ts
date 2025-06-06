import { Component, ChangeDetectionStrategy, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CalendarEvent, CalendarEventTitleFormatter, CalendarDateFormatter } from 'angular-calendar';
import { AgendaService } from './agenda.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarModule } from 'angular-calendar';
import { PacienteService } from '../pacientes/paciente.service'; // Importa el servicio de pacientes
import { HttpClient } from '@angular/common/http'; // Importa HttpClient


@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CalendarModule,
  ],
  providers: [CalendarEventTitleFormatter, CalendarDateFormatter],
  template: `
    <div class="container mt-4">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="banner-agenda">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="header-text">
              <h1>Agenda de Turnos</h1>
              <p>Gestione y visualice todos los turnos médicos</p>
            </div>
          </div>
        </div>

        <!-- BODY DEL CARD -->
        <div class="card-body">
          <!-- Formulario de búsqueda modernizado -->
          <div class="search-section">
            <div class="search-card">
              <div class="search-header">
                <span class="search-icon">🔍</span>
                <h3>Filtros de Búsqueda</h3>
              </div>
              <form class="search-form">
                <div class="search-row">
                  <div class="search-field">
                    <label class="search-label">
                      <span class="label-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">🎯</span>
                      Filtrar por
                    </label>
                    <select class="form-control-modern" [(ngModel)]="filterType" name="filterType">
                      <option value="staffMedico">Staff Médico</option>
                      <option value="centroAtencion">Centro de Atención</option>
                      <option value="consultorio">Consultorio</option>
                      <option value="especialidad">Especialidad</option>
                    </select>
                  </div>
                  
                  <div class="search-field">
                    <label class="search-label">
                      <span class="label-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">✍️</span>
                      Valor de búsqueda
                    </label> 
                    <input
                      type="text"
                      class="form-control-modern"
                      [(ngModel)]="filterValue"
                      name="filterValue"
                      placeholder="Ingrese el valor a buscar"
                      list="filterOptions"
                    />
                    <datalist id="filterOptions">
                      <option *ngFor="let option of getFilterOptions()" [value]="option"></option>
                    </datalist>
                  </div>
                </div>
                
                <div class="search-actions">
                  <button type="button" class="btn btn-modern btn-search" (click)="applyFilter()">
                    🔍 Buscar
                  </button>
                  <button type="button" class="btn btn-modern btn-clear" (click)="clearFilter()">
                    🧹 Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Navegación entre semanas modernizada -->
          <div class="week-navigation">
            <button type="button" class="btn btn-modern btn-nav" (click)="changeWeek(-1)">
              ← Semana anterior
            </button>
            <div class="current-week">
              <span class="week-icon">📅</span>
              <span class="week-text">{{ viewDate | date: 'MMMM yyyy' }}</span>
            </div>
            <button type="button" class="btn btn-modern btn-nav" (click)="changeWeek(1)">
              Semana siguiente →
            </button>
          </div>

          <!-- Vista del calendario modernizada -->
          <div class="calendar-container">
            <mwl-calendar-week-view
              [viewDate]="viewDate"
              [events]="filteredEvents"
              [hourSegments]="6"
              [dayStartHour]="6"
              [dayEndHour]="24"
              (eventClicked)="handleEvent($event)">
            </mwl-calendar-week-view>
          </div>

          <!-- Modal modernizado para detalles del evento -->
          <div *ngIf="selectedEvent" class="modern-modal-overlay" (click)="closeModal()">
            <div class="modern-modal" (click)="$event.stopPropagation()">
              <div class="m
              header-modern">
                <div class="header-content">
                  <div class="header-icon">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="header-text">
                    <h3>Detalle del Turno</h3>
                    <p>Información completa del turno médico</p>
                  </div>
                </div>
                <button type="button" class="modal-close-btn" (click)="closeModal()">×</button>
              </div>
              
              <div class="modal-body-modern">
                <div class="info-grid-modal">
                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">📋</span>
                      Título
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.title }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);">👨‍⚕️</span>
                      Médico
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.meta?.staffMedicoNombre }} {{ selectedEvent.meta?.staffMedicoApellido }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);">🏥</span>
                      Especialidad
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.meta?.especialidadStaffMedico }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);">🚪</span>
                      Consultorio
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.meta?.consultorioNombre }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">🏢</span>
                      Centro de Atención
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.meta?.centroAtencionNombre }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);">🕐</span>
                      Hora Inicio
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.start | date: 'yyyy-MM-dd HH:mm' }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">🕕</span>
                      Hora Fin
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.end | date: 'yyyy-MM-dd HH:mm' }}</div>
                  </div>
                </div>

                <!-- Sección de asignación de paciente -->
                <div class="patient-assignment">
                  <div class="assignment-header">
                    <span class="assignment-icon">👥</span>
                    <h4>Asignar Paciente</h4>
                  </div>
                  <div class="assignment-field">
                    <label class="assignment-label">
                      <span class="label-icon" style="background: linear-gradient(135deg, #e83e8c 0%, #e91e63 100%);">👤</span>
                      Seleccionar Paciente
                    </label>
                    <select
                      class="form-control-modern"
                      [(ngModel)]="pacienteId"
                    >
                      <option value="">Seleccione un paciente...</option>
                      <option *ngFor="let paciente of pacientes" [value]="paciente.id">
                        {{ paciente.nombre }} {{ paciente.apellido }} (ID: {{ paciente.id }})
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="modal-footer-modern">
                <button type="button" class="btn btn-modern btn-assign" (click)="asignarTurno()">
                  💾 Asignar Turno
                </button>
                <button type="button" class="btn btn-modern btn-cancel" (click)="closeModal()">
                  ❌ Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Default,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  styles: [`
    /* Contenedor principal */
    .container {
      max-width: 95%;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    /* Card principal */
    .modern-card {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      border: none;
      background: white;
      transition: all 0.3s ease;
    }
    
    .modern-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    
    /* Header con gradiente calendario */
    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="calendar" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23calendar)"/></svg>');
      opacity: 0.3;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }
    
    .header-icon {
      width: 70px;
      height: 70px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.3);
    }
    
    .header-icon i {
      font-size: 2rem;
      color: white;
    }
    
    .header-text h1 {
      color: white;
      margin: 0;
      font-size: 2.2rem;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
      font-weight: 300;
    }
    
    /* Body del card */
    .card-body {
      padding: 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }
    
    /* Sección de búsqueda modernizada */
    .search-section {
      margin-bottom: 2rem;
    }
    
    .search-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      border: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .search-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    }
    
    .search-icon {
      font-size: 1.5rem;
    }
    
    .search-header h3 {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
      font-size: 1.3rem;
    }
    
    .search-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .search-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    
    .search-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .search-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.95rem;
    }
    
    .label-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      color: white;
      font-weight: bold;
    }
    
    .form-control-modern {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: white;
    }
    
    .form-control-modern:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      background: #fafbff;
    }
    
    .search-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    
    .btn-modern {
      border-radius: 25px;
      padding: 0.7rem 1.5rem;
      font-weight: 600;
      border: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    
    .btn-search {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }
    
    .btn-clear {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    /* Navegación de semanas */
    .week-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 15px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
    }
    
    .btn-nav {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .current-week {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 1.1rem;
    }
    
    .week-icon {
      font-size: 1.3rem;
    }
    
    /* Contenedor del calendario */
    .calendar-container {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      margin-bottom: 2rem;
    }
    
    /* Estilos para angular-calendar */
    .mwl-calendar-week-view {
      border: 1px solid #e9ecef;
      border-radius: 12px;
      background: #fff;
      padding: 1rem;
      height: 600px;
      overflow-y: auto;
    }
    
    .mwl-calendar-week-view .cal-day-column {
      border-right: 1px solid #e9ecef;
    }
    
    .mwl-calendar-week-view .cal-hour-segment {
      background-color: #fafbff;
      border-bottom: 1px solid #f1f3f4;
    }
    
    .mwl-calendar-week-view .cal-event {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: none;
      font-weight: 500;
    }
    
    .mwl-calendar-week-view .cal-day-headers .cal-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 2px solid #667eea;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .past-day {
      background-color: rgba(255, 204, 204, 0.3) !important;
    }
    
    /* Modal modernizado */
    .modern-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      backdrop-filter: blur(5px);
      animation: fadeIn 0.3s ease;
    }
    
    .modern-modal {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    }
    
    
    .modal-close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 1.5rem;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .modal-close-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: scale(1.1);
    }
    
    .modal-body-modern {
      padding: 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }
    
    .info-grid-modal {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .info-item-modal {
      background: white;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      border-left: 4px solid #667eea;
    }
    
    .info-label-modal {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }
    
    .info-icon-modal {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: white;
      font-weight: bold;
    }
    
    .info-value-modal {
      font-size: 1rem;
      color: #495057;
      font-weight: 500;
    }
    
    /* Sección de asignación de paciente */
    .patient-assignment {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      border: 2px solid rgba(102, 126, 234, 0.1);
    }
    
    .assignment-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    }
    
    .assignment-icon {
      font-size: 1.3rem;
    }
    
    .assignment-header h4 {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
    }
    
    .assignment-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .assignment-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.95rem;
    }
    
    .modal-footer-modern {
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 0 0 20px 20px;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    
    .btn-assign {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    /* Animaciones */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(30px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .card-header {
        padding: 1.5rem;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .header-text h1 {
        font-size: 1.8rem;
      }
      
      .card-body {
        padding: 1rem;
      }
      
      .search-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .search-actions {
        justify-content: stretch;
      }
      
      .btn-modern {
        flex: 1;
        justify-content: center;
      }
      
      .week-navigation {
        flex-direction: column;
        gap: 1rem;
      }
      
      .info-grid-modal {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .modern-modal {
        width: 95%;
        margin: 1rem;
      }
      
      .modal-footer-modern {
        flex-direction: column;
      }
      
      .modal-footer-modern .btn-modern {
        width: 100%;
        justify-content: center;
      }
      
      .mwl-calendar-week-view {
        height: 400px;
      }
    }
  `]
})
export class AgendaComponent implements OnInit {
  viewDate: Date = new Date(); // Fecha actual para el calendario

  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  semanas: number = 4; // Número de semanas para generar eventos
  selectedEvent: CalendarEvent | null = null; // Evento seleccionado
  filterType: string = 'staffMedico';
  filterValue: string = '';
  pacientes: { id: number; nombre: string; apellido: string }[] = []; // Lista de pacientes
  pacienteId: number | null = null; // Variable para almacenar el ID del paciente seleccionado

  constructor(
    private agendaService: AgendaService,
    private pacienteService: PacienteService, // Inyecta el servicio de pacientes
    private http: HttpClient, // Inyecta HttpClient
    private cdr: ChangeDetectorRef,
    private router: Router // Inyecta el Router
  ) { }

  ngOnInit() {
    this.cargarTodosLosEventos();
    this.cargarPacientes(); // Carga la lista de pacientes
  }

  // Método para cargar eventos desde el backend
  cargarTodosLosEventos(): void {
    const semanas = this.semanas; // Número de semanas para generar los eventos

    this.agendaService.obtenerTodosLosEventos(semanas).subscribe({
      next: (eventosBackend) => {
        // console.log('Eventos recibidos desde el backend:', eventosBackend);

        // Transformar los eventos del backend en objetos CalendarEvent
        this.events = this.mapEsquemasToEvents(eventosBackend);
        this.filteredEvents = this.events; // Inicialmente, los eventos filtrados son todos los eventos

        // console.log('Eventos filtrados asignados al calendario:', this.filteredEvents);
        this.cdr.detectChanges(); // Forzar la detección de cambios
      },
      error: (err: unknown) => {
        console.error('Error al cargar todos los eventos:', err);
        alert('No se pudieron cargar los eventos. Intente nuevamente.');
      }
    });
  }

  cargarPacientes(): void {
    this.pacienteService.all().subscribe({
      next: (dataPackage) => {
        this.pacientes = dataPackage.data; // Asigna los pacientes recibidos
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
        alert('No se pudieron cargar los pacientes. Intente nuevamente.');
      },
    });
  }

  handleEvent(eventObj: any) {
    this.selectedEvent = eventObj.event; // Asigna el evento seleccionado
    console.log('Evento seleccionado:', this.selectedEvent);
  }
  closeModal() {
    this.selectedEvent = null; // Limpia el evento seleccionado
  }

  applyFilter() {
    if (!this.filterValue) {
      this.filteredEvents = this.events;
      return;
    }
    this.filteredEvents = this.events.filter(event => {
      const valorFiltro = this.filterValue.toLowerCase();
      switch (this.filterType) {
        case 'staffMedico':
            return `${event.meta?.staffMedicoNombre} ${event.meta?.staffMedicoApellido}`.toLowerCase().includes(valorFiltro);
        case 'centroAtencion':
          return event.meta?.centroAtencionNombre?.toLowerCase().includes(valorFiltro);
        case 'consultorio':
          return event.meta?.consultorioNombre?.toLowerCase().includes(valorFiltro);
        case 'especialidad':
          return event.meta?.especialidadStaffMedico?.toLowerCase().includes(valorFiltro);
        default:
          return true;
      }
    });
  }

  clearFilter() {
    this.filterValue = '';
    this.filteredEvents = this.events;
  }

  getFilterOptions(): string[] {
    switch (this.filterType) {
      case 'staffMedico':
      return [...new Set(this.events.map(event => `${event.meta?.staffMedicoNombre} ${event.meta?.staffMedicoApellido}`).filter(Boolean))];
      case 'centroAtencion':
      return [...new Set(this.events.map(event => event.meta?.centroAtencionNombre).filter(Boolean))];
      case 'consultorio':
      return [...new Set(this.events.map(event => event.meta?.consultorioNombre).filter(Boolean))];
      case 'especialidad':
      return [...new Set(this.events.map(event => event.meta?.especialidadStaffMedico).filter(Boolean))];
      default:
      return [];
    }
  }

  private mapEsquemasToEvents(eventosBackend: any[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    // console.log('Eventos recibidos desde el backend:', eventosBackend);

    eventosBackend.forEach(evento => {
      // Validar que el evento tenga los datos necesarios
      if (!evento.fecha || !evento.horaInicio || !evento.horaFin) {
        console.warn('Evento con datos incompletos:', evento);
        return; // Ignorar eventos incompletos
      }

      const start = new Date(`${evento.fecha}T${evento.horaInicio}`);
      const end = new Date(`${evento.fecha}T${evento.horaFin}`);

      // Validar que las fechas sean válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Evento con fechas inválidas:', evento);
        return; // Ignorar eventos con fechas inválidas
      }

      // Crear el evento y agregarlo a la lista
      events.push({
        start,
        end,
        title: evento.titulo || 'Turno',
        color: { 
          primary: evento.backgroundColor || '#1e90ff', 
          secondary: evento.backgroundColor || '#D1E8FF' 
        },
        meta: {
          id: evento.id, 
          staffMedicoNombre: evento.staffMedicoNombre,
          staffMedicoApellido: evento.staffMedicoApellido,
          especialidadStaffMedico: evento.especialidadStaffMedico,
          centroId: evento.centroId,
          staffMedicoId: evento.staffMedicoId,
          consultorioId: evento.consultorioId,
          consultorioNombre: evento.consultorioNombre,
          centroAtencionNombre: evento.nombreCentro,
          esSlot: evento.esSlot,
          ocupado: evento.ocupado
        }
      });
    });

    // console.log('Eventos generados:', events); // Depuración: Verifica cuántos eventos se generan
    return events;
  }

  changeWeek(direction: number): void {
    const currentDate = this.viewDate;
    this.viewDate = new Date(currentDate.setDate(currentDate.getDate() + direction * 7));
    // console.log('Nueva fecha de vista:', this.viewDate);
  }
  
  asignarTurno(): void {
    if (!this.pacienteId) {
      alert('Por favor, seleccione un paciente.');
      return;
    }

    const turnoDTO = {
      id: this.selectedEvent?.meta?.id, // ID dinámico del turno
     fecha: this.selectedEvent?.start.toISOString().substring(0, 10), // Solo la fecha
    horaInicio: this.selectedEvent?.start.toISOString().substring(11, 19), // Solo la hora
    horaFin: this.selectedEvent?.end ? this.selectedEvent.end.toISOString().substring(11, 19) : '', // Solo la hora
      pacienteId: this.pacienteId, // ID del paciente seleccionado
      staffMedicoId: this.selectedEvent?.meta?.staffMedicoId,
      staffMedicoNombre: this.selectedEvent?.meta?.staffMedicoNombre,
      staffMedicoApellido: this.selectedEvent?.meta.staffMedicoApellido, // Agregar el apellido del médico
      especialidadStaffMedico: this.selectedEvent?.meta?.especialidadStaffMedico,
    
      consultorioId: this.selectedEvent?.meta?.consultorioId,
      consultorioNombre: this.selectedEvent?.meta?.consultorioNombre,
      centroId: this.selectedEvent?.meta?.centroId,
      nombreCentro: this.selectedEvent?.meta?.centroAtencionNombre,
      estado: 'PENDIENTE', // Estado inicial del turno
    };

    this.http.post(`/rest/turno/asignar`, turnoDTO).subscribe({
      next: () => {
        alert('Turno asignado correctamente.');
        this.closeModal(); // Cerrar el modal después de asignar el turno
      },
      error: (err: any) => {
        console.error('Error al asignar el turno:', err);
        alert('No se pudo asignar el turno. Intente nuevamente.');
      },
    });
  }
}