import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgendaService } from './agenda.service';
import { Agenda } from './agenda';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4"
             style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <i class="fa fa-calendar me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Agendas</h2>
          </div>
          <button class="btn btn-light btn-sm" (click)="router.navigate(['/agenda/new'])">
            <i class="fa fa-plus me-1"></i> Nueva Agenda
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Centro</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let agenda of resultsPage.content"
                  (click)="goToDetail(agenda.id)"
                  style="cursor:pointer;">
                <td>{{ agenda.id }}</td>
                <td>{{ agenda.fecha | date:'short' }}</td>
                <td>{{ agenda.medico?.nombre }} {{ agenda.medico?.apellido }}</td>
                <td>{{ agenda.especialidad?.nombre }}</td>
                <td>{{ agenda.centroAtencion?.name }}</td>
                <td class="text-center">
                  <button (click)="goToEdit(agenda.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="confirmDelete(agenda.id); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!resultsPage.content || resultsPage.content.length === 0">
                <td colspan="6" class="text-center text-muted py-4">No hay agendas para mostrar.</td>
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
export class AgendaComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private agendaService: AgendaService,
    public router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getAgendas();
  }

  getAgendas(): void {
    this.agendaService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = dataPackage.data;
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getAgendas();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/agenda', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/agenda', id], { queryParams: { edit: true } });
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar agenda",
        "¿Está seguro que desea eliminar esta agenda?",
        "Esta acción no se puede deshacer"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  remove(id: number): void {
    this.agendaService.remove(id).subscribe({
      next: () => this.getAgendas(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar la agenda.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar agenda:", err);
      }
    });
  }
}