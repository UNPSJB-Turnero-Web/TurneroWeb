import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnoService } from './turno.service';
import { Turno, TurnoFilter, AuditLog } from './turno';
import { DataPackage } from '../data.package';
import { AgendaService } from '../agenda/agenda.service';

// Declaraciones para librerías externas
declare var html2canvas: any;
declare var jsPDF: any;

// Interface para slots disponibles
interface SlotDisponible {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  staffMedicoId: number;
  staffMedicoNombre: string;
  staffMedicoApellido: string;
  especialidadStaffMedico: string;
  consultorioId: number;
  consultorioNombre: string;
  centroId: number;
  nombreCentro: string;
}

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
  
  // Modal de reagendamiento
  showReagendarModal: boolean = false;
  isLoadingSlots: boolean = false;
  slotsDisponibles: SlotDisponible[] = [];
  slotsPorFecha: { [fecha: string]: SlotDisponible[] } = {};
  fechasOrdenadas: string[] = [];
  slotSeleccionado: SlotDisponible | null = null;
  motivoReagendamiento: string = '';
  isProcessingReagendar: boolean = false;
  errorMessageReagendar: string = '';
  
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
    private cdr: ChangeDetectorRef,
    private agendaService: AgendaService
  ) {}

  // === MÉTODOS UTILITARIOS ===

  /** Obtiene la información del usuario actual desde localStorage */
  private getCurrentUser(): { role: string; user: string; displayName: string } {
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    console.log('🔍 DEBUG: Obteniendo información del usuario:');
    console.log('   - userRole:', userRole);
    console.log('   - userName:', userName);
    
    let currentUser = 'UNKNOWN';
    let displayName = userName || 'Usuario Desconocido';
    
    if (userRole === 'patient') {
      const patientDNI = localStorage.getItem('patientDNI');
      console.log('   - patientDNI:', patientDNI);
      currentUser = `PACIENTE_${patientDNI || 'UNKNOWN'}`;
      displayName = userName || `Paciente ${patientDNI || 'Desconocido'}`;
    } else if (userRole === 'admin') {
      currentUser = 'ADMIN';
      displayName = userName || 'Administrador';
    } else if (userRole === 'medico') {
      currentUser = 'MEDICO';
      displayName = userName || 'Médico';
    } else {
      console.log('   - Rol no reconocido, usando AUDITOR_DASHBOARD');
      currentUser = 'AUDITOR_DASHBOARD';
      displayName = 'Auditor Dashboard';
    }
    
    console.log('   - currentUser final:', currentUser);
    console.log('   - displayName:', displayName);
    
    return {
      role: userRole || 'unknown',
      user: currentUser,
      displayName: displayName
    };
  }

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
    // Limpiar todos los filtros
    this.filter = {
      page: 0,
      size: 20,
      sortBy: 'fecha',
      sortDirection: 'DESC',
      // Resetear todos los campos de filtro a valores por defecto
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      fechaExacta: '',
      pacienteId: undefined,
      staffMedicoId: undefined,
      especialidadId: undefined,
      centroAtencionId: undefined,
      consultorioId: undefined,
      nombrePaciente: '',
      nombreMedico: '',
      nombreEspecialidad: '',
      nombreCentro: '',
      nombreConsultorio: ''
    };
    
    // Limpiar resultados anteriores
    this.turnos = [];
    this.totalElements = 0;
    this.totalPages = 0;
    
    // Limpiar datos de reportes
    this.reportData = {
      turnosPorDiaConsultorio: [],
      turnosPorEspecialidadMedico: [],
      cancelacionesReprogramaciones: []
    };
    
    // Limpiar estados de carga
    this.loading = false;
    this.reportesLoading = false;
    this.exportLoading = false;
    
    // Si estamos en modo búsqueda, ejecutar búsqueda vacía para mostrar todos los turnos
    // Si estamos en modo reporte, no ejecutar nada hasta que el usuario configure fechas
    if (this.tipoVista === 'busqueda') {
      this.search();
    }
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
    // No permitir cambiar el estado de un turno que ya está reagendado
    if (turno.estado === 'REAGENDADO') {
      alert('No se puede cambiar el estado de un turno que ya está reagendado');
      return;
    }
    
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

    // Si selecciona REAGENDADO, abrir modal de reagendamiento
    if (this.changeStateForm.nuevoEstado === 'REAGENDADO') {
      this.openReagendarModal();
      return;
    }

    // Validar motivo para cancelaciones
    if (this.changeStateForm.nuevoEstado === 'CANCELADO' && 
        !this.changeStateForm.motivo?.trim()) {
      alert('El motivo es obligatorio para cancelaciones');
      return;
    }

    // Validar longitud mínima del motivo
    if (this.changeStateForm.motivo && this.changeStateForm.motivo.trim().length < 5) {
      alert('El motivo debe tener al menos 5 caracteres');
      return;
    }

    this.loading = true;

    // Obtener el usuario actual usando la función utilitaria
    const userInfo = this.getCurrentUser();
    const currentUser = userInfo.user;

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

  /** Obtiene la etiqueta legible del estado */
  getEstadoLabel(estado: string): string {
    const labels: any = {
      'PROGRAMADO': 'Programado',
      'CONFIRMADO': 'Confirmado',
      'CANCELADO': 'Cancelado',
      'REAGENDADO': 'Reagendado',
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

    console.log('📊 Iniciando exportación de reporte a CSV...');
    this.exportLoading = true;
    
    try {
      this.exportReportToCSV();
    } catch (error) {
      console.error('Error al exportar reporte a CSV:', error);
      alert('Error al generar el CSV del reporte');
    } finally {
      this.exportLoading = false;
    }
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

    this.exportLoading = true;
    console.log('🎯 Iniciando exportación de reporte a PDF...');
    
    try {
      const fileName = this.generateReportFileName('pdf');
      this.generateAdvancedPDF(fileName);
    } catch (error) {
      console.error('Error al exportar reporte a PDF:', error);
      alert('Error al generar el PDF del reporte');
      this.exportLoading = false;
    }
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
    
    // Si es solo fecha (YYYY-MM-DD), evitar problemas de zona horaria
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = dateString.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Los meses en JS van de 0-11
      const day = parseInt(parts[2]);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('es-ES');
    }
    
    // Para otros formatos, usar el método original
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  /** Formatea una fecha y hora para mostrar */
  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    
    // Si viene en formato ISO con T, extraer solo la parte de fecha y hora
    if (dateTimeString.includes('T')) {
      const date = new Date(dateTimeString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    // Para otros formatos
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

    // Agregar encabezado del reporte
    const headerInfo = `"Reporte de Auditoría de Turnos"\n` +
                      `"Período: ${this.formatDate(this.filter.fechaDesde || '')} - ${this.formatDate(this.filter.fechaHasta || '')}"\n` +
                      `"Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}"\n\n`;

    switch (this.tipoVista) {
      case 'reporte-dia-consultorio':
        csvContent = headerInfo + '"Turnos por Día y Consultorio"\n' + this.generateCSVForTurnosDiaConsultorio();
        break;
      case 'reporte-especialidad-medico':
        csvContent = headerInfo + '"Turnos por Especialidad y Médico"\n' + this.generateCSVForTurnosEspecialidadMedico();
        break;
      case 'reporte-cancelaciones':
        csvContent = headerInfo + '"Cancelaciones y Reprogramaciones"\n' + this.generateCSVForCancelacionesReprogramaciones();
        break;
    }

    this.downloadFileFromContent(csvContent, fileName, 'text/csv;charset=utf-8;');
  }

  /** Exportar reporte a PDF */
  exportReportToPDF(): void {
    if (!this.isReportMode() || !this.hasReportData()) {
      alert('Primero genera un reporte');
      return;
    }

    const fileName = this.generateReportFileName('pdf');
    this.generateAdvancedPDF(fileName);
  }

  /** Generar PDF avanzado usando canvas */
  private generateAdvancedPDF(fileName: string): void {
    const printContent = this.generatePrintableHTML();
    
    // Crear un div temporal para renderizar el contenido
    const printDiv = document.createElement('div');
    printDiv.innerHTML = printContent;
    printDiv.style.position = 'absolute';
    printDiv.style.left = '-9999px';
    printDiv.style.top = '-9999px';
    printDiv.style.width = '210mm'; // A4 width
    printDiv.style.fontFamily = 'Arial, sans-serif';
    printDiv.style.fontSize = '12px';
    printDiv.style.backgroundColor = 'white';
    printDiv.style.padding = '20px';
    
    document.body.appendChild(printDiv);
    
    // Usar html2canvas para convertir a imagen y luego a PDF
    this.createPDFFromElement(printDiv, fileName).finally(() => {
      document.body.removeChild(printDiv);
    });
  }

  /** Crear PDF desde elemento DOM */
  private async createPDFFromElement(element: HTMLElement, fileName: string): Promise<void> {
    try {
      // Si html2canvas está disponible, usarlo
      if ((window as any).html2canvas) {
        const canvas = await (window as any).html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        // Crear PDF con jsPDF si está disponible
        if ((window as any).jsPDF) {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new (window as any).jsPDF('p', 'mm', 'a4');
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(fileName);
          return;
        }
      }
      
      // Fallback: usar window.print()
      this.fallbackPrintPDF(element);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      // Fallback en caso de error
      this.fallbackPrintPDF(element);
    }
  }

  /** Fallback para generar PDF usando window.print() */
  private fallbackPrintPDF(element: HTMLElement): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printDocument = printWindow.document;
      printDocument.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Reporte de Turnos</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { margin: 20mm; }
              }
              body { 
                font-family: Arial, sans-serif; 
                font-size: 12px;
                line-height: 1.4;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px;
                break-inside: auto;
              }
              th, td { 
                border: 1px solid #333; 
                padding: 8px; 
                text-align: left;
                font-size: 11px;
              }
              th { 
                background-color: #f0f0f0; 
                font-weight: bold;
              }
              .header { 
                text-align: center; 
                margin-bottom: 20px; 
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 18px;
              }
              .date-range { 
                margin-bottom: 15px; 
                font-weight: bold;
                text-align: center;
              }
              .report-title {
                font-size: 16px;
                font-weight: bold;
                margin: 20px 0 10px 0;
              }
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `);
      printDocument.close();
      
      // Esperar a que se cargue y luego imprimir
      printWindow.setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  /** Generar HTML imprimible para el reporte */
  private generatePrintableHTML(): string {
    let html = `
      <div class="header">
        <h1>Reporte de Auditoría de Turnos</h1>
        <div class="date-range">
          Período: ${this.formatDate(this.filter.fechaDesde || '')} - ${this.formatDate(this.filter.fechaHasta || '')}
        </div>
        <div class="date-range">
          Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}
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

    return html;
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
    // Convertir fechas de yyyy-MM-dd a yyyyMMdd
    const fechaInicio = this.filter.fechaDesde?.replace(/-/g, '') || new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fechaFin = this.filter.fechaHasta?.replace(/-/g, '') || new Date().toISOString().split('T')[0].replace(/-/g, '');
    
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

  // === MÉTODOS DE REAGENDAMIENTO ===

  /** Abre el modal de reagendamiento */
  openReagendarModal(): void {
    if (!this.selectedTurno) return;
    
    this.showReagendarModal = true;
    this.showChangeStateModal = false; // Cerrar el modal anterior
    this.motivoReagendamiento = '';
    this.slotSeleccionado = null;
    this.errorMessageReagendar = '';
    
    // Cargar slots disponibles del mismo médico
    if (this.selectedTurno.staffMedicoId) {
      this.cargarSlotsDisponibles(this.selectedTurno.staffMedicoId);
    }
  }

  /** Cierra el modal de reagendamiento */
  closeReagendarModal(): void {
    this.showReagendarModal = false;
    this.slotsDisponibles = [];
    this.slotsPorFecha = {};
    this.fechasOrdenadas = [];
    this.slotSeleccionado = null;
    this.motivoReagendamiento = '';
    this.isLoadingSlots = false;
    this.isProcessingReagendar = false;
    this.errorMessageReagendar = '';
  }

  /** Carga slots disponibles del médico */
  cargarSlotsDisponibles(staffMedicoId: number): void {
    this.isLoadingSlots = true;
    this.errorMessageReagendar = '';

    this.agendaService.obtenerSlotsDisponiblesPorMedico(staffMedicoId, 4).subscribe({
      next: (response: any) => {
        // El backend devuelve un Response object con data
        const slots = response.data || response;
        
        this.slotsDisponibles = slots.filter((slot: any) => {
          // Filtrar slots que no sean el turno actual
          if (!this.selectedTurno) return true;
          
          const currentDateTime = new Date(`${this.selectedTurno.fecha}T${this.selectedTurno.horaInicio}`);
          const slotDateTime = new Date(`${slot.fecha}T${slot.horaInicio}`);
          return slotDateTime.getTime() !== currentDateTime.getTime();
        });
        
        console.log('Slots disponibles cargados:', this.slotsDisponibles);
        this.agruparSlotsPorFecha();
        this.isLoadingSlots = false;
      },
      error: (error: any) => {
        console.error('Error cargando slots disponibles:', error);
        this.errorMessageReagendar = 'No se pudieron cargar los horarios disponibles.';
        this.isLoadingSlots = false;
      }
    });
  }

  /** Agrupa slots por fecha */
  agruparSlotsPorFecha(): void {
    this.slotsPorFecha = {};
    
    // Agrupar slots por fecha
    this.slotsDisponibles.forEach(slot => {
      if (!this.slotsPorFecha[slot.fecha]) {
        this.slotsPorFecha[slot.fecha] = [];
      }
      this.slotsPorFecha[slot.fecha].push(slot);
    });
    
    // Ordenar fechas y horarios dentro de cada fecha
    this.fechasOrdenadas = Object.keys(this.slotsPorFecha).sort();
    
    // Ordenar por horarios dentro de cada fecha
    Object.keys(this.slotsPorFecha).forEach(fecha => {
      this.slotsPorFecha[fecha].sort((a, b) => {
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    });
  }

  /** Selecciona un slot para reagendar */
  seleccionarSlot(slot: SlotDisponible): void {
    this.slotSeleccionado = slot;
    console.log('Slot seleccionado para reagendar:', slot);
  }

  /** Cancela la selección del slot */
  cancelarSeleccionSlot(): void {
    this.slotSeleccionado = null;
    this.motivoReagendamiento = '';
  }

  /** Confirma el reagendamiento */
  confirmarReagendamiento(): void {
    if (!this.selectedTurno || !this.slotSeleccionado) return;

    // Validar motivo
    if (!this.motivoReagendamiento || this.motivoReagendamiento.trim().length < 5) {
      this.errorMessageReagendar = 'Debe ingresar un motivo de al menos 5 caracteres para reagendar el turno';
      return;
    }

    this.isProcessingReagendar = true;
    this.errorMessageReagendar = '';

    // Obtener el usuario actual
    const userInfo = this.getCurrentUser();
    const currentUser = userInfo.user;

    // Preparar los datos del reagendamiento
    const reagendamientoData = {
      fecha: this.slotSeleccionado.fecha,
      horaInicio: this.slotSeleccionado.horaInicio,
      horaFin: this.slotSeleccionado.horaFin,
      motivo: this.motivoReagendamiento.trim(),
      usuario: currentUser
    };

    // Usar el endpoint específico de reagendamiento que modifica el turno existente
    this.turnoService.reagendar(this.selectedTurno.id!, reagendamientoData).subscribe({
      next: (response) => {
        console.log('Turno reagendado exitosamente:', response);
        this.isProcessingReagendar = false;
        
        alert(`Turno reagendado exitosamente!\n\nNueva fecha: ${this.formatDate(this.slotSeleccionado!.fecha)}\nHorario: ${this.slotSeleccionado!.horaInicio} - ${this.slotSeleccionado!.horaFin}\nMédico: ${this.slotSeleccionado!.staffMedicoNombre} ${this.slotSeleccionado!.staffMedicoApellido}`);
        
        this.closeReagendarModal();
        this.closeChangeStateModal();
        this.search(); // Recargar la tabla
      },
      error: (error) => {
        console.error('Error al reagendar turno:', error);
        this.isProcessingReagendar = false;
        
        let errorMessage = 'Error al reagendar el turno';
        if (error.error && error.error.status_text) {
          errorMessage += ': ' + error.error.status_text;
        }
        
        this.errorMessageReagendar = errorMessage;
      }
    });
  }

  /** Formatea una fecha para mostrar */
  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    };
    return fechaObj.toLocaleDateString('es-ES', options);
  }
}
