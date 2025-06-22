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

  // Resultados
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
  
  // Modal de cambio de estado
  showChangeStateModal: boolean = false;
  selectedTurno: Turno | null = null;
  changeStateForm: {
    nuevoEstado: string;
    motivo: string;
  } = {
    nuevoEstado: '',
    motivo: ''
  };
  validNextStates: string[] = [];
  
  // Auditoría
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
        // Verificar tanto el formato nuevo (status_code: 200) como el antiguo (status: 1)
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;
        
        if (isSuccessful) {
          const data = response.data;
          
          // Limpiar primero el array actual
          this.turnos = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.currentPage = 0;
          
          // Verificar si hay contenido en content o directamente en data
          if (data && data.content && Array.isArray(data.content)) {
            this.turnos = [...data.content];
            this.totalElements = data.totalElements || 0;
            this.totalPages = data.totalPages || 1;
            this.currentPage = data.number || 0;
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
        this.cdr.detectChanges();
        
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

  // === MÉTODOS DE CAMBIO DE ESTADO ===

  /** Abre modal para cambio de estado */
  openChangeStateModal(turno: Turno): void {
    this.selectedTurno = turno;
    this.showChangeStateModal = true;
    this.changeStateForm = {
      nuevoEstado: '',
      motivo: ''
    };
    
    // Cargar estados válidos para este turno
    if (turno.id) {
      this.turnoService.getValidNextStates(turno.id).subscribe({
        next: (response: DataPackage<string[]>) => {
          const isSuccessful = response.status === 1 || (response as any).status_code === 200;
          if (isSuccessful) {
            this.validNextStates = response.data || [];
          }
        },
        error: (error) => {
          console.error('Error al cargar estados válidos:', error);
          this.validNextStates = [];
        }
      });
    }
  }

  /** Cierra el modal de cambio de estado */
  closeChangeStateModal(): void {
    this.showChangeStateModal = false;
    this.selectedTurno = null;
    this.changeStateForm = {
      nuevoEstado: '',
      motivo: ''
    };
    this.validNextStates = [];
  }

  /** Cambia el estado del turno */
  changeState(): void {
    if (!this.selectedTurno || !this.changeStateForm.nuevoEstado) {
      alert('Debe seleccionar un estado');
      return;
    }

    // Validar motivo para cancelaciones y reagendamientos
    if ((this.changeStateForm.nuevoEstado === 'CANCELADO' || 
         this.changeStateForm.nuevoEstado === 'REAGENDADO') && 
        !this.changeStateForm.motivo?.trim()) {
      alert('El motivo es obligatorio para cancelaciones y reagendamientos');
      return;
    }

    // Validar longitud mínima del motivo
    if (this.changeStateForm.motivo && this.changeStateForm.motivo.trim().length < 5) {
      alert('El motivo debe tener al menos 5 caracteres');
      return;
    }

    this.loading = true;

    this.turnoService.updateEstado(
      this.selectedTurno.id!, 
      this.changeStateForm.nuevoEstado,
      this.changeStateForm.motivo?.trim()
    ).subscribe({
      next: (response) => {
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;
        if (isSuccessful) {
          alert('Estado actualizado correctamente');
          this.closeChangeStateModal();
          this.search(); // Recargar la tabla
        } else {
          alert('Error al cambiar estado: ' + (response as any).status_text || 'Error desconocido');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        let errorMessage = 'Error al cambiar estado';
        
        if (error.error && error.error.status_text) {
          errorMessage += ': ' + error.error.status_text;
        } else if (error.message) {
          errorMessage += ': ' + error.message;
        }
        
        alert(errorMessage);
        this.loading = false;
      }
    });
  }

  /** Obtiene el texto descriptivo para un estado */
  getEstadoLabel(estado: string): string {
    const labels: any = {
      'PROGRAMADO': 'Programado',
      'CONFIRMADO': 'Confirmado',
      'CANCELADO': 'Cancelado',
      'REAGENDADO': 'Reagendado',
      'COMPLETADO': 'Completado',
      'COMPLETO': 'Completado'
    };
    return labels[estado] || estado;
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
  console.log('CSV Export - Iniciando exportación con filtros:', this.filter);
  
  // Crear una copia limpia del filtro
  const exportFilter = { ...this.filter };
  delete (exportFilter as any).exportFormat;

  this.turnoService.exportToCSVDownload(exportFilter).subscribe({
    next: (blob: Blob) => {
      console.log('CSV Export - Blob recibido:', blob);
      console.log('CSV Export - Blob type:', blob.type);
      console.log('CSV Export - Blob size:', blob.size);
      
      if (blob.type === 'text/html' || blob.size < 50) {
        console.error('Error: El archivo CSV parece ser HTML o está vacío');
        
        // Leer el contenido para debug
        const reader = new FileReader();
        reader.onload = () => {
          console.log('Contenido CSV:', reader.result as string);
        };
        reader.readAsText(blob);
        
        alert('Error: El servidor devolvió HTML en lugar de CSV. Verifique el endpoint del backend.');
        this.exportLoading = false;
        return;
      }
      
      this.downloadFile(blob, 'turnos.csv', 'text/csv');
      this.exportLoading = false;
    },
    error: (error) => {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar CSV: ' + (error.message || error));
      this.exportLoading = false;
    }
  });
}

/** Exporta a PDF */
exportPDF(): void {
  this.exportLoading = true;
  console.log('PDF Export - Iniciando exportación con filtros:', this.filter);
  
  // Crear una copia limpia del filtro sin el campo exportFormat
  const exportFilter = { ...this.filter };
  delete (exportFilter as any).exportFormat;
  
  console.log('PDF Export - Filtro limpio enviado:', exportFilter);

  // Intentar primero con POST
  this.turnoService.exportToPDFDownload(exportFilter).subscribe({
    next: (blob: Blob) => {
      this.handlePDFResponse(blob);
    },
    error: (error) => {
      console.warn('PDF Export - POST falló, intentando con GET:', error);
      
      // Si POST falla, intentar con GET
      this.turnoService.exportToPDFDownloadGET(exportFilter).subscribe({
        next: (blob: Blob) => {
          console.log('PDF Export - GET exitoso');
          this.handlePDFResponse(blob);
        },
        error: (getError) => {
          this.handlePDFError(getError);
        }
      });
    }
  });
}

/** Maneja la respuesta del PDF */
private handlePDFResponse(blob: Blob): void {
  console.log('PDF Export - Blob recibido:', blob);
  console.log('PDF Export - Blob type:', blob.type);
  console.log('PDF Export - Blob size:', blob.size);
  
  // Si el blob es muy pequeño, hay un error
  if (blob.size < 100) {
    console.error('Error: El archivo PDF es demasiado pequeño');
    alert('Error: El archivo PDF está vacío o es demasiado pequeño.');
    this.exportLoading = false;
    return;
  }
  
  // Verificar si es HTML/texto en lugar de PDF
  if (blob.type === 'text/html' || blob.type === 'text/plain' || blob.type === '') {
    console.error('Error: El archivo PDF no tiene el tipo correcto. Tipo recibido:', blob.type);
    
    // Leer el contenido para debug
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      console.log('Contenido del blob completo:', content);
      console.log('Primeros 500 chars:', content.substring(0, 500));
    };
    reader.readAsText(blob);
    
    alert('Error: El servidor devolvió contenido de tipo "' + blob.type + '" en lugar de PDF. Verifique el endpoint del backend.');
    this.exportLoading = false;
    return;
  }
  
  // Si llegamos aquí, el PDF parece estar bien
  console.log('PDF Export - Descargando archivo PDF válido');
  this.downloadFile(blob, 'turnos.pdf', 'application/pdf');
  this.exportLoading = false;
}

/** Maneja errores del PDF */
private handlePDFError(error: any): void {
  console.error('Error al exportar PDF:', error);
  console.error('Error details:', {
    status: error.status,
    statusText: error.statusText,
    message: error.message,
    url: error.url
  });
  
  let errorMessage = 'Error al exportar PDF: ';
  if (error.status === 404) {
    errorMessage += 'Endpoint no encontrado (404). Verifique que el backend tenga implementado rest/turno/export/pdf';
  } else if (error.status === 500) {
    errorMessage += 'Error interno del servidor (500). Revise los logs del backend.';
  } else if (error.status === 405) {
    errorMessage += 'Método no permitido (405). El backend no acepta POST ni GET para este endpoint.';
  } else {
    errorMessage += error.message || error.statusText || 'Error desconocido';
  }
  
  alert(errorMessage);
  this.exportLoading = false;
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
