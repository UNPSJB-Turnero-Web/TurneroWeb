import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuditService } from './audit.service';
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';
import { AuditFilter } from './audit-log';
import { NotificationService } from './notification.service';
import { AuditStatsComponent } from './audit-stats.component';
import { AuditAdvancedSearchComponent } from './audit-advanced-search.component';
import { AuditOperationsComponent } from './audit-operations.component';

@Component({
  selector: 'app-audit-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AuditStatsComponent, AuditAdvancedSearchComponent, AuditOperationsComponent],
  template: `
    <div class="audit-dashboard">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <i class="fas fa-audit"></i>
            Sistema de Auditoría de Turnos
          </h1>
          <p class="subtitle">Gestión completa de turnos con trazabilidad y control de cambios</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-header-glass btn-header-success" (click)="exportData('csv')" title="Exportar datos a CSV">
            <i class="fas fa-download"></i>
            CSV
          </button>
          <button class="btn btn-header-glass btn-header-warning" (click)="exportData('pdf')" title="Exportar datos a PDF">
            <i class="fas fa-file-pdf"></i>
            PDF
          </button>
          <button class="btn btn-header-solid" (click)="viewAuditLogs()" title="Ver historial completo de auditoría">
            <i class="fas fa-history"></i>
            Historial
          </button>
        </div>
      </div>

      <!-- Real-time Statistics -->
      <app-audit-stats></app-audit-stats>

      <!-- Advanced Search -->
      <app-audit-advanced-search
        (filtersChanged)="onAdvancedFiltersChanged($event)"
        (searchTriggered)="onAdvancedSearchTriggered($event)">
      </app-audit-advanced-search>

      <!-- Operations Monitor -->
      <app-audit-operations></app-audit-operations>


      <!-- Statistics Section -->
      <div class="statistics-section">
        <h2 class="section-title">
          <i class="fas fa-chart-bar"></i>
          Resumen del Sistema
        </h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon programado">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
              <h3>{{ statistics.programados || 0 }}</h3>
              <p>Turnos Programados</p>
              <span class="stat-trend positive" *ngIf="statistics.programados > 0">
                <i class="fas fa-arrow-up"></i>
                Activos
              </span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon confirmado">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>{{ statistics.confirmados || 0 }}</h3>
              <p>Turnos Confirmados</p>
              <span class="stat-trend positive" *ngIf="statistics.confirmados > 0">
                <i class="fas fa-thumbs-up"></i>
                Confirmados
              </span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon reagendado">
              <i class="fas fa-sync-alt"></i>
            </div>
            <div class="stat-content">
              <h3>{{ statistics.reagendados || 0 }}</h3>
              <p>Turnos Reagendados</p>
              <span class="stat-trend neutral">
                <i class="fas fa-redo"></i>
                Modificados
              </span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon cancelado">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-content">
              <h3>{{ statistics.cancelados || 0 }}</h3>
              <p>Turnos Cancelados</p>
              <span class="stat-trend negative">
                <i class="fas fa-ban"></i>
                Cancelados
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="results-section">
        <div class="results-header">
          <div class="results-info">
            <h3>Resultados de la Búsqueda</h3>
            <p *ngIf="resultsPage.content">
              Mostrando {{ resultsPage.content.length }} de {{ resultsPage.totalElements }} turnos
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
          <p>Cargando turnos...</p>
        </div>

        <!-- Results Table -->
        <div class="table-container" *ngIf="!isLoading">
          <table class="audit-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Centro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let turno of resultsPage.content" [class.conflict-row]="hasConflicts(turno)">
                <td>{{ turno.id }}</td>
                <td>{{ formatDate(turno.fecha) }}</td>
                <td>{{ turno.horaInicio }} - {{ turno.horaFin }}</td>
                <td>
                  <div class="patient-info">
                    <strong>{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</strong>
                  </div>
                </td>
                <td>
                  <div class="doctor-info">
                    <strong>{{ turno.staffMedicoNombre }} {{ turno.staffMedicoApellido }}</strong>
                  </div>
                </td>
                <td>
                  <span class="specialty-badge">{{ turno.especialidadStaffMedico }}</span>
                </td>
                <td>{{ turno.nombreCentro }}</td>
                <td>
                  <span class="status-badge" [class]="getStatusClass(turno.estado)">
                    {{ getStatusText(turno.estado) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-view"
                      (click)="viewTurnoDetail(turno.id)"
                      title="Ver detalles">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      class="btn-action btn-edit"
                      (click)="editTurno(turno.id)"
                      title="Editar turno">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-action btn-history"
                      (click)="viewAuditHistory(turno.id)"
                      title="Ver historial">
                      <i class="fas fa-history"></i>
                    </button>
                    <button 
                      class="btn-action btn-warning"
                      *ngIf="hasConflicts(turno)"
                      (click)="resolveConflicts(turno.id)"
                      title="Resolver conflictos">
                      <i class="fas fa-exclamation-triangle"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="resultsPage.content?.length === 0">
                <td colspan="9" class="no-results">
                  <i class="fas fa-search fa-3x"></i>
                  <h3>No se encontraron turnos</h3>
                  <p>Intenta ajustar los filtros de búsqueda</p>
                </td>
              </tr>
            </tbody>
          </table>
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
    .audit-dashboard {
      padding: 1rem;
      max-width: 1400px;
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

    .header-content h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .header-content .subtitle {
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

    .filter-group select,
    .filter-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .search-input {
      position: relative;
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
    }

    .filter-actions .btn {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
    }

    .statistics-section {
      margin-bottom: 2rem;
    }

    .section-title {
      color: #495057;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-icon.programado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    }

    .stat-icon.confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .stat-icon.reagendado {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }

    .stat-icon.cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }

    .stat-content h3 {
      margin: 0 0 0.25rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-content p {
      margin: 0;
      color: #6c757d;
      font-weight: 500;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .stat-trend.positive {
      color: #28a745;
    }

    .stat-trend.negative {
      color: #dc3545;
    }

    .stat-trend.neutral {
      color: #6c757d;
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

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;
    }

    .loading-state i {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .audit-table {
      width: 100%;
      border-collapse: collapse;
    }

    .audit-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #e9ecef;
    }

    .audit-table td {
      padding: 1rem;
      border-bottom: 1px solid #f1f3f4;
      vertical-align: middle;
    }

    .audit-table tr:hover {
      background-color: #f8f9fa;
    }

    .conflict-row {
      background-color: #fff3cd !important;
      border-left: 4px solid #ffc107;
    }

    .patient-info strong,
    .doctor-info strong {
      color: #2c3e50;
    }

    .specialty-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-badge {
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

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .btn-action {
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

    .btn-action.btn-view {
      background: #e3f2fd;
      color: #1976d2;
    }

    .btn-action.btn-edit {
      background: #fff3e0;
      color: #f57c00;
    }

    .btn-action.btn-history {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .btn-action.btn-warning {
      background: #fff3cd;
      color: #856404;
    }

    .btn-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;
    }

    .no-results i {
      margin-bottom: 1rem;
      opacity: 0.5;
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

      .statistics-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AuditDashboardComponent implements OnInit {
  resultsPage: any = { content: [], totalElements: 0, totalPages: 0 };
  currentPage = 1;
  pageSize = 25;
  isLoading = false;
  showFilters = false;
  searchTerm = '';
  
  currentFilter: any = {
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    centroId: '',
    especialidadId: '',
    staffMedicoId: ''
  };

  statistics = {
    programados: 0,
    confirmados: 0,
    reagendados: 0,
    cancelados: 0,
    totalAudits: 0,
    conflictsResolved: 0,
    todayTurnos: 0,
    weekTurnos: 0
  };

  constructor(
    private auditService: AuditService,
    private turnoService: TurnoService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadTurnos();
    this.loadStatistics();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadTurnos();
  }

  clearFilters() {
    this.currentFilter = {
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      centroId: '',
      especialidadId: '',
      staffMedicoId: ''
    };
    this.searchTerm = '';
    this.applyFilters();
  }

  onSearchChange() {
    if (this.searchTerm.length >= 3 || this.searchTerm.length === 0) {
      this.applyFilters();
    }
  }

  loadTurnos() {
    this.isLoading = true;
    
    const filter = { ...this.currentFilter };
    if (this.searchTerm) {
      filter.searchTerm = this.searchTerm;
    }

    this.auditService.getTurnosForAuditPaginated(this.currentPage, this.pageSize, filter)
      .subscribe({
        next: (response: any) => {
          this.resultsPage = response.data;
          this.isLoading = false;
          
          // Mostrar notificación de éxito si hay resultados
          if (response.data.content && response.data.content.length > 0) {
            this.notificationService.showInfo(
              'Búsqueda Completa',
              `Se encontraron ${response.data.totalElements} turnos`,
              3000
            );
          }
        },
        error: (error: any) => {
          console.error('Error loading turnos:', error);
          this.isLoading = false;
          this.notificationService.auditError('cargar turnos', error.message);
        }
      });
  }

  loadStatistics() {
    // This would be implemented with a specific endpoint for statistics
    // For now, we'll calculate from the current data
    this.auditService.getAllTurnosForAudit().subscribe({
      next: (response: any) => {
        const turnos = response.data;
        this.statistics = {
          programados: turnos.filter((t: any) => t.estado === 'PROGRAMADO').length,
          confirmados: turnos.filter((t: any) => t.estado === 'CONFIRMADO').length,
          reagendados: turnos.filter((t: any) => t.estado === 'REAGENDADO').length,
          cancelados: turnos.filter((t: any) => t.estado === 'CANCELADO').length,
          totalAudits: turnos.length * 2, // Estimación para demo
          conflictsResolved: Math.floor(turnos.length * 0.05), // 5% de conflictos resueltos
          todayTurnos: turnos.filter((t: any) => this.isToday(t.fecha)).length,
          weekTurnos: turnos.filter((t: any) => this.isThisWeek(t.fecha)).length
        };
      },
      error: (error: any) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  changePageSize() {
    this.currentPage = 1;
    this.loadTurnos();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadTurnos();
  }

  // Advanced Search Methods
  onAdvancedFiltersChanged(filters: any): void {
    // Update current filter with advanced search filters
    this.currentFilter = {
      estado: filters.estado,
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
      centroId: filters.centroId,
      especialidadId: filters.especialidadId,
      staffMedicoId: filters.staffMedicoId
    };
    
    this.searchTerm = filters.searchTerm;
    
    // Apply additional filters that don't exist in basic search
    if (filters.pacienteId) {
      this.currentFilter.pacienteId = filters.pacienteId;
    }
    if (filters.conConflictos) {
      this.currentFilter.conConflictos = true;
    }
    if (filters.soloValidados) {
      this.currentFilter.soloValidados = true;
    }
  }

  onAdvancedSearchTriggered(filters: any): void {
    this.onAdvancedFiltersChanged(filters);
    this.applyFilters();
    
    this.notificationService.showInfo(
      'Búsqueda Avanzada',
      'Aplicando filtros avanzados de búsqueda...',
      2000
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  hasConflicts(turno: any): boolean {
    // This would check for conflicts based on business rules
    // For now, we'll return false
    return false;
  }

  viewTurnoDetail(turnoId: number) {
    this.router.navigate(['/audit/turno', turnoId]);
  }

  editTurno(turnoId: number) {
    this.router.navigate(['/audit/turno', turnoId, 'edit']);
  }

  viewAuditHistory(turnoId: number) {
    this.router.navigate(['/audit/turno', turnoId, 'history']);
  }

  resolveConflicts(turnoId: number) {
    this.router.navigate(['/audit/turno', turnoId, 'conflicts']);
  }

  viewAuditLogs() {
    this.router.navigate(['/audit/logs']);
  }

  exportData(format: 'csv' | 'pdf') {
    const filter = { ...this.currentFilter };
    if (this.searchTerm) {
      filter.searchTerm = this.searchTerm;
    }

    // Mostrar notificación de inicio
    this.notificationService.showInfo(
      'Exportando Datos',
      `Generando archivo ${format.toUpperCase()}...`,
      2000
    );

    const exportMethod = format === 'csv' 
      ? this.auditService.exportTurnosCSV(filter)
      : this.auditService.exportTurnosPDF(filter);

    exportMethod.subscribe({
      next: (blob: any) => {
        const filename = `turnos_audit_${new Date().toISOString().split('T')[0]}.${format}`;
        this.auditService.downloadFile(blob, filename);
        this.notificationService.exportComplete(format, filename);
      },
      error: (error: any) => {
        console.error(`Error exporting ${format}:`, error);
        this.notificationService.auditError(`exportar en formato ${format.toUpperCase()}`, error.message);
      }
    });
  }

  // Métodos auxiliares para estadísticas
  private isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private isThisWeek(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= weekStart && date <= weekEnd;
  }
}
