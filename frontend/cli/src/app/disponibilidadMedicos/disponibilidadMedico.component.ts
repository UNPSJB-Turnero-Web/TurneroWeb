import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DisponibilidadMedicoService } from './disponibilidadMedico.service';
import { DisponibilidadMedico } from './disponibilidadMedico';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { StaffMedico } from '../staffMedicos/staffMedico';

@Component({
  selector: 'app-disponibilidad-medico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between px-4">
          <div class="d-flex align-items-center">
            <i class="fa fa-calendar me-2"></i>
            <h2 class="fw-bold mb-0 fs-4">Disponibilidad Médica</h2>
          </div>
          <button 
            class="btn btn-light btn-sm"
            (click)="router.navigate(['/disponibilidades-medico/new'])"
          >
            <i class="fa fa-plus me-1"></i> Nueva Disponibilidad
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Staff Médico</th>
                <th>Día</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let disp of disponibilidades"
                (click)="goToDetail(disp.id)"
                style="cursor:pointer"
              >
                <td>{{ disp.id }}</td>
                <td>{{ getStaffMedicoNombre(disp.staffMedicoId) }}</td>
                <td>{{ disp.diaSemana }}</td>
                <td>{{ disp.horaInicio }}</td>
                <td>{{ disp.horaFin }}</td>
                <td class="text-center">
                  <button (click)="goToEdit(disp.id); $event.stopPropagation()" class="btn btn-sm btn-outline-primary me-1" title="Editar">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button (click)="remove(disp.id); $event.stopPropagation()" class="btn btn-sm btn-outline-danger" title="Eliminar">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DisponibilidadMedicoComponent {
  disponibilidades: DisponibilidadMedico[] = [];
  currentPage: number = 1; // Initialize currentPage to 1
  resultsPage!: ResultsPage; // Declare the resultsPage property
  staffMedicos: StaffMedico[] = []; // Agregado para almacenar el listado de médicos

  constructor(
    private disponibilidadService: DisponibilidadMedicoService,
    private staffMedicoService: StaffMedicoService, // <--- Agrega el servicio
    public router: Router,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    this.getDisponibilidades();
    this.getStaffMedicos(); // Obtener el listado de médicos al iniciar
  }

  getDisponibilidades(): void {
    this.disponibilidadService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;
      this.disponibilidades = this.resultsPage.content;

      // Por cada disponibilidad, traemos el staff médico completo
      this.disponibilidades.forEach(disp => {
        if (disp.staffMedicoId) {
          this.staffMedicoService.get(disp.staffMedicoId).subscribe(staffDP => {
            disp.staffMedico = staffDP.data as StaffMedico;
          });
        }
      });
    });
  }

  // Nuevo método para obtener el listado de médicos
  getStaffMedicos(): void {
    this.staffMedicoService.all().subscribe(dataPackage => {
      this.staffMedicos = dataPackage.data as StaffMedico[];
    });
  }

  goToEdit(id: number): void {
    this.router.navigate(['/disponibilidades-medico', id], { queryParams: { edit: true } });
  }

  goToDetail(id: number): void {
    this.router.navigate(['/disponibilidades-medico', id]);
  }

  remove(id: number): void {
    this.modalService
      .confirm(
        "Eliminar Disponibilidad",
        "¿Está seguro que desea eliminar esta disponibilidad?",
        "Si elimina la disponibilidad no podrá asignar turnos en ese horario"
      )
      .then(() => {
        this.disponibilidadService.remove(id).subscribe({
          next: () => this.getDisponibilidades(),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar la disponibilidad.";
            alert(msg);
            console.error("Error al eliminar Disponibilidad:", err);
          }
        });
      });
  }

  getStaffMedicoNombre(staffMedicoId: number): string {
    const staff = this.staffMedicos.find(s => s.id === staffMedicoId);
    if (!staff) return 'Sin asignar';
  
    const medicoNombre = staff.medico ? `${staff.medico.nombre} ${staff.medico.apellido}` : 'Sin médico';
    const especialidadNombre = staff.especialidad ? staff.especialidad.nombre : 'Sin especialidad';
  
    return `${medicoNombre} (${especialidadNombre})`;
  }
}