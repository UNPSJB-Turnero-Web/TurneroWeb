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
  
  // Tipo de vista/reporte unificado
  tipoVista: string = 'busqueda'; // 'busqueda', 'reporte-dia-consultorio', 'reporte-especialidad-medico', 'reporte-cancelaciones'
  
  // Opciones del dropdown de tipo de vista
  tiposVista = [
    { value: 'busqueda', label: 'Búsqueda Normal', icon: 'fas fa-search' },
    { value: 'reporte-dia-consultorio', label: 'Reporte: Turnos por Día y Consultorio', icon: 'fas fa-calendar-day' },
    { value: 'reporte-especialidad-medico', label: 'Reporte: Turnos por Especialidad y Médico', icon: 'fas fa-user-md' },
    { value: 'reporte-cancelaciones', label: 'Reporte: Cancelaciones y Reprogramaciones', icon: 'fas fa-times-circle' }
  ];
  
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
  
  // Reportes
  reportesLoading: boolean = false;
  
  reportData: any = {
    turnosPorDiaConsultorio: [],
    turnosPorEspecialidadMedico: [],
    cancelacionesReprogramaciones: []
  };
  
  // Opciones para filtros
  estadosDisponibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'PROGRAMADO', label: 'Programado' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'REAGENDADO', label: 'Reagendado' },
    { value: 'COMPLETADO', label: 'Completado' }    
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
    this.initializeReportFilters();
  }

  /** Realiza la búsqueda con los filtros actuales */
  search(): void {
    this.loading = true;
    
    // Limpiar filtros vacíos para evitar problemas en el backend
    const cleanFilter = this.cleanFilter(this.filter);
    console.log('Filtros enviados al backend:', cleanFilter);
    
    this.turnoService.searchWithFilters(cleanFilter).subscribe({
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

    // Obtener el usuario actual de manera más específica
    const userRole = localStorage.getItem('userRole');
    let currentUser = 'UNKNOWN';
    
    if (userRole === 'PACIENTE') {
      const patientDNI = localStorage.getItem('patientDNI');
      currentUser = `PACIENTE_${patientDNI || 'UNKNOWN'}`;
    } else if (userRole === 'ADMIN' || userRole === 'admin') {
      currentUser = 'ADMIN';
    } else if (userRole === 'MEDICO') {
      currentUser = 'MEDICO';
    } else {
      // Para el dashboard de auditoría u otros contextos
      currentUser = 'AUDITOR_DASHBOARD';
    }

    this.turnoService.updateEstado(
      this.selectedTurno.id!, 
      this.changeStateForm.nuevoEstado,
      this.changeStateForm.motivo?.trim(),
      currentUser
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
    if (this.isReportMode()) {
      this.exportReportCSV();
    } else {
      this.exportSearchCSV();
    }
  }

  private exportSearchCSV(): void {
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
        
        this.downloadFile(blob, `turnos_busqueda_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        this.exportLoading = false;
      },
      error: (error) => {
        console.error('Error al exportar CSV:', error);
        alert('Error al exportar CSV: ' + (error.message || error));
        this.exportLoading = false;
      }
    });
  }

  private exportReportCSV(): void {
    if (!this.hasReportData()) {
      alert('No hay datos de reporte para exportar. Genere un reporte primero.');
      return;
    }

    const csvData = this.generateReportCSVData();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${this.tipoVista}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private generateReportCSVData(): string {
    let csvContent = '';
    
    switch (this.tipoVista) {
      case 'reporte-dia-consultorio':
        csvContent = 'Fecha,Consultorio,Total Turnos,Atendidos,Cancelados,Reprogramados\n';
        this.reportData.turnosPorDiaConsultorio.forEach((item: any) => {
          csvContent += `${item.fecha || ''},${item.consultorio || ''},${item.totalTurnos || 0},${item.atendidos || 0},${item.cancelados || 0},${item.reprogramados || 0}\n`;
        });
        break;
        
      case 'reporte-especialidad-medico':
        csvContent = 'Especialidad,Médico,Total Turnos,Atendidos,Cancelados,Reprogramados\n';
        this.reportData.turnosPorEspecialidadMedico.forEach((item: any) => {
          csvContent += `${item.especialidad || ''},${item.medico || ''},${item.totalTurnos || 0},${item.atendidos || 0},${item.cancelados || 0},${item.reprogramados || 0}\n`;
        });
        break;
        
      case 'reporte-cancelaciones':
        csvContent = 'Fecha,Médico,Paciente,Tipo Movimiento,Motivo,Estado Anterior,Estado Nuevo\n';
        this.reportData.cancelacionesReprogramaciones.forEach((item: any) => {
          csvContent += `${item.fecha || ''},${item.medico || ''},${item.paciente || ''},${item.tipoMovimiento || ''},${item.motivo || ''},${item.estadoAnterior || ''},${item.estadoNuevo || ''}\n`;
        });
        break;
        
      default:
        csvContent = 'No hay datos disponibles para este tipo de reporte\n';
    }
    
    return csvContent;
  }

  /** Exporta a PDF */
  exportPDF(): void {
    if (this.isReportMode()) {
      this.exportReportPDF();
    } else {
      this.exportSearchPDF();
    }
  }

  private exportSearchPDF(): void {
    this.exportLoading = true;
    console.log('PDF Export - Iniciando exportación con filtros:', this.filter);
    
    // Crear una copia limpia del filtro sin el campo exportFormat
    const exportFilter = { ...this.filter };
    delete (exportFilter as any).exportFormat;
    
    console.log('PDF Export - Filtro limpio enviado:', exportFilter);

    // Intentar primero con POST
    this.turnoService.exportToPDFDownload(exportFilter).subscribe({
      next: (blob: Blob) => {
        this.handlePDFResponse(blob, 'busqueda');
      },
      error: (error) => {
        console.warn('PDF Export - POST falló, intentando con GET:', error);
        
        // Si POST falla, intentar con GET
        this.turnoService.exportToPDFDownloadGET(exportFilter).subscribe({
          next: (blob: Blob) => {
            console.log('PDF Export - GET exitoso');
            this.handlePDFResponse(blob, 'busqueda');
          },
          error: (getError) => {
            this.handlePDFError(getError);
          }
        });
      }
    });
  }

  private exportReportPDF(): void {
    if (!this.hasReportData()) {
      alert('No hay datos de reporte para exportar. Genere un reporte primero.');
      return;
    }

    // Implementar exportación PDF de reportes usando jsPDF o similar
    console.log('Exportar reporte PDF - Por implementar con jsPDF');
    alert('Funcionalidad de exportar reporte a PDF será implementada próximamente');
  }

  /** Maneja la respuesta del PDF */
  private handlePDFResponse(blob: Blob, tipo: string = 'busqueda'): void {
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
    const fileName = tipo === 'reporte' 
      ? `reporte_${this.tipoVista}_${new Date().toISOString().split('T')[0]}.pdf`
      : `turnos_busqueda_${new Date().toISOString().split('T')[0]}.pdf`;
    this.downloadFile(blob, fileName, 'application/pdf');
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

  /** Limpia el filtro eliminando propiedades vacías, nulas o undefined */
  private cleanFilter(filter: TurnoFilter): TurnoFilter {
    const cleaned: any = {};
    
    // Copiar solo las propiedades que tienen valores válidos
    Object.keys(filter).forEach(key => {
      const value = (filter as any)[key];
      
      // Incluir solo valores que no sean null, undefined, o strings vacíos
      if (value !== null && value !== undefined && value !== '') {
        // Para strings, verificar que no sean solo espacios en blanco
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed !== '') {
            cleaned[key] = trimmed;
          }
        } else {
          cleaned[key] = value;
        }
      }
    });
    
    // Asegurar que siempre tenga paginación
    if (!cleaned.page) cleaned.page = 0;
    if (!cleaned.size) cleaned.size = 20;
    if (!cleaned.sortBy) cleaned.sortBy = 'fecha';
    if (!cleaned.sortDirection) cleaned.sortDirection = 'DESC';
    
    return cleaned as TurnoFilter;
  }

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

  // === MÉTODOS DE REPORTES ===

  /** Inicializa los filtros de reporte con valores por defecto */
  private initializeReportFilters(): void {
    // Si no hay filtros de fecha, inicializar con fechas de la semana actual
    if (!this.filter.fechaDesde || !this.filter.fechaHasta) {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Domingo de esta semana
      
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + (6 - today.getDay())); // Sábado de esta semana
      
      this.filter.fechaDesde = weekStart.toISOString().split('T')[0];
      this.filter.fechaHasta = weekEnd.toISOString().split('T')[0];
    }
  }

  /** Generar reporte seleccionado */
  /** Reporte 1: Cantidad de turnos por día y consultorio */
  generateTurnosPorDiaConsultorio(): void {
    // Crear filtro para el reporte usando la misma estructura que el search principal
    const reportFilter: TurnoFilter = {
      page: 0,
      size: 10000, // Obtener todos los registros para el reporte
      sortBy: 'fecha',
      sortDirection: 'DESC',
      fechaDesde: this.filter.fechaDesde,
      fechaHasta: this.filter.fechaHasta
    };

    // Agregar filtros opcionales solo si tienen valor
    if (this.filter.nombreConsultorio && this.filter.nombreConsultorio.trim()) {
      reportFilter.nombreConsultorio = this.filter.nombreConsultorio.trim();
    }
    if (this.filter.nombreEspecialidad && this.filter.nombreEspecialidad.trim()) {
      reportFilter.nombreEspecialidad = this.filter.nombreEspecialidad.trim();
    }

    // Limpiar el filtro usando la misma función que el search principal
    const cleanFilter = this.cleanFilter(reportFilter);
    console.log('Reporte 1 - Filtros enviados:', cleanFilter);

    this.turnoService.searchWithFilters(cleanFilter).subscribe({
      next: (response: DataPackage<any>) => {
        console.log('Reporte 1 - Respuesta recibida:', response);
        
        // Usar la misma lógica de verificación que el search principal
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;
        
        if (isSuccessful) {
          const data = response.data;
          let turnos: Turno[] = [];
          
          // Verificar si hay contenido en content o directamente en data
          if (data && data.content && Array.isArray(data.content)) {
            turnos = data.content;
          } else if (Array.isArray(data)) {
            turnos = data;
          }
          
          console.log('Reporte 1 - Turnos obtenidos:', turnos.length);
          
          // Agrupar por fecha y consultorio
          const grouped = this.groupTurnosByDateAndConsultorio(turnos);
          this.reportData.turnosPorDiaConsultorio = grouped;
          
          console.log('Reporte 1 - Datos agrupados:', grouped.length);
        } else {
          console.error('Reporte 1 - Error en respuesta:', response);
          this.reportData.turnosPorDiaConsultorio = [];
        }
        
        this.reportesLoading = false;
      },
      error: (error) => {
        console.error('Error generando reporte 1:', error);
        alert('Error al generar el reporte: ' + (error.error?.status_text || error.message || 'Error desconocido'));
        this.reportData.turnosPorDiaConsultorio = [];
        this.reportesLoading = false;
      }
    });
  }

  /** Reporte 2: Cantidad de turnos por especialidad y médico */
  generateTurnosPorEspecialidadMedico(): void {
    // Crear filtro para el reporte usando la misma estructura que el search principal
    const reportFilter: TurnoFilter = {
      page: 0,
      size: 10000, // Obtener todos los registros para el reporte
      sortBy: 'fecha',
      sortDirection: 'DESC',
      fechaDesde: this.filter.fechaDesde,
      fechaHasta: this.filter.fechaHasta
    };

    // Agregar filtros opcionales solo si tienen valor
    if (this.filter.nombreEspecialidad && this.filter.nombreEspecialidad.trim()) {
      reportFilter.nombreEspecialidad = this.filter.nombreEspecialidad.trim();
    }
    if (this.filter.nombreMedico && this.filter.nombreMedico.trim()) {
      reportFilter.nombreMedico = this.filter.nombreMedico.trim();
    }

    // Limpiar el filtro usando la misma función que el search principal
    const cleanFilter = this.cleanFilter(reportFilter);
    console.log('Reporte 2 - Filtros enviados:', cleanFilter);

    this.turnoService.searchWithFilters(cleanFilter).subscribe({
      next: (response: DataPackage<any>) => {
        console.log('Reporte 2 - Respuesta recibida:', response);
        
        // Usar la misma lógica de verificación que el search principal
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;
        
        if (isSuccessful) {
          const data = response.data;
          let turnos: Turno[] = [];
          
          // Verificar si hay contenido en content o directamente en data
          if (data && data.content && Array.isArray(data.content)) {
            turnos = data.content;
          } else if (Array.isArray(data)) {
            turnos = data;
          }
          
          console.log('Reporte 2 - Turnos obtenidos:', turnos.length);
          
          // Agrupar por especialidad y médico
          const grouped = this.groupTurnosByEspecialidadAndMedico(turnos);
          this.reportData.turnosPorEspecialidadMedico = grouped;
          
          console.log('Reporte 2 - Datos agrupados:', grouped.length);
        } else {
          console.error('Reporte 2 - Error en respuesta:', response);
          this.reportData.turnosPorEspecialidadMedico = [];
        }
        
        this.reportesLoading = false;
      },
      error: (error) => {
        console.error('Error generando reporte 2:', error);
        alert('Error al generar el reporte: ' + (error.error?.status_text || error.message || 'Error desconocido'));
        this.reportData.turnosPorEspecialidadMedico = [];
        this.reportesLoading = false;
      }
    });
  }

  /** Reporte 3: Cancelaciones y reprogramaciones */
  generateCancelacionesReprogramaciones(): void {
    // Crear filtro para el reporte usando la misma estructura que el search principal
    const reportFilter: TurnoFilter = {
      page: 0,
      size: 10000, // Obtener todos los registros para el reporte
      sortBy: 'fecha',
      sortDirection: 'DESC',
      fechaDesde: this.filter.fechaDesde,
      fechaHasta: this.filter.fechaHasta,
      // Filtrar solo cancelados y reagendados - el backend debe soportar múltiples estados
      estado: 'CANCELADO,REAGENDADO'
    };

    // Agregar filtros opcionales solo si tienen valor
    if (this.filter.nombreConsultorio && this.filter.nombreConsultorio.trim()) {
      reportFilter.nombreConsultorio = this.filter.nombreConsultorio.trim();
    }
    if (this.filter.nombreEspecialidad && this.filter.nombreEspecialidad.trim()) {
      reportFilter.nombreEspecialidad = this.filter.nombreEspecialidad.trim();
    }

    // Limpiar el filtro usando la misma función que el search principal
    const cleanFilter = this.cleanFilter(reportFilter);
    console.log('Reporte 3 - Filtros enviados:', cleanFilter);

    this.turnoService.searchWithFilters(cleanFilter).subscribe({
      next: (response: DataPackage<any>) => {
        console.log('Reporte 3 - Respuesta recibida:', response);
        
        // Usar la misma lógica de verificación que el search principal
        const isSuccessful = response.status === 1 || (response as any).status_code === 200;
        
        if (isSuccessful) {
          const data = response.data;
          let turnos: Turno[] = [];
          
          // Verificar si hay contenido en content o directamente en data
          if (data && data.content && Array.isArray(data.content)) {
            turnos = data.content;
          } else if (Array.isArray(data)) {
            turnos = data;
          }
          
          console.log('Reporte 3 - Turnos obtenidos:', turnos.length);
          
          // Filtrar solo cancelados y reagendados (por si el backend no lo hizo)
          const filtered = turnos.filter((turno: Turno) => 
            turno.estado === 'CANCELADO' || turno.estado === 'REAGENDADO'
          );
          
          console.log('Reporte 3 - Turnos filtrados:', filtered.length);
          
          this.reportData.cancelacionesReprogramaciones = this.processCancelacionesReprogramaciones(filtered);
          
          console.log('Reporte 3 - Datos procesados:', this.reportData.cancelacionesReprogramaciones.length);
        } else {
          console.error('Reporte 3 - Error en respuesta:', response);
          this.reportData.cancelacionesReprogramaciones = [];
        }
        
        this.reportesLoading = false;
      },
      error: (error) => {
        console.error('Error generando reporte 3:', error);
        alert('Error al generar el reporte: ' + (error.error?.status_text || error.message || 'Error desconocido'));
        this.reportData.cancelacionesReprogramaciones = [];
        this.reportesLoading = false;
      }
    });
  }

  /** Agrupar turnos por fecha y consultorio */
  private groupTurnosByDateAndConsultorio(turnos: Turno[]): any[] {
    const grouped = new Map<string, any>();

    turnos.forEach(turno => {
      // Manejar casos donde faltan datos
      const consultorio = turno.consultorioNombre || 'Sin consultorio';
      const medico = `${turno.staffMedicoNombre || 'Sin nombre'} ${turno.staffMedicoApellido || 'Sin apellido'}`.trim();
      const especialidad = turno.especialidadStaffMedico || 'Sin especialidad';
      const fecha = turno.fecha || 'Sin fecha';
      
      const key = `${fecha}_${consultorio}_${medico}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          fecha: fecha,
          consultorio: consultorio,
          medico: medico,
          especialidad: especialidad,
          cantidad: 0
        });
      }
      
      grouped.get(key)!.cantidad++;
    });

    return Array.from(grouped.values()).sort((a, b) => {
      // Ordenar por fecha descendente, luego por consultorio
      const dateComparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.consultorio.localeCompare(b.consultorio);
    });
  }

  /** Agrupar turnos por especialidad y médico */
  private groupTurnosByEspecialidadAndMedico(turnos: Turno[]): any[] {
    const grouped = new Map<string, any>();

    turnos.forEach(turno => {
      // Manejar casos donde faltan datos
      const especialidad = turno.especialidadStaffMedico || 'Sin especialidad';
      const medico = `${turno.staffMedicoNombre || 'Sin nombre'} ${turno.staffMedicoApellido || 'Sin apellido'}`.trim();
      
      const key = `${especialidad}_${medico}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          medico: medico,
          especialidad: especialidad,
          totalTurnos: 0,
          turnosAtendidos: 0,
          turnosCancelados: 0,
          turnosReagendados: 0
        });
      }
      
      const item = grouped.get(key)!;
      item.totalTurnos++;
      
      // Contar por estado
      const estado = turno.estado || 'SIN_ESTADO';
      switch (estado.toUpperCase()) {
        case 'COMPLETADO':
        case 'COMPLETO':
          item.turnosAtendidos++;
          break;
        case 'CANCELADO':
          item.turnosCancelados++;
          break;
        case 'REAGENDADO':
          item.turnosReagendados++;
          break;
        // Los demás estados (PROGRAMADO, CONFIRMADO) no se cuentan en estas categorías específicas
      }
    });

    return Array.from(grouped.values()).sort((a, b) => {
      // Ordenar por total de turnos descendente, luego por especialidad
      const totalComparison = b.totalTurnos - a.totalTurnos;
      if (totalComparison !== 0) return totalComparison;
      return a.especialidad.localeCompare(b.especialidad);
    });
  }

  /** Procesar cancelaciones y reprogramaciones */
  private processCancelacionesReprogramaciones(turnos: Turno[]): any[] {
    return turnos.map(turno => {
      // Manejar casos donde faltan datos
      const paciente = `${turno.nombrePaciente || 'Sin nombre'} ${turno.apellidoPaciente || 'Sin apellido'}`.trim();
      const medico = `${turno.staffMedicoNombre || 'Sin nombre'} ${turno.staffMedicoApellido || 'Sin apellido'}`.trim();
      const especialidad = turno.especialidadStaffMedico || 'Sin especialidad';
      const fecha = turno.fecha || 'Sin fecha';
      const estado = turno.estado || 'SIN_ESTADO';
      
      return {
        fecha: fecha,
        paciente: paciente,
        medico: medico,
        especialidad: especialidad,
        estadoFinal: estado,
        motivo: turno.motivoUltimaModificacion || 'Sin motivo registrado'
      };
    }).sort((a, b) => {
      // Ordenar por fecha descendente, luego por paciente
      const dateComparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.paciente.localeCompare(b.paciente);
    });
  }

  /** Exportar reporte a CSV */
  exportReportToCSV(): void {
    if (!this.isReportMode() || !this.hasReportData()) {
      alert('Primero genera un reporte');
      return;
    }

    const fileName = this.generateReportFileName('csv');
    let csvContent = '';

    switch (this.tipoVista) {
      case 'turnos-dia-consultorio':
        csvContent = this.generateCSVForTurnosDiaConsultorio();
        break;
      case 'turnos-especialidad-medico':
        csvContent = this.generateCSVForTurnosEspecialidadMedico();
        break;
      case 'cancelaciones-reprogramaciones':
        csvContent = this.generateCSVForCancelacionesReprogramaciones();
        break;
    }

    this.downloadFileFromContent(csvContent, fileName, 'text/csv');
  }

  /** Exportar reporte a PDF */
  exportReportToPDF(): void {
    if (!this.isReportMode() || !this.hasReportData()) {
      alert('Primero genera un reporte');
      return;
    }

    // Generar contenido HTML del reporte
    const fileName = this.generateReportFileName('pdf');
    const htmlContent = this.generateHTMLForReport();
    
    // Crear un PDF usando la API del navegador
    this.generatePDFFromHTML(htmlContent, fileName);
  }

  /** Generar HTML para el reporte */
  private generateHTMLForReport(): string {
    let html = `
      <html>
        <head>
          <title>Reporte de Turnos</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .date-range { margin-bottom: 15px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte de Auditoría de Turnos</h1>
            <div class="date-range">
              Período: ${this.formatDate(this.filter.fechaDesde || '')} - ${this.formatDate(this.filter.fechaHasta || '')}
            </div>
          </div>
    `;

    switch (this.tipoVista) {
      case 'reporte-dia-consultorio':
        html += this.generateHTMLForTurnosDiaConsultorio();
        break;
      case 'reporte-especialidad-medico':
        html += this.generateHTMLForTurnosEspecialidadMedico();
        break;
      case 'reporte-cancelaciones':
        html += this.generateHTMLForCancelacionesReprogramaciones();
        break;
    }

    html += '</body></html>';
    return html;
  }

  /** Generar PDF desde HTML */
  private generatePDFFromHTML(htmlContent: string, fileName: string): void {
    // Implementación simple usando window.print()
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }

  /** Generar HTML para reporte de turnos por día y consultorio */
  private generateHTMLForTurnosDiaConsultorio(): string {
    let html = `
      <h2>Turnos por Día y Consultorio</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Consultorio</th>
            <th>Médico</th>
            <th>Especialidad</th>
            <th>Cantidad de Turnos</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.reportData.turnosPorDiaConsultorio.forEach((item: any) => {
      html += `
        <tr>
          <td>${this.formatDate(item.fecha)}</td>
          <td>${item.consultorio}</td>
          <td>${item.medico}</td>
          <td>${item.especialidad}</td>
          <td>${item.cantidad}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  }

  /** Generar HTML para reporte de turnos por especialidad y médico */
  private generateHTMLForTurnosEspecialidadMedico(): string {
    let html = `
      <h2>Turnos por Especialidad y Médico</h2>
      <table>
        <thead>
          <tr>
            <th>Médico</th>
            <th>Especialidad</th>
            <th>Total Turnos</th>
            <th>Atendidos</th>
            <th>Cancelados</th>
            <th>Reagendados</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.reportData.turnosPorEspecialidadMedico.forEach((item: any) => {
      html += `
        <tr>
          <td>${item.medico}</td>
          <td>${item.especialidad}</td>
          <td>${item.totalTurnos}</td>
          <td>${item.turnosAtendidos}</td>
          <td>${item.turnosCancelados}</td>
          <td>${item.turnosReagendados}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  }

  /** Generar HTML para reporte de cancelaciones y reprogramaciones */
  private generateHTMLForCancelacionesReprogramaciones(): string {
    let html = `
      <h2>Cancelaciones y Reprogramaciones</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Especialidad</th>
            <th>Estado Final</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.reportData.cancelacionesReprogramaciones.forEach((item: any) => {
      html += `
        <tr>
          <td>${this.formatDate(item.fecha)}</td>
          <td>${item.paciente}</td>
          <td>${item.medico}</td>
          <td>${item.especialidad}</td>
          <td>${this.getEstadoLabel(item.estadoFinal)}</td>
          <td>${item.motivo || 'Sin especificar'}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  }

  /** Verificar si hay datos de reporte */
  hasReportData(): boolean {
    switch (this.tipoVista) {
      case 'reporte-dia-consultorio':
        return this.reportData.turnosPorDiaConsultorio.length > 0;
      case 'reporte-especialidad-medico':
        return this.reportData.turnosPorEspecialidadMedico.length > 0;
      case 'reporte-cancelaciones':
        return this.reportData.cancelacionesReprogramaciones.length > 0;
      default:
        return false;
    }
  }

  /** Generar nombre de archivo para el reporte */
  private generateReportFileName(extension: string): string {
    const fechaInicio = this.filter.fechaDesde!.replace(/-/g, '');
    const fechaFin = this.filter.fechaHasta!.replace(/-/g, '');
    return `report_turnos_${fechaInicio}a${fechaFin}.${extension}`;
  }

  /** Generar CSV para reporte de turnos por día y consultorio */
  private generateCSVForTurnosDiaConsultorio(): string {
    const headers = ['Fecha', 'Consultorio', 'Médico', 'Especialidad', 'Cantidad de Turnos'];
    const rows = this.reportData.turnosPorDiaConsultorio.map((item: any) => [
      item.fecha,
      item.consultorio,
      item.medico,
      item.especialidad,
      item.cantidad.toString()
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /** Generar CSV para reporte de turnos por especialidad y médico */
  private generateCSVForTurnosEspecialidadMedico(): string {
    const headers = ['Médico', 'Especialidad', 'Total Turnos', 'Atendidos', 'Cancelados', 'Reagendados'];
    const rows = this.reportData.turnosPorEspecialidadMedico.map((item: any) => [
      item.medico,
      item.especialidad,
      item.totalTurnos.toString(),
      item.turnosAtendidos.toString(),
      item.turnosCancelados.toString(),
      item.turnosReagendados.toString()
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /** Generar CSV para reporte de cancelaciones y reprogramaciones */
  private generateCSVForCancelacionesReprogramaciones(): string {
    const headers = ['Fecha', 'Paciente', 'Médico', 'Especialidad', 'Estado Final', 'Motivo'];
    const rows = this.reportData.cancelacionesReprogramaciones.map((item: any) => [
      item.fecha,
      item.paciente,
      item.medico,
      item.especialidad,
      item.estadoFinal,
      item.motivo
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /** Convertir array a CSV */
  private arrayToCSV(data: string[][]): string {
    return data.map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /** Descargar archivo desde contenido */
  private downloadFileFromContent(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // === MÉTODOS AUXILIARES PARA TIPO DE VISTA ===

  /** Se ejecuta cuando cambia el tipo de vista */
  onTipoVistaChange(): void {
    console.log('Cambio de tipo de vista a:', this.tipoVista);
    
    // Limpiar resultados anteriores
    this.turnos = [];
    this.totalElements = 0;
    this.totalPages = 0;
    this.currentPage = 0;
    
    // Limpiar datos de reportes
    this.reportData = {
      turnosPorDiaConsultorio: [],
      turnosPorEspecialidadMedico: [],
      cancelacionesReprogramaciones: []
    };
    
    // Si es modo reporte, inicializar filtros de reporte
    if (this.isReportMode()) {
      this.initializeReportFilters();
      
      // Validar que tenga filtros mínimos para reportes
      if (this.tipoVista !== 'busqueda') {
        // Mostrar mensaje de ayuda
        console.log('Modo reporte activado. Se requieren fechas para generar reportes.');
      }
    }
    
    this.cdr.detectChanges();
  }

  /** Se ejecuta cuando cambian los filtros */
  onFilterChange(): void {
    // Solo ejecutar búsqueda automática si estamos en modo búsqueda normal
    if (this.tipoVista === 'busqueda') {
      // Resetear paginación cuando cambian los filtros
      this.filter.page = 0;
      this.search();
    }
  }

  /** Obtiene el icono del tipo de vista actual */
  getCurrentTipoVistaIcon(): string {
    const tipoVista = this.tiposVista.find(t => t.value === this.tipoVista);
    return tipoVista ? tipoVista.icon : 'fas fa-search';
  }

  /** Obtiene la etiqueta del tipo de vista actual */
  getCurrentTipoVistaLabel(): string {
    const tipoVista = this.tiposVista.find(t => t.value === this.tipoVista);
    return tipoVista ? tipoVista.label : 'Búsqueda Normal';
  }

  /** Verifica si se ha ejecutado al menos una búsqueda */
  hasExecutedSearch(): boolean {
    return this.turnos.length > 0 || this.hasReportData();
  }

  /** Verifica si estamos en modo reporte */
  isReportMode(): boolean {
    return this.tipoVista !== 'busqueda';
  }

  /** Verifica si el tipo de vista requiere filtros de fecha obligatorios */
  requiresDateFilters(): boolean {
    return this.isReportMode();
  }

  /** Valida que los filtros obligatorios estén presentes según el tipo de vista */
  validateRequiredFilters(): boolean {
    if (this.isReportMode()) {
      if (!this.filter.fechaDesde || !this.filter.fechaHasta) {
        return false;
      }
      
      // Validar que la fecha de inicio no sea posterior a la fecha de fin
      const fechaInicio = new Date(this.filter.fechaDesde);
      const fechaFin = new Date(this.filter.fechaHasta);
      
      if (fechaInicio > fechaFin) {
        return false;
      }
    }
    
    return true;
  }

  /** Ejecuta la búsqueda o genera el reporte según el tipo de vista */
  executeSearch(): void {
    if (this.isReportMode()) {
      this.generateReportByTipoVista();
    } else {
      this.search();
    }
  }

  /** Genera el reporte según el tipo de vista actual */
  private generateReportByTipoVista(): void {
    if (!this.validateRequiredFilters()) {
      alert('Por favor complete los filtros obligatorios para generar el reporte');
      return;
    }

    this.reportesLoading = true;

    switch (this.tipoVista) {
      case 'reporte-dia-consultorio':
        this.generateTurnosPorDiaConsultorio();
        break;
      case 'reporte-especialidad-medico':
        this.generateTurnosPorEspecialidadMedico();
        break;
      case 'reporte-cancelaciones':
        this.generateCancelacionesReprogramaciones();
        break;
      default:
        console.warn('Tipo de vista de reporte no reconocido:', this.tipoVista);
        this.reportesLoading = false;
    }
  }

}
