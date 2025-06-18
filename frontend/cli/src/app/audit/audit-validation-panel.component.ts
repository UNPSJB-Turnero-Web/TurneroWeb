import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationResult, ConflictDetection, TurnoConflict } from './audit-validation.service';

@Component({
  selector: 'app-audit-validation-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="validation-panel" *ngIf="showPanel">
      <!-- Validation Results -->
      <div class="validation-section" *ngIf="validationResult">
        <h4 class="section-title">
          <i class="fas fa-check-circle"></i>
          Resultado de Validación
        </h4>

        <!-- Errors -->
        <div class="validation-group" *ngIf="validationResult.errors.length > 0">
          <h5 class="group-title error">
            <i class="fas fa-times-circle"></i>
            Errores ({{ validationResult.errors.length }})
          </h5>
          <div class="validation-items">
            <div 
              *ngFor="let error of validationResult.errors" 
              class="validation-item error">
              <div class="item-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="item-content">
                <strong>{{ error.field | titlecase }}</strong>
                <p>{{ error.message }}</p>
                <span class="error-code">Código: {{ error.code }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Warnings -->
        <div class="validation-group" *ngIf="validationResult.warnings.length > 0">
          <h5 class="group-title warning">
            <i class="fas fa-exclamation-triangle"></i>
            Advertencias ({{ validationResult.warnings.length }})
          </h5>
          <div class="validation-items">
            <div 
              *ngFor="let warning of validationResult.warnings" 
              class="validation-item warning"
              [class]="'severity-' + warning.severity">
              <div class="item-icon">
                <i class="fas fa-exclamation"></i>
              </div>
              <div class="item-content">
                <strong>{{ warning.field | titlecase }}</strong>
                <p>{{ warning.message }}</p>
                <span class="severity-badge" [class]="'severity-' + warning.severity">
                  {{ getSeverityText(warning.severity) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Suggestions -->
        <div class="validation-group" *ngIf="validationResult.suggestions.length > 0">
          <h5 class="group-title suggestion">
            <i class="fas fa-lightbulb"></i>
            Recomendaciones ({{ validationResult.suggestions.length }})
          </h5>
          <div class="validation-items">
            <div 
              *ngFor="let suggestion of validationResult.suggestions" 
              class="validation-item suggestion">
              <div class="item-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="item-content">
                <p>{{ suggestion }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div class="validation-success" *ngIf="validationResult.isValid && validationResult.errors.length === 0 && validationResult.warnings.length === 0">
          <i class="fas fa-check-circle"></i>
          <h5>Validación Exitosa</h5>
          <p>Todos los cambios son válidos y no se detectaron problemas.</p>
        </div>
      </div>

      <!-- Conflict Detection -->
      <div class="conflicts-section" *ngIf="conflictDetection">
        <h4 class="section-title">
          <i class="fas fa-exclamation-triangle"></i>
          Detección de Conflictos
        </h4>

        <div class="conflicts-group" *ngIf="conflictDetection.hasConflicts">
          <div class="conflict-alert">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Se detectaron {{ conflictDetection.conflicts.length }} conflicto(s)</span>
          </div>

          <div class="conflict-items">
            <div 
              *ngFor="let conflict of conflictDetection.conflicts; let i = index" 
              class="conflict-item"
              [class]="'severity-' + conflict.severity">
              <div class="conflict-header">
                <div class="conflict-type">
                  <i class="fas" [class]="getConflictIcon(conflict.type)"></i>
                  <strong>{{ getConflictTypeText(conflict.type) }}</strong>
                </div>
                <span class="conflict-severity" [class]="'severity-' + conflict.severity">
                  {{ getSeverityText(conflict.severity) }}
                </span>
              </div>
              
              <div class="conflict-content">
                <p class="conflict-description">{{ conflict.description }}</p>
                
                <div class="affected-turnos" *ngIf="conflict.affectedTurnos.length > 0">
                  <strong>Turnos afectados:</strong>
                  <span class="turno-ids">
                    <span 
                      *ngFor="let turnoId of conflict.affectedTurnos; let last = last"
                      class="turno-id">
                      #{{ turnoId }}<span *ngIf="!last">, </span>
                    </span>
                  </span>
                </div>

                <div class="suggested-resolution" *ngIf="conflict.suggestedResolution">
                  <i class="fas fa-lightbulb"></i>
                  <strong>Resolución sugerida:</strong>
                  <p>{{ conflict.suggestedResolution }}</p>
                </div>

                <div class="conflict-actions">
                  <button 
                    class="btn btn-sm btn-primary"
                    (click)="resolveConflict(conflict, i)">
                    <i class="fas fa-tools"></i>
                    Resolver
                  </button>
                  <button 
                    class="btn btn-sm btn-secondary"
                    (click)="ignoreConflict(conflict, i)">
                    <i class="fas fa-eye-slash"></i>
                    Ignorar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="no-conflicts" *ngIf="!conflictDetection.hasConflicts">
          <i class="fas fa-check-circle"></i>
          <h5>Sin Conflictos</h5>
          <p>No se detectaron conflictos en los datos del turno.</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="panel-actions">
        <button 
          class="btn btn-secondary"
          (click)="closePanel()">
          <i class="fas fa-times"></i>
          Cerrar
        </button>
        <button 
          class="btn btn-primary"
          [disabled]="hasBlockingErrors()"
          (click)="proceedWithChanges()">
          <i class="fas fa-save"></i>
          Continuar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .validation-panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin: 1rem 0;
      overflow: hidden;
    }

    .section-title {
      background: #f8f9fa;
      padding: 1rem;
      margin: 0;
      font-size: 1.1rem;
      color: #495057;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .validation-section,
    .conflicts-section {
      padding: 1rem;
    }

    .validation-group,
    .conflicts-group {
      margin-bottom: 1.5rem;
    }

    .group-title {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .group-title.error {
      color: #dc3545;
    }

    .group-title.warning {
      color: #ffc107;
    }

    .group-title.suggestion {
      color: #17a2b8;
    }

    .validation-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .validation-item {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 6px;
      border-left: 4px solid;
    }

    .validation-item.error {
      background: #f8d7da;
      border-left-color: #dc3545;
    }

    .validation-item.warning {
      background: #fff3cd;
      border-left-color: #ffc107;
    }

    .validation-item.suggestion {
      background: #d1ecf1;
      border-left-color: #17a2b8;
    }

    .item-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
    }

    .item-content strong {
      display: block;
      margin-bottom: 0.25rem;
      color: #2c3e50;
    }

    .item-content p {
      margin: 0;
      color: #495057;
      line-height: 1.4;
    }

    .error-code {
      font-size: 0.8rem;
      color: #6c757d;
      font-style: italic;
    }

    .severity-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .severity-badge.severity-low {
      background: #e2f3e7;
      color: #155724;
    }

    .severity-badge.severity-medium {
      background: #fff3cd;
      color: #856404;
    }

    .severity-badge.severity-high {
      background: #f8d7da;
      color: #721c24;
    }

    .severity-badge.severity-critical {
      background: #721c24;
      color: white;
    }

    .validation-success,
    .no-conflicts {
      text-align: center;
      padding: 2rem;
      color: #28a745;
    }

    .validation-success i,
    .no-conflicts i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .validation-success h5,
    .no-conflicts h5 {
      margin: 0.5rem 0;
      color: #28a745;
    }

    .validation-success p,
    .no-conflicts p {
      margin: 0;
      color: #6c757d;
    }

    .conflict-alert {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .conflict-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .conflict-item {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    .conflict-item.severity-critical {
      border-color: #dc3545;
    }

    .conflict-item.severity-high {
      border-color: #fd7e14;
    }

    .conflict-item.severity-medium {
      border-color: #ffc107;
    }

    .conflict-item.severity-low {
      border-color: #28a745;
    }

    .conflict-header {
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e9ecef;
    }

    .conflict-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #495057;
    }

    .conflict-severity {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .conflict-content {
      padding: 1rem;
    }

    .conflict-description {
      margin: 0 0 1rem 0;
      color: #495057;
      line-height: 1.5;
    }

    .affected-turnos {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .turno-ids {
      margin-left: 0.5rem;
    }

    .turno-id {
      background: #007bff;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .suggested-resolution {
      background: #d1ecf1;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .suggested-resolution i {
      color: #17a2b8;
      margin-right: 0.5rem;
    }

    .suggested-resolution strong {
      color: #0c5460;
    }

    .suggested-resolution p {
      margin: 0.5rem 0 0 0;
      color: #495057;
    }

    .conflict-actions {
      display: flex;
      gap: 0.5rem;
    }

    .panel-actions {
      background: #f8f9fa;
      padding: 1rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .validation-panel {
        margin: 0.5rem 0;
      }

      .section-title,
      .validation-section,
      .conflicts-section {
        padding: 0.75rem;
      }

      .conflict-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }

      .panel-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AuditValidationPanelComponent {
  @Input() validationResult?: ValidationResult;
  @Input() conflictDetection?: ConflictDetection;
  @Input() showPanel: boolean = false;

  @Output() panelClosed = new EventEmitter<void>();
  @Output() proceedRequested = new EventEmitter<void>();
  @Output() conflictResolved = new EventEmitter<{ conflict: TurnoConflict, index: number }>();
  @Output() conflictIgnored = new EventEmitter<{ conflict: TurnoConflict, index: number }>();

  getSeverityText(severity: string): string {
    switch (severity) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return severity;
    }
  }

  getConflictIcon(type: string): string {
    switch (type) {
      case 'SCHEDULE_OVERLAP': return 'fa-calendar-times';
      case 'DOUBLE_BOOKING': return 'fa-copy';
      case 'RESOURCE_UNAVAILABLE': return 'fa-ban';
      case 'INVALID_TIME_SLOT': return 'fa-clock';
      default: return 'fa-exclamation-triangle';
    }
  }

  getConflictTypeText(type: string): string {
    switch (type) {
      case 'SCHEDULE_OVERLAP': return 'Superposición de Horarios';
      case 'DOUBLE_BOOKING': return 'Doble Reserva';
      case 'RESOURCE_UNAVAILABLE': return 'Recurso No Disponible';
      case 'INVALID_TIME_SLOT': return 'Horario Inválido';
      default: return type;
    }
  }

  hasBlockingErrors(): boolean {
    return this.validationResult ? !this.validationResult.isValid : false;
  }

  closePanel(): void {
    this.panelClosed.emit();
  }

  proceedWithChanges(): void {
    this.proceedRequested.emit();
  }

  resolveConflict(conflict: TurnoConflict, index: number): void {
    this.conflictResolved.emit({ conflict, index });
  }

  ignoreConflict(conflict: TurnoConflict, index: number): void {
    this.conflictIgnored.emit({ conflict, index });
  }
}
