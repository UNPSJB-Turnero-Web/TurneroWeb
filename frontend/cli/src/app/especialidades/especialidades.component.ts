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
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4"
             style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <i class="fa fa-stethoscope me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Especialidades</h2>
          </div>
          <button class="btn btn-light btn-sm" (click)="router.navigate(['/especialidades/new'])">
            <i class="fa fa-plus me-1"></i> Nueva Especialidad
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of resultsPage.content"
                  (click)="goToDetail(c.id)"
                  style="cursor:pointer;">
                <td>{{ c.id }}</td>
                <td>{{ c.nombre }}</td>
                <td>{{ c.descripcion }}</td>
                <td class="text-center">
                  <button (click)="goToEdit(c.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="remove(c); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer bg-white">
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
    .table-hover tbody tr:hover {
      background-color: #f5f7fa;
    }
    .btn-outline-primary, .btn-outline-danger {
      min-width: 32px;
    }
    .card {
      border-radius: 1.15rem;
      overflow: hidden;
    }
    .card-header {
      border-top-left-radius: 1rem !important;
      border-top-right-radius: 1rem !important;
      padding-top: 0.75rem;      
      padding-bottom: 0.75rem;  
      padding-right: 0.7rem!important;
      padding-left: 0.7rem!important;  
      overflow: hidden;
    }
  `]
})
export class EspecialidadesComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
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
