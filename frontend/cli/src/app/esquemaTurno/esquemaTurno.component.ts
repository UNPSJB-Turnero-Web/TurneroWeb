import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';
import { EsquemaTurnoService } from './esquemaTurno.service';
import { EsquemaTurno } from './esquemaTurno';
import { ConsultorioService } from '../consultorios/consultorio.service';
import { Consultorio } from '../consultorios/consultorio';
@Component({
  selector: 'app-esquema-turno',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  template: `
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
          <div class="d-flex align-items-center">
            <i class="fa fa-calendar-check me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Esquemas de Agenda</h2>
          </div>
          <button 
            class="btn btn-light btn-sm"
            (click)="router.navigate(['/esquema-turno/new'])"
          >
            <i class="fa fa-plus me-1"></i> Nuevo Esquema
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Staff Médico</th>
                <th>Consultorio</th>
                <th>Días</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Intervalo</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let esquema of resultsPage.content"
                (click)="goToDetail(esquema.id)"
                style="cursor:pointer"
              >
                <td>{{ esquema.id }}</td>
                <td>{{ getStaffMedicoNombre(esquema.staffMedicoId) }}</td>
                <td>{{ getConsultorioNombre(esquema.consultorioId) }}</td>
                <td>{{ esquema.diasSemana?.join(', ') }}</td>
                <td>{{ esquema.horaInicio }}</td>
                <td>{{ esquema.horaFin }}</td>
                <td>{{ esquema.intervalo }} min</td>
                <td class="text-center">
                  <button (click)="goToEdit(esquema.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="remove(esquema.id); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
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
export class EsquemaTurnoComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];

  constructor(
    private esquemaTurnoService: EsquemaTurnoService,
    private disponibilidadService: DisponibilidadMedicoService,
    private staffMedicoService: StaffMedicoService,
    public router: Router,
    private modalService: ModalService,
    private consultorioService: ConsultorioService
  ) {}

  ngOnInit() {
    this.getEsquemas();
    this.staffMedicoService.all().subscribe(dp => {
      this.staffMedicos = dp.data as StaffMedico[];
    });
    this.consultorioService.getAll().subscribe(dp => {
      this.consultorios = dp.data as Consultorio[];
    });
  }


  getEsquemas(): void {
    this.esquemaTurnoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
      // Por cada esquema, traemos la disponibilidad y el staff
      this.resultsPage.content.forEach((esquema: EsquemaTurno) => {
        if (esquema.disponibilidadMedicoId) {
          this.disponibilidadService.get(esquema.disponibilidadMedicoId).subscribe(dp => {
            esquema.disponibilidadMedico = dp.data;
            // Ahora traemos el staff médico
            if (esquema.disponibilidadMedico.staffMedicoId) {
              this.staffMedicoService.get(esquema.disponibilidadMedico.staffMedicoId).subscribe(staffDP => {
                esquema.staffMedico = staffDP.data;
              });
            }
          });
        }
      });
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getEsquemas();
  }

  goToEdit(id: number): void {
    this.router.navigate(['/esquema-turno', id], { queryParams: { edit: true } });
  }

  goToDetail(id: number): void {
    this.router.navigate(['/esquema-turno', id]);
  }

  remove(id: number): void {
    this.modalService
      .confirm(
        "Eliminar Esquema de Turno",
        "¿Está seguro que desea eliminar este esquema?",
        "Si elimina el esquema no podrá asignar turnos en ese horario"
      )
      .then(() => {
        this.esquemaTurnoService.remove(id).subscribe({
          next: () => this.getEsquemas(),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar el esquema.";
            alert(msg);
            console.error("Error al eliminar Esquema de Turno:", err);
          }
        });
      });
  }

  getStaffMedicoNombre(staffMedicoId: number): string {
    if (!this.staffMedicos) return '';
    const staff = this.staffMedicos.find(s => s.id === staffMedicoId);
    if (!staff) return '';
    return `${staff.medicoNombre} (${staff.especialidadNombre})`;
  }

  getConsultorioNombre(consultorioId: number): string {
    if (!consultorioId || !this.consultorios) return '';
    const consultorio = this.consultorios.find(c => c.id === consultorioId);
    return consultorio ? consultorio.name : '';
  }
}