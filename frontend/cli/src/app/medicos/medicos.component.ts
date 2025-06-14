import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MedicoService } from './medico.service';
import { Medico } from './medico';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-medicos">
          <div class="header-content">
            <div class="title-section">
              <div class="header-icon">
                <i class="fas fa-user-md"></i>
              </div>
              <div class="header-text">
                <h1>Médicos</h1>
                <p>Gestión de profesionales médicos del sistema</p>
              </div>
            </div>
            <button 
              class="btn btn-new"
              (click)="router.navigate(['/medicos/new'])"
            >
              <i class="fas fa-plus me-2"></i>
              Nuevo Médico
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
                    Identificador
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle medico-header">
                      <i class="fas fa-user-md"></i>
                    </div>
                    Médico
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle dni-header">
                      <i class="fas fa-id-card"></i>
                    </div>
                    DNI
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle matricula-header">
                      <i class="fas fa-certificate"></i>
                    </div>
                    Matrícula
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle especialidad-header">
                      <i class="fas fa-stethoscope"></i>
                    </div>
                    Especialidad
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
                *ngFor="let medico of resultsPage.content || []; let i = index"
                class="table-row"
                [class.even]="i % 2 === 0"
                [class.odd]="i % 2 !== 0"
                (click)="goToDetail(medico.id)"
              >
                <td>
                  <span class="id-badge">{{ medico.id }}</span>
                </td>
                <td>
                  <div class="medico-info">
                    <div class="avatar-medicos">
                      {{ getMedicoInitials(medico) }}
                    </div>
                    <div class="medico-details">
                      <div class="medico-name">{{ medico.nombre }} {{ medico.apellido }}</div>
                      <div class="medico-subtitle">Profesional médico</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-badge">{{ medico.dni }}</span>
                </td>
                <td>
                  <span class="badge-badge">{{ medico.matricula }}</span>
                </td>
                <td>
                  <span class="badge-especialidades" *ngIf="medico.especialidad; else sinEsp">
                    {{ medico.especialidad.nombre }}
                  </span>
                  <ng-template #sinEsp>
                    <span class="badge-none">Sin especialidad</span>
                  </ng-template>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit"
                      (click)="goToEdit(medico.id); $event.stopPropagation()"
                      title="Editar"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-delete"
                      (click)="confirmDelete(medico.id); $event.stopPropagation()"
                      title="Eliminar"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
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
        [last]="resultsPage.last"
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

 
    .header-icon {
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
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
    .medico-header { background: var(--medicos-gradient); box-shadow: 0 3px 10px var(--medicos-shadow); }
    .dni-header { background: var(--pacientes-gradient); box-shadow: 0 3px 10px var(--pacientes-shadow); }
    .matricula-header { background: var(--consultorios-gradient); box-shadow: 0 3px 10px var(--consultorios-shadow); }
    .especialidad-header { background: var(--especialidades-gradient); box-shadow: 0 3px 10px var(--especialidades-shadow); }
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
    
    /* ID BADGE FUERTE */
    .id-badge {
      background: var(--centro-atencion-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 15px var(--centro-atencion-shadow);
      display: inline-block;
    }
    
    /* INFO CONTAINERS */
    .medico-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .avatar-medicos {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: var(--medicos-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 4px 15px var(--medicos-shadow);
      flex-shrink: 0;
    }
    
    .medico-details {
      flex-grow: 1;
    }
    
    .medico-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.95rem;
      line-height: 1.2;
    }
    
    .medico-subtitle {
      font-size: 0.8rem;
      color: var(--medicos-primary);
      font-weight: 500;
    }
    
    /* BADGES GENERALES */
    .badge-badge {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #495057;
      padding: 8px 14px;
      border-radius: 15px;
      font-weight: 600;
      font-size: 0.85rem;
      border: 1px solid #dee2e6;
      display: inline-block;
    }
    
    .badge-especialidades {
      background: var(--especialidades-light);
      color: var(--especialidades-primary);
      padding: 8px 14px;
      border-radius: 15px;
      font-weight: 600;
      font-size: 0.85rem;
      border: 1px solid var(--especialidades-primary);
      display: inline-block;
    }
    
    .badge-none {
      background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
      color: #e17055;
      padding: 8px 14px;
      border-radius: 15px;
      font-weight: 600;
      font-size: 0.85rem;
      display: inline-block;
    }
    
    /* BOTONES DE ACCIÓN */
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    
    .btn-action {
      width: 35px;
      height: 35px;
      border: none;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .btn-edit {
      background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(116, 185, 255, 0.4);
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(253, 121, 168, 0.4);
    }
    
    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }
      
      .title-section {
        flex-direction: column;
        gap: 1rem;
      }
      
      .header-text h1 {
        font-size: 1.5rem;
      }
      
      .table-container {
        padding: 0 1rem;
      }
      
      .modern-table th,
      .modern-table td {
        padding: 0.75rem 0.5rem;
      }
      
      .header-cell {
        gap: 0.5rem;
        font-size: 0.8rem;
      }
      
      .icon-circle {
        width: 30px;
        height: 30px;
        font-size: 0.8rem;
      }
      
      .medico-info {
        gap: 0.75rem;
      }
      
      .avatar-medicos {
        width: 40px;
        height: 40px;
        font-size: 0.8rem;
      }
      
      .medico-name {
        font-size: 0.9rem;
      }
      
      .medico-subtitle {
        font-size: 0.75rem;
      }
      
      .action-buttons {
        gap: 0.25rem;
      }
      
      .btn-action {
        width: 32px;
        height: 32px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class MedicosComponent {
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
    private medicoService: MedicoService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getMedicos();
  }

  getMedicos(): void {
    this.medicoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  getMedicoInitials(medico: Medico): string {
    if (!medico.nombre && !medico.apellido) return 'M';
    const firstInitial = medico.nombre ? medico.nombre.charAt(0).toUpperCase() : '';
    const lastInitial = medico.apellido ? medico.apellido.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || 'M';
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar médico",
        "Eliminar médico",
        "¿Está seguro que desea eliminar el médico?"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  remove(id: number): void {
    this.medicoService.delete(id).subscribe({
      next: () => this.getMedicos(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el médico.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar médico:", err);
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getMedicos();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/medicos', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/medicos', id], { queryParams: { edit: true } });
  }
}