import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ObraSocialService } from './obraSocial.service';
import { ObraSocial } from './obraSocial';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-obra-social',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-obra-social">
          <div class="header-content">
            <div class="title-section">
              <div class="header-icon">
                <i class="fas fa-heart-pulse"></i>
              </div>
              <div class="header-text">
                <h1>Obras Sociales</h1>
                <p>Gestión de obras sociales del sistema</p>
              </div>
            </div>
            <button 
              class="btn btn-banner"
              (click)="router.navigate(['/obraSocial/new'])"
            >
              <i class="fas fa-plus me-2"></i>
              Nueva Obra Social
            </button>
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
              <!-- Filtro por Nombre -->
              <div class="col-md-4">
                <label for="nombreFilter" class="form-label">
                  <i class="fas fa-heart-pulse me-1"></i>
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombreFilter"
                  class="form-control"
                  placeholder="Buscar por nombre"
                  [(ngModel)]="filters.nombre"
                  (input)="onFilterChange()"
                />
              </div>

              <!-- Filtro por Código -->
              <div class="col-md-4">
                <label for="codigoFilter" class="form-label">
                  <i class="fas fa-barcode me-1"></i>
                  Código
                </label>
                <input
                  type="text"
                  id="codigoFilter"
                  class="form-control"
                  placeholder="Buscar por código"
                  [(ngModel)]="filters.codigo"
                  (input)="onFilterChange()"
                />
              </div>

              <!-- Ordenamiento -->
              <div class="col-md-2">
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
                  <option value="nombre">Nombre</option>
                  <option value="codigo">Código</option>
                </select>
              </div>

              <!-- Dirección de ordenamiento -->
              <div class="col-md-2">
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
                    <div class="icon-circle id-header">
                      <i class="fas fa-hashtag"></i>
                    </div>
                    ID
                  </div>
                </th>
                <th>
                  <button 
                    class="header-button" 
                    (click)="toggleSort('nombre')"
                    [class.active]="filters.sortBy === 'nombre'"
                  >
                    <div class="header-cell">
                      <div class="icon-circle obra-social-header">
                        <i class="fas fa-heart-pulse"></i>
                      </div>
                      Nombre
                      <i class="fas" 
                         [class.fa-sort-up]="filters.sortBy === 'nombre' && filters.sortDir === 'asc'"
                         [class.fa-sort-down]="filters.sortBy === 'nombre' && filters.sortDir === 'desc'"
                         [class.fa-sort]="filters.sortBy !== 'nombre'">
                      </i>
                    </div>
                  </button>
                </th>
                <th>
                  <button 
                    class="header-button" 
                    (click)="toggleSort('codigo')"
                    [class.active]="filters.sortBy === 'codigo'"
                  >
                    <div class="header-cell">
                      <div class="icon-circle obra-social-header">
                        <i class="fas fa-barcode"></i>
                      </div>
                      Código
                      <i class="fas" 
                         [class.fa-sort-up]="filters.sortBy === 'codigo' && filters.sortDir === 'asc'"
                         [class.fa-sort-down]="filters.sortBy === 'codigo' && filters.sortDir === 'desc'"
                         [class.fa-sort]="filters.sortBy !== 'codigo'">
                      </i>
                    </div>
                  </button>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle obra-social-header">
                      <i class="fas fa-file-text"></i>
                    </div>
                    Descripción
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle actions-header">
                      <i class="fas fa-cogs"></i>
                    </div>
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let obraSocial of resultsPage.content || []; let i = index"
                class="table-row"
                [class.even]="i % 2 === 0"
                [class.odd]="i % 2 !== 0"
                (click)="goToDetail(obraSocial.id)"
              >
                <td>
                  <span class="badge-obra-social">{{ obraSocial.id }}</span>
                </td>
                <td>
                  <div class="obra-social-info">
                    <div class="obra-social-name">{{ obraSocial.nombre }}</div>
                    <div class="obra-social-type">Obra Social</div>
                  </div>
                </td>
                <td>
                  <span class="badge-obra-social">{{ obraSocial.codigo }}</span>
                </td>
                <td>
                  <div class="descripcion-text">
                    {{ obraSocial.descripcion || 'Sin descripción' }}
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit"
                      (click)="goToEdit(obraSocial.id); $event.stopPropagation()"
                      title="Editar"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-delete"
                      (click)="confirmDelete(obraSocial.id); $event.stopPropagation()"
                      title="Eliminar"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="(resultsPage.content || []).length === 0">
                <td colspan="5" class="text-center py-4 text-muted">
                  <i class="fas fa-heart-pulse fa-3x mb-3 d-block opacity-50"></i>
                  No hay obras sociales registradas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- PAGINACIÓN -->
      <app-pagination
        [totalPages]="resultsPage.totalPages"
        [currentPage]="currentPage"
        (pageChangeRequested)="onPageChangeRequested($event)"
        [number]="resultsPage.number"
        [hidden]="resultsPage.numberOfElements < 1"
      ></app-pagination>
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
      background: var(--obra-social-light);
      border-radius: 8px;
    }

    .header-button .header-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem;
    }

    /* Estilos normalizados usando el sistema de colores global */
    .container-fluid {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .modern-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      border: none;
      overflow: hidden;
      backdrop-filter: blur(10px);
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
    
    .header-icon {
      background: rgba(255,255,255,0.2);
      width: 60px;
      height: 60px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
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
    
    .table-container {
      padding: 0;
      overflow-x: auto;
    }

    .modern-table {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      border: none;
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 0;
    }

    .modern-table thead tr {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .modern-table th {
      border: none;
      padding: 1.5rem 1rem;
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #495057;
      background: transparent;
    }

    .header-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #495057;
      padding: 0;
    }

    .icon-circle {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
    }

    /* Headers específicos */
    .id-header { background: var(--centro-atencion-gradient); box-shadow: 0 3px 10px var(--centro-atencion-shadow); }
    .obra-social-header { background: var(--obra-social-gradient); box-shadow: 0 3px 10px var(--obra-social-shadow); }
    .actions-header { background: var(--obra-social-gradient); box-shadow: 0 3px 10px var(--obra-social-shadow); }
    
    .table-row {
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
      border-bottom: 1px solid #f8f9fa;
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
    
    /* INFO CONTAINERS */
    .obra-social-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    
    .obra-social-name {
      font-weight: 600;
      color: #495057;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    
    .obra-social-type {
      font-size: 0.85rem;
      color: #636e72;
      background: linear-gradient(135deg, #f1f2f6 0%, #ddd 100%);
      padding: 4px 10px;
      border-radius: 12px;
      display: inline-block;
    }
    
    .descripcion-text {
      color: #6c757d;
      font-size: 0.9rem;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    /* BOTÓN TRANSPARENTE PERSONALIZADO */
    .btn-banner {
      background: rgba(255,255,255,0.2) !important;
      border: 1px solid rgba(255,255,255,0.3) !important;
      color: white !important;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .btn-banner:hover {
      background: rgba(255,255,255,0.3) !important;
      color: white !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }

    /* BOTONES DE ACCIÓN */
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: center;
    }
    
    .btn-action {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      cursor: pointer;
    }
    
    .btn-edit {
      background: var(--obra-social-gradient);
      box-shadow: 0 4px 15px var(--obra-social-shadow);
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      box-shadow: 0 4px 15px rgba(220,53,69,0.3);
    }
    
    .btn-action:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    }

    /* BADGES */
    .badge-obra-social {
      background: var(--obra-social-gradient);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      display: inline-block;
      box-shadow: 0 4px 15px var(--obra-social-shadow);
      border: none;
    }
    
    /* RESPONSIVE */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .title-section {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .obra-social-info {
        text-align: center;
      }
    }
  `]
})
export class ObraSocialComponent {
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
    nombre: '',
    codigo: '',
    sortBy: 'nombre',
    sortDir: 'asc'
  };

  private filterTimeout: any;

  constructor(
    private obraSocialService: ObraSocialService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.searchObrasSociales();
  }

  /**
   * Búsqueda de obras sociales con filtros y paginación
   */
  searchObrasSociales(): void {
    this.obraSocialService.byPageAdvanced(
      this.currentPage,
      this.resultsPage.size,
      this.filters.nombre || undefined,
      this.filters.codigo || undefined,
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
        console.error('Error al buscar obras sociales:', error);
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

  /**
   * Manejo de cambios en filtros con debounce
   */
  onFilterChange(): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filterTimeout = setTimeout(() => {
      this.currentPage = 1; // Reset a primera página
      this.searchObrasSociales();
    }, 500); // Debounce de 500ms
  }

  /**
   * Limpiar todos los filtros
   */
  clearFilters(): void {
    this.filters = {
      nombre: '',
      codigo: '',
      sortBy: 'nombre',
      sortDir: 'asc'
    };
    this.currentPage = 1;
    this.searchObrasSociales();
  }

  /**
   * Toggle de ordenamiento por columna
   */
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
    this.searchObrasSociales();
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar obra social",
        "¿Está seguro que desea eliminar esta obra social?",
        "Esta acción no se puede deshacer"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  remove(id: number): void {
    this.obraSocialService.remove(id).subscribe({
      next: () => this.searchObrasSociales(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar la obra social.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar obra social:", err);
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.searchObrasSociales();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/obraSocial', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/obraSocial', id], { queryParams: { edit: true } });
  }
}