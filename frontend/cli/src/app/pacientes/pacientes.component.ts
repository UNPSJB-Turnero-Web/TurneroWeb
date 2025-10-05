import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PacienteService } from './paciente.service';
import { Paciente } from './paciente';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';
import { FormsModule } from '@angular/forms';

interface PacienteFilters {
  nombreApellido?: string;
  documento?: string;
  email?: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent, FormsModule],
  template: `
    <div class="container-fluid px-3 py-4">
      <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
      <div class="banner-pacientes d-flex align-items-center justify-content-between mb-4">
        <div class="title-section d-flex align-items-center">
          <div class="header-icon me-3">
            <i class="fas fa-user-injured"></i>
          </div>
          <div>
            <h1 class="mb-0 fw-bold">Pacientes</h1>
            <p class="mb-0 opacity-75">Gestión de pacientes registrados</p>
          </div>
        </div>
        <button class="btn-new" (click)="router.navigate(['/pacientes/new'])">
          <i class="fas fa-plus me-2"></i>
          <span class="d-none d-sm-inline">Nuevo Paciente</span>
        </button>
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTROS -->
      <div class="search-filters-card mb-4">
        <div class="row g-3">
          <!-- Búsqueda unificada por nombre o apellido -->
          <div class="col-md-4">
            <label for="nombreApellidoFilter" class="form-label fw-semibold">
              <i class="fas fa-user me-1 text-pacientes"></i>Nombre o Apellido
            </label>
            <input
              type="text"
              id="nombreApellidoFilter"
              class="form-control"
              placeholder="Buscar por nombre o apellido..."
              [(ngModel)]="filters.nombreApellido"
              (input)="onFilterChange()"
              autocomplete="off">
          </div>

          <!-- Búsqueda por documento -->
          <div class="col-md-4">
            <label for="documentoFilter" class="form-label fw-semibold">
              <i class="fas fa-id-card me-1 text-pacientes"></i>DNI/Documento
            </label>
            <input
              type="text"
              id="documentoFilter"
              class="form-control"
              placeholder="Buscar por documento..."
              [(ngModel)]="filters.documento"
              (input)="onFilterChange()"
              autocomplete="off">
          </div>

          <!-- Búsqueda por email -->
          <div class="col-md-4">
            <label for="emailFilter" class="form-label fw-semibold">
              <i class="fas fa-envelope me-1 text-pacientes"></i>Email
            </label>
            <input
              type="email"
              id="emailFilter"
              class="form-control"
              placeholder="Buscar por email..."
              [(ngModel)]="filters.email"
              (input)="onFilterChange()"
              autocomplete="off">
          </div>
        </div>

        <!-- Fila adicional para controles -->
        <div class="row g-3 mt-2">
          <div class="col-md-3">
            <label class="form-label fw-semibold">
              <i class="fas fa-list me-1 text-pacientes"></i>Registros por página
            </label>
            <select
              class="form-select"
              [(ngModel)]="pageSize"
              (change)="onPageSizeChange()">
              <option [value]="10">10 registros</option>
              <option [value]="25">25 registros</option>
              <option [value]="50">50 registros</option>
              <option [value]="100">100 registros</option>
            </select>
          </div>

          <div class="col-md-6 d-flex align-items-end">
            <div class="d-flex gap-2 w-100">
              <button
                class="btn btn-outline-secondary flex-fill"
                (click)="clearFilters()"
                [disabled]="!hasActiveFilters()">
                <i class="fas fa-times me-1"></i>Limpiar filtros
              </button>
              <button
                class="btn btn-pacientes flex-fill"
                (click)="refreshData()"
                [disabled]="isLoading">
                <i class="fas fa-sync-alt me-1" [class.fa-spin]="isLoading"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <!-- Información de resultados -->
        <div class="row mt-3" *ngIf="resultsPage.totalElements > 0">
          <div class="col-12">
            <div class="results-info text-muted small">
              <i class="fas fa-info-circle me-1"></i>
              Mostrando {{ resultsPage.numberOfElements }} de {{ resultsPage.totalElements }} pacientes
              <span *ngIf="hasActiveFilters()" class="ms-2">
                (filtrados de {{ totalUnfiltered }} registros totales)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLA MODERNA CON SISTEMA GLOBAL -->
      <div class="modern-table">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th class="border-0 py-3 ps-4">
                <div class="header-cell">
                  <div class="icon-circle id-header">
                    <i class="fas fa-hashtag"></i>
                  </div>
                  <span>ID</span>
                </div>
              </th>
              <th class="border-0 py-3 sortable-header" (click)="sortBy('nombre')">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-user"></i>
                  </div>
                  <span>Nombre</span>
                  <i class="fas fa-sort sort-icon ms-2"
                     [class.fa-sort-up]="sortConfig.field === 'nombre' && sortConfig.direction === 'asc'"
                     [class.fa-sort-down]="sortConfig.field === 'nombre' && sortConfig.direction === 'desc'"></i>
                </div>
              </th>
              <th class="border-0 py-3 sortable-header" (click)="sortBy('apellido')">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-user-tag"></i>
                  </div>
                  <span>Apellido</span>
                  <i class="fas fa-sort sort-icon ms-2"
                     [class.fa-sort-up]="sortConfig.field === 'apellido' && sortConfig.direction === 'asc'"
                     [class.fa-sort-down]="sortConfig.field === 'apellido' && sortConfig.direction === 'desc'"></i>
                </div>
              </th>
              <th class="border-0 py-3 sortable-header" (click)="sortBy('email')">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <span>Email</span>
                  <i class="fas fa-sort sort-icon ms-2"
                     [class.fa-sort-up]="sortConfig.field === 'email' && sortConfig.direction === 'asc'"
                     [class.fa-sort-down]="sortConfig.field === 'email' && sortConfig.direction === 'desc'"></i>
                </div>
              </th>
              <th class="border-0 py-3">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-phone"></i>
                  </div>
                  <span>Teléfono</span>
                </div>
              </th>
              <th class="border-0 py-3 sortable-header" (click)="sortBy('dni')">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-id-card"></i>
                  </div>
                  <span>DNI</span>
                  <i class="fas fa-sort sort-icon ms-2"
                     [class.fa-sort-up]="sortConfig.field === 'dni' && sortConfig.direction === 'asc'"
                     [class.fa-sort-down]="sortConfig.field === 'dni' && sortConfig.direction === 'desc'"></i>
                </div>
              </th>
              <th class="border-0 py-3 sortable-header" (click)="sortBy('fechaNacimiento')">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <span>Fecha Nac.</span>
                  <i class="fas fa-sort sort-icon ms-2"
                     [class.fa-sort-up]="sortConfig.field === 'fechaNacimiento' && sortConfig.direction === 'asc'"
                     [class.fa-sort-down]="sortConfig.field === 'fechaNacimiento' && sortConfig.direction === 'desc'"></i>
                </div>
              </th>
              <th class="border-0 py-3">
                <div class="header-cell">
                  <div class="icon-circle icon-obra-social">
                    <i class="fas fa-hospital"></i>
                  </div>
                  <span>Obra Social</span>
                </div>
              </th>
              <th class="border-0 py-3 text-center">
                <div class="header-cell justify-content-center">
                  <div class="icon-circle actions-header">
                    <i class="fas fa-cogs"></i>
                  </div>
                  <span>Acciones</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading state -->
            <tr *ngIf="isLoading">
              <td colspan="9" class="text-center py-5">
                <div class="loading-state">
                  <i class="fas fa-spinner fa-spin fa-2x text-pacientes mb-3"></i>
                  <h6 class="text-muted">Cargando pacientes...</h6>
                </div>
              </td>
            </tr>

            <!-- Data rows -->
            <tr *ngFor="let paciente of resultsPage.content || []; let i = index"
                (click)="goToDetail(paciente.id)"
                class="hover-pacientes cursor-pointer">
              <td class="ps-4 py-3">
                <span class="badge-pacientes">{{ paciente.id }}</span>
              </td>
              <td class="py-3">
                <div class="fw-medium text-dark">{{ paciente.nombre }}</div>
              </td>
              <td class="py-3">
                <div class="fw-medium text-dark">{{ paciente.apellido }}</div>
              </td>
              <td class="py-3">
                <div class="text-muted small d-flex align-items-center">
                  <i class="fas fa-envelope me-2 text-pacientes"></i>
                  {{ paciente.email }}
                </div>
              </td>
              <td class="py-3">
                <div class="text-muted d-flex align-items-center">
                  <i class="fas fa-phone me-2 text-pacientes"></i>
                  {{ paciente.telefono }}
                </div>
              </td>
              <td class="py-3">
                <span class="chip-pacientes">{{ paciente.dni }}</span>
              </td>
              <td class="py-3">
                <div class="text-muted small d-flex align-items-center">
                  <i class="fas fa-calendar me-2 text-pacientes"></i>
                  {{ paciente.fechaNacimiento | date: 'dd/MM/yyyy' }}
                </div>
              </td>
              <td class="py-3">
                <span class="badge-obra-social"
                      [class.chip-obra-social]="!paciente.obraSocial?.nombre">
                  <i class="fas fa-hospital me-1"></i>
                  {{ paciente.obraSocial?.nombre || 'Sin obra social' }}
                </span>
              </td>
              <td class="py-3 text-center">
                <div class="d-flex justify-content-center gap-2">
                  <button (click)="goToEdit(paciente.id); $event.stopPropagation()"
                          class="btn-action btn-edit"
                          title="Editar paciente">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button (click)="confirmDelete(paciente.id); $event.stopPropagation()"
                          class="btn-action btn-delete"
                          title="Eliminar paciente">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr *ngIf="!isLoading && (!resultsPage.content || resultsPage.content.length === 0)">
              <td colspan="9" class="text-center py-5">
                <div class="empty-state">
                  <i class="fas fa-user-injured fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay pacientes registrados</h5>
                  <p class="text-muted small">
                    {{ hasActiveFilters() ? 'No se encontraron pacientes con los filtros aplicados' : 'Comience agregando un nuevo paciente al sistema' }}
                  </p>
                  <button *ngIf="hasActiveFilters()" class="btn btn-outline-primary mt-2" (click)="clearFilters()">
                    <i class="fas fa-times me-1"></i>Limpiar filtros
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINACIÓN -->
      <div class="mt-4" *ngIf="!isLoading && resultsPage.totalPages > 1">
        <app-pagination
          [totalPages]="resultsPage.totalPages"
          [currentPage]="currentPage"
          (pageChangeRequested)="onPageChangeRequested($event)"
          [number]="resultsPage.number"
          [hidden]="resultsPage.numberOfElements < 1"
        ></app-pagination>
      </div>
    </div>
  `,
  styles: [`
    /* SISTEMA GLOBAL DE COLORES - COMPONENTE PACIENTES NORMALIZADO */

    .cursor-pointer {
      cursor: pointer;
    }

    .empty-state, .loading-state {
      padding: 3rem 2rem;
    }

    /* Barra de búsqueda y filtros */
    .search-filters-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .form-label {
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .form-control, .form-select {
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
    }

    .form-control:focus, .form-select:focus {
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .btn-pacientes {
      background-color: #007bff;
      border-color: #007bff;
      color: white;
    }

    .btn-pacientes:hover {
      background-color: #0056b3;
      border-color: #004085;
    }

    .results-info {
      background-color: #f8f9fa;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid #e9ecef;
    }

    /* Headers ordenables */
    .sortable-header {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;
    }

    .sortable-header:hover {
      background-color: rgba(0, 123, 255, 0.1);
    }

    .sort-icon {
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .sortable-header:hover .sort-icon {
      opacity: 1;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header-cell span {
        font-size: 0.875rem;
      }

      .modern-table {
        font-size: 0.875rem;
      }

      .search-filters-card .row > div {
        margin-bottom: 1rem;
      }

      .btn-action {
        padding: 0.375rem 0.5rem;
        font-size: 0.875rem;
      }
    }

    @media (max-width: 576px) {
      .search-filters-card {
        padding: 1rem;
      }

      .title-section h1 {
        font-size: 1.5rem;
      }

      .btn-new span {
        display: none;
      }
    }
  `]
})
export class PacientesComponent implements OnInit {
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
  pageSize: number = 10;
  isLoading: boolean = false;
  totalUnfiltered: number = 0;

