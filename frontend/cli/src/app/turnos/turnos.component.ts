import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TurnoService } from './turno.service';
import { Turno } from './turno';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4"
             style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <i class="fa fa-calendar-check me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Turnos</h2>
          </div>
          <button class="btn btn-light btn-sm" (click)="router.navigate(['/turnos/new'])">
            <i class="fa fa-plus me-1"></i> Nuevo Turno
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Código</th>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let turno of resultsPage.content"
                  (click)="goToDetail(turno.id)"
                  style="cursor:pointer;">
                <td>{{ turno.id }}</td>
                <td>{{ turno.nombre }}</td>
                <td>{{ turno.codigo }}</td>
                <td>{{ turno.fecha }}</td>
                <td>{{ turno.horaInicio }}</td>
                <td>{{ turno.horaFin }}</td>
                <td>{{ turno.estado }}</td>
                <td class="text-center">
                  <button (click)="goToEdit(turno.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="confirmDelete(turno.id); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!resultsPage.content || resultsPage.content.length === 0">
                <td colspan="8" class="text-center text-muted py-4">No hay turnos para mostrar.</td>
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
export class TurnosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private turnoService: TurnoService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getTurnos();
  }

  getTurnos(): void {
    this.turnoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar turno",
        "¿Está seguro que desea eliminar este turno?",
        "Esta acción no se puede deshacer"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  remove(id: number): void {
    this.turnoService.remove(id).subscribe({
      next: () => this.getTurnos(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el turno.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar turno:", err);
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getTurnos();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/turnos', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/turnos', id], { queryParams: { edit: true } });
  }
}