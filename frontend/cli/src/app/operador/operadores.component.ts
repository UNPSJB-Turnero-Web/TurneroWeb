import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { OperadorService } from "./operador.service";
import { Operador } from "./operador";
import { ModalService } from "../modal/modal.service";
import { ResultsPage } from "../results-page";
import { PaginationComponent } from "../pagination/pagination.component";

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: "app-operadores",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  template: `
    <div class="container-fluid px-3 py-4">
      <div
        class="banner-operadores d-flex align-items-center justify-content-between mb-4"
      >
        <div class="title-section d-flex align-items-center">
          <div class="header-icon me-3">
            <i class="fas fa-user-cog"></i>
          </div>
          <div>
            <h1 class="mb-0 fw-bold">Operadores</h1>
            <p class="mb-0 opacity-75">Gestión de operadores del sistema</p>
          </div>
        </div>
        <button class="btn-new" (click)="router.navigate(['/operadores/new'])">
          <i class="fas fa-plus me-2"></i>
          <span class="d-none d-sm-inline">Nuevo Operador</span>
        </button>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filters-section card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label for="nombreFilter" class="form-label">Buscar por nombre</label>
              <input
                type="text"
                class="form-control"
                id="nombreFilter"
                [(ngModel)]="filters.nombre"
                (input)="onFilterChange()"
                placeholder="Ingrese nombre..."
                autocomplete="off"
              />
            </div>
            <div class="col-md-3">
              <label for="emailFilter" class="form-label">Buscar por email</label>
              <input
                type="text"
                class="form-control"
                id="emailFilter"
                [(ngModel)]="filters.email"
                (input)="onFilterChange()"
                placeholder="Ingrese email..."
                autocomplete="off"
              />
            </div>
            <div class="col-md-2">
              <label for="estadoFilter" class="form-label">Estado</label>
              <select
                class="form-select"
                id="estadoFilter"
                [(ngModel)]="filters.estado"
                (change)="onFilterChange()"
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="pageSizeSelect" class="form-label">Filas por página</label>
              <select
                class="form-select"
                id="pageSizeSelect"
                [(ngModel)]="pageSize"
                (change)="onPageSizeChange()"
              >
                <option [value]="5">5 filas</option>
                <option [value]="10">10 filas</option>
                <option [value]="25">25 filas</option>
                <option [value]="50">50 filas</option>
                <option [value]="100">100 filas</option>
              </select>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button
                class="btn btn-outline-secondary w-100"
                (click)="clearFilters()"
                [disabled]="!hasActiveFilters()"
              >
                <i class="fas fa-times me-1"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de operadores -->
      <div class="modern-table">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th class="border-0 py-3 ps-4">ID</th>
              <th
                class="border-0 py-3 sortable-header"
                (click)="onSortChange('nombre')"
                role="button"
                tabindex="0"
                (keydown.enter)="onSortChange('nombre')"
                (keydown.space)="onSortChange('nombre'); $event.preventDefault()"
                aria-label="Ordenar por nombre"
              >
                Nombre
                <i
                  class="fas ms-1"
                  [class.fa-sort]="sortConfig?.field !== 'nombre'"
                  [class.fa-sort-up]="sortConfig?.field === 'nombre' && sortConfig?.direction === 'asc'"
                  [class.fa-sort-down]="sortConfig?.field === 'nombre' && sortConfig?.direction === 'desc'"
                  aria-hidden="true"
                ></i>
              </th>
              <th
                class="border-0 py-3 sortable-header"
                (click)="onSortChange('apellido')"
                role="button"
                tabindex="0"
                (keydown.enter)="onSortChange('apellido')"
                (keydown.space)="onSortChange('apellido'); $event.preventDefault()"
                aria-label="Ordenar por apellido"
              >
                Apellido
                <i
                  class="fas ms-1"
                  [class.fa-sort]="sortConfig?.field !== 'apellido'"
                  [class.fa-sort-up]="sortConfig?.field === 'apellido' && sortConfig?.direction === 'asc'"
                  [class.fa-sort-down]="sortConfig?.field === 'apellido' && sortConfig?.direction === 'desc'"
                  aria-hidden="true"
                ></i>
              </th>
              <th
                class="border-0 py-3 sortable-header"
                (click)="onSortChange('email')"
                role="button"
                tabindex="0"
                (keydown.enter)="onSortChange('email')"
                (keydown.space)="onSortChange('email'); $event.preventDefault()"
                aria-label="Ordenar por email"
              >
                Email
                <i
                  class="fas ms-1"
                  [class.fa-sort]="sortConfig?.field !== 'email'"
                  [class.fa-sort-up]="sortConfig?.field === 'email' && sortConfig?.direction === 'asc'"
                  [class.fa-sort-down]="sortConfig?.field === 'email' && sortConfig?.direction === 'desc'"
                  aria-hidden="true"
                ></i>
              </th>
              <th class="border-0 py-3 text-center">Estado</th>
              <th class="border-0 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading state -->
            <tr *ngIf="loading">
              <td colspan="6" class="text-center py-5">
                <div class="d-flex justify-content-center align-items-center">
                  <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <span>Cargando operadores...</span>
                </div>
              </td>
            </tr>

            <!-- Data rows -->
            <tr
              *ngFor="let operador of resultsPage.content || []; let i = index"
              (click)="goToDetail(operador.id)"
              class="hover-operators cursor-pointer"
              [attr.aria-label]="'Operador ' + operador.nombre + ' ' + operador.apellido"
            >
              <td class="ps-4 py-3">{{ operador.id }}</td>
              <td class="py-3">{{ operador.nombre }}</td>
              <td class="py-3">{{ operador.apellido }}</td>
              <td class="py-3">{{ operador.email }}</td>
              <td class="py-3 text-center">
                <span
                  [class.active-badge]="operador.activo"
                  [class.inactive-badge]="!operador.activo"
                  [attr.aria-label]="operador.activo ? 'Estado activo' : 'Estado inactivo'"
                >
                  {{ operador.activo ? "Activo" : "Inactivo" }}
                </span>
              </td>
              <td class="py-3 text-center">
                <div class="d-flex justify-content-center gap-2">
                  <button
                    (click)="goToEdit(operador.id); $event.stopPropagation()"
                    class="btn-action btn-edit"
                    title="Editar operador"
                    aria-label="Editar operador"
                  >
                    <i class="fas fa-edit" aria-hidden="true"></i>
                  </button>
                  <button
                    (click)="
                      confirmDelete(operador.id); $event.stopPropagation()
                    "
                    class="btn-action btn-delete"
                    title="Eliminar operador"
                    aria-label="Eliminar operador"
                  >
                    <i class="fas fa-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr
              *ngIf="!loading && (!resultsPage.content || resultsPage.content.length === 0)"
            >
              <td colspan="6" class="text-center py-5">
                <div class="empty-state">
                  <i class="fas fa-user-cog fa-3x text-muted mb-3" aria-hidden="true"></i>
                  <h5 class="text-muted">No hay operadores registrados</h5>
                  <p class="text-muted small">
                    {{ hasActiveFilters() ? 'No se encontraron resultados para los filtros aplicados' : 'Comience agregando un nuevo operador al sistema' }}
                  </p>
                  <button
                    *ngIf="hasActiveFilters()"
                    class="btn btn-outline-primary mt-2"
                    (click)="clearFilters()"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="mt-4" *ngIf="!loading && resultsPage.totalPages > 1">
        <app-pagination
          [totalPages]="resultsPage.totalPages"
          [currentPage]="currentPage"
          (pageChangeRequested)="onPageChangeRequested($event)"
          [number]="resultsPage.number"
          [hidden]="resultsPage.numberOfElements < 1"
        ></app-pagination>
      </div>

      <!-- Información de resultados -->
      <div class="mt-3 text-muted small" *ngIf="!loading && resultsPage.totalElements > 0">
        Mostrando {{ resultsPage.numberOfElements }} de {{ resultsPage.totalElements }} operadores
        <span *ngIf="resultsPage.totalPages > 1">
          (página {{ currentPage }} de {{ resultsPage.totalPages }}, {{ pageSize }} filas por página)
        </span>
      </div>
    </div>
  `,
  styles: [
    `
      .cursor-pointer {
        cursor: pointer;
      }
      .empty-state {
        padding: 3rem 2rem;
      }
      .active-badge {
        color: white;
        background-color: #28a745;
        padding: 0.25rem 0.5rem;
        border-radius: 5px;
        font-size: 0.875rem;
      }
      .inactive-badge {
        color: white;
        background-color: #dc3545;
        padding: 0.25rem 0.5rem;
        border-radius: 5px;
        font-size: 0.875rem;
      }
      .filters-section {
        border: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .sortable-header {
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s;
      }
      .sortable-header:hover {
        background-color: rgba(0,0,0,0.05);
      }
      .sortable-header:focus {
        outline: 2px solid #007bff;
        outline-offset: -2px;
      }
      .btn-action {
        border: none;
        padding: 0.375rem 0.5rem;
        border-radius: 4px;
        transition: all 0.2s;
      }
      .btn-edit {
        background-color: #007bff;
        color: white;
      }
      .btn-edit:hover {
        background-color: #0056b3;
      }
      .btn-delete {
        background-color: #dc3545;
        color: white;
      }
      .btn-delete:hover {
        background-color: #c82333;
      }
      @media (max-width: 768px) {
        .modern-table {
          font-size: 0.875rem;
        }
        .filters-section .row > div {
          margin-bottom: 1rem;
        }
        .filters-section .col-md-3,
        .filters-section .col-md-2 {
          flex: 0 0 100%;
          max-width: 100%;
        }
      }
    `,
  ],
})
  
