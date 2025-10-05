import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DisponibilidadMedicoService } from "./disponibilidadMedico.service";
import { DisponibilidadMedico } from "./disponibilidadMedico";
import { ModalService } from "../modal/modal.service";
import { ResultsPage } from "../results-page";
import { PaginationComponent } from "../pagination/pagination.component";
import { StaffMedicoService } from "../staffMedicos/staffMedico.service";
import { StaffMedico } from "../staffMedicos/staffMedico";

@Component({
  selector: "app-disponibilidad-medico",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="card modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-disponibilidad">
          <div class="header-content">
            <div class="title-section">
              <div class="icon-disponibilidad">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="header-text">
                <h1>Disponibilidad Médica</h1>
                <p>Gestión de horarios y disponibilidad de médicos</p>
              </div>
            </div>
            <button
              class="btn btn-new"
              (click)="router.navigate(['/disponibilidades-medico/new'])"
            >
              <i class="fas fa-plus me-2"></i>
              Nueva Disponibilidad
            </button>
          </div>
        </div>

        <!-- FILTROS DE BÚSQUEDA -->
        <div class="filters-section">
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label for="staffMedicoFilter" class="form-label"
                >Staff Médico</label
              >
              <input
                type="text"
                class="form-control"
                id="staffMedicoFilter"
                placeholder="Buscar por nombre o apellido..."
                [(ngModel)]="filters.staffMedico"
                (input)="applyFilters()"
              />
            </div>
            <div class="col-md-3">
              <label for="especialidadFilter" class="form-label"
                >Especialidad</label
              >
              <input
                type="text"
                class="form-control"
                id="especialidadFilter"
                placeholder="Buscar por especialidad..."
                [(ngModel)]="filters.especialidad"
                (input)="applyFilters()"
              />
            </div>
            <div class="col-md-2">
              <label for="diaFilter" class="form-label">Día</label>
              <select
                class="form-select"
                id="diaFilter"
                [(ngModel)]="filters.dia"
                (change)="applyFilters()"
              >
                <option value="">Todos los días</option>
                <option *ngFor="let dia of diasSemana" [value]="dia.value">
                  {{ dia.label }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="pageSizeSelect" class="form-label">Mostrar</label>
              <select
                class="form-select"
                id="pageSizeSelect"
                [(ngModel)]="pageSize"
                (change)="changePageSize($any($event.target).value)"
              >
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
            </div>
            <div class="col-md-2">
              <button
                type="button"
                class="btn btn-outline-secondary w-100"
                (click)="clearFilters()"
              >
                <i class="fas fa-times me-1"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <!-- INDICADORES DE RESULTADOS -->
        <div class="results-info" *ngIf="!loading">
          <small class="text-muted">
            Mostrando {{ disponibilidades.length }} de
            {{ totalElements }} resultados (Página {{ currentPage + 1 }} de
            {{ totalPages }})
          </small>
        </div>

        <!-- TABLA MODERNA NORMALIZADA -->
        <div class="table-container">
          <div class="table-responsive">
            <table class="table modern-table">
              <thead>
                <tr>
                  <th class="sortable-header" (click)="sortByColumn('id')">
                    <div class="header-cell">
                      <div class="icon-circle icon-centro-atencion">
                        <i class="fas fa-hashtag"></i>
                      </div>
                      Identificador
                      <span class="sort-indicator">{{
                        getSortIndicator("id")
                      }}</span>
                    </div>
                  </th>
                  <th
                    class="sortable-header"
                    (click)="sortByColumn('staffMedicoName')"
                  >
                    <div class="header-cell">
                      <div class="icon-circle icon-medicos">
                        <i class="fas fa-user-md"></i>
                      </div>
                      Staff Médico
                      <span class="sort-indicator">{{
                        getSortIndicator("staffMedicoName")
                      }}</span>
                    </div>
                  </th>
                  <th>
                    <div class="header-cell">
                      <div class="icon-circle icon-disponibilidad">
                        <i class="fas fa-clock"></i>
                      </div>
                      Horarios de Disponibilidad
                    </div>
                  </th>
                  <th>
                    <div class="header-cell">
                      <div class="icon-circle icon-obra-social">
                        <i class="fas fa-cogs"></i>
                      </div>
                      Acciones
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="loading" class="text-center">
                  <td colspan="4">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                    <span class="ms-2">Cargando disponibilidades...</span>
                  </td>
                </tr>
                <tr
                  *ngFor="let disp of disponibilidades; let i = index"
                  class="table-row"
                  [class.even]="i % 2 === 0"
                  [class.odd]="i % 2 !== 0"
                  (click)="goToDetail(disp.id)"
                >
                  <td>
                    <span class="badge-centro-atencion">{{ disp.id }}</span>
                  </td>
                  <td>
                    <div class="staff-info">
                      <div class="avatar-medicos">
                        {{ getInitials(disp.staffMedicoId) }}
                      </div>
                      <div class="staff-details">
                        <div class="staff-name">
                          {{
                            disp.staffMedicoName ||
                              getStaffMedicoNombre(disp.staffMedicoId)
                          }}
                        </div>
                        <div class="badge-especialidades">
                          {{
                            disp.especialidadName ||
                              getStaffEspecialidad(disp.staffMedicoId)
                          }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="horarios-container">
                      <div
                        *ngFor="let horario of disp.horarios"
                        class="badge-disponibilidad"
                      >
                        <span class="dia-label">{{ horario.dia }}</span>
                        <span class="hora-range"
                          >{{ horario.horaInicio }} -
                          {{ horario.horaFin }}</span
                        >
                      </div>
                      <div
                        *ngIf="!disp.horarios || disp.horarios.length === 0"
                        class="no-horarios"
                      >
                        Sin horarios configurados
                      </div>
                    </div>
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button
                        (click)="goToEdit(disp.id); $event.stopPropagation()"
                        class="btn-action btn-edit"
                        title="Editar disponibilidad"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        (click)="
                          confirmDelete(disp.id); $event.stopPropagation()
                        "
                        class="btn-action btn-delete"
                        title="Eliminar disponibilidad"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="disponibilidades.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">
                    <i
                      class="fas fa-calendar-times fa-3x mb-3 d-block opacity-50"
                    ></i>
                    No hay disponibilidades registradas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- PAGINACIÓN -->
          <div class="pagination-container" *ngIf="totalPages > 1">
            <app-pagination
              [currentPage]="currentPage + 1"
              [totalPages]="totalPages"
              (pageChangeRequested)="changePage($event - 1)"
            ></app-pagination>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Estilos normalizados usando el sistema global de colores */
      .container-fluid {
        max-width: 1400px;
        margin: 0 auto;
      }

      .modern-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        border: none;
        overflow: hidden;
        backdrop-filter: blur(10px);
      }

      .table-container {
        padding: 0;
        overflow-x: auto;
      }

      .modern-table {
        margin: 0;
        border-collapse: separate;
        border-spacing: 0;
      }

      .modern-table thead th {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: none;
        padding: 1.5rem 1rem;
        font-weight: 600;
        color: #495057;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .header-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .icon-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 600;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .table-row {
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        background: white;
      }

      .table-row.even {
        background: var(--disponibilidad-light);
      }

      .table-row.odd {
        background: white;
      }

      .table-row:hover {
        background: var(--disponibilidad-light);
        transform: translateY(-1px);
        box-shadow: 0 8px 25px var(--disponibilidad-shadow);
      }

      .table-row td {
        padding: 1.25rem 1rem;
        border: none;
        vertical-align: middle;
      }

      .staff-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .staff-details {
        flex: 1;
      }

      .staff-name {
        font-weight: 600;
        color: #495057;
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }

      .horarios-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .dia-label {
        font-size: 0.7rem;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .hora-range {
        font-weight: 600;
        font-size: 0.75rem;
      }

      .no-horarios {
        color: #636e72;
        font-style: italic;
        font-size: 0.9rem;
        background: linear-gradient(135deg, #f1f2f6 0%, #e3e4e8 100%);
        padding: 8px 12px;
        border-radius: 12px;
      }

      .actions-cell {
        text-align: center;
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
      }

      .btn-action {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .btn-action::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transition: all 0.3s ease;
        transform: translate(-50%, -50%);
      }

      .btn-action:hover::before {
        width: 100px;
        height: 100px;
      }

      .btn-edit {
        background: var(--centro-atencion-gradient);
        color: white;
        box-shadow: 0 4px 12px var(--centro-atencion-shadow);
      }

      .btn-edit:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px var(--centro-atencion-shadow);
      }

      .btn-delete {
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
      }

      .btn-delete:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(220, 53, 69, 0.5);
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
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .header-text p {
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-size: 1rem;
      }

      .table-row:hover {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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

      .table-row:nth-child(1) {
        animation-delay: 0.1s;
      }
      .table-row:nth-child(2) {
        animation-delay: 0.2s;
      }
      .table-row:nth-child(3) {
        animation-delay: 0.3s;
      }
      .table-row:nth-child(4) {
        animation-delay: 0.4s;
      }
      .table-row:nth-child(5) {
        animation-delay: 0.5s;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .container-fluid {
          padding: 1rem;
        }

        .header-content {
          flex-direction: column;
          gap: 1rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .modern-table {
          min-width: 700px;
        }

        .header-cell {
          font-size: 0.8rem;
        }

        .table-row td {
          padding: 1rem 0.5rem;
        }

        .staff-info {
          flex-direction: column;
          text-align: center;
          gap: 0.5rem;
        }

        .horarios-container {
          justify-content: center;
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

      /* FILTROS Y BÚSQUEDA */
      .filters-section {
        padding: 1.5rem;
        border-bottom: 1px solid #e9ecef;
        background-color: #f8f9fa;
      }

      .results-info {
        padding: 0.75rem 1.5rem;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        font-size: 0.875rem;
      }

      /* CABECERAS ORDENABLES */
      .sortable-header {
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s;
      }

      .sortable-header:hover {
        background-color: rgba(0, 123, 255, 0.1);
      }

      .sort-indicator {
        margin-left: 0.5rem;
        font-weight: bold;
        color: #007bff;
      }

      /* PAGINACIÓN */
      .pagination-container {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e9ecef;
        background-color: #f8f9fa;
      }

      /* RESPONSIVE PARA FILTROS */
      @media (max-width: 768px) {
        .filters-section .row {
          --bs-gutter-x: 0.5rem;
        }

        .filters-section .col-md-3,
        .filters-section .col-md-2 {
          margin-bottom: 1rem;
        }
      }
    `,
  ],
})
export class DisponibilidadMedicoComponent {
  // Data
  disponibilidades: DisponibilidadMedico[] = [];
  staffMedicos: StaffMedico[] = [];

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Filters
  filters = {
    staffMedico: "",
    especialidad: "",
    dia: "",
  };

  // Sorting
  sortBy = "id";
  sortDir: "asc" | "desc" = "asc";

  // UI state
  loading = false;
  diasSemana = [
    { value: "LUNES", label: "Lunes" },
    { value: "MARTES", label: "Martes" },
    { value: "MIERCOLES", label: "Miércoles" },
    { value: "JUEVES", label: "Jueves" },
    { value: "VIERNES", label: "Viernes" },
    { value: "SABADO", label: "Sábado" },
    { value: "DOMINGO", label: "Domingo" },
  ];

  constructor(
    private disponibilidadService: DisponibilidadMedicoService,
    private staffMedicoService: StaffMedicoService,
    public router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadDisponibilidades();
    this.getStaffMedicos();
  }

  /** Carga las disponibilidades con paginación, filtros y ordenamiento */
  loadDisponibilidades(): void {
    this.loading = true;
    this.disponibilidadService
      .getPaged(
        this.currentPage,
        this.pageSize,
        this.filters,
        this.sortBy,
        this.sortDir
      )
      .subscribe({
        next: (dataPackage) => {
          const data = dataPackage.data;
          this.disponibilidades = data.content;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
          this.currentPage = data.currentPage;
          this.loading = false;
        },
        error: (err) => {
          console.error("Error al cargar disponibilidades:", err);
          this.loading = false;
          // TODO: Mostrar mensaje de error al usuario
        },
      });
  }

  /** @deprecated Use loadDisponibilidades instead */
  getDisponibilidades(): void {
    this.loadDisponibilidades();
  }

  getStaffMedicos(): void {
    this.staffMedicoService.all().subscribe((dataPackage) => {
      this.staffMedicos = dataPackage.data as StaffMedico[];
    });
  }

  /** Aplica los filtros y recarga los datos */
  applyFilters(): void {
    this.currentPage = 0; // Reset to first page when filtering
    this.loadDisponibilidades();
  }

  /** Limpia todos los filtros */
  clearFilters(): void {
    this.filters = { staffMedico: "", especialidad: "", dia: "" };
    this.currentPage = 0;
    this.loadDisponibilidades();
  }

  /** Cambia el ordenamiento por columna */
  sortByColumn(column: string): void {
    if (this.sortBy === column) {
      // Toggle direction if same column
      this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
    } else {
      // New column, default to ascending
      this.sortBy = column;
      this.sortDir = "asc";
    }
    this.loadDisponibilidades();
  }

  /** Cambia de página */
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadDisponibilidades();
    }
  }

  /** Cambia el tamaño de página */
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadDisponibilidades();
  }

  /** Obtiene el indicador de ordenamiento para una columna */
  getSortIndicator(column: string): string {
    if (this.sortBy !== column) return "";
    return this.sortDir === "asc" ? "↑" : "↓";
  }

  getStaffMedicoNombre(staffMedicoId: number): string {
    const staff = this.staffMedicos.find((s) => s.id === staffMedicoId);
    if (!staff || !staff.medico) return "Sin asignar";
    return `${staff.medico.nombre} ${staff.medico.apellido}`;
  }

  getStaffEspecialidad(staffMedicoId: number): string {
    const staff = this.staffMedicos.find((s) => s.id === staffMedicoId);
    return staff?.especialidad?.nombre || "Sin especialidad";
  }

  getInitials(staffMedicoId: number): string {
    const staff = this.staffMedicos.find((s) => s.id === staffMedicoId);
    if (!staff || !staff.medico) return "?";

    const nombre = staff.medico.nombre?.charAt(0) || "";
    const apellido = staff.medico.apellido?.charAt(0) || "";
    return (nombre + apellido).toUpperCase();
  }

  goToDetail(id: number): void {
    this.router.navigate(["/disponibilidades-medico", id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(["/disponibilidades-medico", id], {
      queryParams: { edit: true },
    });
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar Disponibilidad",
        "¿Está seguro que desea eliminar esta disponibilidad?",
        "Si elimina la disponibilidad no podrá asignar turnos en ese horario"
      )
      .then(() => {
        this.disponibilidadService.remove(id).subscribe({
          next: () => this.loadDisponibilidades(),
          error: (err) => {
            const msg =
              err?.error?.message || "Error al eliminar la disponibilidad.";
            alert(msg);
            console.error("Error al eliminar disponibilidad:", err);
          },
        });
      });
  }
}
