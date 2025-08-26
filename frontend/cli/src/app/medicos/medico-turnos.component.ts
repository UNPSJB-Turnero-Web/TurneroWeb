import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';

@Component({
  selector: 'app-medico-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0">Mis Turnos</h1>
            <button class="btn btn-outline-secondary" (click)="volverAlDashboard()">
              <i class="fas fa-arrow-left me-2"></i>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-filter me-2"></i>
                Filtros
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <label class="form-label">Fecha</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    [(ngModel)]="filtros.fecha"
                    (change)="aplicarFiltros()">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Estado</label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="filtros.estado"
                    (change)="aplicarFiltros()">
                    <option value="">Todos</option>
                    <option value="PROGRAMADO">Programado</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Centro de Atención</label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="filtros.centroId"
                    (change)="aplicarFiltros()">
                    <option value="">Todos</option>
                    <option *ngFor="let centro of centrosUnicos" [value]="centro.id">
                      {{ centro.nombre }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Acciones</label>
                  <div class="d-grid">
                    <button class="btn btn-outline-primary" (click)="limpiarFiltros()">
                      <i class="fas fa-eraser me-2"></i>
                      Limpiar Filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Calendario/Lista -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="btn-group" role="group">
            <button 
              type="button" 
              class="btn" 
              [class.btn-primary]="vistaActual === 'lista'"
              [class.btn-outline-primary]="vistaActual !== 'lista'"
              (click)="cambiarVista('lista')">
              <i class="fas fa-list me-2"></i>
              Lista
            </button>
            <button 
              type="button" 
              class="btn" 
              [class.btn-primary]="vistaActual === 'calendario'"
              [class.btn-outline-primary]="vistaActual !== 'calendario'"
              (click)="cambiarVista('calendario')">
              <i class="fas fa-calendar me-2"></i>
              Calendario
            </button>
            <button 
              type="button" 
              class="btn" 
              [class.btn-primary]="vistaActual === 'agenda'"
              [class.btn-outline-primary]="vistaActual !== 'agenda'"
              (click)="cambiarVista('agenda')">
              <i class="fas fa-clock me-2"></i>
              Agenda Diaria
            </button>
          </div>
        </div>
      </div>

      <!-- Vista Lista -->
      <div *ngIf="vistaActual === 'lista'" class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Lista de Turnos ({{ turnosFiltrados.length }})</h6>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-success" (click)="exportarExcel()">
                  <i class="fas fa-file-excel me-1"></i>
                  Excel
                </button>
                <button class="btn btn-outline-danger" (click)="exportarPDF()">
                  <i class="fas fa-file-pdf me-1"></i>
                  PDF
                </button>
              </div>
            </div>
            <div class="card-body">
              <div *ngIf="cargando" class="text-center py-5">
                <div class="spinner-border" role="status"></div>
                <p class="mt-2 text-muted">Cargando turnos...</p>
              </div>
              
              <div *ngIf="!cargando && turnosFiltrados.length === 0" class="text-center py-5">
                <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <p class="text-muted">No se encontraron turnos con los filtros aplicados</p>
              </div>

              <div *ngIf="!cargando && turnosFiltrados.length > 0" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Horario</th>
                      <th>Paciente</th>
                      <th>Centro/Consultorio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let turno of turnosFiltrados.slice((paginaActual-1)*itemsPorPagina, paginaActual*itemsPorPagina)">
                      <td>
                        <strong>{{ turno.fecha | date:'dd/MM/yyyy' }}</strong>
                        <br>
                        <small class="text-muted">{{ turno.fecha | date:'EEEE' }}</small>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark">
                          {{ turno.horaInicio }} - {{ turno.horaFin }}
                        </span>
                      </td>
                      <td>
                        <strong>{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</strong>
                        <br>
                        <small class="text-muted" *ngIf="turno.titulo">{{ turno.titulo }}</small>
                      </td>
                      <td>
                        <div>
                          <i class="fas fa-hospital me-1"></i>
                          {{ turno.nombreCentro }}
                        </div>
                        <div class="text-muted">
                          <i class="fas fa-door-open me-1"></i>
                          {{ turno.consultorioNombre }}
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': turno.estado === 'CONFIRMADO',
                          'bg-primary': turno.estado === 'PROGRAMADO',
                          'bg-danger': turno.estado === 'CANCELADO'
                        }">
                          {{ turno.estado }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-primary" 
                            (click)="verDetallesTurno(turno)"
                            title="Ver detalles">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button 
                            class="btn btn-outline-success" 
                            (click)="confirmarTurno(turno)"
                            *ngIf="turno.estado === 'PROGRAMADO'"
                            title="Confirmar turno">
                            <i class="fas fa-check"></i>
                          </button>
                          <button 
                            class="btn btn-outline-warning" 
                            (click)="reagendarTurno(turno)"
                            *ngIf="turno.estado !== 'CANCELADO'"
                            title="Reagendar">
                            <i class="fas fa-calendar-alt"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            (click)="cancelarTurno(turno)"
                            *ngIf="turno.estado !== 'CANCELADO'"
                            title="Cancelar turno">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Paginación -->
              <div *ngIf="turnosFiltrados.length > itemsPorPagina" class="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Mostrando {{ (paginaActual-1)*itemsPorPagina + 1 }} a {{ Math.min(paginaActual*itemsPorPagina, turnosFiltrados.length) }} de {{ turnosFiltrados.length }} resultados
                </div>
                <nav>
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" [class.disabled]="paginaActual === 1">
                      <a class="page-link" (click)="cambiarPagina(paginaActual - 1)">Anterior</a>
                    </li>
                    <li class="page-item" 
                        *ngFor="let pagina of obtenerPaginas()" 
                        [class.active]="pagina === paginaActual">
                      <a class="page-link" (click)="cambiarPagina(pagina)">{{ pagina }}</a>
                    </li>
                    <li class="page-item" [class.disabled]="paginaActual === totalPaginas">
                      <a class="page-link" (click)="cambiarPagina(paginaActual + 1)">Siguiente</a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Agenda Diaria -->
      <div *ngIf="vistaActual === 'agenda'" class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Agenda del {{ fechaSeleccionada | date:'dd/MM/yyyy' }}</h6>
              <div>
                <button class="btn btn-sm btn-outline-secondary me-2" (click)="cambiarFechaAgenda(-1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <input 
                  type="date" 
                  class="btn btn-sm btn-outline-primary" 
                  [(ngModel)]="fechaSeleccionadaString"
                  (change)="actualizarFechaSeleccionada()">
                <button class="btn btn-sm btn-outline-secondary ms-2" (click)="cambiarFechaAgenda(1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="agenda-timeline">
                <div *ngFor="let turno of turnosFecha" class="agenda-item">
                  <div class="agenda-time">
                    <strong>{{ turno.horaInicio }}</strong>
                    <small>{{ turno.horaFin }}</small>
                  </div>
                  <div class="agenda-content">
                    <div class="agenda-patient">
                      <h6 class="mb-1">{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</h6>
                      <small class="text-muted">{{ turno.nombreCentro }} - {{ turno.consultorioNombre }}</small>
                    </div>
                    <div class="agenda-actions">
                      <span class="badge" [ngClass]="{
                        'bg-success': turno.estado === 'CONFIRMADO',
                        'bg-primary': turno.estado === 'PROGRAMADO',
                        'bg-danger': turno.estado === 'CANCELADO'
                      }">
                        {{ turno.estado }}
                      </span>
                    </div>
                  </div>
                </div>
                <div *ngIf="turnosFecha.length === 0" class="text-center py-5">
                  <i class="fas fa-calendar-check fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No hay turnos para esta fecha</p>
                </div>
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
    }

    .table th {
      border-top: none;
      font-weight: 600;
      background-color: #f8f9fa;
    }

    .agenda-timeline {
      max-height: 600px;
      overflow-y: auto;
    }

    .agenda-item {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      align-items: center;
    }

    .agenda-item:last-child {
      border-bottom: none;
    }

    .agenda-time {
      width: 100px;
      text-align: center;
      margin-right: 1rem;
      padding: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 0.375rem;
    }

    .agenda-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .agenda-patient h6 {
      color: #495057;
    }

    .btn-group .btn {
      border-radius: 0;
    }

    .btn-group .btn:first-child {
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;
    }

    .btn-group .btn:last-child {
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }

    .page-link {
      cursor: pointer;
    }
  `]
})
export class MedicoTurnosComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  turnosFecha: Turno[] = [];
  centrosUnicos: any[] = [];
  cargando = false;
  
  // Control de vista
  vistaActual = 'lista';
  
  // Filtros
  filtros = {
    fecha: '',
    estado: '',
    centroId: ''
  };

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  // Agenda diaria
  fechaSeleccionada = new Date();
  fechaSeleccionadaString = '';

  Math = Math; // Para usar Math en el template

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turnoService: TurnoService
  ) {}

  ngOnInit() {
    this.fechaSeleccionadaString = this.fechaSeleccionada.toISOString().split('T')[0];
    
    // Verificar si hay fecha en query params
    this.route.queryParams.subscribe(params => {
      if (params['fecha']) {
        this.filtros.fecha = params['fecha'];
      }
      this.cargarTurnos();
    });
  }

  cargarTurnos() {
    this.cargando = true;
    const medicoId = this.getMedicoIdFromSession();

    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      sortBy: 'fecha,horaInicio',
      size: 1000 // Cargar todos para poder filtrar localmente
    }).subscribe({
      next: (response) => {
        this.turnos = response.data || [];
        this.extraerCentrosUnicos();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar turnos:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    this.turnosFiltrados = this.turnos.filter(turno => {
      let pasaFiltro = true;

      if (this.filtros.fecha && turno.fecha !== this.filtros.fecha) {
        pasaFiltro = false;
      }

      if (this.filtros.estado && turno.estado !== this.filtros.estado) {
        pasaFiltro = false;
      }

      if (this.filtros.centroId && turno.centroId?.toString() !== this.filtros.centroId) {
        pasaFiltro = false;
      }

      return pasaFiltro;
    });

    this.totalPaginas = Math.ceil(this.turnosFiltrados.length / this.itemsPorPagina);
    this.paginaActual = 1;

    // Actualizar agenda diaria si está activa
    if (this.vistaActual === 'agenda') {
      this.actualizarAgendaDiaria();
    }
  }

  limpiarFiltros() {
    this.filtros = {
      fecha: '',
      estado: '',
      centroId: ''
    };
    this.aplicarFiltros();
  }

  cambiarVista(vista: string) {
    this.vistaActual = vista;
    if (vista === 'agenda') {
      this.actualizarAgendaDiaria();
    }
  }

  // Métodos de paginación
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  obtenerPaginas(): number[] {
    const paginas = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, inicio + 4);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Métodos de agenda diaria
  cambiarFechaAgenda(dias: number) {
    this.fechaSeleccionada = new Date(this.fechaSeleccionada.getTime() + dias * 24 * 60 * 60 * 1000);
    this.fechaSeleccionadaString = this.fechaSeleccionada.toISOString().split('T')[0];
    this.actualizarAgendaDiaria();
  }

  actualizarFechaSeleccionada() {
    this.fechaSeleccionada = new Date(this.fechaSeleccionadaString);
    this.actualizarAgendaDiaria();
  }

  actualizarAgendaDiaria() {
    const fechaString = this.fechaSeleccionada.toISOString().split('T')[0];
    this.turnosFecha = this.turnos
      .filter(turno => turno.fecha === fechaString)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  // Métodos de acciones
  verDetallesTurno(turno: Turno) {
    // TODO: Mostrar modal con detalles del turno
    console.log('Ver detalles de turno:', turno);
  }

  confirmarTurno(turno: Turno) {
    if (confirm('¿Confirmar este turno?')) {
      const turnoActualizado = { ...turno, estado: 'CONFIRMADO' };
      this.turnoService.update(turno.id!, turnoActualizado).subscribe({
        next: () => {
          turno.estado = 'CONFIRMADO';
        },
        error: (error) => {
          console.error('Error al confirmar turno:', error);
          alert('Error al confirmar el turno');
        }
      });
    }
  }

  reagendarTurno(turno: Turno) {
    // TODO: Implementar reagendamiento
    console.log('Reagendar turno:', turno);
  }

  cancelarTurno(turno: Turno) {
    const motivo = prompt('Motivo de cancelación:');
    if (motivo) {
      const turnoActualizado = { ...turno, estado: 'CANCELADO' };
      this.turnoService.update(turno.id!, turnoActualizado).subscribe({
        next: () => {
          turno.estado = 'CANCELADO';
        },
        error: (error) => {
          console.error('Error al cancelar turno:', error);
          alert('Error al cancelar el turno');
        }
      });
    }
  }

  // Métodos de exportación
  exportarExcel() {
    // TODO: Implementar exportación a Excel
    console.log('Exportar a Excel');
  }

  exportarPDF() {
    // TODO: Implementar exportación a PDF
    console.log('Exportar a PDF');
  }

  // Navegación
  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
  }

  // Métodos auxiliares
  private extraerCentrosUnicos() {
    const centrosMap = new Map();
    this.turnos.forEach(turno => {
      if (turno.centroId && turno.nombreCentro) {
        centrosMap.set(turno.centroId, {
          id: turno.centroId,
          nombre: turno.nombreCentro
        });
      }
    });
    this.centrosUnicos = Array.from(centrosMap.values());
  }

  private getMedicoIdFromSession(): number {
    // TODO: Implementar obtención real del ID del médico desde la sesión
    return 1;
  }
}