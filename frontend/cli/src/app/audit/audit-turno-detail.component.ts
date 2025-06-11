import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from './audit.service';
import { TurnoService } from '../turnos/turno.service';
import { TurnoAuditInfo, AuditLog, ConflictResolution, ConflictType } from './audit-log';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-audit-turno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-turno-detail">
      <!-- Header -->
      <div class="page-header">
        <div class="header-navigation">
          <button class="btn btn-back" (click)="goBack()">
            <i class="fas fa-arrow-left"></i>
            Volver al Panel
          </button>
          <div class="breadcrumb">
            <span>Auditoría</span>
            <i class="fas fa-chevron-right"></i>
            <span>Turno #{{ turnoId }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-header-glass btn-header-warning" (click)="exportTurnoPDF()">
            <i class="fas fa-file-pdf"></i>
            Exportar PDF
          </button>
          <button class="btn btn-header-solid" (click)="editTurno()" *ngIf="!isEditMode">
            <i class="fas fa-edit"></i>
            Editar Turno
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando información del turno...</p>
      </div>

      <!-- Content -->
      <div class="content-container" *ngIf="!isLoading && turnoAuditInfo">
        <!-- Turno Information -->
        <div class="turno-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-calendar-check"></i>
              Información del Turno
            </h2>
            <div class="turno-status">
              <span class="status-badge" [class]="getStatusClass(turno.estado)">
                {{ getStatusText(turno.estado) }}
              </span>
            </div>
          </div>

          <div class="turno-details" *ngIf="!isEditMode">
            <div class="detail-grid">
              <div class="detail-item">
                <label>ID del Turno</label>
                <span>{{ turno.id }}</span>
              </div>
              <div class="detail-item">
                <label>Fecha</label>
                <span>{{ formatDate(turno.fecha) }}</span>
              </div>
              <div class="detail-item">
                <label>Horario</label>
                <span>{{ turno.horaInicio }} - {{ turno.horaFin }}</span>
              </div>
              <div class="detail-item">
                <label>Estado</label>
                <span class="status-badge" [class]="getStatusClass(turno.estado)">
                  {{ getStatusText(turno.estado) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Paciente</label>
                <span>{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</span>
              </div>
              <div class="detail-item">
                <label>Médico</label>
                <span>{{ turno.staffMedicoNombre }} {{ turno.staffMedicoApellido }}</span>
              </div>
              <div class="detail-item">
                <label>Especialidad</label>
                <span>{{ turno.especialidadStaffMedico }}</span>
              </div>
              <div class="detail-item">
                <label>Centro de Atención</label>
                <span>{{ turno.nombreCentro }}</span>
              </div>
              <div class="detail-item">
                <label>Consultorio</label>
                <span>{{ turno.consultorioNombre }}</span>
              </div>
              <div class="detail-item" *ngIf="turno.titulo">
                <label>Título</label>
                <span>{{ turno.titulo }}</span>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <div class="turno-edit" *ngIf="isEditMode">
            <form (ngSubmit)="saveTurnoChanges()">
              <div class="edit-grid">
                <div class="form-group">
                  <label>Fecha</label>
                  <input type="date" [(ngModel)]="editedTurno.fecha" name="fecha" required>
                </div>
                <div class="form-group">
                  <label>Hora Inicio</label>
                  <input type="time" [(ngModel)]="editedTurno.horaInicio" name="horaInicio" required>
                </div>
                <div class="form-group">
                  <label>Hora Fin</label>
                  <input type="time" [(ngModel)]="editedTurno.horaFin" name="horaFin" required>
                </div>
                <div class="form-group">
                  <label>Estado</label>
                  <select [(ngModel)]="editedTurno.estado" name="estado" required>
                    <option value="PROGRAMADO">Programado</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="REAGENDADO">Reagendado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Motivo del Cambio</label>
                  <textarea 
                    [(ngModel)]="changeReason" 
                    name="changeReason" 
                    placeholder="Explique el motivo de los cambios realizados..."
                    required></textarea>
                </div>
              </div>
              <div class="edit-actions">
                <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!changeReason">
                  <i class="fas fa-save"></i>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Conflicts Section -->
        <div class="conflicts-section" *ngIf="conflicts && conflicts.length > 0">
          <div class="section-header">
            <h2>
              <i class="fas fa-exclamation-triangle"></i>
              Conflictos Detectados
            </h2>
            <div class="conflicts-count">
              <span class="badge badge-warning">{{ conflicts.length }}</span>
            </div>
          </div>

          <div class="conflicts-list">
            <div class="conflict-item" *ngFor="let conflict of conflicts">
              <div class="conflict-header">
                <div class="conflict-type">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ getConflictTypeText(conflict.conflictType) }}
                </div>
                <div class="conflict-status" [class]="conflict.resolvedBy ? 'resolved' : 'pending'">
                  {{ conflict.resolvedBy ? 'Resuelto' : 'Pendiente' }}
                </div>
              </div>
              <div class="conflict-description">
                {{ conflict.description }}
              </div>
              <div class="conflict-resolution" *ngIf="conflict.resolution">
                <strong>Resolución:</strong> {{ conflict.resolution }}
                <div class="resolution-meta">
                  Resuelto por {{ conflict.resolvedBy }} el {{ formatDateTime(conflict.resolvedAt) }}
                </div>
              </div>
              <div class="conflict-actions" *ngIf="!conflict.resolvedBy">
                <button class="btn btn-sm btn-primary" (click)="resolveConflict(conflict.id)">
                  <i class="fas fa-check"></i>
                  Resolver
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit History Section -->
        <div class="audit-history-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-history"></i>
              Historial de Auditoría
            </h2>
            <div class="history-count">
              <span class="badge badge-info">{{ auditLogs.length }} registros</span>
            </div>
          </div>

          <div class="timeline">
            <div class="timeline-item" *ngFor="let log of auditLogs; trackBy: trackByLogId">
              <div class="timeline-marker" [class]="getActionClass(log.action)">
                <i class="fas" [class]="getActionIcon(log.action)"></i>
              </div>
              <div class="timeline-content">
                <div class="log-header">
                  <div class="log-action">
                    {{ getActionText(log.action) }}
                  </div>
                  <div class="log-meta">
                    {{ formatDateTime(log.performedAt) }} - {{ log.performedBy }}
                  </div>
                </div>
                <div class="log-description" *ngIf="log.reason">
                  <strong>Motivo:</strong> {{ log.reason }}
                </div>
                <div class="log-changes" *ngIf="log.oldValues || log.newValues">
                  <div class="changes-grid">
                    <div class="old-values" *ngIf="log.oldValues">
                      <h4>Valores Anteriores:</h4>
                      <div class="values-list">
                        <div *ngFor="let item of getObjectEntries(log.oldValues)" class="value-item">
                          <span class="field-name">{{ item.key }}:</span>
                          <span class="field-value old">{{ item.value }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="new-values" *ngIf="log.newValues">
                      <h4>Valores Nuevos:</h4>
                      <div class="values-list">
                        <div *ngFor="let item of getObjectEntries(log.newValues)" class="value-item">
                          <span class="field-name">{{ item.key }}:</span>
                          <span class="field-value new">{{ item.value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="affected-parties" *ngIf="log.affectedParties && log.affectedParties.length > 0">
                  <strong>Partes Notificadas:</strong>
                  <span class="parties-list">{{ log.affectedParties.join(', ') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="actions-section">
          <h3>Acciones Disponibles</h3>
          <div class="action-buttons">
            <button class="btn btn-success" (click)="confirmTurno()" *ngIf="turno.estado === 'PROGRAMADO'">
              <i class="fas fa-check"></i>
              Confirmar Turno
            </button>
            <button class="btn btn-warning" (click)="rescheduleTurno()" *ngIf="turno.estado !== 'CANCELADO'">
              <i class="fas fa-calendar-alt"></i>
              Reagendar Turno
            </button>
            <button class="btn btn-danger" (click)="cancelTurno()" *ngIf="turno.estado !== 'CANCELADO'">
              <i class="fas fa-times"></i>
              Cancelar Turno
            </button>
            <button class="btn btn-info" (click)="notifyParties()">
              <i class="fas fa-bell"></i>
              Notificar Partes
            </button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="errorMessage">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error al cargar información</h3>
        <p>{{ errorMessage }}</p>
        <button class="btn btn-primary" (click)="retry()">
          <i class="fas fa-redo"></i>
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .audit-turno-detail {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-navigation {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .loading-state,
    .error-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;
    }

    .loading-state i,
    .error-state i {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .content-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .turno-section,
    .conflicts-section,
    .audit-history-section,
    .actions-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .section-header {
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h2 {
      margin: 0;
      color: #495057;
      font-size: 1.25rem;
    }

    .turno-status,
    .conflicts-count,
    .history-count {
      display: flex;
      align-items: center;
    }

    .status-badge,
    .badge {
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.programado {
      background: #cce5ff;
      color: #0066cc;
    }

    .status-badge.confirmado {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.reagendado {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.cancelado {
      background: #f8d7da;
      color: #721c24;
    }

    .badge.badge-warning {
      background: #fff3cd;
      color: #856404;
    }

    .badge.badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-item label {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-item span {
      color: #2c3e50;
      font-weight: 500;
    }

    .edit-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 600;
      color: #495057;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .form-group textarea {
      min-height: 80px;
      resize: vertical;
    }

    .edit-actions {
      padding: 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .conflicts-list {
      padding: 1.5rem;
    }

    .conflict-item {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .conflict-item:last-child {
      margin-bottom: 0;
    }

    .conflict-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .conflict-type {
      font-weight: 600;
      color: #856404;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .conflict-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .conflict-status.pending {
      background: #fd7e14;
      color: white;
    }

    .conflict-status.resolved {
      background: #28a745;
      color: white;
    }

    .conflict-description {
      color: #856404;
      margin-bottom: 1rem;
    }

    .conflict-resolution {
      background: #e2f7e2;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .resolution-meta {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.5rem;
    }

    .conflict-actions {
      display: flex;
      gap: 0.5rem;
    }

    .timeline {
      padding: 1.5rem;
    }

    .timeline-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      position: relative;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 20px;
      top: 45px;
      bottom: -32px;
      width: 2px;
      background: #e9ecef;
    }

    .timeline-marker {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .timeline-marker.create {
      background: #28a745;
    }

    .timeline-marker.update {
      background: #ffc107;
    }

    .timeline-marker.delete {
      background: #dc3545;
    }

    .timeline-marker.confirm {
      background: #17a2b8;
    }

    .timeline-marker.cancel {
      background: #6c757d;
    }

    .timeline-marker.reschedule {
      background: #fd7e14;
    }

    .timeline-content {
      flex: 1;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .log-action {
      font-weight: 600;
      color: #2c3e50;
    }

    .log-meta {
      font-size: 0.85rem;
      color: #6c757d;
    }

    .log-description {
      margin-bottom: 1rem;
      color: #495057;
    }

    .changes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .old-values,
    .new-values {
      background: white;
      border-radius: 6px;
      padding: 0.75rem;
    }

    .old-values h4,
    .new-values h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .value-item {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .value-item:last-child {
      border-bottom: none;
    }

    .field-name {
      font-weight: 500;
      color: #495057;
    }

    .field-value.old {
      color: #dc3545;
      text-decoration: line-through;
    }

    .field-value.new {
      color: #28a745;
      font-weight: 600;
    }

    .affected-parties {
      color: #495057;
    }

    .parties-list {
      color: #6c757d;
      font-style: italic;
    }

    .actions-section {
      padding: 1.5rem;
    }

    .actions-section h3 {
      margin: 0 0 1rem 0;
      color: #495057;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .header-actions {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }

      .detail-grid,
      .edit-grid {
        grid-template-columns: 1fr;
      }

      .changes-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        justify-content: center;
      }

      .edit-actions {
        justify-content: center;
      }
    }
  `]
})
export class AuditTurnoDetailComponent implements OnInit {
  turnoId!: number;
  turnoAuditInfo!: TurnoAuditInfo;
  turno: any = {};
  auditLogs: AuditLog[] = [];
  conflicts: ConflictResolution[] = [];
  isLoading = false;
  errorMessage = '';
  isEditMode = false;
  editedTurno: any = {};
  changeReason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auditService: AuditService,
    private turnoService: TurnoService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.turnoId = +params['id'];
      this.loadTurnoAuditInfo();
    });

    this.route.url.subscribe(segments => {
      this.isEditMode = segments.some(segment => segment.path === 'edit');
    });
  }

  loadTurnoAuditInfo() {
    this.isLoading = true;
    this.errorMessage = '';

    this.auditService.getTurnoAuditInfo(this.turnoId).subscribe({
      next: (response: any) => {
        this.turnoAuditInfo = response.data;
        this.turno = this.turnoAuditInfo.turno;
        this.auditLogs = this.turnoAuditInfo.auditLogs;
        this.conflicts = this.turnoAuditInfo.conflictResolutions || [];
        this.editedTurno = { ...this.turno };
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading turno audit info:', error);
        this.errorMessage = 'No se pudo cargar la información del turno. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/audit']);
  }

  editTurno() {
    this.isEditMode = true;
    this.editedTurno = { ...this.turno };
    this.changeReason = '';
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editedTurno = { ...this.turno };
    this.changeReason = '';
  }

  saveTurnoChanges() {
    if (!this.changeReason.trim()) {
      alert('Debe proporcionar un motivo para los cambios');
      return;
    }

    this.auditService.updateTurnoWithAudit(this.turnoId, this.editedTurno, this.changeReason)
      .subscribe({
        next: (response: any) => {
          alert('Turno actualizado exitosamente');
          this.isEditMode = false;
          this.changeReason = '';
          this.loadTurnoAuditInfo(); // Reload to get updated audit trail
        },
        error: (error: any) => {
          console.error('Error updating turno:', error);
          alert('Error al actualizar el turno. Por favor, intente nuevamente.');
        }
      });
  }

  confirmTurno() {
    const reason = prompt('Ingrese el motivo de la confirmación:');
    if (reason) {
      this.auditService.confirmTurnoWithAudit(this.turnoId, reason).subscribe({
        next: (response: any) => {
          alert('Turno confirmado exitosamente');
          this.loadTurnoAuditInfo();
        },
        error: (error: any) => {
          console.error('Error confirming turno:', error);
          alert('Error al confirmar el turno');
        }
      });
    }
  }

  cancelTurno() {
    const reason = prompt('Ingrese el motivo de la cancelación:');
    if (reason) {
      this.auditService.cancelTurnoWithAudit(this.turnoId, reason).subscribe({
        next: (response: any) => {
          alert('Turno cancelado exitosamente');
          this.loadTurnoAuditInfo();
        },
        error: (error: any) => {
          console.error('Error canceling turno:', error);
          alert('Error al cancelar el turno');
        }
      });
    }
  }

  rescheduleTurno() {
    // This would open a dialog or navigate to a reschedule component
    this.router.navigate(['/audit/turno', this.turnoId, 'reschedule']);
  }

  notifyParties() {
    const message = prompt('Ingrese el mensaje a enviar a las partes involucradas:');
    if (message) {
      this.auditService.notifyAffectedParties(this.turnoId, message).subscribe({
        next: (response: any) => {
          alert('Notificaciones enviadas exitosamente');
        },
        error: (error: any) => {
          console.error('Error sending notifications:', error);
          alert('Error al enviar las notificaciones');
        }
      });
    }
  }

  resolveConflict(conflictId: number) {
    const resolution = prompt('Ingrese la resolución para este conflicto:');
    if (resolution) {
      const conflictResolution: ConflictResolution = {
        id: conflictId,
        turnoId: this.turnoId,
        conflictType: ConflictType.DATA_INCONSISTENCY,
        description: 'Conflicto resuelto por el usuario',
        resolvedBy: localStorage.getItem('userName') || 'Usuario',
        resolvedAt: new Date(),
        resolution: resolution
      };
      
      this.auditService.resolveConflict(this.turnoId, conflictResolution).subscribe({
        next: (response: any) => {
          alert('Conflicto resuelto exitosamente');
          this.loadTurnoAuditInfo();
        },
        error: (error: any) => {
          console.error('Error resolving conflict:', error);
          alert('Error al resolver el conflicto');
        }
      });
    }
  }

  exportTurnoPDF() {
    // Implementation for exporting this specific turno to PDF
    alert('Funcionalidad de exportación en desarrollo');
  }

  retry() {
    this.loadTurnoAuditInfo();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateValue: string | Date): string {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return date.toLocaleString('es-ES');
  }

  getStatusClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROGRAMADO':
        return 'programado';
      case 'CONFIRMADO':
        return 'confirmado';
      case 'REAGENDADO':
        return 'reagendado';
      case 'CANCELADO':
        return 'cancelado';
      default:
        return '';
    }
  }

  getStatusText(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROGRAMADO':
        return 'Programado';
      case 'CONFIRMADO':
        return 'Confirmado';
      case 'REAGENDADO':
        return 'Reagendado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return estado;
    }
  }

  getConflictTypeText(type: string): string {
    switch (type) {
      case 'SCHEDULING_CONFLICT':
        return 'Conflicto de Horario';
      case 'DUPLICATE_APPOINTMENT':
        return 'Turno Duplicado';
      case 'RESOURCE_UNAVAILABLE':
        return 'Recurso No Disponible';
      case 'INVALID_STATUS_CHANGE':
        return 'Cambio de Estado Inválido';
      case 'DATA_INCONSISTENCY':
        return 'Inconsistencia de Datos';
      default:
        return type;
    }
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'create';
      case 'UPDATE':
        return 'update';
      case 'DELETE':
        return 'delete';
      case 'CONFIRM':
        return 'confirm';
      case 'CANCEL':
        return 'cancel';
      case 'RESCHEDULE':
        return 'reschedule';
      default:
        return 'update';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'fa-plus';
      case 'UPDATE':
        return 'fa-edit';
      case 'DELETE':
        return 'fa-trash';
      case 'CONFIRM':
        return 'fa-check';
      case 'CANCEL':
        return 'fa-times';
      case 'RESCHEDULE':
        return 'fa-calendar-alt';
      default:
        return 'fa-edit';
    }
  }

  getActionText(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'Turno Creado';
      case 'UPDATE':
        return 'Turno Modificado';
      case 'DELETE':
        return 'Turno Eliminado';
      case 'CONFIRM':
        return 'Turno Confirmado';
      case 'CANCEL':
        return 'Turno Cancelado';
      case 'RESCHEDULE':
        return 'Turno Reagendado';
      default:
        return action;
    }
  }

  getObjectEntries(obj: any): Array<{key: string, value: any}> {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  trackByLogId(index: number, log: AuditLog): number {
    return log.id;
  }
}