  filters: PacienteFilters = {
    nombreApellido: '',
    documento: '',
    email: ''
  };

  sortConfig: SortConfig = {
    field: '',
    direction: 'asc'
  };

  // Debounce para búsqueda
  private searchTimeout: any;

  constructor(
    private pacienteService: PacienteService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadTotalCount();
    this.getPacientes();
  }

  /**
   * Carga el conteo total de pacientes sin filtros para mostrar información
   */
  private loadTotalCount(): void {
    this.pacienteService.byPageAdvanced(1, 1).subscribe({
      next: (dataPackage) => {
        this.totalUnfiltered = dataPackage.data.totalElements;
      },
      error: (err) => {
        console.error('Error al cargar conteo total:', err);
      }
    });
  }

  /**
   * Obtiene pacientes con filtros, ordenamiento y paginación
   */
  getPacientes(): void {
    this.isLoading = true;

    this.pacienteService.byPageAdvanced(
      this.currentPage,
      this.pageSize,
      this.filters,
      this.sortConfig.field || undefined,
      this.sortConfig.direction
    ).subscribe({
      next: (dataPackage) => {
        this.resultsPage = <ResultsPage>dataPackage.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.status_text || 'Error al cargar pacientes';
        this.modalService.alert('Error', msg);
        console.error('Error al cargar pacientes:', err);
      }
    });
  }

