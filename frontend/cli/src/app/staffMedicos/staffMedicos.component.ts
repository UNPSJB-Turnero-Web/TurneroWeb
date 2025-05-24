import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StaffMedicoService } from './staffMedico.service';
import { StaffMedico } from './staffMedico';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-staff-medicos',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <i class="fa fa-user-md me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Staff Médico</h2>
          </div>
          <button 
            class="btn btn-light btn-sm"
            (click)="router.navigate(['/staffMedico/new'])"
          >
            <i class="fa fa-plus me-1"></i> Nuevo Staff Médico
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Centro</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let staff of resultsPage.content"
                (click)="goToDetail(staff.id)"
                style="cursor:pointer"
              >
                <td>{{ staff.id }}</td>
                <td>{{ staff.centro?.nombre || 'Sin centro' }}</td>
                <td>{{ staff.medico?.nombre }} {{ staff.medico?.apellido }}</td>
                <td>{{ staff.especialidad?.nombre || 'Sin especialidad' }}</td>
                <td class="text-center">
                  <button (click)="goToEdit(staff.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="confirmDelete(staff.id); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer bg-white">
          <app-pagination
            [totalPages]="resultsPage.totalPages"
            [currentPage]="currentPage"
            (pageChangeRequested)="onPageChangeRequested($event)"
            [number]="resultsPage.number"
            [hidden]="resultsPage.numberOfElements < 1"
          ></app-pagination>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-hover tbody tr:hover {
      background-color: #f5f7fa;
    }
    .btn-outline-primary, .btn-outline-danger {
      min-width: 32px;
    }
    .card {
      border-radius: 1.15rem;
      overflow: hidden;
    }
    .card-header {
      border-top-left-radius: 1rem !important;
      border-top-right-radius: 1rem !important;
      padding-top: 0.75rem;      
      padding-bottom: 0.75rem;  
      padding-right: 0.7rem!important;
      padding-left: 0.7rem!important;  
      overflow: hidden;
    }
  `]
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

  goToDetail(id: number): void {
    this.router.navigate(['/staffMedico', id]);
  }

  confirmDelete(id: number): void {
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