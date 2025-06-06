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
    <div class="container mt-4">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="card-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-heart-pulse"></i>
            </div>
            <div class="header-text">
              <h1>Obras Sociales</h1>
              <p>Gestione las obras sociales del sistema</p>
            </div>
            <button class="btn btn-modern btn-add ms-auto" (click)="router.navigate(['/obraSocial/new'])">
              <i class="fas fa-plus me-2"></i> Nueva Obra Social
            </button>
          </div>
        </div>

        <!-- TABLA MODERNA -->
        <div class="card-body">
          <div class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>
                    <div class="th-content">
                      <span class="th-icon" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);">🆔</span>
                      <span class="th-text">ID</span>
                    </div>
                  </th>
                  <th>
                    <div class="th-content">
                      <span class="th-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">💊</span>
                      <span class="th-text">Nombre</span>
                    </div>
                  </th>
                  <th>
                    <div class="th-content">
                      <span class="th-icon" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">🔖</span>
                      <span class="th-text">Código</span>
                    </div>
                  </th>
                  <th>
                    <div class="th-content">
                      <span class="th-icon" style="background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%);">📋</span>
                      <span class="th-text">Descripción</span>
                    </div>
                  </th>
                  <th>
                    <div class="th-content">
                      <span class="th-icon" style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);">⚙️</span>
                      <span class="th-text">Acciones</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let obraSocial of resultsPage.content; let i = index"
                    (click)="goToDetail(obraSocial.id)"
                    class="table-row"
                    [class.even-row]="i % 2 === 0"
                    [class.odd-row]="i % 2 !== 0">
                  <td>
                    <div class="id-badge">
                      {{ obraSocial.id }}
                    </div>
                  </td>
                  <td>
                    <div class="obra-nombre">
                      {{ obraSocial.nombre }}
                    </div>
                  </td>
                  <td>
                    <div class="codigo-badge">
                      {{ obraSocial.codigo }}
                    </div>
                  </td>
                  <td>
                    <div class="descripcion-text">
                      {{ obraSocial.descripcion || 'Sin descripción' }}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="action-container">
                      <button (click)="goToEdit(obraSocial.id); $event.stopPropagation()" 
                              class="btn-action btn-edit" 
                              title="Editar obra social">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button (click)="confirmDelete(obraSocial.id); $event.stopPropagation()" 
                              class="btn-action btn-delete" 
                              title="Eliminar obra social">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="!resultsPage.content || resultsPage.content.length === 0">
                  <td colspan="5" class="text-center text-muted py-4">No hay obras sociales para mostrar.</td>
                </tr>
              </tbody>
            </table>
          </div>
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
    /* Estilos modernos para el listado de obras sociales */
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .modern-card {
      border-radius: 1.5rem;
      overflow: hidden;
      border: none;
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      background: white;
      backdrop-filter: blur(20px);
    }
    
    /* Estilos del encabezado */
    .card-header {
      background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
      border: none;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: translate(-30%, -30%);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }
    
    .header-icon {
      width: 60px;
      height: 60px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff9a9e;
      font-size: 1.5rem;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .header-text h1 {
      color: white;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 1rem;
    }
    
    .btn-modern {
      border-radius: 25px;
      padding: 0.7rem 1.5rem;
      font-weight: 600;
      border: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-add {
      background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
      color: #ff9a9e;
    }
    
    .btn-add:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    /* Estilos de la tabla */
    .card-body {
      padding: 2rem;
    }
    
    .table-container {
      overflow-x: auto;
      border-radius: 1rem;
    }
    
    .modern-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    
    .modern-table thead th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #e9ecef;
    }
    
    .th-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .th-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      color: white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    
    .table-row {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .table-row:hover {
      background-color: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    
    .even-row {
      background-color: #ffffff;
    }
    
    .odd-row {
      background-color: #f8f9fa;
    }
    
    .modern-table td {
      padding: 1rem;
      vertical-align: middle;
      border-bottom: 1px solid #e9ecef;
    }
    
    /* Estilos para los badges y contenido */
    .id-badge {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border-radius: 15px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(0,123,255,0.3);
    }
    
    .obra-nombre {
      font-weight: 600;
      color: #212529;
      font-size: 1.05rem;
    }
    
    .codigo-badge {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      border-radius: 15px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(23,162,184,0.3);
      font-family: 'Courier New', monospace;
    }
    
    .descripcion-text {
      color: #6c757d;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 300px;
    }
    
    /* Estilos para los botones de acción */
    .action-container {
      display: flex;
      gap: 0.5rem;
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
    }
    
    .btn-edit {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      box-shadow: 0 4px 15px rgba(0,123,255,0.3);
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      box-shadow: 0 4px 15px rgba(220,53,69,0.3);
    }
    
    .btn-action:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(0,0,0,0.2);
    }
    
    /* Footer y paginación */
    .card-footer {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: none;
      padding: 1.5rem 2rem;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .card-header {
        padding: 1.5rem;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .header-text h1 {
        font-size: 1.5rem;
      }
      
      .btn-modern {
        width: 100%;
        margin-top: 1rem;
        justify-content: center;
      }
      
      .card-body {
        padding: 1rem;
      }
      
      .th-icon {
        display: none;
      }
      
      .modern-table th, 
      .modern-table td {
        padding: 1rem 0.75rem;
      }
      
      .id-badge,
      .codigo-badge {
        padding: 0.4rem 0.6rem;
        font-size: 0.8rem;
      }
      
      .btn-action {
        width: 35px;
        height: 35px;
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