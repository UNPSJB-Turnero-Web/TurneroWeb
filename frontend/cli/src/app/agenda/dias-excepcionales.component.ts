import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnoService } from '../turnos/turno.service';
import { EsquemaTurnoService } from '../esquemaTurno/esquemaTurno.service';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { DiaExcepcional } from './diaExcepcional';

@Component({
  selector: 'app-dias-excepcionales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="page-header mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="display-6 mb-2">
              <i class="fas fa-calendar-times text-warning me-3"></i>
              Gestión de Días Excepcionales
            </h1>
            <p class="text-muted mb-0">Configure feriados, mantenimiento y horarios especiales</p>
          </div>
          <button class="btn btn-primary btn-lg" (click)="abrirModalNuevo()">
            <i class="fas fa-plus me-2"></i>Agregar Día Excepcional
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-light">
          <h5 class="card-title mb-0">
            <i class="fas fa-filter me-2"></i>Filtros de Búsqueda
          </h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Centro de Atención</label>
              <select class="form-select" [(ngModel)]="filtros.centroId" (change)="aplicarFiltros()">
                <option value="">Todos los centros</option>
                <option *ngFor="let centro of centros" [value]="centro.id">{{ centro.nombre }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Tipo</label>
              <select class="form-select" [(ngModel)]="filtros.tipo" (change)="aplicarFiltros()">
                <option value="">Todos los tipos</option>
                <option value="FERIADO">Feriado</option>
                <option value="ATENCION_ESPECIAL">Atención Especial</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Año</label>
              <select class="form-select" [(ngModel)]="filtros.anio" (change)="aplicarFiltros()">
                <option *ngFor="let anio of anios" [value]="anio">{{ anio }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de días excepcionales -->
      <div class="card shadow-sm">
        <div class="card-header bg-light">
          <h5 class="card-title mb-0">
            <i class="fas fa-list me-2"></i>Días Excepcionales Configurados
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Centro/Consultorio</th>
                  <th>Horario</th>
                  <th>Duración</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let dia of diasFiltrados" class="align-middle">
                  <td>
                    <strong>{{ dia.fecha | date:'dd/MM/yyyy' }}</strong>
                    <br>
                    <small class="text-muted">{{ dia.fecha | date:'EEEE' }}</small>
                  </td>
                  <td>
                    <span class="badge fs-6" [ngClass]="getTipoBadgeClass(dia.tipo)">
                      <i class="fas" [ngClass]="getTipoIcon(dia.tipo)" class="me-1"></i>
                      {{ getTipoLabel(dia.tipo) }}
                    </span>
                  </td>
                  <td class="descripcion-cell">
                    <div class="descripcion-text">{{ dia.descripcion }}</div>
                    <!-- Mostrar tipo de procedimiento si es atención especial -->
                    <div *ngIf="dia.tipo === 'ATENCION_ESPECIAL' && dia.descripcion && getTipoProcedimientoFromDescription(dia.descripcion)" class="mt-1">
                      <small class="badge bg-secondary">
                        <i class="fas fa-medical-kit me-1"></i>
                        {{ getTipoProcedimientoLabel(getTipoProcedimientoFromDescription(dia.descripcion)!) }}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div *ngIf="dia.centroNombre" class="centro-info">
                      <strong>{{ dia.centroNombre }}</strong>
                      <br>
                      <small class="text-muted" *ngIf="dia.consultorioNombre">
                        <i class="fas fa-door-open me-1"></i>{{ dia.consultorioNombre }}
                      </small>
                      <br>
                      <small class="text-muted" *ngIf="dia.medicoNombre">
                        <i class="fas fa-user-md me-1"></i>Dr. {{ dia.medicoNombre }} {{ dia.medicoApellido }}
                        <span *ngIf="dia.especialidad" class="d-block">
                          <i class="fas fa-stethoscope me-1"></i>{{ dia.especialidad }}
                        </span>
                      </small>
                    </div>
                    <div *ngIf="!dia.centroNombre">
                      <span class="badge bg-info text-dark">
                        <i class="fas fa-globe me-1"></i>General
                      </span>
                      <br>
                      <small class="text-muted">(Todos los centros)</small>
                    </div>
                  </td>
                  <td>
                    <div *ngIf="dia.apertura && dia.cierre">
                      <i class="fas fa-clock me-1"></i>
                      {{ dia.apertura }} - {{ dia.cierre }}
                      <!-- Mostrar duración si es atención especial -->
                      <div *ngIf="dia.tipo === 'ATENCION_ESPECIAL'" class="mt-1">
                        <small class="badge bg-info">
                          <i class="fas fa-stopwatch me-1"></i>
                          {{ calcularDuracion(dia.apertura, dia.cierre) }} min
                        </small>
                      </div>
                    </div>
                    <div *ngIf="!dia.apertura">
                      <span class="text-muted">Todo el día</span>
                    </div>
                  </td>
                  <td>
                    <div *ngIf="dia.duracion">
                      <i class="fas fa-clock me-1"></i>
                      {{ dia.duracion }} min
                    </div>
                    <div *ngIf="!dia.duracion">
                      <span class="text-muted">-</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="editar(dia)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="eliminar(dia)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="diasFiltrados.length === 0">
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="fas fa-calendar-times fa-3x mb-3 opacity-50"></i>
                    <p class="mb-0">No hay días excepcionales configurados</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal para agregar/editar día excepcional -->
      <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" 
           tabindex="-1" *ngIf="showModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-calendar-plus me-2"></i>
                {{ editando ? 'Editar' : 'Agregar' }} Día Excepcional
              </h5>
              <button type="button" class="btn-close" (click)="cerrarModal()"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="guardar()" #form="ngForm">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Fecha *</label>
                    <input type="date" class="form-control" [(ngModel)]="diaActual.fecha" 
                           name="fecha" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Tipo *</label>
                    <select class="form-select" [(ngModel)]="diaActual.tipo" 
                            name="tipo" required (change)="onTipoChange()">
                      <option value="">Seleccione un tipo</option>
                      <option value="FERIADO">Feriado</option>
                      <option value="ATENCION_ESPECIAL">Atención Especial</option>
                      <option value="MANTENIMIENTO">Mantenimiento</option>
                    </select>
                  </div>
                  <!-- Descripción general para feriados -->
                  <div class="col-12" *ngIf="diaActual.tipo === 'FERIADO'">
                    <label class="form-label">Descripción *</label>
                    <textarea class="form-control" [(ngModel)]="diaActual.descripcionExcepcion" 
                              name="descripcion" required rows="2" 
                              placeholder="Ej: Día del Trabajador, Día de la Independencia, etc."></textarea>
                  </div>
                  
                  <!-- Solo para mantenimiento y atención especial -->
                  <div class="col-12" *ngIf="diaActual.tipo !== 'FERIADO'">
                    <label class="form-label">Esquema de Turno *</label>
                    <select class="form-select" [(ngModel)]="diaActual.esquemaTurnoId" 
                            name="esquemaTurno" required (change)="onEsquemaTurnoChange()">
                      <option value="">Seleccione un esquema</option>
                      <option *ngFor="let esquema of esquemasTurno" [value]="esquema.id">
                        {{ esquema.nombreCentro }} - {{ esquema.nombreConsultorio }} - Dr. {{ esquema.nombreStaffMedico }}
                      </option>
                    </select>
                  </div>

                  <!-- Mostrar horarios del esquema de turno seleccionado -->
                  <div class="col-12" *ngIf="diaActual.tipo !== 'FERIADO' && getEsquemaSeleccionado()">
                    <div class="esquema-horarios-info">
                      <h6 class="mb-3">
                        <i class="fas fa-clock text-primary me-2"></i>
                        Horarios del Esquema de Turno Seleccionado
                      </h6>
                      <div class="esquema-info-card">
                        <div class="esquema-header">
                          <div class="esquema-details">
                            <div class="detail-item">
                              <i class="fas fa-building text-info me-2"></i>
                              <strong>Centro:</strong> {{ getEsquemaSeleccionado()?.nombreCentro }}
                            </div>
                            <div class="detail-item">
                              <i class="fas fa-door-open text-warning me-2"></i>
                              <strong>Consultorio:</strong> {{ getEsquemaSeleccionado()?.nombreConsultorio }}
                            </div>
                            <div class="detail-item">
                              <i class="fas fa-user-md text-success me-2"></i>
                              <strong>Médico:</strong> Dr. {{ getEsquemaSeleccionado()?.nombreStaffMedico }}
                            </div>
                            <div class="detail-item">
                              <i class="fas fa-hourglass-half text-secondary me-2"></i>
                              <strong>Intervalo:</strong> {{ getEsquemaSeleccionado()?.intervalo }} minutos
                            </div>
                          </div>
                        </div>
                        
                        <div class="horarios-container" *ngIf="getEsquemaSeleccionado()?.horarios && getEsquemaSeleccionado()?.horarios.length > 0; else noHorarios">
                          <div class="horarios-grid">
                            <div *ngFor="let horario of getEsquemaSeleccionado()?.horarios" class="horario-badge">
                              <span class="dia-label">{{ horario.dia }}</span>
                              <span class="hora-label">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <ng-template #noHorarios>
                          <div class="no-horarios-warning">
                            <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                            Este esquema de turno no tiene horarios configurados
                          </div>
                        </ng-template>
                      </div>
                    </div>
                  </div>

                  <!-- Campos específicos para atención especial -->
                  <ng-container *ngIf="diaActual.tipo === 'ATENCION_ESPECIAL'">
                    <div class="col-md-4">
                      <label class="form-label">Hora de Inicio *</label>
                      <input type="time" class="form-control" [(ngModel)]="diaActual.horaInicio" 
                             name="horaInicio" required>
                      <small class="form-text text-muted">Hora exacta de inicio del procedimiento</small>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Duración (minutos) *</label>
                      <input type="number" class="form-control" [(ngModel)]="diaActual.duracionMinutos" 
                             name="duracionMinutos" required min="15" max="480" step="15"
                             placeholder="Ej: 60">
                      <small class="form-text text-muted">Duración total del procedimiento</small>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Tipo de Procedimiento *</label>
                      <select class="form-select" [(ngModel)]="diaActual.tipoProcedimiento" 
                              name="tipoProcedimiento" required>
                        <option value="">Seleccionar tipo</option>
                        <option value="CIRUGIA">Cirugía</option>
                        <option value="ESTUDIO">Estudio Médico</option>
                        <option value="PROCEDIMIENTO_ESPECIAL">Procedimiento Especial</option>
                        <option value="CONSULTA_EXTENDIDA">Consulta Extendida</option>
                        <option value="INTERCONSULTA">Interconsulta</option>
                      </select>
                      <small class="form-text text-muted">Categoría del procedimiento reservado</small>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Descripción del Procedimiento *</label>
                      <textarea class="form-control" [(ngModel)]="diaActual.descripcionExcepcion" 
                                name="descripcionExcepcion" required rows="3"
                                placeholder="Ej: Cirugía de apendicitis - Paciente Juan Pérez"></textarea>
                      <small class="form-text text-muted">Descripción detallada del procedimiento o motivo de la reserva</small>
                    </div>
                  </ng-container>

                  <!-- Campos específicos para mantenimiento -->
                  <ng-container *ngIf="diaActual.tipo === 'MANTENIMIENTO'">
                    <div class="col-md-6">
                      <label class="form-label">Hora de Inicio del Mantenimiento *</label>
                      <input type="time" class="form-control" [(ngModel)]="diaActual.horaInicio" 
                             name="horaInicioMantenimiento" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Duración Adicional (minutos)</label>
                      <input type="number" class="form-control" [(ngModel)]="diaActual.duracion" 
                             name="duracion" min="0" max="60"
                             placeholder="Ej: 15">
                      <small class="form-text text-muted">Tiempo adicional después del mantenimiento</small>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Descripción del Mantenimiento *</label>
                      <textarea class="form-control" [(ngModel)]="diaActual.descripcionExcepcion" 
                                name="descripcionMantenimiento" required rows="2"
                                placeholder="Ej: Mantenimiento sistema eléctrico, Reparación equipos médicos, etc."></textarea>
                      <small class="form-text text-muted">Descripción detallada del tipo de mantenimiento a realizar</small>
                    </div>
                  </ng-container>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">
                <i class="fas fa-times me-2"></i>Cancelar
              </button>
              <button type="button" class="btn btn-primary" (click)="guardar()" [disabled]="!form.valid">
                <i class="fas fa-save me-2"></i>{{ editando ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" *ngIf="showModal"></div>
    </div>
  `,
  styles: [`
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
    }

    .card {
      border: none;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
    }

    .table th {
      border-top: none;
      font-weight: 600;
      background-color: #f8f9fa;
      color: #495057;
      white-space: nowrap;
    }

    .table td {
      vertical-align: middle;
      border-color: #e9ecef;
    }

    /* Mejoras de visualización para columnas */
    .table th:nth-child(1), .table td:nth-child(1) { width: 12%; } /* Fecha */
    .table th:nth-child(2), .table td:nth-child(2) { width: 15%; } /* Tipo */
    .table th:nth-child(3), .table td:nth-child(3) { width: 20%; } /* Descripción */
    .table th:nth-child(4), .table td:nth-child(4) { width: 25%; } /* Centro/Consultorio */
    .table th:nth-child(5), .table td:nth-child(5) { width: 12%; } /* Horario */
    .table th:nth-child(6), .table td:nth-child(6) { width: 10%; } /* duracion */
    .table th:nth-child(7), .table td:nth-child(7) { width: 6%; }  /* Acciones */

    .descripcion-cell {
      max-width: 200px;
    }

    .descripcion-text {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.3;
      max-height: 2.6em;
    }

    .centro-info {
      font-size: 0.9rem;
      line-height: 1.2;
    }

    .centro-info strong {
      font-weight: 600;
      color: #495057;
    }

    .centro-info small {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .badge.fs-6 {
      font-size: 0.875rem !important;
      padding: 0.5rem 0.8rem;
    }

    .badge-danger {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    .badge-warning {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #212529;
    }

    .badge-info {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
    }

    .modal.show {
      background: rgba(0, 0, 0, 0.5);
    }

    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }

    /* Estilos para la información del esquema de turno */
    .esquema-horarios-info {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }

    .esquema-info-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 1px solid #dee2e6;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 0.5rem;
    }

    .esquema-header {
      margin-bottom: 1rem;
    }

    .esquema-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      padding: 0.25rem 0;
    }

    .detail-item strong {
      margin-left: 0.25rem;
      margin-right: 0.5rem;
    }

    .horarios-container {
      border-top: 1px solid #dee2e6;
      padding-top: 1rem;
    }

    .horarios-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .horario-badge {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
    }

    .horario-badge .dia-label {
      font-size: 0.75rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.2rem;
    }

    .horario-badge .hora-label {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .no-horarios-warning {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      color: #856404;
      font-style: italic;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .table-responsive {
        font-size: 0.85rem;
      }
      
      .descripcion-text {
        -webkit-line-clamp: 1;
        max-height: 1.3em;
      }

      .centro-info {
        font-size: 0.8rem;
      }

      .badge.fs-6 {
        font-size: 0.75rem !important;
        padding: 0.35rem 0.6rem;
      }
    }
  `]
})
export class DiasExcepcionalesComponent implements OnInit {
  diasExcepcionales: DiaExcepcional[] = [];
  diasFiltrados: DiaExcepcional[] = [];
  centros: any[] = [];
  esquemasTurno: any[] = [];
  
  filtros = {
    centroId: '',
    tipo: '',
    anio: new Date().getFullYear()
  };
  
  anios: number[] = [];
  showModal = false;
  editando = false;
  
  diaActual: DiaExcepcional = {
    fecha: '',
    tipo: 'FERIADO',
    descripcionExcepcion: ''
  };

  constructor(
    private turnoService: TurnoService,
    private esquemaTurnoService: EsquemaTurnoService,
    private centroService: CentroAtencionService,
    private cdr: ChangeDetectorRef
  ) {
    // Generar años (actual y próximos 2)
    const anioActual = new Date().getFullYear();
    this.anios = [anioActual - 1, anioActual, anioActual + 1, anioActual + 2];
  }

  ngOnInit() {
    this.cargarCentros();
    this.cargarEsquemasTurno();
    this.cargarDiasExcepcionales();
  }

  cargarCentros() {
    this.centroService.all().subscribe({
      next: (response) => {
        this.centros = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar centros:', error);
      }
    });
  }

  cargarEsquemasTurno() {
    this.esquemaTurnoService.all().subscribe({
      next: (response) => {
        this.esquemasTurno = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar esquemas de turno:', error);
      }
    });
  }

  cargarDiasExcepcionales() {
    const fechaInicio = `${this.filtros.anio}-01-01`;
    const fechaFin = `${this.filtros.anio}-12-31`;
    
    this.turnoService.getDiasExcepcionales(fechaInicio, fechaFin, 
      this.filtros.centroId ? Number(this.filtros.centroId) : undefined).subscribe({
      next: (response) => {
        // Mapear datos del backend a propiedades de compatibilidad
        this.diasExcepcionales = (response.data || []).map(dia => this.mapearDiaDesdeBackend(dia));
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar días excepcionales:', error);
      }
    });
  }

  /**
   * Mapea los datos del backend (ConfiguracionExcepcionalDTO) a las propiedades 
   * de compatibilidad esperadas en el frontend
   */
  mapearDiaDesdeBackend(diaBackend: any): DiaExcepcional {
    return {
      ...diaBackend,
      // Aliases para compatibilidad con el frontend
      apertura: diaBackend.horaInicio,
      cierre: diaBackend.horaFin,
      centroId: diaBackend.centroAtencionId,
      centroNombre: diaBackend.centroAtencionNombre,
      especialidad: diaBackend.especialidadNombre,
      // Campos de compatibilidad para formulario
      descripcionExcepcion: diaBackend.descripcion,
      // Mapear la duración - el backend devuelve "duracion", el frontend espera "duracion"
      duracion: diaBackend.duracion,
      duracionMinutos: diaBackend.duracion // Alias para formularios de atención especial
    };
  }

  aplicarFiltros() {
    this.diasFiltrados = this.diasExcepcionales.filter(dia => {
      let cumpleFiltros = true;
      
      if (this.filtros.tipo && dia.tipo !== this.filtros.tipo) {
        cumpleFiltros = false;
      }
      
      return cumpleFiltros;
    });
  }

  abrirModalNuevo() {
    this.editando = false;
    this.diaActual = {
      fecha: '',
      tipo: 'FERIADO',
      descripcionExcepcion: ''
    };
    this.showModal = true;
  }

  editar(dia: DiaExcepcional) {
    this.editando = true;
    // Mapear campos del DTO a campos del formulario
    this.diaActual = {
      ...dia,
      descripcionExcepcion: dia.descripcion || dia.descripcionExcepcion,
      horaInicio: dia.apertura || dia.horaInicio,
      horaFin: dia.cierre || dia.horaFin
    };
    this.showModal = true;
  }

  onTipoChange() {
    // Limpiar campos específicos cuando cambia el tipo
    if (this.diaActual.tipo === 'FERIADO') {
      this.diaActual.esquemaTurnoId = undefined;
      this.diaActual.horaInicio = undefined;
      this.diaActual.horaFin = undefined;
      this.diaActual.duracion = undefined;
      this.diaActual.duracionMinutos = undefined;
      this.diaActual.tipoProcedimiento = undefined;
    } else if (this.diaActual.tipo === 'ATENCION_ESPECIAL') {
      // Para atención especial no se necesita tiempo de sanitización
      this.diaActual.duracion = undefined;
      // Limpiar campos específicos de mantenimiento si se cambió desde allí
      this.diaActual.horaFin = undefined;
    } else if (this.diaActual.tipo === 'MANTENIMIENTO') {
      // Para mantenimiento no se necesitan campos de procedimiento
      this.diaActual.duracionMinutos = undefined;
      this.diaActual.tipoProcedimiento = undefined;
      this.diaActual.horaFin = undefined;
    }
  }

  onEsquemaTurnoChange() {
    // Este método se llama cuando cambia la selección del esquema de turno
    // Fuerza la actualización de la vista para mostrar/ocultar la información del esquema
    this.cdr.detectChanges();
  }

  getEsquemaSeleccionado(): any {
    if (!this.diaActual.esquemaTurnoId) {
      return null;
    }
    return this.esquemasTurno.find(esquema => esquema.id == this.diaActual.esquemaTurnoId);
  }

  guardar() {
    if (!this.diaActual.fecha || !this.diaActual.tipo|| !this.diaActual.descripcionExcepcion) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Validaciones específicas por tipo
    if (this.diaActual.tipo !== 'FERIADO') {
      if (!this.diaActual.esquemaTurnoId) {
        alert('Debe seleccionar un esquema de turno para este tipo de día excepcional');
        return;
      }
    }

    if (this.diaActual.tipo === 'ATENCION_ESPECIAL') {
      if (!this.diaActual.horaInicio || !this.diaActual.duracionMinutos || !this.diaActual.tipoProcedimiento) {
        alert('Debe especificar hora de inicio, duración y tipo de procedimiento para atención especial');
        return;
      }
      if (this.diaActual.duracionMinutos < 15 || this.diaActual.duracionMinutos > 480) {
        alert('La duración debe estar entre 15 minutos y 8 horas (480 minutos)');
        return;
      }
      if (!this.diaActual.descripcionExcepcion || this.diaActual.descripcionExcepcion.trim().length < 10) {
        alert('Debe proporcionar una descripción detallada del procedimiento (mínimo 10 caracteres)');
        return;
      }
    }

    if (this.diaActual.tipo === 'MANTENIMIENTO') {
      if (!this.diaActual.horaInicio) {
        alert('Debe especificar la hora de inicio del mantenimiento');
        return;
      }
      if (!this.diaActual.duracion || this.diaActual.duracion <= 0) {
        alert('Debe especificar un tiempo de duración válido para el mantenimiento');
        return;
      }
    }

    // Preparar datos para enviar
    const params: any = {
      fecha: this.diaActual.fecha,
      tipoAgenda: this.diaActual.tipo,
      descripcion: this.diaActual.descripcionExcepcion
    };

    // Solo agregar esquemaTurnoId si no es feriado
    if (this.diaActual.tipo !== 'FERIADO' && this.diaActual.esquemaTurnoId) {
      params.esquemaTurnoId = this.diaActual.esquemaTurnoId;
    }

    // Agregar horarios si es atención especial
    if (this.diaActual.tipo === 'ATENCION_ESPECIAL') {
      params.horaInicio = this.diaActual.horaInicio;
      params.duracionMinutos = this.diaActual.duracionMinutos;
      params.tipoProcedimiento = this.diaActual.tipoProcedimiento;
      
      // Calcular hora fin basada en duración para compatibilidad con backend
      if (this.diaActual.horaInicio && this.diaActual.duracionMinutos) {
        const [horas, minutos] = this.diaActual.horaInicio.split(':').map(Number);
        const inicioEnMinutos = horas * 60 + minutos;
        const finEnMinutos = inicioEnMinutos + this.diaActual.duracionMinutos;
        const horaFin = Math.floor(finEnMinutos / 60);
        const minutoFin = finEnMinutos % 60;
        params.horaFin = `${horaFin.toString().padStart(2, '0')}:${minutoFin.toString().padStart(2, '0')}`;
      }
    }

    // Agregar hora de inicio si es mantenimiento
    if (this.diaActual.tipo === 'MANTENIMIENTO') {
      params.horaInicio = this.diaActual.horaInicio;
    }

    // Agregar duración si está especificado
    if (this.diaActual.duracion) {
      params.duracion = this.diaActual.duracion;
    }

    // Usar el método apropiado según si estamos editando o creando
    const operacion = this.editando ? 
      this.turnoService.actualizarDiaExcepcional(this.diaActual.id!, params) :
      this.turnoService.crearDiaExcepcional(params);

    operacion.subscribe({
      next: () => {
        alert(`Día excepcional ${this.editando ? 'actualizado' : 'creado'} correctamente`);
        this.cerrarModal();
        this.cargarDiasExcepcionales();
      },
      error: (error) => {
        console.error('Error al guardar día excepcional:', error);
        const mensaje = error.error?.status_text || error.error?.message || 'Error al guardar el día excepcional';
        alert(mensaje);
      }
    });
  }

  eliminar(dia: DiaExcepcional) {
    if (confirm('¿Está seguro que desea eliminar este día excepcional?')) {
      this.turnoService.eliminarDiaExcepcional(dia.id!).subscribe({
        next: () => {
          alert('Día excepcional eliminado correctamente');
          this.cargarDiasExcepcionales();
        },
        error: (error) => {
          console.error('Error al eliminar día excepcional:', error);
          alert('Error al eliminar el día excepcional: ' + (error.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.editando = false;
  }

  getTipoBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'FERIADO': return 'badge-danger';
      case 'ATENCION_ESPECIAL': return 'badge-warning';
      case 'MANTENIMIENTO': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'FERIADO': return 'fa-calendar-times';
      case 'ATENCION_ESPECIAL': return 'fa-clock';
      case 'MANTENIMIENTO': return 'fa-tools';
      default: return 'fa-calendar';
    }
  }

  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'FERIADO': return 'Feriado';
      case 'ATENCION_ESPECIAL': return 'Atención Especial';
      case 'MANTENIMIENTO': return 'Mantenimiento';
      default: return tipo;
    }
  }

  // Función para calcular duración en minutos entre dos horas
  calcularDuracion(horaInicio: string, horaFin: string): number {
    if (!horaInicio || !horaFin) return 0;
    
    const [horasInicio, minutosInicio] = horaInicio.split(':').map(Number);
    const [horasFin, minutosFin] = horaFin.split(':').map(Number);
    
    const inicioEnMinutos = horasInicio * 60 + minutosInicio;
    const finEnMinutos = horasFin * 60 + minutosFin;
    
    return finEnMinutos - inicioEnMinutos;
  }

  // Función para extraer tipo de procedimiento de la descripción
  getTipoProcedimientoFromDescription(descripcion: string): string | null {
    if (!descripcion) return null;
    
    // Buscar patrones en la descripción que indiquen el tipo
    const descripcionLower = descripcion.toLowerCase();
    if (descripcionLower.includes('cirugía') || descripcionLower.includes('cirugia')) return 'CIRUGIA';
    if (descripcionLower.includes('estudio')) return 'ESTUDIO';
    if (descripcionLower.includes('procedimiento')) return 'PROCEDIMIENTO_ESPECIAL';
    if (descripcionLower.includes('consulta')) return 'CONSULTA_EXTENDIDA';
    if (descripcionLower.includes('interconsulta')) return 'INTERCONSULTA';
    
    return null;
  }

  // Función para obtener etiqueta del tipo de procedimiento
  getTipoProcedimientoLabel(tipo: string): string {
    switch (tipo) {
      case 'CIRUGIA': return 'Cirugía';
      case 'ESTUDIO': return 'Estudio Médico';
      case 'PROCEDIMIENTO_ESPECIAL': return 'Procedimiento Especial';
      case 'CONSULTA_EXTENDIDA': return 'Consulta Extendida';
      case 'INTERCONSULTA': return 'Interconsulta';
      default: return tipo;
    }
  }
}
