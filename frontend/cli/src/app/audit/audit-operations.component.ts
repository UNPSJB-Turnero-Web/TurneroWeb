import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

interface AuditOperation {
  id: string;
  type: 'validation' | 'export' | 'conflict_resolution' | 'data_sync';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  details?: any;
}

@Component({
  selector: 'app-audit-operations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audit-operations" *ngIf="operations.length > 0">
      <div class="operations-header">
        <h4>
          <i class="fas fa-tasks"></i>
          Operaciones en Curso
          <span class="operations-count" *ngIf="getActiveOperations().length > 0">
            {{ getActiveOperations().length }}
          </span>
        </h4>
        <button 
          class="clear-completed-btn" 
          (click)="clearCompleted()"
          *ngIf="getCompletedOperations().length > 0">
          <i class="fas fa-trash"></i>
          Limpiar Completadas
        </button>
      </div>

      <div class="operations-list">
        <div 
          *ngFor="let operation of operations; trackBy: trackByOperationId" 
          class="operation-item"
          [class]="'status-' + operation.status">
          
          <div class="operation-icon">
            <i class="fas" [class]="getOperationIcon(operation.type, operation.status)"></i>
          </div>
          
          <div class="operation-content">
            <div class="operation-header">
              <h5 class="operation-title">{{ operation.description }}</h5>
              <span class="operation-status" [class]="'status-' + operation.status">
                {{ getStatusText(operation.status) }}
              </span>
            </div>
            
            <div class="operation-details">
              <div class="operation-time">
                <i class="fas fa-clock"></i>
                Iniciado: {{ formatTime(operation.startTime) }}
                <span *ngIf="operation.endTime">
                  - Finalizado: {{ formatTime(operation.endTime) }}
                </span>
              </div>
              
              <div class="operation-progress" *ngIf="operation.status === 'in_progress'">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="operation.progress">
                  </div>
                </div>
                <span class="progress-text">{{ operation.progress }}%</span>
              </div>
              
              <div class="operation-error" *ngIf="operation.status === 'error' && operation.error">
                <i class="fas fa-exclamation-triangle"></i>
                {{ operation.error }}
              </div>
              
              <div class="operation-meta" *ngIf="operation.details">
                <span *ngIf="operation.details.processedItems">
                  Procesados: {{ operation.details.processedItems | number }}
                </span>
                <span *ngIf="operation.details.totalItems">
                  de {{ operation.details.totalItems | number }}
                </span>
                <span *ngIf="operation.details.duration">
                  Duración: {{ operation.details.duration }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="operation-actions">
            <button 
              *ngIf="operation.status === 'in_progress'" 
              class="action-btn cancel-btn"
              (click)="cancelOperation(operation.id)">
              <i class="fas fa-times"></i>
            </button>
            <button 
              *ngIf="operation.status === 'error'" 
              class="action-btn retry-btn"
              (click)="retryOperation(operation.id)">
              <i class="fas fa-redo"></i>
            </button>
            <button 
              *ngIf="operation.status === 'completed' || operation.status === 'error'" 
              class="action-btn remove-btn"
              (click)="removeOperation(operation.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="operations-stats" *ngIf="operations.length > 0">
        <div class="stat-item">
          <span class="stat-label">En progreso:</span>
          <span class="stat-value">{{ getOperationsByStatus('in_progress').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Completadas:</span>
          <span class="stat-value">{{ getOperationsByStatus('completed').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Con errores:</span>
          <span class="stat-value">{{ getOperationsByStatus('error').length }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-operations {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .operations-header {
      background: #f8f9fa;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .operations-header h4 {
      margin: 0;
      color: #495057;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .operations-count {
      background: #007bff;
      color: white;
      font-size: 0.8rem;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-weight: 600;
    }

    .clear-completed-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      transition: background 0.2s ease;
    }

    .clear-completed-btn:hover {
      background: #545b62;
    }

    .operations-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .operation-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #f8f9fa;
      transition: background 0.2s ease;
    }

    .operation-item:hover {
      background: #f8f9fa;
    }

    .operation-item:last-child {
      border-bottom: none;
    }

    .operation-item.status-in_progress {
      border-left: 4px solid #007bff;
    }

    .operation-item.status-completed {
      border-left: 4px solid #28a745;
    }

    .operation-item.status-error {
      border-left: 4px solid #dc3545;
    }

    .operation-item.status-pending {
      border-left: 4px solid #6c757d;
    }

    .operation-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: white;
      flex-shrink: 0;
    }

    .status-in_progress .operation-icon {
      background: #007bff;
    }

    .status-completed .operation-icon {
      background: #28a745;
    }

    .status-error .operation-icon {
      background: #dc3545;
    }

    .status-pending .operation-icon {
      background: #6c757d;
    }

    .status-in_progress .operation-icon i {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .operation-content {
      flex: 1;
      min-width: 0;
    }

    .operation-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .operation-title {
      margin: 0;
      color: #2c3e50;
      font-size: 1rem;
      font-weight: 600;
    }

    .operation-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .operation-status.status-in_progress {
      background: #cce5ff;
      color: #0066cc;
    }

    .operation-status.status-completed {
      background: #d4edda;
      color: #155724;
    }

    .operation-status.status-error {
      background: #f8d7da;
      color: #721c24;
    }

    .operation-status.status-pending {
      background: #e2e3e5;
      color: #495057;
    }

    .operation-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .operation-time {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .operation-progress {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: #495057;
      min-width: 35px;
    }

    .operation-error {
      background: #f8d7da;
      color: #721c24;
      padding: 0.75rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .operation-meta {
      display: flex;
      gap: 1rem;
      color: #6c757d;
      font-size: 0.85rem;
    }

    .operation-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .cancel-btn {
      background: #ffc107;
      color: #212529;
    }

    .cancel-btn:hover {
      background: #e0a800;
    }

    .retry-btn {
      background: #17a2b8;
      color: white;
    }

    .retry-btn:hover {
      background: #117a8b;
    }

    .remove-btn {
      background: #dc3545;
      color: white;
    }

    .remove-btn:hover {
      background: #c82333;
    }

    .operations-stats {
      background: #f8f9fa;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 2rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .stat-value {
      color: #2c3e50;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .operation-item {
        flex-direction: column;
        gap: 1rem;
      }

      .operation-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }

      .operation-actions {
        flex-direction: row;
        justify-content: center;
      }

      .operations-stats {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class AuditOperationsComponent implements OnInit, OnDestroy {
  operations: AuditOperation[] = [];
  private updateSubscription?: Subscription;

  ngOnInit(): void {
    // Start with some sample operations
    this.initSampleOperations();
    
    // Update progress for in-progress operations
    this.updateSubscription = interval(1000).subscribe(() => {
      this.updateOperationProgress();
    });
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private initSampleOperations(): void {
    // This would come from a service in a real application
    if (Math.random() > 0.7) { // 30% chance of having operations
      this.addOperation({
        type: 'validation',
        description: 'Validación masiva de turnos programados',
        status: 'in_progress',
        progress: Math.floor(Math.random() * 80) + 10,
        details: {
          processedItems: 150,
          totalItems: 200
        }
      });
    }

    if (Math.random() > 0.8) { // 20% chance
      this.addOperation({
        type: 'export',
        description: 'Exportación de reporte de auditoría mensual',
        status: 'completed',
        progress: 100,
        details: {
          duration: '2:35 min'
        },
        endTime: new Date(Date.now() - 300000) // 5 minutes ago
      });
    }
  }

  addOperation(operationData: Partial<AuditOperation>): void {
    const operation: AuditOperation = {
      id: this.generateOperationId(),
      type: operationData.type || 'validation',
      description: operationData.description || 'Operación de auditoría',
      status: operationData.status || 'pending',
      progress: operationData.progress || 0,
      startTime: operationData.startTime || new Date(),
      endTime: operationData.endTime,
      error: operationData.error,
      details: operationData.details
    };

    this.operations.unshift(operation);
    
    // Limit to 10 operations max
    if (this.operations.length > 10) {
      this.operations = this.operations.slice(0, 10);
    }
  }

  private updateOperationProgress(): void {
    this.operations.forEach(operation => {
      if (operation.status === 'in_progress') {
        // Simulate progress update
        if (operation.progress < 100) {
          operation.progress += Math.random() * 5;
          
          if (operation.progress >= 100) {
            operation.progress = 100;
            operation.status = 'completed';
            operation.endTime = new Date();
          }
        }
      }
    });
  }

  cancelOperation(operationId: string): void {
    const operation = this.operations.find(op => op.id === operationId);
    if (operation && operation.status === 'in_progress') {
      operation.status = 'error';
      operation.error = 'Operación cancelada por el usuario';
      operation.endTime = new Date();
    }
  }

  retryOperation(operationId: string): void {
    const operation = this.operations.find(op => op.id === operationId);
    if (operation && operation.status === 'error') {
      operation.status = 'in_progress';
      operation.progress = 0;
      operation.error = undefined;
      operation.endTime = undefined;
      operation.startTime = new Date();
    }
  }

  removeOperation(operationId: string): void {
    this.operations = this.operations.filter(op => op.id !== operationId);
  }

  clearCompleted(): void {
    this.operations = this.operations.filter(op => 
      op.status !== 'completed' && op.status !== 'error'
    );
  }

  getActiveOperations(): AuditOperation[] {
    return this.operations.filter(op => 
      op.status === 'pending' || op.status === 'in_progress'
    );
  }

  getCompletedOperations(): AuditOperation[] {
    return this.operations.filter(op => 
      op.status === 'completed' || op.status === 'error'
    );
  }

  getOperationsByStatus(status: string): AuditOperation[] {
    return this.operations.filter(op => op.status === status);
  }

  getOperationIcon(type: string, status: string): string {
    if (status === 'in_progress') {
      return 'fa-spinner';
    }
    
    switch (type) {
      case 'validation':
        return status === 'completed' ? 'fa-check-double' : 'fa-shield-alt';
      case 'export':
        return status === 'completed' ? 'fa-download' : 'fa-file-export';
      case 'conflict_resolution':
        return status === 'completed' ? 'fa-handshake' : 'fa-exclamation-triangle';
      case 'data_sync':
        return status === 'completed' ? 'fa-sync' : 'fa-database';
      default:
        return status === 'error' ? 'fa-times' : 'fa-tasks';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'error': return 'Error';
      default: return status;
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByOperationId(index: number, operation: AuditOperation): string {
    return operation.id;
  }

  private generateOperationId(): string {
    return 'op_' + Math.random().toString(36).substr(2, 9);
  }
}
