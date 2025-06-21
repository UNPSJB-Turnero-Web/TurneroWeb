import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnoService } from './turno.service';
import { Turno, TurnoFilter, AuditLog } from './turno';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-turno-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turno-advanced-search.component.html',
  styleUrls: ['./turno-advanced-search.component.css']
})
export class TurnoAdvancedSearchComponent implements OnInit {
  
  // Filtros de búsqueda
  filter: TurnoFilter = {
    page: 0,
    size: 20,
    sortBy: 'fecha',
    sortDirection: 'DESC'
  };

  // Resultados
  turnos: Turno[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  
  // Estados de la UI
  loading: boolean = false;
  showAdvancedFilters: boolean = false;
  showAuditPanel: boolean = false;
  
  // Auditoría
  selectedTurno: Turno | null = null;
  auditHistory: AuditLog[] = [];
  auditStatistics: any = {};
  recentLogs: AuditLog[] = [];
  
  // Exportación
  exportLoading: boolean = false;
  
  // Opciones para filtros
  estadosDisponibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'PROGRAMADO', label: 'Programado' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'REAGENDADO', label: 'Reagendado' }
  ];

  constructor(
    private turnoService: TurnoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.search();
    this.loadAuditStatistics();
    this.loadRecentLogs();
  }

  /** Realiza la búsqueda con los filtros actuales */
  search(): void {
    this.loading = true;
    
    this.turnoService.searchWithFilters(this.filter).subscribe({
      next: (response: DataPackage<any>) => {
        if (response.status === 1) {
          this.turnos = response.data.content || [];
          this.totalElements = response.data.totalElements || 0;
          this.totalPages = response.data.totalPages || 0;
          this.currentPage = response.data.number || 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.loading = false;
      }
    });
  }

  /** Reinicia los filtros */
  resetFilters(): void {
    this.filter = {
      page: 0,
      size: 20,
      sortBy: 'fecha',
      sortDirection: 'DESC'
    };
    this.search();
  }

  /** Cambia de página */
  changePage(page: number): void {
    this.filter.page = page;
    this.search();
  }

  /** Cambia el tamaño de página */
  changePageSize(size: number): void {
    this.filter.size = size;
    this.filter.page = 0;
    this.search();
  }

  /** Cambia el ordenamiento */
  changeSort(sortBy: string): void {
    if (this.filter.sortBy === sortBy) {
      // Cambiar dirección si ya está ordenando por este campo
      this.filter.sortDirection = this.filter.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.filter.sortBy = sortBy;
      this.filter.sortDirection = 'ASC';
    }
    this.search();
  }

  /** Muestra el historial de auditoría de un turno */
  showAuditHistory(turno: Turno): void {
    this.selectedTurno = turno;
    this.showAuditPanel = true;
    
    if (turno.id) {
      this.turnoService.getAuditHistory(turno.id).subscribe({
        next: (response: DataPackage<AuditLog[]>) => {
          if (response.status === 1) {
            this.auditHistory = response.data || [];
          }
        },
        error: (error) => {
          console.error('Error al cargar historial:', error);
        }
      });
    }
  }

  /** Cierra el panel de auditoría */
  closeAuditPanel(): void {
    this.showAuditPanel = false;
    this.selectedTurno = null;
    this.auditHistory = [];
  }

  /** Verifica la integridad del historial */
  verifyIntegrity(turnoId: number): void {
    this.turnoService.verifyAuditIntegrity(turnoId).subscribe({
      next: (response: DataPackage<{isValid: boolean}>) => {
        if (response.status === 1) {
          const isValid = response.data.isValid;
          alert(isValid ? 'El historial de auditoría es íntegro' : 'Se detectaron inconsistencias en el historial');
        }
      },
      error: (error) => {
        console.error('Error al verificar integridad:', error);
        alert('Error al verificar la integridad');
      }
    });
  }

  /** Carga estadísticas de auditoría */
  loadAuditStatistics(): void {
    this.turnoService.getAuditStatistics().subscribe({
      next: (response: DataPackage<any[]>) => {
        if (response.status === 1) {
          this.auditStatistics = this.processStatistics(response.data);
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  /** Carga logs recientes */
  loadRecentLogs(): void {
    this.turnoService.getRecentAuditLogs().subscribe({
      next: (response: DataPackage<AuditLog[]>) => {
        if (response.status === 1) {
          this.recentLogs = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error al cargar logs recientes:', error);
      }
    });
  }

  /** Procesa las estadísticas para mostrar */
  private processStatistics(data: any[]): any {
    const stats: any = {};
    data.forEach(item => {
      if (Array.isArray(item) && item.length >= 2) {
        stats[item[0]] = item[1];
      }
    });
    return stats;
  }

  // === MÉTODOS DE EXPORTACIÓN ===

  /** Exporta a CSV */
  exportCSV(): void {
    this.exportLoading = true;
    const exportFilter = { ...this.filter, exportFormat: 'CSV' };
    
    this.turnoService.exportToCSV(exportFilter).subscribe({
      next: (csvContent: string) => {
        this.downloadFile(csvContent, 'turnos.csv', 'text/csv');
        this.exportLoading = false;
      },
      error: (error) => {
        console.error('Error al exportar CSV:', error);
        this.exportLoading = false;
      }
    });
  }

  /** Exporta a PDF */
  exportPDF(): void {
    this.exportLoading = true;
    const exportFilter = { ...this.filter, exportFormat: 'PDF' };
    
    this.turnoService.exportToPDF(exportFilter).subscribe({
      next: (htmlContent: string) => {
        // Abrir en nueva ventana para que el usuario pueda imprimir o guardar como PDF
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
        }
        this.exportLoading = false;
      },
      error: (error) => {
        console.error('Error al exportar PDF:', error);
        this.exportLoading = false;
      }
    });
  }

  /** Descarga un archivo */
  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // === MÉTODOS DE NAVEGACIÓN ===

  /** Navega al detalle de un turno */
  goToDetail(turno: Turno): void {
    if (turno.id) {
      this.router.navigate(['/turnos', turno.id]);
    }
  }

  /** Edita un turno */
  editTurno(turno: Turno): void {
    if (turno.id) {
      this.router.navigate(['/turnos', turno.id, 'edit']);
    }
  }

  // === MÉTODOS AUXILIARES ===

  /** Formatea una fecha para mostrar */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  /** Formatea una fecha y hora para mostrar */
  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES');
  }

  /** Obtiene la clase CSS para el estado */
  getEstadoClass(estado: string): string {
    const classes: any = {
      'PROGRAMADO': 'badge bg-primary',
      'CONFIRMADO': 'badge bg-success',
      'CANCELADO': 'badge bg-danger',
      'REAGENDADO': 'badge bg-warning'
    };
    return classes[estado] || 'badge bg-secondary';
  }

  /** Obtiene la clase CSS para el tipo de acción de auditoría */
  getActionClass(action: string): string {
    const classes: any = {
      'CREATED': 'badge bg-info',
      'STATUS_CHANGED': 'badge bg-primary',
      'CANCELED': 'badge bg-danger',
      'CONFIRMED': 'badge bg-success',
      'RESCHEDULED': 'badge bg-warning',
      'DELETED': 'badge bg-dark'
    };
    return classes[action] || 'badge bg-secondary';
  }
}
