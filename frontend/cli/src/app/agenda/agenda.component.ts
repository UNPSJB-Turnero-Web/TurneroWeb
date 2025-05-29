import { Component, ChangeDetectionStrategy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarEventTitleFormatter, CalendarDateFormatter } from 'angular-calendar';
import { addHours } from 'date-fns';
import { AgendaService } from './agenda.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';
import { ModalService } from '../modal/modal.service';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { Agenda } from './agenda';
import { FormsModule } from '@angular/forms'; // Para ngModel si quieres seleccionar esquemaTurnoId y semanas
import { RouterModule } from '@angular/router';

import { forkJoin } from 'rxjs';

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

          <div>
            <input type="number" [(ngModel)]="esquemaTurnoId" placeholder="ID EsquemaTurno" class="form-control d-inline-block w-auto me-2" />
            <input type="number" [(ngModel)]="semanas" placeholder="Semanas" class="form-control d-inline-block w-auto me-2" />

          </div>
        </div>
        <div class="card-body p-0">
        <mwl-calendar-month-view
          [viewDate]="viewDate"
          [events]="events"
          (eventClicked)="handleEvent($event)">
        </mwl-calendar-month-view>

        <!-- Aquí la tabla de eventos -->
        <div class="mt-4">
          <h3>Eventos generados</h3>
          <table class="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Título</th>
                <th>Consultorio</th>
                <th>Médico</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let event of events">
                <td>{{ event.start | date: 'yyyy-MM-dd' }}</td>
                <td>{{ event.start | date: 'HH:mm' }}</td>
                <td>{{ event.title }}</td>
                <td>{{ event.meta?.consultorioId }}</td>
                <td>{{ event.meta?.staffMedicoId }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <div *ngIf="agendaDTO">
        <h3 class="mt-4">Agenda Detallada</h3>
        <div *ngFor="let dia of agendaDTO.dias" class="mb-3">
          <div class="fw-bold">
            {{ dia.fecha }} ({{ dia.diaSemana }}) 
            <span *ngIf="dia.inhabilitado" class="badge bg-warning text-dark ms-2">Inhabilitado</span>
          </div>
          <div *ngIf="dia.motivoInhabilitacion" class="text-danger small mb-1">
            {{ dia.motivoInhabilitacion }}
          </div>
          <table class="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Estado</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let slot of dia.slots">
                <td>{{ slot.horaInicio }}</td>
                <td>{{ slot.horaFin }}</td>
                <td>
                  <span *ngIf="slot.inhabilitado" class="text-danger">Inhabilitado</span>
                  <span *ngIf="!slot.inhabilitado" class="text-success">Disponible</span>
                </td>
                <td>{{ slot.motivoInhabilitacion }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="agendas.length > 0">
        <h3 class="mt-4">Agendas por Esquema</h3>
        <div *ngFor="let agenda of agendas" class="mb-3">
          <div class="fw-bold">
          <div *ngFor="let dia of agenda.dias" class="mb-2">
            <div class="small text-muted">
              {{ dia.fecha }} ({{ dia.diaSemana }})
              <span *ngIf="dia.inhabilitado" class="badge bg-warning text-dark ms-2">Inhabilitado</span>
            </div>
            <div *ngIf="dia.motivoInhabilitacion" class="text-danger small mb-1">
              {{ dia.motivoInhabilitacion }}
            </div>
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let slot of dia.slots">
                  <td>{{ slot.horaInicio }}</td>
                  <td>{{ slot.horaFin }}</td>
                  <td>
                    <span *ngIf="slot.inhabilitado" class="text-danger">Inhabilitado</span>
                    <span *ngIf="!slot.inhabilitado" class="text-success">Disponible</span>
                  </td>
                  <td>{{ slot.motivoInhabilitacion }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Agrega esto arriba del calendario -->
    <div>Eventos cargados: {{ events.length }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [`
    .card { border-radius: 1.15rem; overflow: hidden; }
    .card-header { border-top-left-radius: 1rem !important; border-top-right-radius: 1rem !important; }

    /* Estilos básicos para angular-calendar */
.mwl-calendar-month-view {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: #fff;
  margin-bottom: 2rem;
  padding: 1rem;
}
.mwl-calendar-table {
  width: 100%;
  border-collapse: collapse;
}
.mwl-calendar-table th,
.mwl-calendar-table td {
  border: 1px solid #dee2e6;
  text-align: center;
  padding: 0.5rem;
  min-width: 40px;
  min-height: 40px;
}
.mwl-calendar-event {
  background: #1e90ff;
  color: #fff;
  border-radius: 4px;
  padding: 2px 4px;
  margin: 2px 0;
  font-size: 0.85em;
  cursor: pointer;
}

    
  `],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AgendaComponent implements OnInit {
  viewDate: Date = new Date(2025, 4, 1); // Mayo 2025
  events: CalendarEvent[] = [];
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;
  agendaDTO: Agenda | null = null;
  esquemaTurnoId: number = 1; // valor por defecto, puedes cambiarlo
  semanas: number = 4; // valor por defecto
  esquemas: any[] = [];
  agendas: Agenda[] = [];

  constructor(
    private agendaService: AgendaService,
    public router: Router,
    private modalService: ModalService
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

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getAgendas();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/agenda', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/agenda', id], { queryParams: { edit: true } });
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar agenda",
        "¿Está seguro que desea eliminar esta agenda?",
        "Esta acción no se puede deshacer"
      )
      .then(() => this.remove(id))
      .catch(() => { });
  }

  remove(id: number): void {
    this.agendaService.remove(id).subscribe({
      next: () => this.getAgendas(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar la agenda.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar agenda:", err);
      }
    });
  }

  handleEvent(eventObj: any) {
    alert('Turno: ' + eventObj.event?.title);
  }


cargarEsquemasYEventos() {
  this.agendaService.getEsquemasTurno().subscribe(esquemas => {
    this.esquemas = esquemas; // <-- usa directamente el array
    this.events = this.mapEsquemasToEvents(this.esquemas);
  });
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
    const mes = this.viewDate.getMonth();
    const anio = this.viewDate.getFullYear();

    esquemas.forEach(esquema => {
      const intervalo = esquema.intervalo ? Number(esquema.intervalo) : 20; // minutos
      esquema.horarios.forEach((horario: any) => {
        for (let semana = 0; semana < 5; semana++) {
          const primerDiaMes = new Date(anio, mes, 1);
          let dia = diasSemana[horario.dia as keyof typeof diasSemana];
          let primerDia = primerDiaMes.getDay();
          let offset = (7 + dia - primerDia) % 7;
          let fechaEvento = new Date(anio, mes, 1 + offset + semana * 7);

          if (fechaEvento.getMonth() !== mes) continue;

          const [hInicio, mInicio, sInicio] = horario.horaInicio.split(':').map(Number);
          const [hFin, mFin, sFin] = horario.horaFin.split(':').map(Number);

          let slotStart = new Date(fechaEvento);
          slotStart.setHours(hInicio, mInicio, sInicio || 0, 0);

          let slotEnd = new Date(fechaEvento);
          slotEnd.setHours(hFin, mFin, sFin || 0, 0);

          while (slotStart < slotEnd) {
            let nextSlot = new Date(slotStart.getTime() + intervalo * 60000);
            if (nextSlot > slotEnd) nextSlot = new Date(slotEnd);

            events.push({
              start: new Date(slotStart),
              end: new Date(nextSlot),
              title: `Turno (${horario.dia})`,
              color: { primary: '#1e90ff', secondary: '#D1E8FF' },
              meta: {
                esquemaId: esquema.id,
                consultorioId: esquema.consultorioId,
                staffMedicoId: esquema.staffMedicoId
              }
            });

            slotStart = nextSlot;
          }
        }
      });
    });
    console.log('EVENTOS GENERADOS:', events);
    return events.filter(ev => ev.start instanceof Date && !isNaN(ev.start.getTime()));
  }
}