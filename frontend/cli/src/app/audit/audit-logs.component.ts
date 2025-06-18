import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuditService } from './audit.service';
import { AuditLog, AuditFilter, AuditAction } from './audit-log';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-logs">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button class="btn btn-back" (click)="goBack()">
            <i class="fas fa-arrow-left"></i>
            Volver
          </button>
          <div class="title-section">
            <h1>
              <i class="fas fa-history"></i>
              Historial de Auditoría
            </h1>
            <p class="subtitle">Registro completo de todas las modificaciones del sistema</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-header-glass btn-header-success" (click)="exportLogs('csv')">
            <i class="fas fa-file-csv"></i>
            Exportar CSV
          </button>
          <button class="btn btn-header-glass btn-header-warning" (click)="exportLogs('pdf')">
            <i class="fas fa-file-pdf"></i>
            Exportar PDF
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-header">
          <h2>
            <i class="fas fa-filter"></i>
            Filtros de Auditoría
          </h2>
          <button class="btn btn-link" (click)="toggleFilters()">
            <i class="fas" [class.fa-chevron-down]="!showFilters" [class.fa-chevron-up]="showFilters"></i>
            {{ showFilters ? 'Ocultar' : 'Mostrar' }} Filtros
          </button>
        </div>

        <div class="filters-content" [class.expanded]="showFilters">
          <div class="filter-row">
            <div class="filter-group">
              <label>Fecha Desde</label>
              <input 
                type="datetime-local" 
                [(ngModel)]="currentFilter.dateFrom" 
                (change)="applyFilters()"
                class="form-control">
            </div>

            <div class="filter-group">
              <label>Fecha Hasta</label>
              <input 
                type="datetime-local" 
                [(ngModel)]="currentFilter.dateTo" 
                (change)="applyFilters()"
                class="form-control">
            </div>

            <div class="filter-group">
              <label>Acción</label>
              <select [(ngModel)]="currentFilter.action" (change)="applyFilters()">
                <option value="">Todas las acciones</option>
                <option value="CREATE">Crear</option>
                <option value="UPDATE">Actualizar</option>
                <option value="DELETE">Eliminar</option>
                <option value="CONFIRM">Confirmar</option>
                <option value="CANCEL">Cancelar</option>
                <option value="RESCHEDULE">Reagendar</option>
                <option value="STATUS_CHANGE">Cambio de Estado</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Usuario</label>
              <input 
                type="text" 
                [(ngModel)]="currentFilter.performedBy" 
                (input)="onFilterChange()"
                placeholder="Nombre del usuario..."
                class="form-control">
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-group">
              <label>ID de Turno</label>
              <input 
                type="number" 
                [(ngModel)]="currentFilter.turnoId" 
                (input)="onFilterChange()"
                placeholder="ID del turno..."
                class="form-control">
            </div>

            <div class="filter-group">
              <label>ID de Paciente</label>
              <input 
                type="number" 
                [(ngModel)]="currentFilter.pacienteId" 
                (input)="onFilterChange()"
                placeholder="ID del paciente..."
                class="form-control">
            </div>

            <div class="filter-group">
              <label>ID de Médico</label>
              <input 
                type="number" 
                [(ngModel)]="currentFilter.staffMedicoId" 
                (input)="onFilterChange()"
                placeholder="ID del médico..."
                class="form-control">
            </div>

            <div class="filter-group">
              <label>Acciones</label>
              <div class="filter-actions">
                <button class="btn btn-secondary" (click)="clearFilters()">
                  <i class="fas fa-eraser"></i>
                  Limpiar
                </button>
                <button class="btn btn-primary" (click)="applyFilters()">
                  <i class="fas fa-search"></i>
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="results-section">
        <div class="results-header">
          <div class="results-info">
            <h3>Registros de Auditoría</h3>
            <p *ngIf="resultsPage.content">
              Mostrando {{ resultsPage.content.length }} de {{ resultsPage.totalElements }} registros
            </p>
          </div>
          <div class="results-controls">
            <select [(ngModel)]="pageSize" (change)="changePageSize()">
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="isLoading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando registros de auditoría...</p>
        </div>

        <!-- Audit Logs Timeline -->
        <div class="audit-timeline" *ngIf="!isLoading && resultsPage.content?.length > 0">
          <div class="timeline-item" *ngFor="let log of resultsPage.content; trackBy: trackByLogId">
            <div class="timeline-marker" [class]="getActionClass(log.action)">
              <i class="fas" [class]="getActionIcon(log.action)"></i>
            </div>
            <div class="timeline-content">
              <div class="log-header">
                <div class="log-title">
                  <span class="action-badge" [class]="getActionClass(log.action)">
                    {{ getActionText(log.action) }}
                  </span>
                  <span class="log-id">Turno #{{ log.turnoId }}</span>
                </div>
                <div class="log-meta">
                  <div class="log-time">
                    <i class="fas fa-clock"></i>
                    {{ formatDateTime(log.performedAt) }}
                  </div>
                  <div class="log-user">
                    <i class="fas fa-user"></i>
                    {{ log.performedBy }}
                  </div>
                </div>
              </div>

              <div class="log-reason" *ngIf="log.reason">
                <div class="reason-label">
                  <i class="fas fa-comment"></i>
                  Motivo:
                </div>
                <div class="reason-text">{{ log.reason }}</div>
              </div>

              <div class="log-changes" *ngIf="log.oldValues || log.newValues">
                <div class="changes-header">
                  <i class="fas fa-exchange-alt"></i>
                  Cambios Realizados
                </div>
                <div class="changes-grid">
                  <div class="old-values" *ngIf="log.oldValues">
                    <h4>Valores Anteriores:</h4>
                    <div class="values-list">
                      <div *ngFor="let item of getObjectEntries(log.oldValues)" class="value-item">
                        <span class="field-name">{{ formatFieldName(item.key) }}:</span>
                        <span class="field-value old">{{ formatFieldValue(item.value) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="new-values" *ngIf="log.newValues">
                    <h4>Valores Nuevos:</h4>
                    <div class="values-list">
                      <div *ngFor="let item of getObjectEntries(log.newValues)" class="value-item">
                        <span class="field-name">{{ formatFieldName(item.key) }}:</span>
                        <span class="field-value new">{{ formatFieldValue(item.value) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="affected-parties" *ngIf="log.affectedParties && log.affectedParties.length > 0">
                <div class="parties-header">
                  <i class="fas fa-users"></i>
                  Partes Notificadas:
                </div>
                <div class="parties-list">
                  <span *ngFor="let party of log.affectedParties; let last = last" class="party-tag">
                    {{ party }}<span *ngIf="!last">, </span>
                  </span>
                </div>
              </div>

              <div class="log-actions">
                <button class="btn btn-sm btn-outline" (click)="viewTurnoDetail(log.turnoId)">
                  <i class="fas fa-eye"></i>
                  Ver Turno
                </button>
                <button class="btn btn-sm btn-outline" (click)="viewRelatedLogs(log.turnoId)">
                  <i class="fas fa-history"></i>
                  Ver Historial Completo
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!isLoading && resultsPage.content?.length === 0">
          <i class="fas fa-search fa-3x"></i>
          <h3>No se encontraron registros</h3>
          <p>No hay registros de auditoría que coincidan con los filtros aplicados</p>
          <button class="btn btn-primary" (click)="clearFilters()">
            <i class="fas fa-eraser"></i>
            Limpiar Filtros
          </button>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" *ngIf="resultsPage.totalPages > 1">
          <div class="pagination">
            <button 
              class="btn btn-pagination"
              [disabled]="currentPage === 1"
              (click)="goToPage(1)">
              <i class="fas fa-angle-double-left"></i>
            </button>
            <button 
              class="btn btn-pagination"
              [disabled]="currentPage === 1"
              (click)="goToPage(currentPage - 1)">
              <i class="fas fa-angle-left"></i>
            </button>
            
            <span class="pagination-info">
              Página {{ currentPage }} de {{ resultsPage.totalPages }}
            </span>
            
            <button 
              class="btn btn-pagination"
              [disabled]="currentPage === resultsPage.totalPages"
              (click)="goToPage(currentPage + 1)">
              <i class="fas fa-angle-right"></i>
            </button>
            <button 
              class="btn btn-pagination"
              [disabled]="currentPage === resultsPage.totalPages"
              (click)="goToPage(resultsPage.totalPages)">
              <i class="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-logs {
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

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-section h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .title-section .subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .filters-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .filters-header {
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .filters-header h2 {
      margin: 0;
      color: #495057;
      font-size: 1.25rem;
    }

    .filters-content {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .filters-content.expanded {
      padding: 1.5rem;
      max-height: 500px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-row:last-child {
      margin-bottom: 0;
    }

    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }

    .filter-group input,
    .filter-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
    }

    .filter-actions .btn {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
    }

    .results-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .results-header {
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .results-info h3 {
      margin: 0 0 0.25rem 0;
      color: #495057;
    }

    .results-info p {
      margin: 0;
      color: #6c757d;
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;
    }

    .loading-state i,
    .empty-state i {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .audit-timeline {
      padding: 2rem;
    }

    .timeline-item {
      display: flex;
      gap: 1.5rem;
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
      background: linear-gradient(to bottom, #e9ecef 0%, transparent 100%);
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
      position: relative;
      z-index: 1;
    }

    .timeline-marker.create {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .timeline-marker.update {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }

    .timeline-marker.delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }

    .timeline-marker.confirm {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    }

    .timeline-marker.cancel {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    }

    .timeline-marker.reschedule {
      background: linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%);
    }

    .timeline-content {
      flex: 1;
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .log-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .action-badge {
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
    }

    .action-badge.create {
      background: #28a745;
    }

    .action-badge.update {
      background: #ffc107;
    }

    .action-badge.delete {
      background: #dc3545;
    }

    .action-badge.confirm {
      background: #17a2b8;
    }

    .action-badge.cancel {
      background: #6c757d;
    }

    .action-badge.reschedule {
      background: #fd7e14;
    }

    .log-id {
      background: white;
      color: #495057;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .log-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #6c757d;
    }

    .log-time,
    .log-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .log-reason {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      border-left: 4px solid #007bff;
    }

    .reason-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .reason-text {
      color: #6c757d;
      line-height: 1.5;
    }

    .log-changes {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .changes-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
    }

    .changes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .old-values,
    .new-values {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 0.75rem;
    }

    .old-values h4,
    .new-values h4 {
      margin: 0 0 0.75rem 0;
      font-size: 0.9rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .value-item:last-child {
      border-bottom: none;
    }

    .field-name {
      font-weight: 500;
      color: #495057;
      flex: 1;
    }

    .field-value {
      flex: 1;
      text-align: right;
      font-weight: 500;
    }

    .field-value.old {
      color: #dc3545;
      text-decoration: line-through;
      opacity: 0.8;
    }

    .field-value.new {
      color: #28a745;
      font-weight: 600;
    }

    .affected-parties {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .parties-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .parties-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .party-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .log-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

    .btn-outline {
      background: white;
      border: 1px solid #dee2e6;
      color: #495057;
      transition: all 0.2s ease;
    }

    .btn-outline:hover {
      background: #007bff;
      border-color: #007bff;
      color: white;
    }

    .pagination-container {
      padding: 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-pagination {
      width: 40px;
      height: 40px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-pagination:hover:not(:disabled) {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      margin: 0 1rem;
      font-weight: 500;
      color: #495057;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .header-content {
        flex-direction: column;
        gap: 0.5rem;
      }

      .header-actions {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }

      .results-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .filter-row {
        grid-template-columns: 1fr;
      }

      .timeline-item {
        flex-direction: column;
        gap: 1rem;
      }

      .timeline-item::after {
        display: none;
      }

      .log-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .changes-grid {
        grid-template-columns: 1fr;
      }

      .log-actions {
        justify-content: center;
      }
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  resultsPage: any = { content: [], totalElements: 0, totalPages: 0 };
  currentPage = 1;
  pageSize = 25;
  isLoading = false;
  showFilters = false;
  
  currentFilter: AuditFilter = {};

  constructor(
    private auditService: AuditService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAuditLogs();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  clearFilters() {
    this.currentFilter = {};
    this.applyFilters();
  }

  onFilterChange() {
    // Debounce for text inputs
    setTimeout(() => {
      this.applyFilters();
    }, 500);
  }

  loadAuditLogs() {
    this.isLoading = true;
    
    const request = {
      page: this.currentPage - 1,
      size: this.pageSize,
      filter: this.currentFilter,
      sortBy: 'performedAt',
      sortDirection: 'desc' as const
    };

    this.auditService.getAuditLogsPaginated(request).subscribe({
      next: (response: any) => {
        this.resultsPage = response.data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading audit logs:', error);
        this.isLoading = false;
      }
    });
  }

  changePageSize() {
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadAuditLogs();
  }

  goBack() {
    this.router.navigate(['/audit']);
  }

  viewTurnoDetail(turnoId: number) {
    this.router.navigate(['/audit/turno', turnoId]);
  }

  viewRelatedLogs(turnoId: number) {
    this.currentFilter.turnoId = turnoId;
    this.applyFilters();
  }

  exportLogs(format: 'csv' | 'pdf') {
    const exportMethod = format === 'csv' 
      ? this.auditService.exportAuditLogsCSV(this.currentFilter)
      : this.auditService.exportAuditLogsPDF(this.currentFilter);

    exportMethod.subscribe({
      next: (blob: any) => {
        const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;
        this.auditService.downloadFile(blob, filename);
      },
      error: (error: any) => {
        console.error(`Error exporting ${format}:`, error);
        alert(`Error al exportar en formato ${format.toUpperCase()}`);
      }
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFieldName(fieldName: string): string {
    const fieldMappings: { [key: string]: string } = {
      'fecha': 'Fecha',
      'horaInicio': 'Hora Inicio',
      'horaFin': 'Hora Fin',
      'estado': 'Estado',
      'pacienteId': 'Paciente',
      'staffMedicoId': 'Médico',
      'consultorioId': 'Consultorio',
      'centroId': 'Centro',
      'titulo': 'Título'
    };
    return fieldMappings[fieldName] || fieldName;
  }

  formatFieldValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
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
        return 'Creado';
      case 'UPDATE':
        return 'Modificado';
      case 'DELETE':
        return 'Eliminado';
      case 'CONFIRM':
        return 'Confirmado';
      case 'CANCEL':
        return 'Cancelado';
      case 'RESCHEDULE':
        return 'Reagendado';
      case 'STATUS_CHANGE':
        return 'Cambio Estado';
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
