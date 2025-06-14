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
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-esquema-turno',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent,FormsModule],
  template: `
    <div class="container mt-4">
      <div class="card modern-card">
        <!-- HEADER NORMALIZADO CON SISTEMA DE COLORES -->
        <div class="banner-esquema-turno">
          <div class="header-content">
            <div class="title-section">
              <div class="header-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="header-text">
                <h1>Esquemas de Turno</h1>
                <p>Gestione los esquemas de turnos para médicos</p>
              </div>
            </div>
            <button 
              class="btn btn-new"
              (click)="router.navigate(['/esquema-turno/new'])"
            >
              <i class="fas fa-plus me-2"></i>
              Nuevo Esquema
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
                    <div class="icon-circle id-header">
                      <i class="fas fa-hashtag"></i>
                    </div>
                    ID
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-medicos">
                      <i class="fas fa-user-md"></i>
                    </div>
                    Staff Médico
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-consultorios">
                      <i class="fas fa-door-open"></i>
                    </div>
                    Consultorio
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-centro-atencion">
                      <i class="fas fa-hospital"></i>
                    </div>
                    Centro
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-disponibilidad">
                      <i class="fas fa-clock"></i>
                    </div>
                    Horarios
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    <div class="icon-circle icon-esquema-turno">
                      <i class="fas fa-stopwatch"></i>
                    </div>
                    Intervalo
                  </div>
                </th>
                <th>
                  <div class="header-cell text-center">
                    <div class="icon-circle actions-header">
                      <i class="fas fa-cogs"></i>
                    </div>
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let esquema of resultsPage.content || []; let i = index"
                class="table-row"
                (click)="goToDetail(esquema.id)"
                [style.animation-delay]="(i * 100) + 'ms'"
              >
                <td>
                  <div class="id-badge">
                    <span>{{ esquema.id }}</span>
                  </div>
                </td>
                <td>
                  <div class="staff-info">
                    <div class="avatar-medicos">
                      {{ getStaffMedicoInitials(esquema.staffMedicoId) }}
                    </div>
                    <div class="medico-details">
                      <span class="medico-name">{{ getStaffMedicoNombre(esquema.staffMedicoId) }}</span>
                      <span class="medico-especialidad">{{ getStaffMedicoEspecialidad(esquema.staffMedicoId) }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="badge-consultorios">
                    <i class="fas fa-door-open me-1"></i>
                    {{ getConsultorioNombre(esquema.consultorioId) }}
                  </div>
                </td>
                <td>
                  <div class="badge-centro-atencion">
                    <i class="fas fa-hospital me-1"></i>
                    {{ getCentroAtencionNombre(esquema.centroId) }}
                  </div>
                </td>
                <td>
                  <div class="horarios-container">
                    <div *ngFor="let horario of esquema.horarios" class="horario-badge">
                      <span class="dia-label">{{ horario.dia }}</span>
                      <span class="hora-range">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                    </div>
                    <div *ngIf="!esquema.horarios || esquema.horarios.length === 0" class="no-horarios">
                      Sin horarios configurados
                    </div>
                  </div>
                </td>
                <td>
                  <div class="badge-esquema-turno">
                    <i class="fas fa-clock me-1"></i>
                    {{ esquema.intervalo }} min
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit"
                      (click)="goToEdit(esquema.id); $event.stopPropagation()" 
                      title="Editar esquema"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-delete"
                      (click)="remove(esquema.id); $event.stopPropagation()" 
                      title="Eliminar esquema"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
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
    /* Estilos normalizados usando el sistema de colores global */
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .modern-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      border: none;
      overflow: hidden;
      backdrop-filter: blur(10px);
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

    .table-container {
      padding: 0;
      overflow-x: auto;
    }

    .table-row {
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
      border-bottom: 1px solid #f8f9fa;
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

    /* ID BADGE usando sistema global */
    .id-badge {
      background: var(--esquema-turno-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 15px var(--esquema-turno-shadow);
      display: inline-block;
    }

    /* STAFF INFO usando sistema global */
    .staff-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar-medicos {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--medicos-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 4px 12px var(--medicos-shadow);
    }

    .medico-details {
      display: flex;
      flex-direction: column;
    }

    .medico-name {
      font-weight: 600;
      color: #495057;
      font-size: 0.95rem;
      line-height: 1.2;
    }

    .medico-especialidad {
      font-size: 0.8rem;
      color: #6c757d;
      line-height: 1.2;
    }

    /* BADGES usando sistema global */
    .badge-consultorios {
      background: var(--consultorios-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      box-shadow: 0 4px 15px var(--consultorios-shadow);
      display: inline-flex;
      align-items: center;
    }

    .badge-centro-atencion {
      background: var(--centro-atencion-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      box-shadow: 0 4px 15px var(--centro-atencion-shadow);
      display: inline-flex;
      align-items: center;
    }

    .badge-esquema-turno {
      background: var(--esquema-turno-gradient);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      box-shadow: 0 4px 15px var(--esquema-turno-shadow);
      display: inline-flex;
      align-items: center;
    }

    /* HORARIOS con el mismo estilo que disponibilidadMedico */
    .horarios-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .horario-badge {
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      color: white;
      padding: 8px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      min-width: 80px;
    }

    .dia-label {
      font-size: 0.7rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .hora-range {
      font-weight: 600;
      font-size: 0.75rem;
    }

    .no-horarios {
      color: #636e72;
      font-style: italic;
      font-size: 0.9rem;
      background: linear-gradient(135deg, #f1f2f6 0%, #e3e4e8 100%);
      padding: 8px 12px;
      border-radius: 12px;
    }

    /* BOTONES DE ACCIÓN usando sistema global */
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
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
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .btn-edit {
      background: var(--action-edit);
      color: white;
    }

    .btn-edit:hover {
      background: var(--action-edit);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }

    .btn-delete {
      background: var(--action-delete);
      color: white;
    }

    .btn-delete:hover {
      background: var(--action-delete);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }

    /* ANIMACIONES */
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

    /* RESPONSIVE */
    @media (max-width: 1200px) {
      .header-content {
        padding: 1.5rem;
      }
      
      .header-text h1 {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .title-section {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .modern-table {
        min-width: 800px;
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
      
      .horarios-container {
        justify-content: center;
      }
      
      .horario-badge {
        min-width: 70px;
        font-size: 0.7rem;
      }
    }
  `]
})
export class EsquemaTurnoComponent {
  resultsPage: ResultsPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    numberOfElements: 0,
    first: true,
    last: true
  };
  currentPage: number = 1;
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];
  centrosAtencion: CentroAtencion[] = [];
  esquema: EsquemaTurno = {
    id: 0,
    intervalo: 15,
    disponibilidadMedicoId: 0,
    staffMedicoId: 0,
    centroId: 0,
    consultorioId: 0,
    horarios: [], // Inicializamos como un array vacío
    horariosDisponibilidad: [], // Inicializamos como un array vacío
  };

  constructor(
    private esquemaTurnoService: EsquemaTurnoService,
    private disponibilidadService: DisponibilidadMedicoService,
    private staffMedicoService: StaffMedicoService,
    public router: Router,
    private modalService: ModalService,
    private consultorioService: ConsultorioService,
    private centroAtencionService: CentroAtencionService
  ) { }

  ngOnInit() {
    this.getEsquemas();
    this.staffMedicoService.all().subscribe(dp => {
      this.staffMedicos = dp.data as StaffMedico[];
    });
    this.consultorioService.getAll().subscribe(dp => {
      this.consultorios = dp.data as Consultorio[];
    });
    this.centroAtencionService.all().subscribe(dp => {
      this.centrosAtencion = dp.data as CentroAtencion[];
    });
  }


  getEsquemas(): void {
    this.esquemaTurnoService.byPage(this.currentPage, 10).subscribe(dataPackage => {
      this.resultsPage = <ResultsPage>dataPackage.data;

      // Procesar cada esquema para asignar datos relacionados
      this.resultsPage.content.forEach((esquema: EsquemaTurno) => {
        // Obtener el staff médico
        if (esquema.staffMedicoId) {
          const staff = this.staffMedicos.find(s => s.id === esquema.staffMedicoId);
          if (staff) {
            esquema.staffMedico = staff;
          }
        }

        // Obtener el consultorio
        if (esquema.consultorioId) {
          const consultorio = this.consultorios.find(c => c.id === esquema.consultorioId);
          if (consultorio) {
            esquema.consultorio = consultorio;
          }
        }

        // Obtener el centro de atención
        if (esquema.centroId) {
          const centro = this.centrosAtencion.find(c => c.id === esquema.centroId);
          if (centro) {
            esquema.centroAtencion = centro;
          }
        }

        // Procesar los horarios del esquema
        if (!esquema.horarios || esquema.horarios.length === 0) {
          esquema.horarios = [];
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
    return staff.medico ? `${staff.medico.nombre} ${staff.medico.apellido}` : 'Sin médico';
  }

  getStaffMedicoInitials(staffMedicoId: number): string {
    if (!this.staffMedicos) return '??';
    const staff = this.staffMedicos.find(s => s.id === staffMedicoId);
    if (!staff || !staff.medico) return '??';
    
    const nombre = staff.medico.nombre?.charAt(0).toUpperCase() || '';
    const apellido = staff.medico.apellido?.charAt(0).toUpperCase() || '';
    return nombre + apellido || '??';
  }

  getStaffMedicoEspecialidad(staffMedicoId: number): string {
    if (!this.staffMedicos) return '';
    const staff = this.staffMedicos.find(s => s.id === staffMedicoId);
    if (!staff) return '';
    return staff.especialidad ? staff.especialidad.nombre : 'Sin especialidad';
  }

  getConsultorioNombre(consultorioId: number): string {
    if (!consultorioId || !this.consultorios) return '';
    const consultorio = this.consultorios.find(c => c.id === consultorioId);
    return consultorio ? consultorio.nombre : '';
  }
  getCentroAtencionNombre(centroId: number): string {
    if (!centroId || !this.centrosAtencion) return '';
    const centro = this.centrosAtencion.find(c => c.id === centroId);
    return centro ? centro.nombre : '';
  }
  getDiasSemana(horarios: { dia: string; horaInicio: string; horaFin: string }[]): string {
    if (!horarios || horarios.length === 0) {
      return 'Sin días asignados';
    }
    return horarios
      .map(h => `${h.dia}: ${h.horaInicio} - ${h.horaFin}`)
      .join(', ');
  }
}