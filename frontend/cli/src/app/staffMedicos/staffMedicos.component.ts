import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StaffMedicoService } from './staffmedico.service';
import { StaffMedico } from './staffmedico';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-staff-medicos',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
<h2>Staff Médico</h2>&nbsp;<a routerLink="/staffMedico/new" class="btn btn-success">Nuevo Staff Médico</a>
<div class="table-responsive">
  <table class="table table-striped table-sm">
    <thead>
      <tr>
        <th>#</th>
        <th>Centro</th>
        <th>Médico</th>
        <th>Especialidad</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let staff of resultsPage.content; index as i">
        <td>{{ staff.id }}</td>
        <td>{{ staff.centro?.name }}</td>
        <td>{{ staff.medico?.name }} {{ staff.medico?.apellido }}</td>
        <td>{{ staff.especialidad?.name }}</td>
        <td>
          <a [routerLink]="['/staffMedico', staff.id]" class="btn btn-sm btn-outline-primary">
            <i class="fa fa-pencil"></i>
          </a>
          <a (click)="remove(staff.id)" class="btn btn-sm btn-outline-danger ms-1">
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
      ></app-pagination>
    </tfoot>
  </table>
</div>
  `,
  styles: ``
})
export class StaffMedicosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private staffMedicoService: StaffMedicoService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getStaffMedicos();
  }

  getStaffMedicos(): void {
    this.staffMedicoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
    });
  }

  remove(id: number): void {
    this.modalService
      .confirm(
        "Eliminar Staff Médico",
        "¿Está seguro que desea eliminar este Staff Médico?",
        "Si elimina el Staff Médico no lo podrá utilizar luego"
      )
      .then(() => {
        this.staffMedicoService.remove(id).subscribe({
          next: () => this.getStaffMedicos(),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar el Staff Médico.";
            alert(msg);
            console.error("Error al eliminar Staff Médico:", err);
          }
        });
      });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getStaffMedicos();
  }
}