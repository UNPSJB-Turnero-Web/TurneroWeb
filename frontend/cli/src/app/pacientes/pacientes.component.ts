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
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4"
             style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <i class="fa fa-user me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Pacientes</h2>
          </div>
          <button class="btn btn-light btn-sm" (click)="router.navigate(['/pacientes/new'])">
            <i class="fa fa-plus me-1"></i> Nuevo Paciente
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let paciente of resultsPage.content"
                  (click)="goToDetail(paciente.id)"
                  style="cursor:pointer;">
                <td>{{ paciente.id }}</td>
                <td>{{ paciente.name }}</td>
                <td>{{ paciente.apellido }}</td>
                <td>{{ paciente.email }}</td>
                <td>{{ paciente.telefono }}</td>
                <td class="text-center">
                  <button (click)="goToEdit(paciente.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="confirmDelete(paciente.id); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!resultsPage.content || resultsPage.content.length === 0">
                <td colspan="6" class="text-center text-muted py-4">No hay pacientes para mostrar.</td>
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
export class PacientesComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private pacienteService: PacienteService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit() {
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
        "¿Está seguro que desea eliminar el paciente?",
        "Si elimina el paciente no lo podrá utilizar luego"
      )
      .then(() => {
        this.pacienteService.remove(id).subscribe({
          next: () => this.getPacientes(),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar el paciente.";
            this.modalService.alert("Error", msg);
            console.error("Error al eliminar paciente:", err);
          }
        });
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