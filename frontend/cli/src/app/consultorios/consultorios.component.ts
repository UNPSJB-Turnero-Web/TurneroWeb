import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsultorioService } from './consultorio.service';
import { Consultorio } from './consultorio';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-consultorios">
          <div class="header-content">
            <div class="title-section">
              <div class="header-icon">
                <i class="fas fa-door-open"></i>
              </div>
              <div class="header-text">
                <h1>Consultorios</h1>
                <p>Gestión de consultorios médicos del sistema</p>
              </div>
            </div>
            <button 
              class="btn btn-banner"
              (click)="router.navigate(['/consultorios/new'])"
            >
              <i class="fas fa-plus me-2"></i>
              Nuevo Consultorio
            </button>
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
                    Número
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle centro-header">
                      <i class="fas fa-hospital"></i>
                    </div>
                    Centro de Atención
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle consultorio-header">
                      <i class="fas fa-door-open"></i>
                    </div>
                    Nombre del Consultorio
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
                *ngFor="let c of resultsPage.content; let i = index"
                class="table-row"
                [class.even]="i % 2 === 0"
                [class.odd]="i % 2 !== 0"
                (click)="goToDetail(c.id)"
              >
                <td>
                  <span class="badge-consultorios">{{ c.numero }}</span>
                </td>
                <td>
                  <div class="centro-info">
                    <div class="ref-centro-atencion">
                      <i class="fas fa-hospital me-2"></i>
                      {{ c.centroAtencion }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="consultorio-info">
                    <div class="consultorio-name">{{ c.nombre }}</div>
                    <div class="consultorio-type">Consultorio Médico</div>
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit"
                      (click)="goToEdit(c.id); $event.stopPropagation()"
                      title="Editar"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-delete"
                      (click)="confirmDelete(c.id); $event.stopPropagation()"
                      title="Eliminar"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="resultsPage.content.length === 0">
                <td colspan="4" class="text-center py-4 text-muted">
                  <i class="fas fa-door-open fa-3x mb-3 d-block opacity-50"></i>
                  No hay consultorios registrados
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
    .centro-header { background: var(--centro-atencion-gradient); box-shadow: 0 3px 10px var(--centro-atencion-shadow); }
    .consultorio-header { background: var(--consultorios-gradient); box-shadow: 0 3px 10px var(--consultorios-shadow); }
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
    .centro-info,
    .consultorio-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .consultorio-info {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .consultorio-name {
      font-weight: 600;
      color: #495057;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    
    .consultorio-type {
      font-size: 0.85rem;
      color: #636e72;
      background: linear-gradient(135deg, #f1f2f6 0%, #ddd 100%);
      padding: 4px 10px;
      border-radius: 12px;
      display: inline-block;
    }
    
    /* REFERENCIAS CRUZADAS */
    .ref-centro-atencion {
      background: var(--centro-atencion-gradient);
      color: white;
      padding: 8px 12px;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
      box-shadow: 0 3px 10px var(--centro-atencion-shadow);
      display: inline-flex;
      align-items: center;
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
      
      .centro-info,
      .consultorio-info {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }
  `]
})
export class ConsultoriosComponent implements OnInit {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private consultorioService: ConsultorioService,
    public router: Router,
    private modal: ModalService
  ) { }

  ngOnInit(): void {
    this.getConsultorios();
  }

  getConsultorios(): void {
    this.consultorioService.byPage(this.currentPage, 10).subscribe({
      next: (dataPackage) => {
        this.resultsPage = <ResultsPage>dataPackage.data;
      },
      error: (err) => {
        console.error('Error al cargar consultorios:', err);
        this.modal.alert('Error', 'No se pudieron cargar los consultorios.');
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getConsultorios();
  }

  confirmDelete(id: number): void {
    this.modal
      .confirm('Eliminando consultorio', 'Eliminar consultorio', '¿Estás seguro que deseas eliminarlo?')
      .then(() => this.delete(id))
      .catch(() => { }); // si cancela, no hacemos nada
  }

  delete(id: number): void {
    this.consultorioService.delete(id).subscribe({
      next: () => this.getConsultorios(),              // recarga la página actual
      error: (err) => {
        console.error('Error al eliminar el consultorio:', err);
        this.modal.alert('Error', 'No se pudo eliminar el consultorio');
      }
    });
  }

  goToDetail(id: number): void {
    this.router.navigate(['/consultorios', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/consultorios', id], { queryParams: { edit: true } });
  }
}
