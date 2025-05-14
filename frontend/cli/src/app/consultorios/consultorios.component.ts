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
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Consultorios</h2>
        <button class="btn btn-primary" (click)="router.navigate(['/consultorios/new'])">
          + Nuevo Consultorio
        </button>
      </div>

      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">N°</th>
            <th scope="col">Centro Atención</th>
            <th scope="col">Nombre consultorio</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of resultsPage.content" 
              (click)="goToDetail(c.id)" 
              style="cursor:pointer;">
            <td>{{ c.numero }}</td>
            <td>{{ c.centroAtencion }}</td>
            <td>{{ c.name | uppercase }}</td>
            <td>
              <a 
                (click)="goToEdit(c.id); $event.stopPropagation()" 
                class="btn btn-sm btn-outline-primary">
                <i class="fa fa-pencil"></i>
              </a>
              <a 
                (click)="confirmDelete(c.id); $event.stopPropagation()" 
                class="btn btn-sm btn-outline-danger ms-1">
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
