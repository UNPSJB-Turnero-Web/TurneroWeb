import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  // Resultados con getter/setter para monitoreo
  private _turnos: Turno[] = [];
  get turnos(): Turno[] {
    return this._turnos;
  }
  set turnos(value: Turno[]) {
    
    this._turnos = value;
    
  }

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
    { value: 'REAGENDADO', label: 'Reagendado' },
    {value: 'COMPLETADO', label: 'Completado' }    
  ];

  constructor(
    private turnoService: TurnoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  /** Verifica si la respuesta es exitosa considerando ambos formatos */
  private isSuccessfulResponse(response: any): boolean {
    return response.status === 1 || response.status_code === 200;
  }

  ngOnInit(): void {
   
    // TEMPORAL: Quitar filtro de estado para probar
    this.filter.estado = '';
  
    
    this.search();
    this.loadAuditStatistics();
    this.loadRecentLogs();
  }

  /** Realiza la búsqueda con los filtros actuales */
  search(): void {
    this.loading = true;
   
    
    this.turnoService.searchWithFilters(this.filter).subscribe({
      next: (response: DataPackage<any>) => {
      
        
        // Verificar tanto el formato nuevo (status_code: 200) como el antiguo (status: 1)
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;

        
        if (isSuccessful) {
          const data = response.data;
    
          
          // Limpiar primero el array actual - CON LOG DETALLADO
     
          this.turnos = [];
   
          this.totalElements = 0;
          this.totalPages = 0;
          this.currentPage = 0;
          
          // Verificar si hay contenido en content o directamente en data
          if (data && data.content && Array.isArray(data.content)) {
         
            
            // Asignar cada campo por separado para debug
            const newTurnos = [...data.content];
           
            
            // ASIGNACIÓN PASO A PASO
      
            this.turnos = newTurnos;
          
            
            this.totalElements = data.totalElements || 0;
            this.totalPages = data.totalPages || 1;
            this.currentPage = data.number || 0;
         
            
            // Verificar inmediatamente después de la asignación
            setTimeout(() => {
   
            }, 0);
            
          } else if (Array.isArray(data)) {
        
            this.turnos = [...data];
            this.totalElements = data.length;
            this.totalPages = 1;
            this.currentPage = 0;
     
          }
          
        
        } else {
          
          this.turnos = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.currentPage = 0;
        }
        

        this.loading = false;
  
        
        // Forzar detección de cambios después de cambiar loading
        this.cdr.detectChanges();
       
        
        // Log final para verificar el estado del componente

        
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.turnos = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.currentPage = 0;
        this.loading = false;
        this.cdr.detectChanges();
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
          const isSuccessful = response.status === 1 || (response as any).status_code === 200;
          if (isSuccessful) {
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
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;
        if (isSuccessful) {
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
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;
        if (isSuccessful) {
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
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;
        if (isSuccessful) {
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

  this.turnoService.exportToCSVDownload(exportFilter).subscribe({
    next: (blob: Blob) => {
      this.downloadFile(blob, 'turnos.csv', 'text/csv');
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

  this.turnoService.exportToPDFDownload(exportFilter).subscribe({
    next: (blob: Blob) => {
      this.downloadFile(blob, 'turnos.pdf', 'application/pdf');
      this.exportLoading = false;
    },
    error: (error) => {
      console.error('Error al exportar PDF:', error);
      this.exportLoading = false;
    }
  });
}

/** Descarga un archivo */
private downloadFile(blob: Blob, filename: string, contentType: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  // Para navegadores modernos, simular click y limpiar el objeto URL
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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


  /** TrackBy function para optimizar ngFor */
  trackByTurnoId(index: number, turno: Turno): any {
    return turno.id || index;
  }




}
