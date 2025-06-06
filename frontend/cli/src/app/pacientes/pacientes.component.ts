import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PacienteService } from './paciente.service';
import { Paciente } from './paciente';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
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
              <th class="border-0 py-3">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-user"></i>
                  </div>
                  <span>Nombre</span>
                </div>
              </th>
              <th class="border-0 py-3">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-user-tag"></i>
                  </div>
                  <span>Apellido</span>
                </div>
              </th>
              <th class="border-0 py-3">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <span>Email</span>
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
              <th class="border-0 py-3">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-id-card"></i>
                  </div>
                  <span>DNI</span>
                </div>
              </th>
              <th class="border-0 py-3">
                <div class="header-cell">
                  <div class="icon-circle icon-pacientes">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <span>Fecha Nac.</span>
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
            <tr *ngFor="let paciente of resultsPage.content; let i = index"
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
            <tr *ngIf="!resultsPage.content || resultsPage.content.length === 0">
              <td colspan="9" class="text-center py-5">
                <div class="empty-state">
                  <i class="fas fa-user-injured fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay pacientes registrados</h5>
                  <p class="text-muted small">Comience agregando un nuevo paciente al sistema</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINACIÓN -->
      <div class="mt-4">
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
    
    .empty-state {
      padding: 3rem 2rem;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header-cell span {
        font-size: 0.875rem;
      }
      
      .modern-table {
        font-size: 0.875rem;
      }
    }
  `]
})
export class PacientesComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private pacienteService: PacienteService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getPacientes();
  }

  getPacientes(): void {
    this.pacienteService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

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

  remove(id: number): void {
    this.pacienteService.remove(id).subscribe({
      next: () => this.getPacientes(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el paciente.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar paciente:", err);
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getPacientes();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/pacientes', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/pacientes', id], { queryParams: { edit: true } });
  }
}