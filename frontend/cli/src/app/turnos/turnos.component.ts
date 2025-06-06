import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
    <div class="container-fluid mt-4">
      <div class="modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-turnos">
          <div class="header-content">
            <div class="title-section">
              <div class="header-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="header-text">
                <h1>Turnos Médicos</h1>
                <p>Gestión de citas y consultas médicas</p>
              </div>
            </div>
            <button 
              class="btn btn-new"
              (click)="router.navigate(['/turnos/new'])"
            >
              <i class="fas fa-plus me-2"></i>
              Nuevo Turno
            </button>
          </div>
        </div>

        <!-- TABLA MODERNA NORMALIZADA -->
        <div class="table-container">
          <table class="table modern-table">
            <thead>
              <tr>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-turnos">
                      <i class="fas fa-hashtag"></i>
                    </div>
                    ID
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-pacientes">
                      <i class="fas fa-user"></i>
                    </div>
                    Paciente
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-medicos">
                      <i class="fas fa-user-md"></i>
                    </div>
                    Médico
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-especialidades">
                      <i class="fas fa-stethoscope"></i>
                    </div>
                    Especialidad
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-turnos">
                      <i class="fas fa-calendar-alt"></i>
                    </div>
                    Fecha & Hora
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-centro-atencion">
                      <i class="fas fa-hospital"></i>
                    </div>
                    Centro/Consultorio
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-turnos">
                      <i class="fas fa-info-circle"></i>
                    </div>
                    Estado
                  </div>
                </th>
                <th>
                  <div class="header-cell text-center">
                    <div class="icon-circle icon-turnos">
                      <i class="fas fa-cogs"></i>
                    </div>
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let turno of resultsPage.content; let i = index"
                class="table-row"
                (click)="goToDetail(turno.id)"
                [style.animation-delay]="(i * 100) + 'ms'"
              >
                <td>
                  <div class="id-badge">
                    <span>{{ turno.id }}</span>
                  </div>
                </td>
                <td>
                  <div class="paciente-info">
                    <div class="paciente-avatar">
                      <span>{{ getPacienteInitials(turno.nombrePaciente, turno.apellidoPaciente) }}</span>
                    </div>
                    <div class="paciente-details">
                      <span class="paciente-name">{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</span>
                      <span class="paciente-id">ID: {{ turno.pacienteId }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="medico-info">
                    <div class="medico-avatar">
                      <span>{{ getMedicoInitials(turno.staffMedicoNombre, turno.staffMedicoApellido) }}</span>
                    </div>
                    <div class="medico-details">
                      <span class="medico-name">{{ turno.staffMedicoNombre }} {{ turno.staffMedicoApellido }}</span>
                      <span class="medico-id">Staff ID: {{ turno.staffMedicoId }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="badge-especialidades">
                    {{ turno.especialidadStaffMedico || 'Sin especialidad' }}
                  </div>
                </td>
                <td>
                  <div class="fecha-info">
                    <div class="fecha-day">{{ turno.fecha | date:'dd/MM/yyyy' }}</div>
                    <div class="fecha-time">{{ turno.horaInicio }} - {{ turno.horaFin }}</div>
                  </div>
                </td>
                <td>
                  <div class="centro-info">
                    <div class="centro-name">{{ turno.nombreCentro }}</div>
                    <div class="consultorio-name">Consultorio: {{ turno.consultorioNombre }}</div>
                  </div>
                </td>
                <td>
                  <div class="estado-badge" 
                       [class]="getEstadoBadgeClass(turno.estado)">
                    <i class="fas" [class]="getEstadoIcon(turno.estado)"></i>
                    {{ turno.estado }}
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit"
                      (click)="goToEdit(turno.id); $event.stopPropagation()" 
                      title="Editar turno"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-delete"
                      (click)="confirmDelete(turno.id); $event.stopPropagation()" 
                      title="Eliminar turno"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="resultsPage.content?.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-calendar-check fa-3x mb-3 opacity-50"></i>
                  <p class="mb-0">No hay turnos registrados</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer">
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
    /* Turnos específicos usando sistema de colores global */
    .paciente-info, .medico-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .paciente-avatar, .medico-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .paciente-avatar {
      background: var(--pacientes-gradient);
      box-shadow: 0 4px 12px var(--pacientes-shadow);
    }

    .medico-avatar {
      background: var(--medicos-gradient);
      box-shadow: 0 4px 12px var(--medicos-shadow);
    }

    .paciente-details, .medico-details {
      display: flex;
      flex-direction: column;
    }

    .paciente-name, .medico-name {
      font-weight: 600;
      color: #495057;
      font-size: 0.95rem;
      line-height: 1.2;
    }

    .paciente-id, .medico-id {
      font-size: 0.8rem;
      color: #6c757d;
      line-height: 1.2;
    }

    .fecha-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .fecha-day {
      font-weight: 600;
      color: #495057;
      font-size: 0.95rem;
    }

    .fecha-time {
      font-size: 0.85rem;
      color: #6c757d;
      background: var(--turnos-light);
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .centro-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .centro-name {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .consultorio-name {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .id-badge {
      background: var(--turnos-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px var(--turnos-shadow);
    }

    .badge-especialidades {
      background: var(--especialidades-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px var(--especialidades-shadow);
      display: inline-block;
    }

    .estado-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .estado-badge.pendiente {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #212529;
      box-shadow: 0 4px 12px rgba(255,193,7,0.3);
    }

    .estado-badge.confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(40,167,69,0.3);
    }

    .estado-badge.cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(220,53,69,0.3);
    }

    .estado-badge.completado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(23,162,184,0.3);
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-action {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }

    .btn-edit {
      background: var(--action-edit);
      color: white;
    }

    .btn-edit:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px var(--action-edit-shadow);
    }

    .btn-delete {
      background: var(--action-delete);
      color: white;
    }

    .btn-delete:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px var(--action-delete-shadow);
    }
  .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    
    .title-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .header-text h1 {
      color: white;
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 1rem;
    }

    .table-row:hover {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .table-row td {
      padding: 1.25rem 1rem;
      vertical-align: middle;
      border: none;
    }
    
    /* Animaciones */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .table-row {
      animation: fadeInUp 0.5s ease-out;
    }

    .table-row:nth-child(1) { animation-delay: 0.1s; }
    .table-row:nth-child(2) { animation-delay: 0.2s; }
    .table-row:nth-child(3) { animation-delay: 0.3s; }
    .table-row:nth-child(4) { animation-delay: 0.4s; }
    .table-row:nth-child(5) { animation-delay: 0.5s; }

    /* Responsive */
    @media (max-width: 992px) {
      .paciente-info, .medico-info {
        gap: 0.5rem;
      }
      
      .paciente-avatar, .medico-avatar {
        width: 32px;
        height: 32px;
        font-size: 0.8rem;
      }
      
      .fecha-info {
        font-size: 0.85rem;
      }
      
      .centro-info {
        max-width: 150px;
      }
      
      .centro-name, .consultorio-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .modern-table {
        min-width: 900px;
      }
      
      .header-cell {
        font-size: 0.8rem;
      }
      
      .table-row td {
        padding: 1rem 0.5rem;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .btn-action {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class TurnosComponent {
  resultsPage: ResultsPage = <ResultsPage>{};
  currentPage: number = 1;

  constructor(
    private turnoService: TurnoService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getTurnos();
  }

  getTurnos(): void {
    this.turnoService.all().subscribe(dataPackage => {
      console.log('DataPackage recibido:', dataPackage);
      // El backend devuelve un array directamente, no paginado
      const turnos = dataPackage.data || [];
      console.log('Turnos extraídos:', turnos);
      this.resultsPage = {
        content: turnos,
        totalPages: 1,
        totalElements: turnos.length,
        numberOfElements: turnos.length,
        number: 0,
        size: turnos.length,
        first: true,
        last: true
      };
      console.log('ResultsPage final:', this.resultsPage);
    });
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar turno",
        "¿Está seguro que desea eliminar este turno?",
        "Esta acción no se puede deshacer"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  remove(id: number): void {
    this.turnoService.remove(id).subscribe({
      next: () => this.getTurnos(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el turno.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar turno:", err);
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.getTurnos();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/turnos', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/turnos', id], { queryParams: { edit: true } });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'pendiente';
      case 'CONFIRMADO':
        return 'confirmado';
      case 'CANCELADO':
        return 'cancelado';
      case 'COMPLETADO':
        return 'completado';
      default:
        return 'pendiente';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'fa-clock';
      case 'CONFIRMADO':
        return 'fa-check-circle';
      case 'CANCELADO':
        return 'fa-times-circle';
      case 'COMPLETADO':
        return 'fa-check-double';
      default:
        return 'fa-question-circle';
    }
  }

  getPacienteInitials(nombre?: string, apellido?: string): string {
    if (!nombre && !apellido) return 'P';
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return `${n}${a}`.toUpperCase() || 'P';
  }

  getMedicoInitials(nombre?: string, apellido?: string): string {
    if (!nombre && !apellido) return 'M';
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return `${n}${a}`.toUpperCase() || 'M';
  }
}