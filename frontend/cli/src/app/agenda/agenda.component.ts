import { Component, ChangeDetectionStrategy, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CalendarEvent, CalendarEventTitleFormatter, CalendarDateFormatter } from 'angular-calendar';
import { AgendaService } from './agenda.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';
import { ModalService } from '../modal/modal.service';
import { CalendarModule } from 'angular-calendar';
import { Agenda } from './agenda';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    FormsModule,
    CalendarModule,
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
  styles: [`
  .container {
    max-width: 90%; /* Ocupa el 90% del ancho de la pantalla */
    margin: 0 auto; /* Centra el contenido horizontalmente */
    padding: 1rem; /* Espaciado interno */
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
  `],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AgendaComponent implements OnInit {
  viewDate: Date = new Date(2025, 4, 5); // Lunes 5 de mayo de 2025
  events: CalendarEvent[] = [];
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;
  agendaDTO: Agenda | null = null;
  esquemaTurnoId: number = 1; // valor por defecto, puedes cambiarlo
  semanas: number = 4; // valor por defecto
  esquemas: any[] = [];
  agendas: Agenda[] = [];
  selectedEvent: CalendarEvent | null = null; // Agregado para el evento seleccionado
  filterType: string = 'staffMedico';
  filterValue: string = '';
  filteredEvents: CalendarEvent[] = [];

  constructor(
    private agendaService: AgendaService,
    public router: Router,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef // Agrega esto
  ) { }

  ngOnInit() {
    this.getAgendas();
    this.cargarEsquemasYEventos();
  }

  getAgendas(): void {
    this.agendaService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = dataPackage.data;
    });
  }

  handleEvent(eventObj: any) {
    this.selectedEvent = eventObj.event; // Asigna el evento seleccionado
    console.log('Evento seleccionado:', this.selectedEvent); // Depuración
  }

  closeModal() {
    this.selectedEvent = null; // Limpia el evento seleccionado
  }

  cargarEsquemasYEventos() {
    this.agendaService.getEsquemasTurno().subscribe(esquemas => {
      this.esquemas = esquemas;
      this.events = this.mapEsquemasToEvents(this.esquemas);
      this.filteredEvents = this.events; // Inicialmente, los eventos filtrados son todos los eventos
      console.log('Eventos pasados al calendario:', this.events); // Depuración
      this.cdr.detectChanges(); // Forzar la detección de cambios
    });
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

  private mapEsquemasToEvents(esquemas: any[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const diasSemana = {
      'DOMINGO': 0,
      'LUNES': 1,
      'MARTES': 2,
      'MIERCOLES': 3,
      'JUEVES': 4,
      'VIERNES': 5,
      'SABADO': 6
    };

    // Generar eventos para un rango amplio de fechas
    const semanasARango = 4; // Cambia este valor si necesitas más semanas
    const fechaInicio = new Date(2025, 4, 1); // Fecha fija para evitar dependencia de la fecha actual
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaInicio.getDate() + semanasARango * 7); // 4 semanas desde la fecha fija

    console.log('Generando eventos desde:', fechaInicio, 'hasta:', fechaFin);

    esquemas.forEach(esquema => {
      const intervalo = esquema.intervalo ? Number(esquema.intervalo) : 20; // minutos
      console.log('Procesando esquema:', esquema);

      esquema.horarios.forEach((horario: any) => {
        console.log('Procesando horario:', horario);

        let fechaActual = new Date(fechaInicio);

        while (fechaActual <= fechaFin) {
          const diaSemana = diasSemana[horario.dia as keyof typeof diasSemana];
          if (fechaActual.getDay() === diaSemana) {
            console.log(`Generando eventos para el día: ${horario.dia} (${fechaActual.toDateString()})`);

            const [hInicio, mInicio, sInicio] = horario.horaInicio.split(':').map(Number);
            const [hFin, mFin, sFin] = horario.horaFin.split(':').map(Number);

            let slotStart = new Date(fechaActual);
            slotStart.setHours(hInicio, mInicio, sInicio || 0, 0);

            let slotEnd = new Date(fechaActual);
            slotEnd.setHours(hFin, mFin, sFin || 0, 0);

            while (slotStart < slotEnd) {
              let nextSlot = new Date(slotStart.getTime() + intervalo * 60000);

              // 🔒 Clampeo por seguridad
              if (nextSlot > slotEnd) {
                nextSlot = new Date(slotEnd);
              }

              // ⚠️ Verificación explícita de duración positiva
              if (nextSlot.getTime() > slotStart.getTime()) {
                events.push({
                  start: new Date(slotStart),
                  end: new Date(nextSlot.getTime()),
                  title: `🩺 Turno (${horario.dia})\n${slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, // Agregar hora de inicio
                  color: { primary: '#1e90ff', secondary: '#D1E8FF' }, // Colores personalizados
                  meta: {
                    staffMedicoNombre: esquema.nombreStaffMedico,
                    consultorioNombre: esquema.nombreConsultorio,
                    centroAtencionNombre: esquema.nombreCentro
                  }
                });
              }

              // 🔄 Importante: clonar el objeto, no referenciarlo
              slotStart = new Date(nextSlot.getTime());
            }
          }
          fechaActual.setDate(fechaActual.getDate() + 1); // Avanzar al siguiente día
        }
      });
    });

    console.log('Eventos generados:', events); // Depuración: Verifica cuántos eventos se generan

    return events.filter(ev => ev.start instanceof Date && !isNaN(ev.start.getTime()));
  }
}