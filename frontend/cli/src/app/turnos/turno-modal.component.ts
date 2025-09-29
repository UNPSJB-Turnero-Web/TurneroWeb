import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-turno-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <i class="fas fa-calendar-check text-primary me-2"></i>
        Turno #{{turno?.id}}
      </h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="row g-3" *ngIf="turno">
        <!-- Estado del turno -->
        <div class="col-12">
          <div class="d-flex align-items-center">
            <span class="badge fs-6 me-2" [ngClass]="getEstadoBadgeClass(turno.estado)">
              {{getEstadoDisplayName(turno.estado)}}
            </span>
            <small class="text-muted">Estado actual</small>
          </div>
        </div>

        <!-- Fecha y hora -->
        <div class="col-md-6">
          <div class="card h-100 border-0 bg-light">
            <div class="card-body p-3">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-calendar-alt text-info me-2"></i>
                <strong class="text-muted">Fecha</strong>
              </div>
              <p class="mb-0 fw-bold">{{turno.fecha | date:'dd/MM/yyyy'}}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100 border-0 bg-light">
            <div class="card-body p-3">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-clock text-warning me-2"></i>
                <strong class="text-muted">Horario</strong>
              </div>
              <p class="mb-0 fw-bold">{{turno.horaInicio}} - {{turno.horaFin}}</p>
            </div>
          </div>
        </div>

        <!-- Paciente -->
        <div class="col-12">
          <div class="card border-0 bg-light">
            <div class="card-body p-3">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-user text-success me-2"></i>
                <strong class="text-muted">Paciente</strong>
              </div>
              <p class="mb-0 fw-bold">{{turno.nombrePaciente}} {{turno.apellidoPaciente}}</p>
              <small class="text-muted">ID: {{turno.pacienteId}}</small>
            </div>
          </div>
        </div>

        <!-- Médico y especialidad -->
        <div class="col-12">
          <div class="card border-0 bg-light">
            <div class="card-body p-3">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-user-md text-primary me-2"></i>
                <strong class="text-muted">Profesional Médico</strong>
              </div>
              <p class="mb-0 fw-bold">{{turno.staffMedicoNombre}} {{turno.staffMedicoApellido}}</p>
              <small class="text-muted">{{turno.especialidadStaffMedico}}</small>
            </div>
          </div>
        </div>

        <!-- Centro y consultorio -->
        <div class="col-md-6">
          <div class="card h-100 border-0 bg-light">
            <div class="card-body p-3">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-hospital text-danger me-2"></i>
                <strong class="text-muted">Centro de Atención</strong>
              </div>
              <p class="mb-0 fw-bold">{{turno.nombreCentro}}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100 border-0 bg-light">
            <div class="card-body p-3">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-door-open text-secondary me-2"></i>
                <strong class="text-muted">Consultorio</strong>
              </div>
              <p class="mb-0 fw-bold">{{turno.consultorioNombre}}</p>
            </div>
          </div>
        </div>

        <!-- Información de auditoría -->
        <div class="col-12" *ngIf="turno.fechaUltimaModificacion">
          <div class="card border-0 bg-light">
            <div class="card-body p-3">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-history text-muted me-2"></i>
                <strong class="text-muted">Última Modificación</strong>
              </div>
              <p class="mb-1">
                <small class="text-muted">Por: {{turno.ultimoUsuarioModificacion}}</small>
              </p>
              <p class="mb-1">
                <small class="text-muted">Fecha: {{turno.fechaUltimaModificacion | date:'dd/MM/yyyy HH:mm'}}</small>
              </p>
              <p class="mb-0" *ngIf="turno.motivoUltimaModificacion">
                <small class="text-muted">Motivo: {{turno.motivoUltimaModificacion}}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">
        <i class="fas fa-times me-1"></i>
        Cerrar
      </button>
    </div>
  `,
  styles: [`
    .modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom: none;
      border-radius: 0.5rem 0.5rem 0 0;
    }

    .modal-title {
      font-weight: 600;
    }

    .badge {
      font-size: 0.75rem !important;
    }

    .card {
      transition: transform 0.2s ease-in-out;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `]
})
export class TurnoModalComponent {
  @Input() turno: any;

  constructor(public modal: NgbActiveModal) {}

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROGRAMADO': return 'bg-warning text-dark';
      case 'CONFIRMADO': return 'bg-success';
      case 'CANCELADO': return 'bg-danger';
      case 'REAGENDADO': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getEstadoDisplayName(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROGRAMADO': return 'Programado';
      case 'CONFIRMADO': return 'Confirmado';
      case 'CANCELADO': return 'Cancelado';
      case 'REAGENDADO': return 'Reagendado';
      default: return estado || 'Desconocido';
    }
  }
}
