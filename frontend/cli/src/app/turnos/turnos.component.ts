import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurnoService } from './turno.service';
import { Turno } from './turno';
import { ModalService } from '../modal/modal.service';
import { ResultsPage } from '../results-page';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './turnos.component.html', 
  styleUrl: './turnos.component.css'
})
export class TurnosComponent {
  resultsPage: ResultsPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    numberOfElements: 0,
    first: true,
    last: true
  };
  
  currentPage: number = 1;
  
  // Filtros de búsqueda
  filters = {
    paciente: '',
    medico: '',
    consultorio: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    sortBy: 'fecha',
    sortDir: 'desc'
  };

  private filterTimeout: any;

  constructor(
    private turnoService: TurnoService,
    private modalService: ModalService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.searchTurnos();
  }

  /** Búsqueda de turnos con filtros y paginación */
  searchTurnos(): void {
    this.turnoService.byPageAdvanced(
      this.currentPage,
      this.resultsPage.size,
      this.filters.paciente || undefined,
      this.filters.medico || undefined,
      this.filters.consultorio || undefined,
      this.filters.estado || undefined,
      this.filters.fechaDesde || undefined,
      this.filters.fechaHasta || undefined,
      this.filters.sortBy,
      this.filters.sortDir
    ).subscribe({
      next: (dataPackage) => {
        console.log('DataPackage recibido:', dataPackage);
        if (dataPackage.data) {
          this.resultsPage = {
            content: dataPackage.data.content || [],
            totalElements: dataPackage.data.totalElements || 0,
            totalPages: dataPackage.data.totalPages || 0,
            number: dataPackage.data.currentPage || 0,
            size: dataPackage.data.size || 10,
            numberOfElements: dataPackage.data.numberOfElements || 0,
            first: dataPackage.data.first || false,
            last: dataPackage.data.last || false
          };
        }
      },
      error: (error) => {
        console.error('Error al buscar turnos:', error);
        this.resultsPage = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
          numberOfElements: 0,
          first: true,
          last: true
        };
      }
    });
  }

  /** Manejo de cambios en filtros con debounce */
  onFilterChange(): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filterTimeout = setTimeout(() => {
      this.currentPage = 1; // Reset a primera página
      this.searchTurnos();
    }, 500); // Debounce de 500ms
  }

  /** Limpiar todos los filtros */
  clearFilters(): void {
    this.filters = {
      paciente: '',
      medico: '',
      consultorio: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      sortBy: 'fecha',
      sortDir: 'desc'
    };
    this.currentPage = 1;
    this.searchTurnos();
  }

  /** Toggle de ordenamiento por columna */
  toggleSort(column: string): void {
    if (this.filters.sortBy === column) {
      // Si ya está ordenando por esta columna, cambiar dirección
      this.filters.sortDir = this.filters.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una nueva columna, usar ascendente por defecto
      this.filters.sortBy = column;
      this.filters.sortDir = 'asc';
    }
    this.currentPage = 1;
    this.searchTurnos();
  }

  confirmDelete(id: number): void {
    this.modalService
      .confirm(
        "Eliminar turno",
        "¿Está seguro que desea eliminar este turno?",
        "Esta acción no se puede deshacer"
      )
      .then(() => this.remove(id))
      .catch(() => {});
  }

  remove(id: number): void {
    this.turnoService.remove(id).subscribe({
      next: () => this.searchTurnos(),
      error: (err) => {
        const msg = err?.error?.message || "Error al eliminar el turno.";
        this.modalService.alert("Error", msg);
        console.error("Error al eliminar turno:", err);
      }
    });
  }

  onPageChangeRequested(page: number): void {
    this.currentPage = page;
    this.searchTurnos();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/turnos', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/turnos', id], { queryParams: { edit: true } });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROGRAMADO':
        return 'programado';
      case 'CONFIRMADO':
        return 'confirmado';
      case 'CANCELADO':
        return 'cancelado';
      case 'COMPLETADO':
        return 'completado';
      default:
        return 'programado';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROGAMADO':
        return 'fa-clock';
      case 'CONFIRMADO':
        return 'fa-check-circle';
      case 'CANCELADO':
        return 'fa-times-circle';
      case 'COMPLETADO':
        return 'fa-check-double';
      default:
        return 'fa-question-circle';
    }
  }

  getPacienteInitials(nombre?: string, apellido?: string): string {
    if (!nombre && !apellido) return 'P';
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return `${n}${a}`.toUpperCase() || 'P';
  }

  getMedicoInitials(nombre?: string, apellido?: string): string {
    if (!nombre && !apellido) return 'M';
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return `${n}${a}`.toUpperCase() || 'M';
  }

  // === MÉTODOS DE AUDITORÍA ===

  /** Muestra el historial de auditoría de un turno */
  showAuditHistory(turno: Turno): void {
    // Navegar al componente de búsqueda avanzada con el turno preseleccionado
    this.router.navigate(['/turnos/advanced-search'], { 
      queryParams: { 
        turnoId: turno.id,
        showAudit: true 
      } 
    });
  }

  exportarCSV() {
    this.turnoService.exportToCSVDownload({}).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'turnos.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportarPDF() {
    this.turnoService.exportToPDFDownload({}).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'turnos.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}