import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { MedicoService } from './medico.service';

interface EstadisticasPeriodo {
  periodo: string;
  turnosRealizados: number;
  turnosCancelados: number;
  pacientesAtendidos: number;
  horasTrabajadas: number;
  ingresos?: number;
}

interface EstadisticasEspecialidad {
  especialidad: string;
  cantidad: number;
  porcentaje: number;
}

@Component({
  selector: 'app-medico-estadisticas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0">Mis Estadísticas</h1>
            <button class="btn btn-outline-secondary" (click)="volverAlDashboard()">
              <i class="fas fa-arrow-left me-2"></i>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Período Selector -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-calendar-alt me-2"></i>
                Seleccionar Período
              </h6>
            </div>
            <div class="card-body">
              <div class="btn-group" role="group">
                <button 
                  *ngFor="let periodo of periodosDisponibles" 
                  type="button" 
                  class="btn"
                  [class.btn-primary]="periodoSeleccionado === periodo.valor"
                  [class.btn-outline-primary]="periodoSeleccionado !== periodo.valor"
                  (click)="seleccionarPeriodo(periodo.valor)">
                  {{ periodo.nombre }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white stats-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h3 class="mb-1">{{ estadisticasActuales.turnosRealizados }}</h3>
                  <p class="mb-0">Turnos Realizados</p>
                </div>
                <i class="fas fa-check-circle fa-3x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white stats-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h3 class="mb-1">{{ estadisticasActuales.pacientesAtendidos }}</h3>
                  <p class="mb-0">Pacientes Únicos</p>
                </div>
                <i class="fas fa-users fa-3x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white stats-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h3 class="mb-1">{{ estadisticasActuales.horasTrabajadas }}h</h3>
                  <p class="mb-0">Horas Trabajadas</p>
                </div>
                <i class="fas fa-clock fa-3x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white stats-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h3 class="mb-1">{{ calcularTasaCancelacion() }}%</h3>
                  <p class="mb-0">Tasa Cancelación</p>
                </div>
                <i class="fas fa-times-circle fa-3x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <!-- Evolución Temporal -->
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-chart-line me-2"></i>
                Evolución de Turnos - {{ getPeriodoNombre() }}
              </h6>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <!-- Simulación de gráfico de líneas -->
                <div class="chart-placeholder">
                  <div class="chart-bars">
                    <div class="chart-bar" *ngFor="let stat of evolutionData" 
                         [style.height.%]="(stat.turnosRealizados / getMaxTurnos()) * 100">
                      <div class="bar-value">{{ stat.turnosRealizados }}</div>
                      <div class="bar-label">{{ stat.periodo }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribución por Especialidades -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-pie-chart me-2"></i>
                Por Especialidad
              </h6>
            </div>
            <div class="card-body">
              <div class="specialty-stats">
                <div class="specialty-item" *ngFor="let esp of especialidadesStats">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="specialty-name">{{ esp.especialidad }}</span>
                    <span class="specialty-percentage">{{ esp.porcentaje }}%</span>
                  </div>
                  <div class="progress mb-3">
                    <div class="progress-bar bg-primary" 
                         [style.width.%]="esp.porcentaje" 
                         role="progressbar">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Stats -->
      <div class="row mb-4">
        <!-- Rendimiento Mensual -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-calendar-check me-2"></i>
                Rendimiento Mensual
              </h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Turnos</th>
                      <th>Pacientes</th>
                      <th>Horas</th>
                      <th>Tasa Éxito</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let stat of rendimientoMensual">
                      <td>{{ stat.periodo }}</td>
                      <td>
                        <span class="badge bg-primary">{{ stat.turnosRealizados }}</span>
                      </td>
                      <td>{{ stat.pacientesAtendidos }}</td>
                      <td>{{ stat.horasTrabajadas }}h</td>
                      <td>
                        <span class="badge" 
                              [class.bg-success]="calcularTasaExito(stat) >= 90"
                              [class.bg-warning]="calcularTasaExito(stat) >= 70 && calcularTasaExito(stat) < 90"
                              [class.bg-danger]="calcularTasaExito(stat) < 70">
                          {{ calcularTasaExito(stat) }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparativa -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-balance-scale me-2"></i>
                Comparativa vs Período Anterior
              </h6>
            </div>
            <div class="card-body">
              <div class="comparison-stats">
                <div class="comparison-item">
                  <div class="comparison-label">Turnos Realizados</div>
                  <div class="comparison-values">
                    <span class="current-value">{{ estadisticasActuales.turnosRealizados }}</span>
                    <span class="comparison-arrow" [class.text-success]="comparativas.turnosRealizados > 0" 
                          [class.text-danger]="comparativas.turnosRealizados < 0">
                      <i class="fas" [class.fa-arrow-up]="comparativas.turnosRealizados > 0" 
                         [class.fa-arrow-down]="comparativas.turnosRealizados < 0"></i>
                      {{ Math.abs(comparativas.turnosRealizados) }}%
                    </span>
                  </div>
                </div>

                <div class="comparison-item">
                  <div class="comparison-label">Pacientes Atendidos</div>
                  <div class="comparison-values">
                    <span class="current-value">{{ estadisticasActuales.pacientesAtendidos }}</span>
                    <span class="comparison-arrow" [class.text-success]="comparativas.pacientesAtendidos > 0" 
                          [class.text-danger]="comparativas.pacientesAtendidos < 0">
                      <i class="fas" [class.fa-arrow-up]="comparativas.pacientesAtendidos > 0" 
                         [class.fa-arrow-down]="comparativas.pacientesAtendidos < 0"></i>
                      {{ Math.abs(comparativas.pacientesAtendidos) }}%
                    </span>
                  </div>
                </div>

                <div class="comparison-item">
                  <div class="comparison-label">Horas Trabajadas</div>
                  <div class="comparison-values">
                    <span class="current-value">{{ estadisticasActuales.horasTrabajadas }}h</span>
                    <span class="comparison-arrow" [class.text-success]="comparativas.horasTrabajadas > 0" 
                          [class.text-danger]="comparativas.horasTrabajadas < 0">
                      <i class="fas" [class.fa-arrow-up]="comparativas.horasTrabajadas > 0" 
                         [class.fa-arrow-down]="comparativas.horasTrabajadas < 0"></i>
                      {{ Math.abs(comparativas.horasTrabajadas) }}%
                    </span>
                  </div>
                </div>

                <div class="comparison-item">
                  <div class="comparison-label">Tasa de Cancelación</div>
                  <div class="comparison-values">
                    <span class="current-value">{{ calcularTasaCancelacion() }}%</span>
                    <span class="comparison-arrow" [class.text-danger]="comparativas.tasaCancelacion > 0" 
                          [class.text-success]="comparativas.tasaCancelacion < 0">
                      <i class="fas" [class.fa-arrow-up]="comparativas.tasaCancelacion > 0" 
                         [class.fa-arrow-down]="comparativas.tasaCancelacion < 0"></i>
                      {{ Math.abs(comparativas.tasaCancelacion) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Actions -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-download me-2"></i>
                Exportar Estadísticas
              </h6>
            </div>
            <div class="card-body">
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-outline-success" (click)="exportarExcel()">
                  <i class="fas fa-file-excel me-2"></i>
                  Exportar Excel
                </button>
                <button class="btn btn-outline-danger" (click)="exportarPDF()">
                  <i class="fas fa-file-pdf me-2"></i>
                  Reporte PDF
                </button>
                <button class="btn btn-outline-primary" (click)="enviarPorEmail()">
                  <i class="fas fa-envelope me-2"></i>
                  Enviar por Email
                </button>
                <button class="btn btn-outline-info" (click)="programarReporte()">
                  <i class="fas fa-clock me-2"></i>
                  Programar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .stats-card:hover {
      transform: translateY(-2px);
    }

    .opacity-50 {
      opacity: 0.5 !important;
    }

    .chart-container {
      height: 300px;
      position: relative;
    }

    .chart-placeholder {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .chart-bars {
      display: flex;
      align-items: end;
      justify-content: center;
      gap: 10px;
      height: 80%;
      width: 90%;
    }

    .chart-bar {
      background: linear-gradient(to top, #007bff, #66b3ff);
      min-height: 20px;
      border-radius: 4px 4px 0 0;
      position: relative;
      flex: 1;
      max-width: 60px;
      display: flex;
      flex-direction: column;
      justify-content: end;
    }

    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-weight: bold;
      color: #333;
      font-size: 12px;
    }

    .bar-label {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%) rotate(-45deg);
      font-size: 10px;
      color: #666;
      white-space: nowrap;
      transform-origin: center;
    }

    .specialty-stats {
      max-height: 300px;
      overflow-y: auto;
    }

    .specialty-name {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .specialty-percentage {
      font-weight: bold;
      color: #007bff;
    }

    .progress {
      height: 8px;
    }

    .comparison-item {
      padding: 1rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .comparison-item:last-child {
      border-bottom: none;
    }

    .comparison-label {
      font-weight: 500;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    .comparison-values {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .current-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
    }

    .comparison-arrow {
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .table th {
      border-top: none;
      font-weight: 600;
      background-color: #f8f9fa;
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

    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
  `]
})
export class MedicoEstadisticasComponent implements OnInit {
  periodoSeleccionado = 'mes_actual';
  medicoData: any = null;
  especialidadMedico: string = '';
  
  estadisticasActuales: EstadisticasPeriodo = {
    periodo: 'Mes Actual',
    turnosRealizados: 0,
    turnosCancelados: 0,
    pacientesAtendidos: 0,
    horasTrabajadas: 0
  };

  evolutionData: EstadisticasPeriodo[] = [];
  especialidadesStats: EstadisticasEspecialidad[] = [];
  rendimientoMensual: EstadisticasPeriodo[] = [];

  comparativas = {
    turnosRealizados: 0,
    pacientesAtendidos: 0,
    horasTrabajadas: 0,
    tasaCancelacion: 0
  };

  periodosDisponibles = [
    { nombre: 'Esta Semana', valor: 'semana_actual' },
    { nombre: 'Este Mes', valor: 'mes_actual' },
    { nombre: 'Último Trimestre', valor: 'trimestre' },
    { nombre: 'Este Año', valor: 'ano_actual' }
  ];

  Math = Math; // Para usar Math en el template

  constructor(
    private router: Router, 
    private turnoService: TurnoService,
    private medicoService: MedicoService
  ) {}

  ngOnInit() {
    this.cargarDatosMedico();
  }

  cargarDatosMedico() {
    // Obtener datos del médico desde localStorage
    const medicoDataStr = localStorage.getItem('medicoData');
    if (medicoDataStr) {
      this.medicoData = JSON.parse(medicoDataStr);
      this.especialidadMedico = this.medicoData?.especialidad?.nombre || '';
      this.cargarEstadisticas();
    } else {
      // Fallback: obtener desde API si no está en localStorage
      const medicoId = localStorage.getItem('medicoId');
      if (medicoId && medicoId !== '0') {
        this.medicoService.findById(parseInt(medicoId, 10)).subscribe({
          next: (medico) => {
            this.medicoData = medico;
            this.especialidadMedico = medico?.especialidad?.nombre || '';
            this.cargarEstadisticas();
          },
          error: (error) => {
            console.error('Error al cargar datos del médico:', error);
            this.cargarEstadisticasConDatosPorDefecto();
          }
        });
      } else {
        console.warn('No hay medicoId válido en localStorage');
        this.cargarEstadisticasConDatosPorDefecto();
      }
    }
  }

  cargarEstadisticas() {
    const medicoId = this.getMedicoIdFromSession();
    
    // Cargar estadísticas reales de turnos del médico
    this.cargarEstadisticasTurnos(medicoId);
    
    // Para especialidades, mostrar solo la del médico logueado
    if (this.especialidadMedico) {
      this.especialidadesStats = [
        { 
          especialidad: this.especialidadMedico, 
          cantidad: 100, // Todos los turnos del médico son de su especialidad
          porcentaje: 100 
        }
      ];
    }
  }

  cargarEstadisticasTurnos(medicoId: number) {
    // Obtener estadísticas para el período actual
    const filtro = this.getFiltroParaPeriodo();
    
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      ...filtro,
      size: 1000
    }).subscribe({
      next: (response) => {
        const turnos = response.data || [];
        this.calcularEstadisticas(turnos);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de turnos:', error);
        this.cargarEstadisticasSimuladas(); // Fallback
      }
    });
  }

  calcularEstadisticas(turnos: any[]) {
    const turnosRealizados = turnos.filter(t => t.estado === 'COMPLETADO' || t.estado === 'CONFIRMADO').length;
    const turnosCancelados = turnos.filter(t => t.estado === 'CANCELADO').length;
    const pacientesUnicos = new Set(turnos.map(t => t.pacienteId)).size;
    
    this.estadisticasActuales = {
      periodo: this.getPeriodoNombre(),
      turnosRealizados,
      turnosCancelados,
      pacientesAtendidos: pacientesUnicos,
      horasTrabajadas: turnosRealizados * 0.75 // Estimación: 45 min por turno
    };
  }

  cargarEstadisticasSimuladas() {
    // Datos simulados como fallback
    this.estadisticasActuales = {
      periodo: this.getPeriodoNombre(),
      turnosRealizados: 89,
      turnosCancelados: 12,
      pacientesAtendidos: 67,
      horasTrabajadas: 156
    };
  }

  cargarEstadisticasConDatosPorDefecto() {
    this.especialidadMedico = 'Sin especialidad';
    this.especialidadesStats = [
      { 
        especialidad: 'Sin especialidad', 
        cantidad: 0, 
        porcentaje: 100 
      }
    ];
    this.cargarEstadisticasSimuladas();
  }

    this.rendimientoMensual = [
      { periodo: 'Enero', turnosRealizados: 75, turnosCancelados: 8, pacientesAtendidos: 58, horasTrabajadas: 140 },
      { periodo: 'Febrero', turnosRealizados: 82, turnosCancelados: 10, pacientesAtendidos: 62, horasTrabajadas: 148 },
      { periodo: 'Marzo', turnosRealizados: 89, turnosCancelados: 12, pacientesAtendidos: 67, horasTrabajadas: 156 }
    ];

    this.comparativas = {
      turnosRealizados: 8.5,
      pacientesAtendidos: 12.3,
      horasTrabajadas: 5.4,
      tasaCancelacion: -2.1
    };
  }

  seleccionarPeriodo(periodo: string) {
    this.periodoSeleccionado = periodo;
    this.cargarEstadisticas(); // Recargar con nuevo período
  }

  private getMedicoIdFromSession(): number {
    const medicoId = localStorage.getItem('medicoId');
    const parsedId = medicoId ? parseInt(medicoId, 10) : 0;
    
    // Si el ID es 0 o inválido, intentar obtenerlo de medicoData
    if (parsedId <= 0 && this.medicoData?.id) {
      return this.medicoData.id;
    }
    
    return parsedId > 0 ? parsedId : 1; // Fallback a 1 si todo falla
  }

  private getFiltroParaPeriodo(): any {
    const ahora = new Date();
    let filtro: any = {};

    switch (this.periodoSeleccionado) {
      case 'mes_actual':
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        filtro.fechaDesde = inicioMes.toISOString().split('T')[0];
        filtro.fechaHasta = finMes.toISOString().split('T')[0];
        break;
      
      case 'mes_anterior':
        const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
        filtro.fechaDesde = inicioMesAnterior.toISOString().split('T')[0];
        filtro.fechaHasta = finMesAnterior.toISOString().split('T')[0];
        break;
      
      case 'trimestre':
        const inicioTrimestre = new Date(ahora.getFullYear(), Math.floor(ahora.getMonth() / 3) * 3, 1);
        const finTrimestre = new Date(ahora.getFullYear(), Math.floor(ahora.getMonth() / 3) * 3 + 3, 0);
        filtro.fechaDesde = inicioTrimestre.toISOString().split('T')[0];
        filtro.fechaHasta = finTrimestre.toISOString().split('T')[0];
        break;
      
      case 'año':
        const inicioAño = new Date(ahora.getFullYear(), 0, 1);
        const finAño = new Date(ahora.getFullYear(), 11, 31);
        filtro.fechaDesde = inicioAño.toISOString().split('T')[0];
        filtro.fechaHasta = finAño.toISOString().split('T')[0];
        break;
    }

    return filtro;
  }

  getPeriodoNombre(): string {
    const periodo = this.periodosDisponibles.find(p => p.valor === this.periodoSeleccionado);
    return periodo ? periodo.nombre : 'Período Actual';
  }

  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
  }

  calcularTasaCancelacion(): number {
    const total = this.estadisticasActuales.turnosRealizados + this.estadisticasActuales.turnosCancelados;
    if (total === 0) return 0;
    return Math.round((this.estadisticasActuales.turnosCancelados / total) * 100);
  }

  calcularTasaExito(stat: EstadisticasPeriodo): number {
    const total = stat.turnosRealizados + stat.turnosCancelados;
    if (total === 0) return 0;
    return Math.round((stat.turnosRealizados / total) * 100);
  }

  getMaxTurnos(): number {
    return Math.max(...this.evolutionData.map(d => d.turnosRealizados), 1);
  }

  // Export methods
  exportarExcel() {
    console.log('Exportando estadísticas a Excel...');
    // TODO: Implement Excel export
  }

  exportarPDF() {
    console.log('Generando reporte PDF...');
    // TODO: Implement PDF report generation
  }

  enviarPorEmail() {
    console.log('Enviando estadísticas por email...');
    // TODO: Implement email functionality
  }

  programarReporte() {
    console.log('Programando reporte automático...');
    // TODO: Implement scheduled reports
  }
}