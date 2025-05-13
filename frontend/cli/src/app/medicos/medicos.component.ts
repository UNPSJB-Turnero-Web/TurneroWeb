import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
<h2>Médicos</h2>&nbsp;<a routerLink="/medicos/new" class="btn btn-success">Nuevo Médico</a>
<div class="table-responsive">
  <table class="table table-striped table-sm">
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Apellido</th>
        <th>Especialidad</th>
        <th></th> <!-- Acciones -->
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let medico of resultsPage.content; index as i">
        <td>{{ medico.id }}</td>
        <td>{{ medico.name }}</td>
        <td>{{ medico.apellido }}</td>
        <td>{{ medico.especialidad?.name || 'Sin especialidad' }}</td>
        <td>
          <a [routerLink]="['/medicos', medico.id]" class="btn btn-sm btn-outline-primary">
            <i class="fa fa-pencil"></i>
          </a>
          <a (click)="remove(medico.id)" class="btn btn-sm btn-outline-danger ms-1">
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
  `,
  styles: ``
})
export class MedicosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private medicoService: MedicoService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getMedicos();
  }

  getMedicos(): void {
    this.medicoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  remove(id: number): void {
    this.modalService
      .confirm(
        "Eliminar médico",
        "¿Está seguro que desea eliminar el médico?",
        "Si elimina el médico no lo podrá utilizar luego"
      )
      .then(() => {
        this.medicoService.remove(id).subscribe({
          next: () => this.getMedicos(),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar el médico.";
            alert(msg); // ⛔️ Esto muestra el error personalizado del backend
            console.error("Error al eliminar médico:", err);
          }
        });
      });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getMedicos();
  }
}