import { Component, ChangeDetectionStrategy, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CalendarEvent, CalendarEventTitleFormatter, CalendarDateFormatter } from 'angular-calendar';
import { AgendaService } from './agenda.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarModule } from 'angular-calendar';


@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    FormsModule,
    RouterModule,
    CalendarModule,
  ],
  providers: [CalendarEventTitleFormatter, CalendarDateFormatter],
  template: `
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4">
          <div class="d-flex align-items-center">
            <i class="fa fa-calendar me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Agenda de Turnos</h2>
          </div>
        </div>
        <div class="card-body">
          <!-- Formulario de búsqueda -->
          <form class="mb-3 d-flex align-items-center bg-light p-3 rounded shadow-sm">
            <div class="me-3">
              <label for="filterType" class="form-label fw-bold">Filtrar por:</label>
              <select id="filterType" class="form-select" [(ngModel)]="filterType" name="filterType">
                <option value="staffMedico">Staff Médico</option>
                <option value="centroAtencion">Centro de Atención</option>
                <option value="consultorio">Consultorio</option>
              </select>
            </div>
            <div class="me-3">
              <label for="filterValue" class="form-label fw-bold">Valor:</label>
              <input
                id="filterValue"
                type="text"
                class="form-control"
                [(ngModel)]="filterValue"
                name="filterValue"
                placeholder="Ingrese el valor a buscar"
                list="filterOptions"
              />
              
              <datalist id="filterOptions">
                <option *ngFor="let option of getFilterOptions()" [value]="option"></option>
              </datalist>
            </div>
            <button type="button" class="btn btn-primary" (click)="applyFilter()">Buscar</button>
            <button type="button" class="btn btn-secondary ms-2" (click)="clearFilter()">Limpiar</button>
          </form>

          <!-- Navegación entre semanas -->
          <div class="d-flex justify-content-between mb-3">
            <button type="button" class="btn btn-secondary" (click)="changeWeek(-1)">Semana anterior</button>
            <button type="button" class="btn btn-secondary" (click)="changeWeek(1)">Semana siguiente</button>
          </div>

          <!-- Vista del calendario semanal -->
          <mwl-calendar-week-view
            [viewDate]="viewDate"
            [events]="filteredEvents"
            [hourSegments]="6"
            [dayStartHour]="6"
            [dayEndHour]="24"
            (eventClicked)="handleEvent($event)">

          </mwl-calendar-week-view>

          <!-- Modal para mostrar detalles del evento -->
          <div *ngIf="selectedEvent" class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0, 0, 0, 0.5);">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Detalle del Turno</h5>
                  <button type="button" class="btn-close" (click)="closeModal()" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p><strong>Título:</strong> {{ selectedEvent.title }}</p>
                  <p><strong>Médico:</strong> {{ selectedEvent.meta?.staffMedicoNombre }}</p>
                  <p><strong>Consultorio:</strong> {{ selectedEvent.meta?.consultorioNombre }}</p>
                  <p><strong>Centro de Atención:</strong> {{ selectedEvent.meta?.centroAtencionNombre }}</p>
                  <p><strong>Hora Inicio:</strong> {{ selectedEvent.start | date: 'yyyy-MM-dd HH:mm' }}</p>
                  <p><strong>Hora Fin:</strong> {{ selectedEvent.end | date: 'yyyy-MM-dd HH:mm' }}</p>

                  <!-- Campo para ingresar el ID del paciente -->
                  <div class="mt-3">
                    <label for="pacienteId" class="form-label"><strong>Asignar Paciente:</strong></label>
                    <input
                      id="pacienteId"
                      type="text"
                      class="form-control"
                      [(ngModel)]="pacienteId"
                      placeholder="Ingrese el ID del paciente"
                    />
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-success" (click)="asignarTurno()">Asignar Turno</button>
                  <button type="button" class="btn btn-secondary" (click)="closeModal()">Cerrar</button>
                </div>
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
  .container {
    max-width: 100%; /* Reduce el ancho del contenedor */
    margin: 0 auto; /* Centra el contenido */
    padding: 1rem;
  }
  .card {
    border-radius: 1.15rem;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra más suave */
  }
  .card-header {
    border-top-left-radius: 1rem !important;
    border-top-right-radius: 1rem !important;
    background: linear-gradient(90deg, #007bff, #0056b3); /* Degradado en el encabezado */
    color: white;
  }
  .card-body {
    background-color: #f8f9fa; /* Fondo claro para el cuerpo */
  }

  /* Estilos básicos para angular-calendar */
  .mwl-calendar-week-view {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    background: #fff;
    margin-bottom: 2rem;
    padding: 1rem;
    height: 500px; /* Ajusta la altura del calendario */
    overflow-y: auto; /* Permite desplazamiento si el contenido excede la altura */
  }
  .mwl-calendar-week-view .cal-day-column {
    border-right: 1px solid #dee2e6; /* Líneas divisorias más visibles */
  }
  .mwl-calendar-week-view .cal-hour-segment {
    background-color: #f8f9fa; /* Fondo claro para las horas */
  }
  .mwl-calendar-week-view .cal-event {
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Sombra para los eventos */
  }

  .past-day {
  background-color: #ffcccc !important; /* Fondo rojo claro */
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
  pacienteId: string = ''; // Variable para almacenar el ID del paciente

  constructor(
    private agendaService: AgendaService,
    private cdr: ChangeDetectorRef,
    private router: Router // Inyecta el Router
  ) { }

  ngOnInit() {
    this.cargarTodosLosEventos();
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
      error: (err) => {
        console.error('Error al cargar todos los eventos:', err);
        alert('No se pudieron cargar los eventos. Intente nuevamente.');
      }
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
          return event.meta?.staffMedicoNombre?.toLowerCase().includes(valorFiltro);
        case 'centroAtencion':
          return event.meta?.centroAtencionNombre?.toLowerCase().includes(valorFiltro);
        case 'consultorio':
          return event.meta?.consultorioNombre?.toLowerCase().includes(valorFiltro);
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
        return [...new Set(this.events.map(event => event.meta?.staffMedicoNombre).filter(Boolean))];
      case 'centroAtencion':
        return [...new Set(this.events.map(event => event.meta?.centroAtencionNombre).filter(Boolean))];
      case 'consultorio':
        return [...new Set(this.events.map(event => event.meta?.consultorioNombre).filter(Boolean))];
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
        color: { primary: '#1e90ff', secondary: '#D1E8FF' },
        meta: {
          id: evento.id, 
          staffMedicoNombre: evento.staffMedicoNombre,
          consultorioNombre: evento.consultorioNombre,
          centroAtencionNombre: evento.nombreCentro
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
      alert('Por favor, ingrese el ID del paciente.');
      return;
    }

    const turnoId = this.selectedEvent?.meta?.id; // Obtener el ID del turno
    if (!turnoId) {
      alert('No se puede asignar el turno porque no hay un ID válido.');
      return;
    }

    this.agendaService.asignarTurno(turnoId, +this.pacienteId).subscribe({
      next: () => {
        alert('Turno asignado correctamente.');
        this.closeModal(); // Cerrar el modal después de asignar el turno
      },
      error: (err) => {
        console.error('Error al asignar el turno:', err);
        alert('No se pudo asignar el turno. Intente nuevamente.');
      },
    });
  }
}