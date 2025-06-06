import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StaffMedicoService } from './staffMedico.service';
import { StaffMedico } from './staffMedico';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-staff-medicos',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-staff-medico">
          <div class="header-content">
            <div class="title-section">
              <div class="header-icon">
                <i class="fas fa-user-md"></i>
              </div>
              <div class="header-text">
                <h1>Staff Médico</h1>
                <p>Gestión de médicos asociados a centros de atención</p>
              </div>
            </div>
            <button 
              class="btn btn-new"
              (click)="router.navigate(['/staff-medicos/new'])"
            >
              <i class="fas fa-plus me-2"></i>
              Nuevo Staff
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
                    <div class="icon-circle icon-centro-atencion">
                      <i class="fas fa-hospital"></i>
                    </div>
                    Centro de Atención
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
                *ngFor="let staff of resultsPage.content; let i = index"
                class="table-row"
                [class.even]="i % 2 === 0"
                [class.odd]="i % 2 !== 0"
                (click)="goToDetail(staff.id)"
              >
                <td>
                  <span class="id-badge">{{ staff.id }}</span>
                </td>
                <td>
                  <div class="centro-info">
                    <div class="avatar-centro-atencion">
                      {{ getCentroInitials(staff) }}
                    </div>
                    <div class="centro-details">
                      <div class="centro-name">{{ getCentroNombre(staff) }}</div>
                      <div class="centro-location">{{ getCentroUbicacion(staff) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="medico-info">
                    <div class="avatar-medicos">
                      {{ getMedicoInitials(staff) }}
                    </div>
                    <div class="medico-details">
                      <div class="medico-name">{{ getMedicoNombre(staff) }}</div>
                      <div class="medico-dni">DNI: {{ staff.medico?.dni }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-especialidades">{{ getEspecialidadNombre(staff) }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit"
                      (click)="goToEdit(staff.id); $event.stopPropagation()"
                      title="Editar"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-delete"
                      (click)="confirmDelete(staff.id); $event.stopPropagation()"
                      title="Eliminar"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                    <button 
                      class="btn-action btn-add"
                      (click)="goToDisponibilidad(staff); $event.stopPropagation()"
                      title="Gestionar Disponibilidad"
                    >
                      <i class="fas fa-calendar-plus"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="resultsPage.content.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">
                  <i class="fas fa-user-md fa-3x mb-3 d-block opacity-50"></i>
                  No hay staff médico registrado
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
    .centro-info,
    .medico-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .centro-details,
    .medico-details {
      flex: 1;
    }
    
    .centro-name,
    .medico-name {
      font-weight: 600;
      color: #495057;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    
    .centro-location,
    .medico-dni {
      font-size: 0.85rem;
      color: #636e72;
      background: linear-gradient(135deg, #f1f2f6 0%, #ddd 100%);
      padding: 4px 10px;
      border-radius: 12px;
      display: inline-block;
    }
    
    /* AVATARS CON SISTEMA DE COLORES GLOBAL */
    .avatar-centro-atencion,
    .avatar-medicos {
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

    .avatar-centro-atencion {
      background: var(--centro-atencion-gradient);
      box-shadow: 0 4px 12px var(--centro-atencion-shadow);
    }

    .avatar-medicos {
      background: var(--medicos-gradient);
      box-shadow: 0 4px 12px var(--medicos-shadow);
    }

    /* BADGE ESPECIALIDADES */
    .badge-especialidades {
      background: var(--especialidades-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      box-shadow: 0 4px 15px var(--especialidades-shadow);
      display: inline-block;
    }

    /* BOTONES DE ACCIÓN CON SISTEMA DE COLORES GLOBAL */
    .btn-action {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      color: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .btn-edit {
      background: var(--action-edit);
    }

    .btn-edit:hover {
      background: var(--action-edit);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }

    .btn-delete {
      background: var(--action-delete);
    }

    .btn-delete:hover {
      background: var(--action-delete);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }

    .btn-add {
      background: var(--action-add);
    }

    .btn-add:hover {
      background: var(--action-add);
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
      .medico-info {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }
  `]
})  

export class StaffMedicosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private staffMedicoService: StaffMedicoService,
    public router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getStaffMedicos();
  }

  getStaffMedicos(): void {
    this.staffMedicoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = dataPackage.data;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getStaffMedicos();
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getStaffMedicos();
  }

  goToEdit(id: number): void {
    this.router.navigate(['/staff-medicos', id], { queryParams: { edit: true } });
  }

  goToDetail(id: number): void {
    this.router.navigate(['/staff-medicos', id]);
  }

  goToDisponibilidad(staff: StaffMedico): void {
    this.router.navigate(['/disponibilidades-medico/new'], { 
      queryParams: { staffMedicoId: staff.id } 
    });
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar Staff Médico",
        "¿Está seguro que desea eliminar este Staff Médico?",
        "Si elimina el Staff Médico no lo podrá utilizar luego"
      )
      .then(() => {
        this.staffMedicoService.remove(id).subscribe({
          next: () => this.getStaffMedicos(),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar el Staff Médico.";
            alert(msg);
            console.error("Error al eliminar Staff Médico:", err);
          }
        });
      });
  }

  // Métodos auxiliares para el sistema de colores
  getCentroInitials(staff: StaffMedico): string {
    if (!staff.centro?.nombre) return '?';
    return staff.centro.nombre.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  getCentroNombre(staff: StaffMedico): string {
    return staff.centro?.nombre || 'Sin centro asignado';
  }

  getCentroUbicacion(staff: StaffMedico): string {
    if (!staff.centro) return 'Sin ubicación';
    const partes = [];
    if (staff.centro.localidad) partes.push(staff.centro.localidad);
    if (staff.centro.provincia) partes.push(staff.centro.provincia);
    return partes.join(', ') || 'Sin ubicación';
  }

  getMedicoInitials(staff: StaffMedico): string {
    if (!staff.medico) return '?';
    const nombre = staff.medico.nombre?.charAt(0) || '';
    const apellido = staff.medico.apellido?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  }

  getMedicoNombre(staff: StaffMedico): string {
    if (!staff.medico) return 'Sin médico asignado';
    return `${staff.medico.nombre} ${staff.medico.apellido}`;
  }

  getEspecialidadNombre(staff: StaffMedico): string {
    return staff.especialidad?.nombre || 'Sin especialidad';
  }
}