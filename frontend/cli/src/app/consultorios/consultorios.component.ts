import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ConsultorioService } from './consultorio.service';
import { Consultorio } from './consultorio';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  template: `
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4"
             style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-stethoscope me-2" viewBox="0 0 16 16">
              <path d="M8 10.5a3.5 3.5 0 0 1-3.5-3.5V2.75a.75.75 0 0 0-1.5 0V7a5 5 0 0 0 4 4.9V13a2 2 0 1 0 4 0v-1.1a5 5 0 0 0 4-4.9V2.75a.75.75 0 0 0-1.5 0V7a3.5 3.5 0 0 1-3.5 3.5z"/>
            </svg>
            <h2 class="fw-bold mb-0 fs-4">Consultorios</h2>
          </div>
          <button class="btn btn-light btn-sm" (click)="router.navigate(['/consultorios/new'])">
            <i class="fa fa-plus me-1"></i> Nuevo Consultorio
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>N°</th>
                <th>Centro Atención</th>
                <th>Nombre consultorio</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of resultsPage.content"
                  (click)="goToDetail(c.id)"
                  style="cursor:pointer;">
                <td>{{ c.numero }}</td>
                <td>{{ c.centroAtencion }}</td>
                <td>{{ c.nombre }}</td>
                <td class="text-center">
                  <button (click)="goToEdit(c.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="confirmDelete(c.id); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
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
export class ConsultoriosComponent implements OnInit {
  consultorios: Consultorio[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private consultorioService: ConsultorioService,
    public router: Router,
    private modal: ModalService
  ) { }

  ngOnInit(): void {
    this.getConsultorios();
  }

  getConsultorios(): void {
    this.consultorioService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getConsultorios();
  }

  confirmDelete(id: number): void {
    this.modal
      .confirm('Eliminando centro de atencion', 'Eliminar consultorio', '¿Estás seguro que deseas eliminarlo?')
      .then(() => this.delete(id))
      .catch(() => { }); // si cancela, no hacemos nada
  }

  delete(id: number): void {
    this.consultorioService.delete(id).subscribe(
      () => this.getConsultorios(),              // recarga la página actual
      () => this.modal.alert('Error', 'No se pudo eliminar el consultorio')
    );
  }

  goToDetail(id: number): void {
    this.router.navigate(['/consultorios', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/consultorios', id], { queryParams: { edit: true } });
  }
}
