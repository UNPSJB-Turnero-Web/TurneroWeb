import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistorialService, HistorialTurnoDTO, HistorialFilter } from './historial.service';
import { HistorialTurnoDetalleComponent } from './historial-turno-detalle.component';

@Component({
  selector: 'app-historial-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid mt-4">
      <!-- HEADER -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="banner-historial">
            <div class="header-content">
              <div class="header-icon">
                <i class="fas fa-history"></i>
              </div>
              <div class="header-text">
                <h1>Historial de Turnos</h1>
                <p>Consulta tu historial de atenciones médicas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTROS -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="filtros-card">
            <div class="filtros-header">
              <span class="filtros-icon">🔍</span>
              <h3>Filtros de Búsqueda</h3>
            </div>
            <div class="filtros-body">
              <div class="row">
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Fecha Desde</label>
                    <input 
                      type="date" 
                      class="form-control-paciente"
                      [(ngModel)]="filtro.fechaDesde"
                      (change)="aplicarFiltros()"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Fecha Hasta</label>
                    <input 
                      type="date" 
                      class="form-control-paciente"
                      [(ngModel)]="filtro.fechaHasta"
                      (change)="aplicarFiltros()"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Estado</label>
                    <select 
                      class="form-control-paciente"
                      [(ngModel)]="filtro.estado"
                      (change)="aplicarFiltros()"
                    >
                      <option value="undefined">Todos</option>
                      <option value="PROGRAMADO">Programado</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="CANCELADO">Cancelado</option>
                      <option value="COMPLETO">Completado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LISTA DE TURNOS -->
      <div class="row">
        <div class="col-12">
          <div class="turnos-card">
            <div class="turnos-header">
              <h3>
                <i class="fas fa-calendar-check"></i>
                Turnos Históricos
              </h3>
              <div class="turnos-info" *ngIf="totalElements > 0">
                {{ totalElements }} turnos encontrados
              </div>
            </div>

            <div class="turnos-body">
              <!-- Loading State -->
              <div class="loading-turnos" *ngIf="isLoading">
                <i class="fas fa-spinner fa-spin"></i>
                Cargando historial...
              </div>

              <!-- Empty State -->
              <div class="no-turnos-content" *ngIf="!isLoading && turnos.length === 0">
                <i class="fas fa-calendar-times"></i>
                <h4>No hay turnos para mostrar</h4>
                <p>No se encontraron turnos con los filtros seleccionados.</p>
              </div>

              <!-- Turnos List -->
              <div class="turnos-grid" *ngIf="!isLoading && turnos.length > 0">
                <div class="turno-card clickable" 
                     *ngFor="let turno of turnos"
                     (click)="abrirDetalle(turno)">
                  <div class="turno-header" [ngClass]="getEstadoClass(turno.estado)">
                    <div class="estado-badge">
                      {{ turno.estado }}
                    </div>
                    <div class="fecha-info">
                      {{ turno.fecha | date:'dd/MM/yyyy' }} - {{ turno.horaInicio }}
                    </div>
                  </div>

                  <div class="turno-body">
                    <div class="turno-detail">
                      <i class="fas fa-user-md"></i>
                      <strong>Médico: </strong> {{ turno.staffMedicoNombre }}
                    </div>
                    <div class="turno-detail">
                      <i class="fas fa-stethoscope"></i>
                      <strong>Especialidad: </strong> {{ turno.especialidadStaffMedico }}
                    </div>
                    <div class="turno-detail" *ngIf="turno.observaciones">
                      <i class="fas fa-clipboard-list"></i>
                      <strong>Observaciones: </strong>
                      <div class="observaciones-text">{{ turno.observaciones }}</div>
                    </div>
                    <div class="turno-footer">
                      <div class="asistencia-badge" [ngClass]="{'asistio': turno.asistio, 'no-asistio': !turno.asistio}">
                        <i [class]="turno.asistio ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                        {{ turno.asistio ? 'Asistió' : 'No asistió' }}
                      </div>
                      <div class="update-info">
                        Actualizado: {{ turno.updatedAt | date:'dd/MM/yyyy HH:mm' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Paginación -->
              <div class="paginacion-controles" *ngIf="!isLoading && totalPages > 1">
                <button 
                  class="btn-paginacion" 
                  [disabled]="currentPage === 0"
                  (click)="cambiarPagina(currentPage - 1)"
                >
                  <i class="fas fa-chevron-left"></i>
                  Anterior
                </button>

                <div class="numeros-pagina">
                  <button 
                    *ngFor="let num of getPaginasArray()"
                    class="btn-numero-pagina"
                    [class.active]="currentPage === num"
                    (click)="cambiarPagina(num)"
                  >
                    {{ num + 1 }}
                  </button>
                </div>

                <button 
                  class="btn-paginacion"
                  [disabled]="currentPage === totalPages - 1"
                  (click)="cambiarPagina(currentPage + 1)"
                >
                  Siguiente
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* HEADER */
    .banner-historial {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .header-icon {
      font-size: 3rem;
      color: white;
      opacity: 0.9;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .header-text h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .header-text p {
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    /* FILTROS */
    .filtros-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .filtros-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 15px 15px 0 0;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .filtros-body {
      padding: 2rem;
    }

    .form-control-paciente {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control-paciente:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    /* TURNOS CARD */
    .turnos-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .turnos-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 15px 15px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .turnos-header h3 {
      margin: 0;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .turnos-info {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .turnos-body {
      padding: 1.5rem;
    }

    /* LOADING STATE */
    .loading-turnos {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #6c757d;
      font-size: 1.1rem;
      gap: 0.75rem;
    }

    /* EMPTY STATE */
    .no-turnos-content {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-turnos-content i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #adb5bd;
    }

    .no-turnos-content h4 {
      margin-bottom: 0.5rem;
      color: #495057;
    }

    /* TURNOS GRID */
    .turnos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .turno-card {
      background: white;
      border-radius: 12px;
      border: 2px solid #e9ecef;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .turno-card.clickable {
      cursor: pointer;
    }

    .turno-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }

    .turno-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
      border-bottom: 2px solid #e9ecef;
    }

    .estado-badge {
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: white;
    }

    .fecha-info {
      font-size: 0.9rem;
      color: #495057;
      font-weight: 500;
    }

    .turno-body {
      padding: 1.25rem;
    }

    .turno-detail {
      margin-bottom: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      color: #495057;
    }

    .turno-detail i {
      color: #667eea;
      margin-top: 0.25rem;
    }

    .turno-detail strong {
      margin-right: 0.5rem;
    }

    .observaciones-text {
      font-style: italic;
      color: #6c757d;
      margin-top: 0.25rem;
    }

    .turno-footer {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .asistencia-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .asistencia-badge.asistio {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }

    .asistencia-badge.no-asistio {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }

    .update-info {
      font-size: 0.8rem;
      color: #adb5bd;
    }

    /* ESTADOS */
    .estado-programado {
      background: rgba(255, 193, 7, 0.1);
    }

    .estado-confirmado {
      background: rgba(23, 162, 184, 0.1);
    }

    .estado-completo {
      background: rgba(3, 228, 55, 0.1);
    }

    .estado-cancelado {
      background: rgba(220, 53, 69, 0.1);
    }

    .estado-programado .estado-badge {
      background: #ffc107;
      color: #000;
    }

    .estado-confirmado .estado-badge {
      background: #17a2b8;
    }

    .estado-completo .estado-badge {
      background: #082dc1ff;
    }

    .estado-cancelado .estado-badge {
      background: #dc3545;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .turnos-grid {
        grid-template-columns: 1fr;
      }

      .turno-footer {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class HistorialTurnosComponent implements OnInit {
  turnos: HistorialTurnoDTO[] = [];
  isLoading = false;

  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Filtros
  filtro: HistorialFilter = {
    fechaDesde: undefined,
    fechaHasta: undefined,
    estado: undefined  // ⚠️ Cambiá de '' a undefined
  };
  constructor(
    private historialService: HistorialService,
    private modalService: NgbModal
  ) { }

  abrirDetalle(turno: HistorialTurnoDTO) {
    const modalRef = this.modalService.open(HistorialTurnoDetalleComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.turno = turno;
  }

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    const pacienteId = parseInt(localStorage.getItem('pacienteId') || '0');
    if (!pacienteId) {
      console.error('No se encontró ID de paciente');
      return;
    }

    // 🔍 DEBUG: Ver qué filtros se están enviando
    console.log('📡 Enviando request con filtros:', {
      pacienteId,
      page: this.currentPage,
      size: this.pageSize,
      filtro: this.filtro
    });

    this.isLoading = true;
    this.historialService.getHistorialTurnosPaginado(
      pacienteId,
      this.currentPage,
      this.pageSize,
      this.filtro
    ).subscribe({
      next: (response) => {
        console.log('✅ Response recibida:', response);
        this.turnos = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.currentPage = response.data.currentPage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar historial:', error);
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros() {
    console.log('🔍 Filtros aplicados:', this.filtro);
    console.log('   - Estado:', this.filtro.estado, '(tipo:', typeof this.filtro.estado, ')');

    // Limpiar valores vacíos
    if (this.filtro.estado === '' || this.filtro.estado === 'TODOS') {
      this.filtro.estado = undefined;
    }

    this.currentPage = 0;
    this.cargarHistorial();
  }

  cambiarPagina(pagina: number) {
    this.currentPage = pagina;
    this.cargarHistorial();
  }

  getPaginasArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getEstadoClass(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }
}