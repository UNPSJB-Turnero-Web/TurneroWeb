import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistorialTurnoDTO } from './historial.service';

@Component({
  selector: 'app-historial-turno-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detalle-modal">
      <div class="modal-header">
        <h4>
          <i class="fas fa-calendar-check"></i> Detalle del Turno #{{ turno.id }}
        </h4>
        <button type="button" class="btn-close" (click)="closeModal.emit()"></button>
      </div>
      
      <div class="modal-body" *ngIf="turno">
        <!-- Estado y Fecha -->
        <div class="estado-fecha-section">
          <div class="estado-badge" [ngClass]="'estado-' + turno.estado.toLowerCase()">
            {{ turno.estado }}
          </div>
          <div class="fecha-info">
            {{ turno.fecha | date:'fullDate':'':'es' }}
            <div class="hora">{{ turno.horaInicio }} - {{ turno.horaFin }}</div>
          </div>
        </div>

        <!-- Información Principal -->
        <div class="info-section">
          <div class="info-row">
            <div class="info-label">
              <i class="fas fa-user-md"></i>
              <span>Médico: </span>
            </div>
            <div class="info-value"> {{ turno.staffMedicoNombre }} {{ turno.staffMedicoApellido }}</div>
          </div>

          <div class="info-row">
            <div class="info-label">
              <i class="fas fa-stethoscope"></i>
              <span>Especialidad: </span>
            </div>
            <div class="info-value"> {{ turno.especialidadStaffMedico }}</div>
          </div>

          <!-- Centro de Atención -->
          <div class="info-row">
            <div class="info-label">
              <i class="fas fa-hospital"></i>
              <span>Centro</span>
            </div>
            <div class="info-value">{{ turno.nombreCentro }}</div>
          </div>

          <!-- Consultorio -->
          <div class="info-row" *ngIf="turno.consultorioNombre">
            <div class="info-label">
              <i class="fas fa-door-open"></i>
              <span>Consultorio: </span>
            </div>
            <div class="info-value">{{ turno.consultorioNombre }}</div>
          </div>

          <!-- Observaciones si existen -->
          <div class="info-row observaciones-row" *ngIf="turno.observaciones">
            <div class="info-label">
              <i class="fas fa-clipboard-list"></i>
              <span>Observaciones: </span>
            </div>
            <div class="info-value observaciones">
              {{ turno.observaciones }}
            </div>
          </div>
        </div>

        <!-- Estado de Asistencia -->
        <div class="asistencia-section">
          <div class="asistencia-badge" [ngClass]="{'asistio': turno.asistio, 'no-asistio': !turno.asistio}">
            <i [class]="turno.asistio ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            {{ turno.asistio ? 'Asistió al turno' : 'No asistió al turno' }}
          </div>
        </div>

        <!-- Información de Auditoría -->
        <div class="audit-section">
          <div class="audit-row">
            <div class="audit-label">Actualizado por:</div>
            <div class="audit-value">{{ turno.performedBy }}</div>
          </div>
          <div class="audit-row">
            <div class="audit-label">Última actualización:</div>
            <div class="audit-value">{{ turno.updatedAt | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detalle-modal {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      max-width: 600px;
      margin: 0 auto;
    }

    .modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h4 {
      margin: 0;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-body {
      padding: 2rem;
    }

    /* Estado y Fecha Section */
    .estado-fecha-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .estado-badge {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      border-radius: 25px;
      font-weight: 600;
      color: white;
      margin-bottom: 1rem;
    }

    .fecha-info {
      font-size: 1.2rem;
      color: #495057;
    }

    .hora {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
      margin-top: 0.5rem;
    }

    /* Info Section */
    .info-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .info-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .info-label {
      flex: 0 0 120px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #495057;
      font-weight: 500;
    }

    .info-label i {
      color: #667eea;
    }

    .info-value {
      flex: 1;
      color: #212529;
    }

    .observaciones-row {
      background: rgba(108, 117, 125, 0.1);
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
    }

    .observaciones {
      font-style: italic;
      color: #6c757d;
      white-space: pre-line;
      margin-top: 0.5rem;
    }

    /* Estados */
    .estado-programado { background: #ffc107; color: #000; }
    .estado-confirmado { background: #17a2b8; }
    .estado-completado { background: #28a745; }
    .estado-cancelado { background: #dc3545; }

    /* Asistencia Section */
    .asistencia-section {
      text-align: center;
      margin: 2rem 0;
    }

    .asistencia-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 600;
    }

    .asistencia-badge.asistio {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }

    .asistencia-badge.no-asistio {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }

    /* Audit Section */
    .audit-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 2rem;
    }

    .audit-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #6c757d;
      padding: 0.5rem 0;
    }

    .audit-label {
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 576px) {
      .modal-body {
        padding: 1rem;
      }

      .info-row {
        flex-direction: row; /* Mantén horizontal en lugar de column */
        align-items: center; /* Alinea verticalmente el ícono y texto */
        flex-wrap: wrap; /* Permite wrap solo si es absolutamente necesario */
      }
     .info-label {
        flex: 0 0 80px; /* Reduce el ancho fijo para dar más espacio al valor */
        margin-bottom: 0; /* Elimina margen inferior innecesario */
        min-width: 80px; /* Evita que se encoja demasiado */
      }
      .info-value {
        flex: 1;
        padding-left: 0.75rem; /* Espacio entre label y value */
        white-space: nowrap; /* Fuerza todo en una línea, sin saltos */
        overflow: hidden; /* Oculta exceso si es muy largo */
        text-overflow: ellipsis; /* Agrega "..." si el nombre es muy largo */
      }
      .audit-row {
        flex-direction: column;
        gap: 0.25rem;
      }

    }
  `]
})
export class HistorialTurnoDetalleComponent {
  @Input() turno!: HistorialTurnoDTO;
  @Output() closeModal = new EventEmitter<void>();
}