  /**
   * Maneja cambios en filtros con debounce para evitar llamadas excesivas
   */
  onFilterChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1; // Resetear a primera página al filtrar
      this.getPacientes();
    }, 300);
  }

  /**
   * Cambia el ordenamiento por una columna
   * @param field Campo por el cual ordenar
   */
  sortBy(field: string): void {
    if (this.sortConfig.field === field) {
      // Cambiar dirección si es el mismo campo
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Nuevo campo, comenzar con ascendente
      this.sortConfig.field = field;
      this.sortConfig.direction = 'asc';
    }

    this.getPacientes();
  }

  /**
   * Maneja cambio de tamaño de página
   */
  onPageSizeChange(): void {
    this.currentPage = 1; // Resetear a primera página
    this.getPacientes();
  }

  /**
   * Maneja cambio de página desde el componente de paginación
   */
  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getPacientes();
  }

  /**
   * Limpia todos los filtros aplicados
   */
  clearFilters(): void {
    this.filters = {
      nombreApellido: '',
      documento: '',
      email: ''
    };
    this.currentPage = 1;
    this.getPacientes();
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(this.filters.nombreApellido || this.filters.documento || this.filters.email);
  }

  /**
   * Refresca los datos manualmente
   */
  refreshData(): void {
    this.getPacientes();
  }

  /**
   * Confirma eliminación de paciente
   */
  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar paciente",
        "Eliminar paciente",
        "¿Está seguro que desea eliminar el paciente?"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  /**
   * Elimina un paciente
   */
  remove(id: number): void {
    this.pacienteService.remove(id).subscribe({
      next: () => {
        this.modalService.alert('Éxito', 'Paciente eliminado correctamente');
        this.getPacientes();
      },
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el paciente.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar paciente:", err);
      }
    });
  }

  /**
   * Navega al detalle del paciente
   */
  goToDetail(id: number): void {
    this.router.navigate(['/pacientes', id]);
  }

  /**
   * Navega a la edición del paciente
   */
  goToEdit(id: number): void {
    this.router.navigate(['/pacientes', id], { queryParams: { edit: true } });
  }
}