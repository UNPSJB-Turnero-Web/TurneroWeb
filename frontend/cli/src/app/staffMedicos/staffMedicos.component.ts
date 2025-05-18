import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Staff Médico</h2>
        <button class="btn btn-success" (click)="router.navigate(['/staffMedico/new'])">
          + Nuevo Staff Médico
        </button>
      </div>
      <table class="table table-striped table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Centro</th>
            <th>Médico</th>
            <th>Especialidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let staff of resultsPage.content">
            <td>{{ staff.id }}</td>
            <td>{{ staff.centro?.name }}</td>
            <td>{{ staff.medico?.name }} {{ staff.medico?.apellido }}</td>
            <td>{{ staff.especialidad?.nombre }}</td>
            <td>
              <a 
                (click)="goToEdit(staff.id); $event.stopPropagation()" 
                class="btn btn-sm btn-outline-primary">
                <i class="fa fa-pencil"></i>
              </a>
              <a 
                (click)="remove(staff.id); $event.stopPropagation()" 
                class="btn btn-sm btn-outline-danger ms-1">
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
    public router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getStaffMedicos();
  }

  getStaffMedicos(): void {
    this.staffMedicoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = dataPackage.data;
    });
  }



  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getStaffMedicos();
  }

  goToEdit(id: number): void {
    this.router.navigate(['/staffMedico', id], { queryParams: { edit: true } });
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
}