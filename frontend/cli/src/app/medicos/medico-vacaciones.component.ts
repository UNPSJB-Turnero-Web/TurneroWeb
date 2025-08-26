import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface Ausencia {
  id?: number;
  fechaInicio: string;
  fechaFin: string;
  tipoAusencia: string;
  motivo: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  observaciones?: string;
  fechaSolicitud?: string;
}

@Component({
  selector: 'app-medico-vacaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0">Gestión de Vacaciones y Ausencias</h1>
            <button class="btn btn-outline-secondary" (click)="volverAlDashboard()">
              <i class="fas fa-arrow-left me-2"></i>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ diasVacacionesUsadas }}</h4>
                  <p class="mb-0">Días Usados</p>
                </div>
                <i class="fas fa-calendar-check fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ diasVacacionesDisponibles }}</h4>
                  <p class="mb-0">Días Disponibles</p>
                </div>
                <i class="fas fa-calendar-plus fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ ausenciasPendientes }}</h4>
                  <p class="mb-0">Pendientes Aprobación</p>
                </div>
                <i class="fas fa-clock fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ proximasAusencias }}</h4>
                  <p class="mb-0">Próximas Ausencias</p>
                </div>
                <i class="fas fa-calendar-times fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-tools me-2"></i>
                Acciones Rápidas
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-2 mb-2">
                  <button class="btn btn-primary w-100" (click)="mostrarFormulario = true">
                    <i class="fas fa-plus mb-1 d-block"></i>
                    Nueva Ausencia
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-info w-100" (click)="filtrarPor('VACACIONES')">
                    <i class="fas fa-umbrella-beach mb-1 d-block"></i>
                    Ver Vacaciones
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-warning w-100" (click)="filtrarPor('ENFERMEDAD')">
                    <i class="fas fa-user-md mb-1 d-block"></i>
                    Ver Licencias Médicas
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-secondary w-100" (click)="filtrarPor('PERSONAL')">
                    <i class="fas fa-user mb-1 d-block"></i>
                    Motivos Personales
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-success w-100" (click)="exportarReporte()">
                    <i class="fas fa-file-export mb-1 d-block"></i>
                    Exportar Reporte
                  </button>
                </div>
                <div class="col-md-2 mb-2">
                  <button class="btn btn-outline-dark w-100" (click)="limpiarFiltros()">
                    <i class="fas fa-eraser mb-1 d-block"></i>
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario Nueva Ausencia -->
      <div class="row mb-4" *ngIf="mostrarFormulario">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="fas fa-calendar-plus me-2"></i>
                {{ modoEdicion ? 'Editar' : 'Nueva' }} Ausencia
              </h6>
              <button class="btn btn-sm btn-outline-secondary" (click)="cancelarFormulario()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="card-body">
              <form [formGroup]="ausenciaForm" (ngSubmit)="guardarAusencia()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Tipo de Ausencia *</label>
                    <select class="form-control" formControlName="tipoAusencia" 
                            [class.is-invalid]="ausenciaForm.get('tipoAusencia')?.invalid && ausenciaForm.get('tipoAusencia')?.touched">
                      <option value="">Seleccionar tipo</option>
                      <option value="VACACIONES">Vacaciones</option>
                      <option value="ENFERMEDAD">Licencia por Enfermedad</option>
                      <option value="PERSONAL">Motivos Personales</option>
                      <option value="CAPACITACION">Capacitación/Congreso</option>
                      <option value="FAMILIAR">Motivos Familiares</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    <div class="invalid-feedback">
                      El tipo de ausencia es obligatorio
                    </div>
                  </div>
                  
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Fecha Inicio *</label>
                    <input type="date" class="form-control" formControlName="fechaInicio"
                           [min]="fechaMinima"
                           [class.is-invalid]="ausenciaForm.get('fechaInicio')?.invalid && ausenciaForm.get('fechaInicio')?.touched">
                    <div class="invalid-feedback">
                      La fecha de inicio es obligatoria
                    </div>
                  </div>
                  
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Fecha Fin *</label>
                    <input type="date" class="form-control" formControlName="fechaFin"
                           [min]="ausenciaForm.get('fechaInicio')?.value || fechaMinima"
                           [class.is-invalid]="ausenciaForm.get('fechaFin')?.invalid && ausenciaForm.get('fechaFin')?.touched">
                    <div class="invalid-feedback">
                      La fecha de fin es obligatoria
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-12 mb-3">
                    <label class="form-label">Motivo/Descripción *</label>
                    <textarea class="form-control" rows="3" formControlName="motivo" 
                              placeholder="Describe el motivo de la ausencia..."
                              [class.is-invalid]="ausenciaForm.get('motivo')?.invalid && ausenciaForm.get('motivo')?.touched"></textarea>
                    <div class="invalid-feedback">
                      El motivo es obligatorio
                    </div>
                  </div>
                </div>

                <!-- Información adicional -->
                <div class="row" *ngIf="ausenciaForm.get('fechaInicio')?.value && ausenciaForm.get('fechaFin')?.value">
                  <div class="col-12 mb-3">
                    <div class="alert alert-info">
                      <div class="row">
                        <div class="col-md-4">
                          <strong>Duración:</strong> {{ calcularDiasDiferencia() }} días
                        </div>
                        <div class="col-md-4">
                          <strong>Días hábiles:</strong> {{ calcularDiasHabiles() }}
                        </div>
                        <div class="col-md-4">
                          <strong>Turnos afectados:</strong> {{ turnosAfectadosCount }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Turnos afectados -->
                <div class="row" *ngIf="turnosAfectados.length > 0">
                  <div class="col-12 mb-3">
                    <div class="alert alert-warning">
                      <h6><i class="fas fa-exclamation-triangle me-2"></i>Turnos que serán afectados:</h6>
                      <div class="table-responsive">
                        <table class="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Horario</th>
                              <th>Paciente</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr *ngFor="let turno of turnosAfectados.slice(0, 5)">
                              <td>{{ turno.fecha | date:'dd/MM/yyyy' }}</td>
                              <td>{{ turno.horaInicio }} - {{ turno.horaFin }}</td>
                              <td>{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</td>
                              <td>
                                <span class="badge bg-primary">{{ turno.estado }}</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <small class="text-muted" *ngIf="turnosAfectados.length > 5">
                        Y {{ turnosAfectados.length - 5 }} turnos más...
                      </small>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary" (click)="cancelarFormulario()">
                    <i class="fas fa-times me-2"></i>
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="ausenciaForm.invalid || guardando">
                    <i class="fas fa-spinner fa-spin me-2" *ngIf="guardando"></i>
                    <i class="fas fa-save me-2" *ngIf="!guardando"></i>
                    {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Solicitar Ausencia') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Ausencias -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="fas fa-list me-2"></i>
                Mis Ausencias ({{ ausenciasFiltradas.length }})
              </h6>
              <div class="input-group" style="width: 300px;">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Buscar..."
                  [(ngModel)]="busqueda"
                  (input)="filtrarAusencias()">
              </div>
            </div>
            <div class="card-body">
              <div *ngIf="cargando" class="text-center py-5">
                <div class="spinner-border" role="status"></div>
                <p class="mt-2 text-muted">Cargando ausencias...</p>
              </div>

              <div *ngIf="!cargando && ausenciasFiltradas.length === 0" class="text-center py-5">
                <i class="fas fa-calendar-check fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No se encontraron ausencias</h5>
                <p class="text-muted">{{ ausencias.length === 0 ? 'No has solicitado ninguna ausencia aún.' : 'No hay ausencias que coincidan con los filtros.' }}</p>
                <button class="btn btn-primary" (click)="mostrarFormulario = true" *ngIf="ausencias.length === 0">
                  <i class="fas fa-plus me-2"></i>
                  Solicitar Primera Ausencia
                </button>
              </div>

              <div *ngIf="!cargando && ausenciasFiltradas.length > 0">
                <div class="row">
                  <div class="col-md-6 col-lg-4 mb-3" *ngFor="let ausencia of ausenciasFiltradas">
                    <div class="card h-100" [class.border-success]="ausencia.estado === 'APROBADA'" 
                         [class.border-warning]="ausencia.estado === 'PENDIENTE'"
                         [class.border-danger]="ausencia.estado === 'RECHAZADA'">
                      <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                          <i class="fas" [class.fa-umbrella-beach]="ausencia.tipoAusencia === 'VACACIONES'"
                             [class.fa-user-md]="ausencia.tipoAusencia === 'ENFERMEDAD'"
                             [class.fa-user]="ausencia.tipoAusencia === 'PERSONAL'"
                             [class.fa-graduation-cap]="ausencia.tipoAusencia === 'CAPACITACION'"
                             [class.fa-home]="ausencia.tipoAusencia === 'FAMILIAR'"
                             [class.fa-ellipsis-h]="ausencia.tipoAusencia === 'OTRO'"></i>
                          {{ ausencia.tipoAusencia }}
                        </h6>
                        <span class="badge" [ngClass]="{
                          'bg-success': ausencia.estado === 'APROBADA',
                          'bg-warning': ausencia.estado === 'PENDIENTE',
                          'bg-danger': ausencia.estado === 'RECHAZADA'
                        }">
                          {{ ausencia.estado }}
                        </span>
                      </div>
                      <div class="card-body">
                        <div class="mb-2">
                          <strong>Período:</strong><br>
                          <small>{{ ausencia.fechaInicio | date:'dd/MM/yyyy' }} - {{ ausencia.fechaFin | date:'dd/MM/yyyy' }}</small>
                        </div>
                        <div class="mb-2">
                          <strong>Duración:</strong> {{ calcularDuracionAusencia(ausencia) }} días
                        </div>
                        <div class="mb-3">
                          <strong>Motivo:</strong><br>
                          <small class="text-muted">{{ ausencia.motivo }}</small>
                        </div>
                        <div class="mb-2" *ngIf="ausencia.observaciones">
                          <strong>Observaciones:</strong><br>
                          <small class="text-muted">{{ ausencia.observaciones }}</small>
                        </div>
                      </div>
                      <div class="card-footer">
                        <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">
                            Solicitado: {{ ausencia.fechaSolicitud | date:'dd/MM/yyyy' }}
                          </small>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" (click)="verDetallesAusencia(ausencia)" title="Ver detalles">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning" (click)="editarAusencia(ausencia)" 
                                    *ngIf="ausencia.estado === 'PENDIENTE'" title="Editar">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" (click)="cancelarAusencia(ausencia)" 
                                    *ngIf="ausencia.estado === 'PENDIENTE'" title="Cancelar">
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      transition: transform 0.2s ease-in-out;
    }

    .card:hover {
      transform: translateY(-2px);
    }

    .opacity-50 {
      opacity: 0.5 !important;
    }

    .btn-group .btn {
      border-radius: 0;
    }

    .btn-group .btn:first-child {
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;
    }

    .btn-group .btn:last-child {
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }

    .table th {
      border-top: none;
    }

    .alert {
      border-left: 4px solid;
    }

    .alert-info {
      border-left-color: #0dcaf0;
    }

    .alert-warning {
      border-left-color: #ffc107;
    }
  `]
})
export class MedicoVacacionesComponent implements OnInit {
  ausencias: Ausencia[] = [];
  ausenciasFiltradas: Ausencia[] = [];
  turnosAfectados: any[] = [];
  
  // Stats
  diasVacacionesUsadas = 0;
  diasVacacionesDisponibles = 21; // Días anuales típicos
  ausenciasPendientes = 0;
  proximasAusencias = 0;
  turnosAfectadosCount = 0;

  // UI State
  mostrarFormulario = false;
  modoEdicion = false;
  cargando = false;
  guardando = false;
  busqueda = '';
  filtroTipo = '';

  // Forms
  ausenciaForm!: FormGroup;
  fechaMinima: string;

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
    this.fechaMinima = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarAusencias();
    this.calcularEstadisticas();
  }

  private inicializarFormulario() {
    this.ausenciaForm = this.fb.group({
      tipoAusencia: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Watch fecha changes to calculate affected appointments
    this.ausenciaForm.get('fechaInicio')?.valueChanges.subscribe(() => {
      this.calcularTurnosAfectados();
    });
    
    this.ausenciaForm.get('fechaFin')?.valueChanges.subscribe(() => {
      this.calcularTurnosAfectados();
    });
  }

  cargarAusencias() {
    this.cargando = true;
    
    // TODO: Implement actual API call
    // Simulando datos de ausencias
    setTimeout(() => {
      this.ausencias = [
        {
          id: 1,
          fechaInicio: '2024-01-15',
          fechaFin: '2024-01-19',
          tipoAusencia: 'VACACIONES',
          motivo: 'Vacaciones familiares programadas',
          estado: 'APROBADA',
          fechaSolicitud: '2023-12-01'
        },
        {
          id: 2,
          fechaInicio: '2024-02-20',
          fechaFin: '2024-02-21',
          tipoAusencia: 'ENFERMEDAD',
          motivo: 'Licencia médica por gripe',
          estado: 'APROBADA',
          observaciones: 'Certificado médico adjunto',
          fechaSolicitud: '2024-02-19'
        },
        {
          id: 3,
          fechaInicio: '2024-03-10',
          fechaFin: '2024-03-12',
          tipoAusencia: 'CAPACITACION',
          motivo: 'Congreso Internacional de Cardiología',
          estado: 'PENDIENTE',
          fechaSolicitud: '2024-02-25'
        }
      ];
      
      this.ausenciasFiltradas = [...this.ausencias];
      this.cargando = false;
    }, 500);
  }

  calcularEstadisticas() {
    this.diasVacacionesUsadas = this.ausencias
      .filter(a => a.tipoAusencia === 'VACACIONES' && a.estado === 'APROBADA')
      .reduce((total, ausencia) => total + this.calcularDuracionAusencia(ausencia), 0);
    
    this.diasVacacionesDisponibles = 21 - this.diasVacacionesUsadas;
    this.ausenciasPendientes = this.ausencias.filter(a => a.estado === 'PENDIENTE').length;
    
    const hoy = new Date();
    this.proximasAusencias = this.ausencias.filter(a => 
      a.estado === 'APROBADA' && new Date(a.fechaInicio) > hoy
    ).length;
  }

  filtrarPor(tipo: string) {
    this.filtroTipo = tipo;
    this.filtrarAusencias();
  }

  filtrarAusencias() {
    this.ausenciasFiltradas = this.ausencias.filter(ausencia => {
      let coincide = true;

      if (this.filtroTipo && ausencia.tipoAusencia !== this.filtroTipo) {
        coincide = false;
      }

      if (this.busqueda) {
        const busquedaLower = this.busqueda.toLowerCase();
        coincide = coincide && (
          ausencia.tipoAusencia.toLowerCase().includes(busquedaLower) ||
          ausencia.motivo.toLowerCase().includes(busquedaLower) ||
          ausencia.estado.toLowerCase().includes(busquedaLower)
        );
      }

      return coincide;
    });
  }

  limpiarFiltros() {
    this.filtroTipo = '';
    this.busqueda = '';
    this.filtrarAusencias();
  }

  calcularDiasDiferencia(): number {
    const fechaInicio = this.ausenciaForm.get('fechaInicio')?.value;
    const fechaFin = this.ausenciaForm.get('fechaFin')?.value;
    
    if (!fechaInicio || !fechaFin) return 0;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
  }

  calcularDiasHabiles(): number {
    const fechaInicio = this.ausenciaForm.get('fechaInicio')?.value;
    const fechaFin = this.ausenciaForm.get('fechaFin')?.value;
    
    if (!fechaInicio || !fechaFin) return 0;
    
    let diasHabiles = 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      const diaSemana = d.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) { // No domingo (0) ni sábado (6)
        diasHabiles++;
      }
    }
    
    return diasHabiles;
  }

  calcularDuracionAusencia(ausencia: Ausencia): number {
    const inicio = new Date(ausencia.fechaInicio);
    const fin = new Date(ausencia.fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
  }

  calcularTurnosAfectados() {
    const fechaInicio = this.ausenciaForm.get('fechaInicio')?.value;
    const fechaFin = this.ausenciaForm.get('fechaFin')?.value;
    
    if (!fechaInicio || !fechaFin) {
      this.turnosAfectados = [];
      this.turnosAfectadosCount = 0;
      return;
    }
    
    // TODO: Implement actual API call to get affected appointments
    // Simulando turnos afectados
    this.turnosAfectados = [
      {
        id: 1,
        fecha: fechaInicio,
        horaInicio: '09:00',
        horaFin: '10:00',
        nombrePaciente: 'Juan',
        apellidoPaciente: 'Pérez',
        estado: 'CONFIRMADO'
      },
      {
        id: 2,
        fecha: fechaInicio,
        horaInicio: '11:00',
        horaFin: '12:00',
        nombrePaciente: 'María',
        apellidoPaciente: 'González',
        estado: 'PROGRAMADO'
      }
    ];
    
    this.turnosAfectadosCount = this.turnosAfectados.length;
  }

  guardarAusencia() {
    if (this.ausenciaForm.valid) {
      this.guardando = true;
      
      const ausenciaData: Ausencia = {
        ...this.ausenciaForm.value,
        estado: 'PENDIENTE' as const,
        fechaSolicitud: new Date().toISOString().split('T')[0]
      };
      
      // TODO: Implement actual API call
      setTimeout(() => {
        if (this.modoEdicion) {
          // Update existing
          const index = this.ausencias.findIndex(a => a.id === ausenciaData.id);
          if (index >= 0) {
            this.ausencias[index] = ausenciaData;
          }
        } else {
          // Add new
          ausenciaData.id = this.ausencias.length + 1;
          this.ausencias.push(ausenciaData);
        }
        
        this.filtrarAusencias();
        this.calcularEstadisticas();
        this.cancelarFormulario();
        this.guardando = false;
        
        alert(this.modoEdicion ? 'Ausencia actualizada correctamente' : 'Solicitud de ausencia enviada correctamente');
      }, 1000);
    }
  }

  editarAusencia(ausencia: Ausencia) {
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    
    this.ausenciaForm.patchValue({
      tipoAusencia: ausencia.tipoAusencia,
      fechaInicio: ausencia.fechaInicio,
      fechaFin: ausencia.fechaFin,
      motivo: ausencia.motivo
    });
  }

  cancelarAusencia(ausencia: Ausencia) {
    if (confirm('¿Estás seguro de cancelar esta solicitud de ausencia?')) {
      // TODO: Implement actual API call
      ausencia.estado = 'RECHAZADA';
      alert('Solicitud de ausencia cancelada');
    }
  }

  verDetallesAusencia(ausencia: Ausencia) {
    // TODO: Show modal with detailed information
    alert(`Detalles de ausencia:\n\nTipo: ${ausencia.tipoAusencia}\nFechas: ${ausencia.fechaInicio} - ${ausencia.fechaFin}\nMotivo: ${ausencia.motivo}\nEstado: ${ausencia.estado}`);
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.ausenciaForm.reset();
    this.turnosAfectados = [];
    this.turnosAfectadosCount = 0;
  }

  exportarReporte() {
    // TODO: Implement export functionality
    console.log('Exportar reporte de ausencias');
  }

  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
  }
}