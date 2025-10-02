import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurnoService } from './turno.service';
import { Turno } from './turno';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-turnos">
          <div class="header-content">
            <div class="title-section">
              <div class="header-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="header-text">
                <h1>Turnos Médicos</h1>
                <p>Gestión de citas y consultas médicas</p>
              </div>
            </div>
            <div class="header-actions">
              <div class="btn-group me-2">
                <button 
                  class="btn btn-outline-info"
                  (click)="router.navigate(['/turnos/audit-dashboard'])"
                  title="Dashboard de Auditoría"
                >
                  <i class="fas fa-chart-bar me-2"></i>
                  Dashboard
                </button>
                <button 
                  class="btn btn-outline-primary"
                  (click)="router.navigate(['/turnos/advanced-search'])"
                  title="Búsqueda Avanzada"
                >
                  <i class="fas fa-search me-2"></i>
                  Búsqueda Avanzada
                </button>
              </div>
              <button 
                class="btn btn-new"
                (click)="router.navigate(['/turnos/new'])"
              >
                <i class="fas fa-plus me-2"></i>
                Nuevo Turno
              </button>
            </div>
          </div>
        </div>

        <!-- BARRA DE FILTROS Y BÚSQUEDA -->
        <div class="card-body">
          <div class="filters-section">
            <h5 class="filters-title">
              <i class="fas fa-filter me-2"></i>
              Filtros de búsqueda
            </h5>
            
            <div class="row g-3">
              <!-- Filtro por Paciente -->
              <div class="col-md-3">
                <label for="pacienteFilter" class="form-label">
                  <i class="fas fa-user me-1"></i>
                  Paciente
                </label>
                <input
                  type="text"
                  id="pacienteFilter"
                  class="form-control"
                  placeholder="Buscar por nombre/apellido"
                  [(ngModel)]="filters.paciente"
                  (input)="onFilterChange()"
                />
              </div>

              <!-- Filtro por Médico -->
              <div class="col-md-3">
                <label for="medicoFilter" class="form-label">
                  <i class="fas fa-user-md me-1"></i>
                  Médico
                </label>
                <input
                  type="text"
                  id="medicoFilter"
                  class="form-control"
                  placeholder="Buscar por nombre/apellido"
                  [(ngModel)]="filters.medico"
                  (input)="onFilterChange()"
                />
              </div>

              <!-- Filtro por Consultorio -->
              <div class="col-md-3">
                <label for="consultorioFilter" class="form-label">
                  <i class="fas fa-hospital me-1"></i>
                  Consultorio
                </label>
                <input
                  type="text"
                  id="consultorioFilter"
                  class="form-control"
                  placeholder="Buscar consultorio"
                  [(ngModel)]="filters.consultorio"
                  (input)="onFilterChange()"
                />
              </div>

              <!-- Filtro por Estado -->
              <div class="col-md-3">
                <label for="estadoFilter" class="form-label">
                  <i class="fas fa-info-circle me-1"></i>
                  Estado
                </label>
                <select
                  id="estadoFilter"
                  class="form-select"
                  [(ngModel)]="filters.estado"
                  (change)="onFilterChange()"
                >
                  <option value="">Todos los estados</option>
                  <option value="PROGRAMADO">Programado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <!-- Filtro Fecha Desde -->
              <div class="col-md-3">
                <label for="fechaDesdeFilter" class="form-label">
                  <i class="fas fa-calendar-alt me-1"></i>
                  Desde
                </label>
                <input
                  type="date"
                  id="fechaDesdeFilter"
                  class="form-control"
                  [(ngModel)]="filters.fechaDesde"
                  (change)="onFilterChange()"
                />
              </div>

              <!-- Filtro Fecha Hasta -->
              <div class="col-md-3">
                <label for="fechaHastaFilter" class="form-label">
                  <i class="fas fa-calendar-alt me-1"></i>
                  Hasta
                </label>
                <input
                  type="date"
                  id="fechaHastaFilter"
                  class="form-control"
                  [(ngModel)]="filters.fechaHasta"
                  (change)="onFilterChange()"
                />
              </div>

              <!-- Ordenamiento -->
              <div class="col-md-3">
                <label for="sortByFilter" class="form-label">
                  <i class="fas fa-sort me-1"></i>
                  Ordenar por
                </label>
                <select
                  id="sortByFilter"
                  class="form-select"
                  [(ngModel)]="filters.sortBy"
                  (change)="onFilterChange()"
                >
                  <option value="fecha">Fecha</option>
                  <option value="estado">Estado</option>
                  <option value="horaInicio">Hora</option>
                </select>
              </div>

              <!-- Dirección de ordenamiento -->
              <div class="col-md-3">
                <label for="sortDirFilter" class="form-label">
                  <i class="fas fa-sort-amount-down me-1"></i>
                  Dirección
                </label>
                <select
                  id="sortDirFilter"
                  class="form-select"
                  [(ngModel)]="filters.sortDir"
                  (change)="onFilterChange()"
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>

            <!-- Botones de control -->
            <div class="filters-controls mt-3">
              <button
                type="button"
                class="btn btn-outline-secondary"
                (click)="clearFilters()"
              >
                <i class="fas fa-times me-2"></i>
                Limpiar filtros
              </button>
              
              <div class="results-info">
                <span class="badge bg-primary">
                  {{ resultsPage.totalElements }} resultado(s) encontrado(s)
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TABLA MODERNA NORMALIZADA -->
        <div class="table-container">
          <table class="table modern-table">
            <thead>
              <tr>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-turnos">
                      <i class="fas fa-hashtag"></i>
                    </div>
                    ID
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-pacientes">
                      <i class="fas fa-user"></i>
                    </div>
                    Paciente
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-medicos">
                      <i class="fas fa-user-md"></i>
                    </div>
                    Médico
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-especialidades">
                      <i class="fas fa-stethoscope"></i>
                    </div>
                    Especialidad
                  </div>
                </th>
                <th>
                  <button 
                    class="header-button" 
                    (click)="toggleSort('fecha')"
                    [class.active]="filters.sortBy === 'fecha'"
                  >
                    <div class="header-cell">
                      <div class="icon-circle icon-turnos">
                        <i class="fas fa-calendar-alt"></i>
                      </div>
                      Fecha & Hora
                      <i class="fas" 
                         [class.fa-sort-up]="filters.sortBy === 'fecha' && filters.sortDir === 'asc'"
                         [class.fa-sort-down]="filters.sortBy === 'fecha' && filters.sortDir === 'desc'"
                         [class.fa-sort]="filters.sortBy !== 'fecha'">
                      </i>
                    </div>
                  </button>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-centro-atencion">
                      <i class="fas fa-hospital"></i>
                    </div>
                    Centro/Consultorio
                  </div>
                </th>
                <th>
                  <button 
                    class="header-button" 
                    (click)="toggleSort('estado')"
                    [class.active]="filters.sortBy === 'estado'"
                  >
                    <div class="header-cell">
                      <div class="icon-circle icon-turnos">
                        <i class="fas fa-info-circle"></i>
                      </div>
                      Estado
                      <i class="fas" 
                         [class.fa-sort-up]="filters.sortBy === 'estado' && filters.sortDir === 'asc'"
                         [class.fa-sort-down]="filters.sortBy === 'estado' && filters.sortDir === 'desc'"
                         [class.fa-sort]="filters.sortBy !== 'estado'">
                      </i>
                    </div>
                  </button>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-medico">
                      <i class="fas fa-history"></i>
                    </div>
                    Auditoría
                  </div>
                </th>
                <th>
                  <div class="header-cell text-center">
                    <div class="icon-circle icon-turnos">
                      <i class="fas fa-cogs"></i>
                    </div>
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let turno of resultsPage.content || []; let i = index"
                class="table-row"
                (click)="goToDetail(turno.id)"
                [style.animation-delay]="(i * 100) + 'ms'"
              >
                <td>
                  <div class="id-badge">
                    <span>{{ turno.id }}</span>
                  </div>
                </td>
                <td>
                  <div class="paciente-info">
                    <div class="paciente-avatar">
                      <span>{{ getPacienteInitials(turno.nombrePaciente, turno.apellidoPaciente) }}</span>
                    </div>
                    <div class="paciente-details">
                      <span class="paciente-name">{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</span>
                      <span class="paciente-id">ID: {{ turno.pacienteId }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="medico-info">
                    <div class="medico-avatar">
                      <span>{{ getMedicoInitials(turno.staffMedicoNombre, turno.staffMedicoApellido) }}</span>
                    </div>
                    <div class="medico-details">
                      <span class="medico-name">{{ turno.staffMedicoNombre }} {{ turno.staffMedicoApellido }}</span>
                      <span class="medico-id">Staff ID: {{ turno.staffMedicoId }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="badge-especialidades">
                    {{ turno.especialidadStaffMedico || 'Sin especialidad' }}
                  </div>
                </td>
                <td>
                  <div class="fecha-info">
                    <div class="fecha-day">{{ turno.fecha | date:'dd/MM/yyyy' }}</div>
                    <div class="fecha-time">{{ turno.horaInicio }} - {{ turno.horaFin }}</div>
                  </div>
                </td>
                <td>
                  <div class="centro-info">
                    <div class="centro-name">{{ turno.nombreCentro }}</div>
                    <div class="consultorio-name">Consultorio: {{ turno.consultorioNombre }}</div>
                  </div>
                </td>
                <td>
                  <div class="estado-badge" 
                       [class]="getEstadoBadgeClass(turno.estado)">
                    <i class="fas" [class]="getEstadoIcon(turno.estado)"></i>
                    {{ turno.estado }}
                  </div>
                </td>
                <td>
                  <div class="audit-info">
                    <div class="audit-summary" *ngIf="turno.totalModificaciones && turno.totalModificaciones > 0">
                      <span class="badge bg-warning">
                        <i class="fas fa-edit"></i>
                        {{ turno.totalModificaciones }} modificaciones
                      </span>
                      <div class="audit-details">
                        <small class="text-muted">
                          Último: {{ turno.ultimoUsuarioModificacion }}
                        </small>
                      </div>
                    </div>
                    <div class="audit-summary" *ngIf="!turno.totalModificaciones || turno.totalModificaciones === 0">
                      <span class="badge bg-success">
                        <i class="fas fa-check"></i>
                        Sin modificaciones
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-info"
                      (click)="showAuditHistory(turno); $event.stopPropagation()" 
                      title="Ver historial de auditoría"
                      *ngIf="turno.totalModificaciones && turno.totalModificaciones > 0"
                    >
                      <i class="fas fa-history"></i>
                    </button>
                    <button 
                      class="btn-action btn-edit"
                      (click)="goToEdit(turno.id); $event.stopPropagation()" 
                      title="Editar turno"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-delete"
                      (click)="confirmDelete(turno.id); $event.stopPropagation()" 
                      title="Eliminar turno"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="resultsPage.content?.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-calendar-check fa-3x mb-3 opacity-50"></i>
                  <p class="mb-0">No hay turnos registrados</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer">
          <app-pagination
            [totalPages]="resultsPage.totalPages"
            [currentPage]="currentPage"
            (pageChangeRequested)="onPageChangeRequested($event)"
            [number]="resultsPage.number"
            [hidden]="resultsPage.numberOfElements < 1"
          ></app-pagination>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* === ESTILOS DE FILTROS === */
    .filters-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #dee2e6;
    }

    .filters-title {
      color: #495057;
      margin-bottom: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .filters-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .results-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* === ESTILOS DE ORDENAMIENTO === */
    .header-button {
      background: none;
      border: none;
      width: 100%;
      padding: 0;
      cursor: pointer;
      transition: all 0.3s ease;
      color: inherit;
    }

    .header-button:hover {
      background: rgba(0,0,0,0.05);
      border-radius: 8px;
    }

    .header-button.active {
      background: var(--turnos-light);
      border-radius: 8px;
    }

    .header-button .header-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem;
    }

    /* Turnos específicos usando sistema de colores global */
    .paciente-info, .medico-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .paciente-avatar, .medico-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .paciente-avatar {
      background: var(--pacientes-gradient);
      box-shadow: 0 4px 12px var(--pacientes-shadow);
    }

    .medico-avatar {
      background: var(--medicos-gradient);
      box-shadow: 0 4px 12px var(--medicos-shadow);
    }

    .paciente-details, .medico-details {
      display: flex;
      flex-direction: column;
    }

    .paciente-name, .medico-name {
      font-weight: 600;
      color: #495057;
      font-size: 0.95rem;
      line-height: 1.2;
    }

    .paciente-id, .medico-id {
      font-size: 0.8rem;
      color: #6c757d;
      line-height: 1.2;
    }

    .fecha-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .fecha-day {
      font-weight: 600;
      color: #495057;
      font-size: 0.95rem;
    }

    .fecha-time {
      font-size: 0.85rem;
      color: #6c757d;
      background: var(--turnos-light);
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .centro-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .centro-name {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .consultorio-name {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .id-badge {
      background: var(--turnos-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px var(--turnos-shadow);
    }

    .badge-especialidades {
      background: var(--especialidades-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px var(--especialidades-shadow);
      display: inline-block;
    }

    .estado-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .estado-badge.programado {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #212529;
      box-shadow: 0 4px 12px rgba(255,193,7,0.3);
    }

    .estado-badge.confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(40,167,69,0.3);
    }

    .estado-badge.cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(220,53,69,0.3);
    }

    .estado-badge.completado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(23,162,184,0.3);
    }

    /* === ESTILOS PARA INFORMACIÓN DE AUDITORÍA === */
    .audit-info {
      text-align: center;
      padding: 0.5rem;
    }

    .audit-summary {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .audit-summary .badge {
      font-size: 0.75rem;
      padding: 0.4rem 0.6rem;
      border-radius: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .audit-summary .badge.bg-warning {
      background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%) !important;
      color: #000;
    }

    .audit-summary .badge.bg-success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
      color: white;
    }

    .audit-details {
      margin-top: 0.25rem;
    }

    .audit-details small {
      font-size: 0.7rem;
      color: #6c757d;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-action {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }

    .btn-edit {
      background: var(--action-edit);
      color: white;
    }

    .btn-edit:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px var(--action-edit-shadow);
    }

    .btn-info {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
    }

    .btn-info:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(23,162,184,0.4);
    }

    .btn-delete {
      background: var(--action-delete);
      color: white;
    }

    .btn-delete:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px var(--action-delete-shadow);
    }
  .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    
    .title-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .header-text h1 {
      color: white;
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 1rem;
    }

    .table-row:hover {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .table-row td {
      padding: 1.25rem 1rem;
      vertical-align: middle;
      border: none;
    }
    
    /* Animaciones */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .table-row {
      animation: fadeInUp 0.5s ease-out;
    }

    .table-row:nth-child(1) { animation-delay: 0.1s; }
    .table-row:nth-child(2) { animation-delay: 0.2s; }
    .table-row:nth-child(3) { animation-delay: 0.3s; }
    .table-row:nth-child(4) { animation-delay: 0.4s; }
    .table-row:nth-child(5) { animation-delay: 0.5s; }

    /* Responsive */
    @media (max-width: 992px) {
      .paciente-info, .medico-info {
        gap: 0.5rem;
      }
      
      .paciente-avatar, .medico-avatar {
        width: 32px;
        height: 32px;
        font-size: 0.8rem;
      }
      
      .fecha-info {
        font-size: 0.85rem;
      }
      
      .centro-info {
        max-width: 150px;
      }
      
      .centro-name, .consultorio-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .modern-table {
        min-width: 900px;
      }
      
      .header-cell {
        font-size: 0.8rem;
      }
      
      .table-row td {
        padding: 1rem 0.5rem;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .btn-action {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class TurnosComponent {
  resultsPage: ResultsPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    numberOfElements: 0,
    first: true,
    last: true
  };
  
  currentPage: number = 1;
  
  // Filtros de búsqueda
  filters = {
    paciente: '',
    medico: '',
    consultorio: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    sortBy: 'fecha',
    sortDir: 'desc'
  };

  private filterTimeout: any;

  constructor(
    private turnoService: TurnoService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.searchTurnos();
  }

  /** Búsqueda de turnos con filtros y paginación */
  searchTurnos(): void {
    this.turnoService.byPageAdvanced(
      this.currentPage,
      this.resultsPage.size,
      this.filters.paciente || undefined,
      this.filters.medico || undefined,
      this.filters.consultorio || undefined,
      this.filters.estado || undefined,
      this.filters.fechaDesde || undefined,
      this.filters.fechaHasta || undefined,
      this.filters.sortBy,
      this.filters.sortDir
    ).subscribe({
      next: (dataPackage) => {
        console.log('DataPackage recibido:', dataPackage);
        if (dataPackage.data) {
          this.resultsPage = {
            content: dataPackage.data.content || [],
            totalElements: dataPackage.data.totalElements || 0,
            totalPages: dataPackage.data.totalPages || 0,
            number: dataPackage.data.currentPage || 0,
            size: dataPackage.data.size || 10,
            numberOfElements: dataPackage.data.numberOfElements || 0,
            first: dataPackage.data.first || false,
            last: dataPackage.data.last || false
          };
        }
      },
      error: (error) => {
        console.error('Error al buscar turnos:', error);
        this.resultsPage = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
          numberOfElements: 0,
          first: true,
          last: true
        };
      }
    });
  }

  /** Manejo de cambios en filtros con debounce */
  onFilterChange(): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filterTimeout = setTimeout(() => {
      this.currentPage = 1; // Reset a primera página
      this.searchTurnos();
    }, 500); // Debounce de 500ms
  }

  /** Limpiar todos los filtros */
  clearFilters(): void {
    this.filters = {
      paciente: '',
      medico: '',
      consultorio: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      sortBy: 'fecha',
      sortDir: 'desc'
    };
    this.currentPage = 1;
    this.searchTurnos();
  }

  /** Toggle de ordenamiento por columna */
  toggleSort(column: string): void {
    if (this.filters.sortBy === column) {
      // Si ya está ordenando por esta columna, cambiar dirección
      this.filters.sortDir = this.filters.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una nueva columna, usar ascendente por defecto
      this.filters.sortBy = column;
      this.filters.sortDir = 'asc';
    }
    this.currentPage = 1;
    this.searchTurnos();
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar turno",
        "¿Está seguro que desea eliminar este turno?",
        "Esta acción no se puede deshacer"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  remove(id: number): void {
    this.turnoService.remove(id).subscribe({
      next: () => this.searchTurnos(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el turno.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar turno:", err);
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.searchTurnos();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/turnos', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/turnos', id], { queryParams: { edit: true } });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROGRAMADO':
        return 'programado';
      case 'CONFIRMADO':
        return 'confirmado';
      case 'CANCELADO':
        return 'cancelado';
      case 'COMPLETADO':
        return 'completado';
      default:
        return 'programado';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROGAMADO':
        return 'fa-clock';
      case 'CONFIRMADO':
        return 'fa-check-circle';
      case 'CANCELADO':
        return 'fa-times-circle';
      case 'COMPLETADO':
        return 'fa-check-double';
      default:
        return 'fa-question-circle';
    }
  }

  getPacienteInitials(nombre?: string, apellido?: string): string {
    if (!nombre && !apellido) return 'P';
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return `${n}${a}`.toUpperCase() || 'P';
  }

  getMedicoInitials(nombre?: string, apellido?: string): string {
    if (!nombre && !apellido) return 'M';
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return `${n}${a}`.toUpperCase() || 'M';
  }

  // === MÉTODOS DE AUDITORÍA ===

  /** Muestra el historial de auditoría de un turno */
  showAuditHistory(turno: Turno): void {
    // Navegar al componente de búsqueda avanzada con el turno preseleccionado
    this.router.navigate(['/turnos/advanced-search'], { 
      queryParams: { 
        turnoId: turno.id,
        showAudit: true 
      } 
    });
  }

  exportarCSV() {
    this.turnoService.exportToCSVDownload({}).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'turnos.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportarPDF() {
    this.turnoService.exportToPDFDownload({}).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'turnos.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}