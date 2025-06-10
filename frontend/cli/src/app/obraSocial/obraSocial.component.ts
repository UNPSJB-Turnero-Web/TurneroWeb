import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ObraSocialService } from './obraSocial.service';
import { ObraSocial } from './obraSocial';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-obra-social',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
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
                  <div class="header-cell">
                    <div class="icon-circle obra-social-header">
                      <i class="fas fa-heart-pulse"></i>
                    </div>
                    Nombre
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle obra-social-header">
                      <i class="fas fa-barcode"></i>
                    </div>
                    Código
                  </div>
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
                *ngFor="let obraSocial of resultsPage.content; let i = index"
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
              <tr *ngIf="resultsPage.content.length === 0">
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
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private obraSocialService: ObraSocialService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getObrasSociales();
  }

  getObrasSociales(): void {
    this.obraSocialService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
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
      next: () => this.getObrasSociales(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar la obra social.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar obra social:", err);
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getObrasSociales();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/obraSocial', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/obraSocial', id], { queryParams: { edit: true } });
  }
}