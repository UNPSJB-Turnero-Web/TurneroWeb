import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
<h2>Pacientes</h2>&nbsp;<a routerLink="/pacientes/new" class="btn btn-success">Nuevo Paciente</a>
<div class="table-responsive">
  <table class="table table-striped table-sm">
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Apellido</th>
        <th>Email</th>
        <th>Teléfono</th>
        <th></th> <!-- Acciones -->
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let paciente of resultsPage.content; index as i">
        <td>{{ paciente.id }}</td>
        <td>{{ paciente.name }}</td>
        <td>{{ paciente.apellido }}</td>
        <td>{{ paciente.email }}</td>
        <td>{{ paciente.telefono }}</td>
        <td>
          <a [routerLink]="['/pacientes', paciente.id]" class="btn btn-sm btn-outline-primary">
            <i class="fa fa-pencil"></i>
          </a>
          <a (click)="remove(paciente.id)" class="btn btn-sm btn-outline-danger ms-1">
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
export class PacientesComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private pacienteService: PacienteService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getPacientes();
  }

  getPacientes(): void {
    this.pacienteService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  remove(id: number): void {
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
            alert(msg); // ⛔️ Esto muestra el error personalizado del backend
            console.error("Error al eliminar paciente:", err);
          }
        });
      });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getPacientes();
  }
}