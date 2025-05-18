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
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Médicos</h2>
        <button class="btn btn-success" (click)="router.navigate(['/medicos/new'])">
          + Nuevo Médico
        </button>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Matrícula</th>
              <th>Especialidad</th>
              <th>Acciones</th>
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
              <td>{{ medico.especialidad?.nombre || 'Sin especialidad' }}</td>
              <td>
                <a (click)="goToEdit(medico.id); $event.stopPropagation()"
                   class="btn btn-sm btn-outline-primary" title="Ver/Editar">
                  <i class="fa fa-pencil"></i>
                </a>
                <a (click)="confirmDelete(medico.id); $event.stopPropagation()"
                   class="btn btn-sm btn-outline-danger ms-1" title="Eliminar">
                  <i class="fa fa-trash"></i>
                </a>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <app-pagination
              [totalPages]="resultsPage.totalPages"
              [currentPage]="currentPage"
              (pageChangeRequested)="onPageChangeRequested($event)"
              [number]="resultsPage.number"
              [hidden]="resultsPage.numberOfElements < 1"
            >
            </app-pagination>
          </tfoot>
        </table>
      </div>
    </div>
  `,
  styles: ``
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