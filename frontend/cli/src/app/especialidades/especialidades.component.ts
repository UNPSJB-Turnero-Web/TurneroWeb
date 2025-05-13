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
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Especialidades</h2>
        <button class="btn btn-primary" (click)="router.navigate(['/especialidades/new'])">
          + Nueva Especialidad
        </button>
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Descripción</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let especialidad of resultsPage.content">
            <td>{{ especialidad.id }}</td>
            <td>{{ especialidad.nombre }}</td>
            <td>{{ especialidad.descripcion }}</td>
            <td>
              <a [routerLink]="['/especialidades', especialidad.id]" class="btn btn-sm btn-outline-primary">
                <i class="fa fa-pencil"></i>
              </a>
              <a (click)="remove(especialidad.id)" class="btn btn-sm btn-outline-danger ms-1">
                <i class="fa fa-remove"></i>
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
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getEspecialidades();
  }

  remove(id: number): void {
    this.modalService
      .confirm("Eliminar especialidad", "¿Está seguro que desea eliminar esta especialidad?", "Esta acción no se puede deshacer")
      .then(() => {
        this.especialidadService.remove(id).subscribe(() => this.getEspecialidades());
      });
  }
}
