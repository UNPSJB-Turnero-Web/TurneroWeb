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
  styleUrls: ['./historial-turno-detalle.component.css']
})
export class HistorialTurnoDetalleComponent {
  @Input() turno!: HistorialTurnoDTO;
  @Output() closeModal = new EventEmitter<void>();
}

