import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CentroAtencionService } from './centroAtencion.service';
import { CentroAtencion } from './centroAtencion';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-centros-atencion',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <h2>Centros de Atención</h2>&nbsp;<a routerLink="/centrosAtencion/new" class="btn btn-success">Nuevo Centro</a> 
    <div class="table-responsive">
      <table class="table table-striped table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let centro of resultsPage.content; index as i">
            <td>{{ centro.id }}</td>
            <td>{{ centro.code }}</td>
            <td>{{ centro.name }}</td>
            <td>{{ centro.location || 'Sin ubicación' }}</td>
            <td>
              <a [routerLink]="['/centrosAtencion/code', centro.code]" class="btn btn-sm btn-outline-primary">
                <i class="fa fa-pencil"></i>
              </a>
              <a (click)="remove(centro)" class="btn btn-sm btn-outline-danger ms-1">
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
export class CentrosAtencionComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private centroAtencionService: CentroAtencionService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getCentrosAtencion();
  }

  getCentrosAtencion(): void {
    this.centroAtencionService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  remove(centro: CentroAtencion): void {
    this.modalService
      .confirm(
        "Eliminar centro de atención",
        "¿Está seguro que desea eliminar el centro de atención?",
        "Si elimina el centro no lo podrá utilizar luego"
      )
      .then(() => {
        this.centroAtencionService.delete(centro.code).subscribe(() => {
          this.getCentrosAtencion();
        });
      });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getCentrosAtencion();
  }
}