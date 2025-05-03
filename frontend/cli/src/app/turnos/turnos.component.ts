import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    <h2>Turnos</h2>&nbsp;<a routerLink="/turnos/new" class="btn btn-success">Nuevo Turno</a> 
    <div class="table-responsive">
      <table class="table table-striped table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Paciente</th>
            <th>Agenda</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let turno of resultsPage.content; index as i">
            <td>{{ turno.id }}</td>
            <td>{{ turno.code }}</td>
            <td>{{ turno.name }}</td>
            <td>{{ turno.especialidad?.name || 'Sin especialidad' }}</td>
            <td>{{ turno.paciente?.name || 'Sin paciente' }}</td>
            <td>{{ turno.agenda?.fechaHora || 'Sin agenda' }}</td>
            <td>{{ turno.estado || 'Sin estado' }}</td>
            <td>
              <a [routerLink]="['/turnos/code', turno.code]" class="btn btn-sm btn-outline-primary">
                <i class="fa fa-pencil"></i>
              </a>
              <a (click)="remove(turno)" class="btn btn-sm btn-outline-danger ms-1">
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
export class TurnosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private turnoService: TurnoService,
    private modalService: ModalService) { }

  ngOnInit() {
    this.getTurnos();
  }

  getTurnos(): void {
    this.turnoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  remove(turno: Turno): void {
    let that = this;
    this.modalService.confirm("Eliminar turno", "¿Estás seguro de eliminar el turno?", "Si elimina el turno será irrecuperable")
      .then(function () {
        that.turnoService.delete(turno.code).subscribe(() => {
          that.getTurnos();
        });
      });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getTurnos();
  }
}