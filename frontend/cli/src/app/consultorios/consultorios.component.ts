import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConsultorioService } from './consultorio.service';
import { Consultorio } from './consultorio';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <h2>Consultorios</h2>&nbsp;<a routerLink="/consultorios/new" class="btn btn-success">Nuevo Consultorio</a> 
    <div class="table-responsive">
      <table class="table table-striped table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Centro de Atención</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let consultorio of resultsPage.content; index as i">
            <td>{{ consultorio.id }}</td>
            <td>{{ consultorio.code }}</td>
            <td>{{ consultorio.name }}</td>
            <td>{{ consultorio.centroAtencion?.name || 'Sin centro' }}</td>
            <td>
              <a [routerLink]="['/consultorios/code', consultorio.code]" class="btn btn-sm btn-outline-primary">
                <i class="fa fa-pencil"></i>
              </a>
              <a (click)="remove(consultorio)" class="btn btn-sm btn-outline-danger ms-1">
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
export class ConsultoriosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private consultorioService: ConsultorioService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getConsultorios();
  }

  getConsultorios(): void {
    this.consultorioService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  remove(consultorio: Consultorio): void {
    this.modalService
      .confirm(
        "Eliminar consultorio",
        "¿Está seguro que desea eliminar el consultorio?",
        "Si elimina el consultorio no lo podrá utilizar luego"
      )
      .then(() => {
        this.consultorioService.delete(consultorio.code).subscribe(() => {
          this.getConsultorios();
        });
      });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getConsultorios();
  }
}