export class OperadoresComponent implements OnInit {
  resultsPage: ResultsPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    numberOfElements: 0,
    first: true,
    last: true,
  };

  currentPage: number = 1;
  loading: boolean = false;
  pageSize: number = 10; // Tamaño de página por defecto

  // Configuración de filtros
  filters = {
    nombre: '',
    email: '',
    estado: ''
  };

  // Configuración de ordenamiento
  sortConfig: SortConfig | null = null;

  constructor(
    private operadorService: OperadorService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadOperadores();
  }

  /**
   * Carga los operadores con los filtros y ordenamiento actuales
   */
   loadOperadores(): void {
    this.loading = true;

    this.operadorService
      .findByPage(
        this.currentPage,
        this.pageSize,
        this.filters.nombre?.trim() || undefined,
        this.filters.email?.trim() || undefined,
        this.filters.estado?.trim() || undefined,
        this.sortConfig?.field,
        this.sortConfig?.direction
      )
      .subscribe({
        next: (dataPackage) => {
          this.resultsPage = <ResultsPage>dataPackage.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar operadores:', error);
          this.modalService.alert(
            'Error',
            'No se pudieron cargar los operadores. Intente nuevamente.'
          );
          this.loading = false;
        }
      });
  }

  /**
   * Maneja el cambio de página
   */
  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.loadOperadores();
  }

  /**
   * Maneja el cambio de filtros
   */
  onFilterChange(): void {
    // Resetear a página 1 cuando cambian los filtros
    this.currentPage = 1;
    this.loadOperadores();
  }

  /**
   * Maneja el cambio de tamaño de página
   */
  onPageSizeChange(): void {
    this.currentPage = 1; // Resetear a página 1 cuando cambia el tamaño
    this.loadOperadores();
  }

  /**
   * Maneja el cambio de ordenamiento por columna
   */
  onSortChange(field: string): void {
    if (this.sortConfig?.field === field) {
      // Cambiar dirección si es el mismo campo
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Nuevo campo, orden ascendente por defecto
      this.sortConfig = { field, direction: 'asc' };
    }
    this.currentPage = 1; // Resetear a página 1
    this.loadOperadores();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filters = { nombre: '', email: '', estado: '' };
    this.currentPage = 1;
    this.loadOperadores();
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(this.filters.nombre || this.filters.email || this.filters.estado);
  }

  /**
   * Confirma y elimina un operador
   */
  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar operador",
        "Eliminar operador",
        "¿Está seguro que desea eliminar el operador?"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  /**
   * Elimina un operador
   */
  remove(id: number): void {
    this.operadorService.remove(id).subscribe({
      next: () => this.loadOperadores(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el operador.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar operador:", err);
      },
    });
  }

  /**
   * Navega al detalle del operador
   */
  goToDetail(id: number): void {
    this.router.navigate(["/operadores", id]);
  }

  /**
   * Navega a la edición del operador
   */
  goToEdit(id: number): void {
    this.router.navigate(["/operadores", id], { queryParams: { edit: true } });
  }
}
