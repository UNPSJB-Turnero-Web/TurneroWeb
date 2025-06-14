// src/app/playType/play-types.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EspecialidadService } from './especialidad.service';
import { Especialidad } from './especialidad';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-especialidades">
          <div class="header-content">
            <div class="title-section">
              <div class="header-icon">
                <i class="fas fa-stethoscope"></i>
              </div>
              <div class="header-text">
                <h1>Especialidades</h1>
                <p>Gestión de especialidades médicas del sistema</p>
              </div>
            </div>
            <button 
              class="btn btn-new"
              (click)="router.navigate(['/especialidades/new'])"
            >
              <i class="fas fa-plus me-2"></i>
              Nueva Especialidad
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
                    <div class="icon-circle icon-especialidades">
                      <i class="fas fa-stethoscope"></i>
                    </div>
                    Nombre
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-obra-social">
                      <i class="fas fa-file-text"></i>
                    </div>
                    Descripción
                  </div>
                </th>
                <th>
                  <div class="header-cell text-center">
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
                *ngFor="let especialidad of resultsPage.content || []; let i = index"
                class="table-row"
                (click)="goToDetail(especialidad.id)"
                [style.animation-delay]="(i * 100) + 'ms'"
              >
                <td>
                  <div class="id-badge">
                    <span>{{ especialidad.id }}</span>
                  </div>
                </td>
                <td>
                  <div class="especialidad-info">
                    <div class="avatar-especialidades">
                      <i class="fas fa-stethoscope"></i>
                    </div>
                    <div class="especialidad-details">
                      <span class="especialidad-name">{{ especialidad.nombre }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="descripcion-text">
                    {{ especialidad.descripcion || 'Sin descripción' }}
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit"
                      (click)="goToEdit(especialidad.id); $event.stopPropagation()" 
                      title="Editar especialidad"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-delete"
                      (click)="remove(especialidad); $event.stopPropagation()" 
                      title="Eliminar especialidad"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
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
    /* === ESPECIALIDADES CON SISTEMA DE COLORES GLOBAL === */
    
    /* Banner header structure - uses global banner-especialidades */
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
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.2);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .header-text h1 {
      color: white;
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 1rem;
    }

    /* Table structure */
    .table-container {
      padding: 0;
      overflow-x: auto;
    }

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

    /* ID BADGE usando sistema global */
    .id-badge {
      background: var(--especialidades-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 15px var(--especialidades-shadow);
      display: inline-block;
    }

    /* Especialidad info usando avatares globales */
    .especialidad-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .especialidad-details {
      display: flex;
      flex-direction: column;
    }

    .especialidad-name {
      font-weight: 600;
      color: #495057;
      font-size: 0.95rem;
      line-height: 1.2;
    }

    /* Descripción text styling */
    .descripcion-text {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Action buttons usando sistema global */
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

    .btn-delete {
      background: var(--action-delete);
      color: white;
    }

    .btn-delete:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px var(--action-delete-shadow);
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

    /* Responsive design */
    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }
      
      .header-icon {
        width: 50px;
        height: 50px;
        font-size: 1.2rem;
      }
      
      .header-text h1 {
        font-size: 1.5rem;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .modern-table {
        min-width: 600px;
      }
      
      .descripcion-text {
        max-width: 150px;
      }
      
      .especialidad-info {
        gap: 0.5rem;
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
export class EspecialidadesComponent {
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

  constructor(
    private especialidadService: EspecialidadService,
    public router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getEspecialidades();
  }

  getEspecialidades(): void {
    this.especialidadService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = dataPackage.data; 
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getEspecialidades();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/especialidades', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/especialidades', id], { queryParams: { edit: true } });
  }

  remove(especialidad: Especialidad): void {
    if (!especialidad.id) {
      alert('No se puede eliminar: la especialidad no tiene ID.');
      return;
    }
    this.modalService
      .confirm(
        "Eliminar especialidad",
        "¿Está seguro que desea eliminar esta especialidad?",
        "Esta acción no se puede deshacer"
      )
      .then(() => {
        this.especialidadService.remove(especialidad.id).subscribe({
          next: (response: any) => {
            if (response?.status_code === 400) {
              alert('No se puede eliminar la especialidad porque tiene dependencias asociadas.');
            } else {
              this.getEspecialidades();
            }
          },
          error: (err) => {
            if (err?.status === 400) {
              alert('No se puede eliminar la especialidad porque tiene dependencias asociadas.');
            } else {
              alert('No se pudo eliminar la especialidad. Intente nuevamente.');
            }
          }
        });
      });
  }
}
