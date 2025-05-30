import { Component, ChangeDetectionStrategy, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CalendarEvent, CalendarEventTitleFormatter, CalendarDateFormatter } from 'angular-calendar';
import { AgendaService } from './agenda.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    FormsModule,
    RouterModule,
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
                </div>
                <div class="modal-footer">
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AgendaComponent implements OnInit {
  viewDate: Date = new Date(); // Fecha actual para el calendario
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  esquemaTurnoId: number = 1; // ID del esquema de turno (puedes cambiarlo dinámicamente)
  semanas: number = 4; // Número de semanas para generar eventos
  selectedEvent: CalendarEvent | null = null; // Evento seleccionado
  filterType: string = 'staffMedico';
  filterValue: string = '';

  constructor(
    private agendaService: AgendaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarEventos();
  }

  // Método para cargar eventos desde el backend
  cargarEventos(): void {
    this.agendaService.obtenerEventos(this.esquemaTurnoId, this.semanas).subscribe((eventos) => {
      this.events = eventos.map(evento => ({
        start: new Date(evento.fecha + 'T' + evento.horaInicio),
        end: new Date(evento.fecha + 'T' + evento.horaFin),
        title: evento.titulo,
        color: { primary: '#1e90ff', secondary: '#D1E8FF' },
        meta: {
          staffMedicoNombre: evento.staffMedicoNombre,
          consultorioNombre: evento.consultorioNombre,
          centroAtencionNombre: evento.nombreCentro
        }
      }));
      this.filteredEvents = this.events; // Inicialmente, los eventos filtrados son todos los eventos
      console.log('Eventos cargados desde el backend:', this.events);
      this.cdr.detectChanges(); // Forzar la detección de cambios
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
}