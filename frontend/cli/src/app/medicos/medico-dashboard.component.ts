import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { MedicoService } from './medico.service';
import { Turno } from '../turnos/turno';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';
import { Medico } from './medico';

interface DashboardStats {
  turnosHoy: number;
  turnosManana: number;
  turnosSemana: number;
  turnosPendientes: number;
}

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="h3 mb-3">Dashboard Médico</h1>
          <div class="alert alert-info" *ngIf="medicoActual">
            <i class="fas fa-user-md me-2"></i>
            Bienvenido/a, <strong>Dr/a. {{ medicoActual.nombre }} {{ medicoActual.apellido }}</strong>
            <br>
            <small>
              <span *ngIf="medicoActual.especialidades && medicoActual.especialidades.length > 0; else especialidadUnica">
                Especialidades: 
                <span *ngFor="let esp of medicoActual.especialidades; let last = last">
                  {{ esp.nombre }}<span *ngIf="!last">, </span>
                </span>
              </span>
              <ng-template #especialidadUnica>
                <span *ngIf="medicoActual.especialidad">Especialidad: {{ medicoActual.especialidad.nombre }}</span>
              </ng-template>
              | Matrícula: {{ medicoActual.matricula }}
            </small>
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.turnosHoy }}</h4>
                  <p class="mb-0">Turnos Hoy</p>
                </div>
                <i class="fas fa-calendar-day fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.turnosManana }}</h4>
                  <p class="mb-0">Turnos Mañana</p>
                </div>
                <i class="fas fa-clock fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.turnosSemana }}</h4>
                  <p class="mb-0">Esta Semana</p>
                </div>
                <i class="fas fa-calendar-week fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.turnosPendientes }}</h4>
                  <p class="mb-0">Pendientes</p>
                </div>
                <i class="fas fa-exclamation-triangle fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-tools me-2"></i>
                Acciones Rápidas
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-primary w-100" (click)="verTurnosHoy()">
                    <i class="fas fa-list-alt mb-1 d-block"></i>
                    Turnos Hoy
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-success w-100" (click)="gestionarHorarios()">
                    <i class="fas fa-clock mb-1 d-block"></i>
                    Horarios
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-warning w-100" (click)="gestionarVacaciones()">
                    <i class="fas fa-calendar-times mb-1 d-block"></i>
                    Vacaciones
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-info w-100" (click)="verHistorial()">
                    <i class="fas fa-history mb-1 d-block"></i>
                    Historial
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-secondary w-100" (click)="verEstadisticas()">
                    <i class="fas fa-chart-bar mb-1 d-block"></i>
                    Estadísticas
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-dark w-100" (click)="configurarPerfil()">
                    <i class="fas fa-user-cog mb-1 d-block"></i>
                    Mi Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="row">
        <!-- Turnos de Hoy -->
        <div class="col-md-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-calendar-day me-2"></i>
                Turnos de Hoy ({{ fechaHoy | date:'dd/MM/yyyy' }})
              </h5>
              <button class="btn btn-sm btn-primary" (click)="verTurnosHoy()">
                Ver Todos
              </button>
            </div>
            <div class="card-body">
              <div *ngIf="turnosHoy.length === 0" class="text-center text-muted py-4">
                <i class="fas fa-calendar-check fa-3x mb-3 opacity-25"></i>
                <p class="mb-0">No hay turnos programados para hoy</p>
              </div>
              <div *ngFor="let turno of turnosHoy.slice(0, 5)" class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                  <strong>{{ turno.horaInicio }} - {{ turno.horaFin }}</strong>
                  <br>
                  <span class="text-muted">{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</span>
                  <br>
                  <small class="text-info">{{ turno.nombreCentro }} - {{ turno.consultorioNombre }}</small>
                </div>
                <span class="badge" [ngClass]="{
                  'bg-success': turno.estado === 'CONFIRMADO',
                  'bg-primary': turno.estado === 'PROGRAMADO',
                  'bg-danger': turno.estado === 'CANCELADO'
                }">
                  {{ turno.estado }}
                </span>
              </div>
              <div *ngIf="turnosHoy.length > 5" class="text-center mt-2">
                <small class="text-muted">Y {{ turnosHoy.length - 5 }} turnos más...</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar - Información Útil -->
        <div class="col-md-4">
          <!-- Próximos Turnos -->
          <div class="card mb-3">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-clock me-2"></i>
                Próximos Turnos
              </h6>
            </div>
            <div class="card-body">
              <div *ngIf="proximosTurnos.length === 0" class="text-center text-muted py-2">
                <small>No hay turnos próximos</small>
              </div>
              <div *ngFor="let turno of proximosTurnos.slice(0, 3); let last = last" class="mb-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <small class="fw-bold">{{ turno.fecha | date:'dd/MM' }} - {{ turno.horaInicio }}</small>
                    <br>
                    <small class="text-muted">{{ turno.nombrePaciente }}</small>
                  </div>
                  <span class="badge bg-light text-dark">{{ turno.estado }}</span>
                </div>
                <hr class="my-1" *ngIf="!last">
              </div>
            </div>
          </div>

          <!-- Estado de Disponibilidad -->
          <div class="card mb-3">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-calendar-alt me-2"></i>
                Mi Disponibilidad
              </h6>
            </div>
            <div class="card-body">
              <div *ngIf="disponibilidadActual.length === 0" class="text-center text-muted py-2">
                <small>Sin horarios configurados</small>
                <br>
                <button class="btn btn-sm btn-outline-primary mt-2" (click)="gestionarHorarios()">
                  Configurar
                </button>
              </div>
              <div *ngFor="let disp of disponibilidadActual.slice(0, 3)">
                <div *ngFor="let horario of disp.horarios" class="mb-1">
                  <small>
                    <span class="fw-bold">{{ horario.dia }}:</span>
                    {{ horario.horaInicio | slice:0:5 }} - {{ horario.horaFin | slice:0:5 }}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Notificaciones/Alertas -->
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-bell me-2"></i>
                Notificaciones
              </h6>
            </div>
            <div class="card-body">
              <div class="alert alert-info py-2 mb-2" *ngIf="stats.turnosPendientes > 0">
                <small>
                  <i class="fas fa-exclamation-circle me-1"></i>
                  Tienes {{ stats.turnosPendientes }} turnos pendientes de confirmación
                </small>
              </div>
              <div class="alert alert-warning py-2 mb-2" *ngIf="disponibilidadActual.length === 0">
                <small>
                  <i class="fas fa-calendar-times me-1"></i>
                  No tienes horarios de disponibilidad configurados
                </small>
              </div>
              <div class="text-center text-muted py-2" *ngIf="stats.turnosPendientes === 0 && disponibilidadActual.length > 0">
                <small>
                  <i class="fas fa-check-circle text-success me-1"></i>
                  Todo está al día
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border: 1px solid rgba(0, 0, 0, 0.125);
    }
    
    .card-header {
      background-color: rgba(0, 0, 0, 0.03);
    }

    .btn {
      transition: all 0.2s ease-in-out;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .opacity-25 {
      opacity: 0.25 !important;
    }

    .opacity-50 {
      opacity: 0.5 !important;
    }

    .border-bottom:last-child {
      border-bottom: none !important;
    }
  `]
})
export class MedicoDashboardComponent implements OnInit {
  medicoActual: Medico | null = null;
  stats: DashboardStats = {
    turnosHoy: 0,
    turnosManana: 0,
    turnosSemana: 0,
    turnosPendientes: 0
  };
  turnosHoy: Turno[] = [];
  proximosTurnos: Turno[] = [];
  disponibilidadActual: DisponibilidadMedico[] = [];
  fechaHoy: Date = new Date();

  constructor(
    private router: Router,
    private turnoService: TurnoService,
    private disponibilidadService: DisponibilidadMedicoService,
    private medicoService: MedicoService
  ) {}

  ngOnInit() {
    this.cargarDatosMedico();
    this.cargarEstadisticas();
    this.cargarTurnosHoy();
    this.cargarProximosTurnos();
    this.cargarDisponibilidad();
  }

  private cargarDatosMedico() {
    // TODO: Obtener el médico actual desde la sesión/autenticación
    // Por ahora, simulamos que el médico tiene ID 1
    const medicoId = this.getMedicoIdFromSession();
    
    this.medicoService.findById(medicoId).subscribe({
      next: (medico) => {
        this.medicoActual = medico;
      },
      error: (error) => {
        console.error('Error al cargar datos del médico:', error);
      }
    });
  }

  private cargarEstadisticas() {
    const medicoId = this.getMedicoIdFromSession();
    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
    
    // Turnos de hoy
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaExacta: hoy
    }).subscribe(response => {
      this.stats.turnosHoy = response.data?.length || 0;
    });

    // Turnos de mañana
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaExacta: manana
    }).subscribe(response => {
      this.stats.turnosManana = response.data?.length || 0;
    });

    // Turnos de la semana
    const inicioSemana = this.getStartOfWeek(new Date()).toISOString().split('T')[0];
    const finSemana = this.getEndOfWeek(new Date()).toISOString().split('T')[0];
    
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaDesde: inicioSemana,
      fechaHasta: finSemana
    }).subscribe(response => {
      this.stats.turnosSemana = response.data?.length || 0;
    });

    // Turnos pendientes
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      estado: 'PROGRAMADO'
    }).subscribe(response => {
      this.stats.turnosPendientes = response.data?.length || 0;
    });
  }

  private cargarTurnosHoy() {
    const medicoId = this.getMedicoIdFromSession();
    const hoy = new Date().toISOString().split('T')[0];
    
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaExacta: hoy,
      sortBy: 'horaInicio'
    }).subscribe(response => {
      this.turnosHoy = response.data || [];
    });
  }

  private cargarProximosTurnos() {
    const medicoId = this.getMedicoIdFromSession();
    const manana = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
    
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaDesde: manana,
      sortBy: 'fecha',
      size: 10
    }).subscribe(response => {
      this.proximosTurnos = response.data || [];
    });
  }

  private cargarDisponibilidad() {
    const medicoId = this.getMedicoIdFromSession();
    
    this.disponibilidadService.byMedico(medicoId).subscribe({
      next: (response) => {
        this.disponibilidadActual = response.data;
      },
      error: (error) => {
        console.error('Error al cargar disponibilidad:', error);
      }
    });
  }

  // Navigation methods
  verTurnosHoy() {
    this.router.navigate(['/medico-turnos'], { queryParams: { fecha: new Date().toISOString().split('T')[0] } });
  }

  gestionarHorarios() {
    this.router.navigate(['/medico-horarios']);
  }

  gestionarVacaciones() {
    this.router.navigate(['/medico-vacaciones']);
  }

  verHistorial() {
    this.router.navigate(['/medico-historial']);
  }

  verEstadisticas() {
    this.router.navigate(['/medico-estadisticas']);
  }

  configurarPerfil() {
    this.router.navigate(['/medico-perfil']);
  }

  // Utility methods
  private getMedicoIdFromSession(): number {
    const medicoId = localStorage.getItem('medicoId');
    return medicoId ? parseInt(medicoId, 10) : 1;
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  private getEndOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  }
}