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
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4"
             style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <i class="fa fa-user-md me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Médicos</h2>
          </div>
          <button class="btn btn-light btn-sm" (click)="router.navigate(['/medicos/new'])">
            <i class="fa fa-plus me-1"></i> Nuevo Médico
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Matrícula</th>
                <th>Especialidad</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let medico of resultsPage.content"
                  (click)="goToDetail(medico.id)"
                  style="cursor:pointer;">
                <td>{{ medico.id }}</td>
                <td>{{ medico.nombre }}</td>
                <td>{{ medico.apellido }}</td>
                <td>{{ medico.dni }}</td>
                <td>{{ medico.matricula }}</td>
                <td>
                  <ng-container *ngIf="medico.especialidades?.length > 0; else sinEsp">
                    <span *ngFor="let esp of medico.especialidades; let last = last">
                      {{ esp }}<span *ngIf="!last">, </span>
                    </span>
                  </ng-container>
                  <ng-template #sinEsp>Sin especialidad</ng-template>
                </td>
                <td class="text-center">
                  <button (click)="goToEdit(medico.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Ver/Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="confirmDelete(medico.id); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
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
export class MedicosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
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