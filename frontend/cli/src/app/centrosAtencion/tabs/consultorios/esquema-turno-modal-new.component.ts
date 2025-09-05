import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EsquemaTurno } from '../../../esquemaTurno/esquemaTurno';
import { EsquemaTurnoService } from '../../../esquemaTurno/esquemaTurno.service';
import { Consultorio } from '../../../consultorios/consultorio';
import { StaffMedico } from '../../../staffMedicos/staffMedico';
import { DisponibilidadMedico } from '../../../disponibilidadMedicos/disponibilidadMedico';
import { DisponibilidadMedicoService } from '../../../disponibilidadMedicos/disponibilidadMedico.service';

@Component({
  selector: 'app-esquema-turno-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .interseccion-visual {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
    }
    
    .interseccion-step {
      margin-bottom: 25px;
      padding: 15px;
      border-left: 4px solid #007bff;
      background: white;
      border-radius: 0 8px 8px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .interseccion-title {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      color: #495057;
      font-weight: 600;
    }
    
    .interseccion-title.resultado {
      color: #28a745;
    }
    
    .step-number {
      background: #007bff;
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 10px;
    }
    
    .interseccion-resultado .step-number {
      background: #28a745;
    }
    
    .horarios-referencia {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .horario-ref {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 10px;
      min-width: 200px;
    }
    
    .horario-ref.ocupado {
      background: #fff3cd;
      border-color: #ffeaa7;
    }
    
    .medico-horarios .horario-ref {
      border-left: 4px solid #007bff;
    }
    
    .consultorio-horarios .horario-ref {
      border-left: 4px solid #28a745;
    }
    
    .esquemas-existentes .horario-ref {
      border-left: 4px solid #ffc107;
    }
    
    .horarios-tabla-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .table-success {
      background-color: rgba(40, 167, 69, 0.1) !important;
    }
    
    .controles-rapidos {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
    }
  `],
  template: `
    <!-- Modal Header -->
    <div class="modal-header">
      <h4 class="modal-title">
        <i class="fa fa-calendar-plus me-2"></i>
        Nuevo Esquema de Turno - {{ consultorio?.nombre }}
      </h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="onCancel()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="modal-body modal-esquema-body">
      <!-- Información del Consultorio -->
      <div class="consultorio-info p-3 mb-4 rounded">
        <div class="d-flex align-items-center">
          <div class="avatar-consultorio me-3">
            {{ consultorio?.nombre?.charAt(0) }}
          </div>
          <div>
            <h6 class="mb-1">{{ consultorio?.nombre }}</h6>
            <small class="text-muted">Consultorio #{{ consultorio?.numero }}</small>
          </div>
        </div>
      </div>

      <!-- Mensajes de Error/Éxito -->
      <div *ngIf="mensajeError" class="alert alert-danger alert-esquema">
        <i class="fa fa-exclamation-triangle me-2"></i>
        {{ mensajeError }}
      </div>

      <div *ngIf="mensajeExito" class="alert alert-success alert-esquema">
        <i class="fa fa-check-circle me-2"></i>
        {{ mensajeExito }}
      </div>

      <!-- Seleccionar Disponibilidad Médica -->
      <div class="form-group-modern mb-4">
        <label class="form-label-modern">
          <i class="fa fa-user-md me-2"></i>
          Seleccionar Disponibilidad Médica
        </label>
        <select 
          class="form-control form-control-modern"
          [(ngModel)]="esquema.disponibilidadMedicoId"
          name="disponibilidadMedico"
          (change)="onDisponibilidadChange()"
          required
        >
          <option [ngValue]="null">Seleccione una disponibilidad...</option>
          <option *ngFor="let disp of disponibilidadesDisponibles" [value]="disp.id">
            {{ disp.staffMedico?.medico?.nombre }} {{ disp.staffMedico?.medico?.apellido }} - 
            {{ disp.horarios.map(h => getDiaNombre(h.dia) + ' ' + h.horaInicio + '-' + h.horaFin).join(', ') }}
          </option>
        </select>
        <div class="form-help mt-2">
          <i class="fa fa-info-circle me-1 text-primary"></i>
          Solo se muestran disponibilidades de médicos asignados a este centro.
        </div>
      </div>

      <!-- Horarios del Consultorio -->
      <div class="form-group-modern mb-4">
        <label class="form-label-modern">
          <i class="fa fa-clock me-2"></i>
          Horarios de Atención del Consultorio
        </label>
        <div class="horarios-consultorio-info">
          <div *ngIf="consultorioHorarios.length > 0; else noHorariosConsultorio">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Hora Apertura</th>
                  <th>Hora Cierre</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let horario of consultorioHorarios">
                  <td>{{ getDiaNombre(horario.diaSemana) }}</td>
                  <td>{{ horario.horaInicio }}</td>
                  <td>{{ horario.horaFin }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="horario.activo" [class.badge-secondary]="!horario.activo">
                      {{ horario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noHorariosConsultorio>
            <p class="text-muted mb-0">
              <i class="fa fa-exclamation-triangle me-2"></i>
              Este consultorio no tiene horarios de atención configurados.
            </p>
          </ng-template>
        </div>
      </div>

      <!-- Esquemas Existentes -->
      <div class="form-group-modern mb-4">
        <label class="form-label-modern">
          <i class="fa fa-list me-2"></i>
          Esquemas Existentes en este Consultorio
        </label>
        <div class="horarios-consultorio-info">
          <div *ngIf="esquemasExistentes.length > 0; else noEsquemasExistentes">
            <div *ngFor="let esquema of esquemasExistentes" class="mb-2">
              <strong>{{ esquema.staffMedico?.medico?.nombre }} {{ esquema.staffMedico?.medico?.apellido }}</strong>
              <div class="small text-muted">
                <span *ngFor="let horario of esquema.horarios; let last = last">
                  {{ getDiaNombre(horario.dia) }} {{ horario.horaInicio }}-{{ horario.horaFin }}{{ !last ? ', ' : '' }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #noEsquemasExistentes>
            <p class="text-muted mb-0">
              <i class="fa fa-info-circle me-2"></i>
              No hay esquemas configurados para este consultorio.
            </p>
          </ng-template>
        </div>
      </div>

      <!-- Análisis de Intersección -->
      <div *ngIf="disponibilidadSeleccionada" class="form-group-modern mb-4">
        <label class="form-label-modern">
          <i class="fa fa-calculator me-2"></i>
          Análisis de Intersección de Horarios
        </label>
        
        <!-- Explicación del proceso -->
        <div class="alert alert-info">
          <i class="fa fa-info-circle me-2"></i>
          <strong>Proceso de cálculo:</strong> Se analizan automáticamente los horarios del médico, 
          del consultorio y los esquemas existentes para encontrar los períodos disponibles.
        </div>

        <!-- Visualización del proceso de intersección -->
        <div class="interseccion-visual">
          
          <!-- 1. Disponibilidad del Médico -->
          <div class="interseccion-step">
            <h6 class="interseccion-title">
              <span class="step-number">1</span>
              <i class="fa fa-user-md me-2"></i>
              Disponibilidad del Médico Seleccionado
            </h6>
            <div class="horarios-referencia medico-horarios">
              <div class="horario-ref">
                <strong>{{ disponibilidadSeleccionada.staffMedico?.medico?.nombre }} {{ disponibilidadSeleccionada.staffMedico?.medico?.apellido }}</strong>
                <br>
                <div *ngFor="let horario of disponibilidadSeleccionada.horarios">
                  <span class="badge bg-primary">{{ getDiaNombre(horario.dia) }}</span>
                  <span class="ms-2">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Horarios del Consultorio -->
          <div class="interseccion-step">
            <h6 class="interseccion-title">
              <span class="step-number">2</span>
              <i class="fa fa-building me-2"></i>
              Horarios de Atención del Consultorio
            </h6>
            <div class="horarios-referencia consultorio-horarios">
              <div *ngFor="let horario of consultorioHorarios" class="horario-ref">
                <span class="badge bg-success">{{ getDiaNombre(horario.diaSemana) }}</span>
                <span class="ms-2">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                <span class="badge bg-light text-dark ms-2">{{ horario.estado }}</span>
              </div>
              <div *ngIf="consultorioHorarios.length === 0" class="text-muted">
                <i class="fa fa-exclamation-triangle me-2"></i>
                No hay horarios configurados para este consultorio
              </div>
            </div>
          </div>

          <!-- 3. Esquemas Existentes -->
          <div class="interseccion-step">
            <h6 class="interseccion-title">
              <span class="step-number">3</span>
              <i class="fa fa-calendar-times me-2"></i>
              Esquemas ya Ocupados en este Consultorio
            </h6>
            <div class="horarios-referencia esquemas-existentes">
              <div *ngFor="let esquema of esquemasExistentes" class="horario-ref ocupado">
                <strong>{{ esquema.staffMedico?.medico?.nombre }} {{ esquema.staffMedico?.medico?.apellido }}</strong>
                <br>
                <span *ngFor="let horario of esquema.horarios; let last = last" class="me-1">
                  <span class="badge bg-warning text-dark">{{ getDiaNombre(horario.dia) }}</span>
                  <span class="ms-1">{{ horario.horaInicio }}-{{ horario.horaFin }}</span>{{ !last ? ', ' : '' }}
                </span>
              </div>
              <div *ngIf="esquemasExistentes.length === 0" class="text-muted">
                <i class="fa fa-check-circle me-2"></i>
                No hay esquemas ocupando horarios en este consultorio
              </div>
            </div>
          </div>

          <!-- Resultado de la Intersección -->
          <div class="interseccion-resultado">
            <h6 class="interseccion-title resultado">
              <span class="step-number">⚡</span>
              <i class="fa fa-check-double me-2"></i>
              Horarios Disponibles Resultantes
            </h6>
            
            <div *ngIf="horariosDisponibles.length > 0; else noResultados" class="horarios-tabla-container">
              <div class="alert alert-success">
                <i class="fa fa-lightbulb me-2"></i>
                <strong>{{ horariosDisponibles.length }} horario(s) disponible(s)</strong> encontrado(s) para asignar al esquema.
                Seleccione los que desea incluir:
              </div>
              
              <!-- Tabla de horarios disponibles para seleccionar -->
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead class="table-primary">
                    <tr>
                      <th width="50">
                        <input type="checkbox" 
                               class="form-check-input"
                               [checked]="todosSeleccionados()"
                               [indeterminate]="algunosSeleccionados()"
                               (change)="toggleTodosSeleccionados()">
                      </th>
                      <th>Día</th>
                      <th>Hora Inicio</th>
                      <th>Hora Fin</th>
                      <th>Duración</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let horario of horariosDisponibles; let i = index"
                        [class.table-success]="isHorarioSeleccionado(horario)">
                      <td>
                        <input type="checkbox" 
                               class="form-check-input"
                               [checked]="isHorarioSeleccionado(horario)"
                               (change)="toggleHorarioSeleccionado(horario, null)">
                      </td>
                      <td>
                        <span class="badge bg-primary">{{ getDiaNombre(horario.dia) }}</span>
                      </td>
                      <td>{{ horario.horaInicio }}</td>
                      <td>{{ horario.horaFin }}</td>
                      <td>
                        <span class="badge bg-info">{{ calcularDuracion(horario.horaInicio, horario.horaFin) }}</span>
                      </td>
                      <td>
                        <button type="button" 
                                class="btn btn-sm"
                                [class]="isHorarioSeleccionado(horario) ? 'btn-warning' : 'btn-success'"
                                (click)="toggleHorarioSeleccionado(horario, null)">
                          <i class="fa" [class]="isHorarioSeleccionado(horario) ? 'fa-minus' : 'fa-plus'"></i>
                          {{ isHorarioSeleccionado(horario) ? 'Quitar' : 'Agregar' }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Controles rápidos -->
              <div class="controles-rapidos mt-3">
                <button type="button" 
                        class="btn btn-success me-2"
                        (click)="seleccionarTodos()"
                        [disabled]="todosSeleccionados()">
                  <i class="fa fa-check-double me-2"></i>
                  Seleccionar Todos
                </button>
                <button type="button" 
                        class="btn btn-warning"
                        (click)="limpiarTodos()"
                        [disabled]="ningunoSeleccionado()">
                  <i class="fa fa-eraser me-2"></i>
                  Limpiar Selección
                </button>
              </div>
            </div>

            <ng-template #noResultados>
              <div class="alert alert-warning">
                <i class="fa fa-exclamation-triangle me-2"></i>
                <strong>No hay horarios disponibles</strong>
                <div class="mt-2">
                  <div *ngIf="!disponibilidadSeleccionada">
                    → Seleccione primero una disponibilidad médica.
                  </div>
                  <div *ngIf="disponibilidadSeleccionada && consultorioHorarios.length === 0">
                    → El consultorio no tiene horarios de atención configurados.
                  </div>
                  <div *ngIf="disponibilidadSeleccionada && consultorioHorarios.length > 0">
                    → No hay intersección entre la disponibilidad del médico y los horarios del consultorio, 
                    o todos los horarios están ocupados por otros esquemas.
                  </div>
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Configuración del Esquema -->
      <div *ngIf="esquema.horarios.length > 0" class="form-group-modern mb-4">
        <label class="form-label-modern">
          <i class="fa fa-cog me-2"></i>
          Configuración del Esquema
        </label>
        
        <div class="row">
          <div class="col-12">
            <label class="form-label-small">Intervalo de Turnos (minutos)</label>
            <select 
              [(ngModel)]="esquema.intervalo"
              name="intervalo"
              class="form-control form-control-sm"
              required
            >
              <option value="15">15 minutos</option>
              <option value="20">20 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </select>
          </div>
        </div>

        <!-- Resumen de Turnos -->
        <div class="resumen-turnos mt-3">
          <div class="resumen-item">
            <span class="resumen-label">Total de horarios seleccionados:</span>
            <span class="resumen-valor">{{ esquema.horarios.length }}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">Tiempo total disponible:</span>
            <span class="resumen-valor">{{ calcularTiempoTotal() }} minutos</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">Turnos estimados ({{ esquema.intervalo }}min):</span>
            <span class="resumen-valor">{{ calcularTurnosEstimados() }} turnos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="onCancel()">
        <i class="fa fa-times me-2"></i>
        Cancelar
      </button>
      <button 
        type="button" 
        class="btn btn-success btn-crear-esquema"
        (click)="guardarEsquema()"
        [disabled]="!puedeGuardar() || guardando"
      >
        <i class="fa" [class.fa-save]="!guardando" [class.fa-spinner]="guardando" [class.fa-spin]="guardando"></i>
        {{ guardando ? 'Guardando...' : 'Crear Esquema' }}
      </button>
    </div>
  `
})
export class EsquemaTurnoModalComponent implements OnInit, AfterViewInit {
  @Input() consultorio!: Consultorio;
  @Input() centroId!: number;
  @Input() staffMedicos: StaffMedico[] = [];
  
  esquema: EsquemaTurno = {
    id: 0,
    consultorioId: 0,
    disponibilidadMedicoId: 0,
    staffMedicoId: 0,
    centroId: 0,
    horarios: [],
    intervalo: 30
  };

  disponibilidadesDisponibles: DisponibilidadMedico[] = [];
  disponibilidadSeleccionada: DisponibilidadMedico | null = null;
  consultorioHorarios: any[] = [];
  horariosDisponibles: any[] = [];
  esquemasExistentes: EsquemaTurno[] = [];
  
  mensajeError = '';
  mensajeExito = '';
  guardando = false;

  constructor(
    public activeModal: NgbActiveModal,
    private esquemaTurnoService: EsquemaTurnoService,
    private disponibilidadMedicoService: DisponibilidadMedicoService
  ) {}

  ngOnInit() {
    if (this.consultorio) {
      this.esquema.consultorioId = this.consultorio.id;
      console.log('Modal inicializado con consultorio:', this.consultorio);
      console.log('Centro ID:', this.centroId);
      console.log('Staff médicos recibidos:', this.staffMedicos);
    }
  }

  ngAfterViewInit() {
    // Cargar datos después de que la vista se inicialice
    setTimeout(() => {
      this.cargarDatos();
    }, 100);
  }

  private cargarDatos() {
    this.cargarDisponibilidades();
    this.cargarHorariosConsultorio();
    this.cargarEsquemasExistentes();
  }

  private cargarDisponibilidades() {
    console.log('Cargando disponibilidades para centro:', this.centroId);
    
    this.disponibilidadMedicoService.all().subscribe({
      next: (response: any) => {
        console.log('Disponibilidades recibidas del servidor:', response);
        
        if (response && response.data) {
          // Filtrar disponibilidades por centro
          this.disponibilidadesDisponibles = response.data.filter((disp: DisponibilidadMedico) => {
            const perteneceCentro = disp.staffMedico?.centroAtencionId === this.centroId;
            console.log(`Disponibilidad ${disp.id} - Centro: ${disp.staffMedico?.centroAtencionId}, ¿Pertenece?: ${perteneceCentro}`);
            return perteneceCentro;
          });
          
          console.log('Disponibilidades filtradas:', this.disponibilidadesDisponibles);
        }
      },
      error: (error: any) => {
        console.error('Error al cargar disponibilidades:', error);
        this.mensajeError = 'Error al cargar las disponibilidades médicas';
      }
    });
  }

  private cargarHorariosConsultorio() {
    // Simular horarios del consultorio
    this.consultorioHorarios = [
      { diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Martes', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Miércoles', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Jueves', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Viernes', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Sábado', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Domingo', horaInicio: '08:00', horaFin: '19:00', activo: true }
    ];
  }

  private cargarEsquemasExistentes() {
    if (this.consultorio && this.consultorio.id) {
      this.esquemaTurnoService.getByConsultorio(this.consultorio.id).subscribe({
        next: (response) => {
          this.esquemasExistentes = response.data || [];
          console.log('Esquemas existentes:', this.esquemasExistentes);
        },
        error: (error) => {
          console.error('Error al cargar esquemas existentes:', error);
        }
      });
    }
  }

  onDisponibilidadChange() {
    const disponibilidadId = this.esquema.disponibilidadMedicoId;
    console.log('Disponibilidad seleccionada ID:', disponibilidadId);
    
    if (disponibilidadId) {
      this.disponibilidadSeleccionada = this.disponibilidadesDisponibles.find(d => d.id === Number(disponibilidadId)) || null;
      console.log('Disponibilidad seleccionada:', this.disponibilidadSeleccionada);
      
      if (this.disponibilidadSeleccionada) {
        this.esquema.staffMedicoId = this.disponibilidadSeleccionada.staffMedicoId;
        this.calcularHorariosDisponibles();
      }
    } else {
      this.disponibilidadSeleccionada = null;
      this.horariosDisponibles = [];
    }
  }

  private calcularHorariosDisponibles() {
    if (!this.disponibilidadSeleccionada) {
      this.horariosDisponibles = [];
      return;
    }

    console.log('Calculando horarios disponibles...');
    console.log('Disponibilidad médica:', this.disponibilidadSeleccionada.horarios);
    console.log('Horarios consultorio:', this.consultorioHorarios);
    console.log('Esquemas existentes:', this.esquemasExistentes);

    // Intersección: horarios del médico que coinciden con horarios del consultorio
    const horariosInterseccion: any[] = [];
    
    for (const horarioMedico of this.disponibilidadSeleccionada.horarios) {
      const horarioConsultorio = this.consultorioHorarios.find(hc => 
        hc.diaSemana === horarioMedico.dia && hc.activo
      );
      
      if (horarioConsultorio) {
        // Calcular intersección de horarios
        const inicioMedico = this.timeToMinutes(horarioMedico.horaInicio);
        const finMedico = this.timeToMinutes(horarioMedico.horaFin);
        const inicioConsultorio = this.timeToMinutes(horarioConsultorio.horaInicio);
        const finConsultorio = this.timeToMinutes(horarioConsultorio.horaFin);
        
        const inicioInterseccion = Math.max(inicioMedico, inicioConsultorio);
        const finInterseccion = Math.min(finMedico, finConsultorio);
        
        if (inicioInterseccion < finInterseccion) {
          horariosInterseccion.push({
            dia: horarioMedico.dia,
            horaInicio: this.minutesToTime(inicioInterseccion),
            horaFin: this.minutesToTime(finInterseccion)
          });
        }
      }
    }

    // Filtrar horarios que no están ocupados por esquemas existentes
    this.horariosDisponibles = horariosInterseccion.filter(horario => {
      return !this.esQuemasOcupanHorario(horario);
    });

    console.log('Horarios disponibles calculados:', this.horariosDisponibles);
  }

  private esQuemasOcupanHorario(horario: any): boolean {
    for (const esquema of this.esquemasExistentes) {
      for (const horarioEsquema of esquema.horarios) {
        if (horarioEsquema.dia === horario.dia) {
          const inicioNuevo = this.timeToMinutes(horario.horaInicio);
          const finNuevo = this.timeToMinutes(horario.horaFin);
          const inicioExistente = this.timeToMinutes(horarioEsquema.horaInicio);
          const finExistente = this.timeToMinutes(horarioEsquema.horaFin);
          
          // Verificar si hay solapamiento
          if (inicioNuevo < finExistente && finNuevo > inicioExistente) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  getDiaNombre(dia: string): string {
    const nombres: { [key: string]: string } = {
      'Lunes': 'Lunes',
      'Martes': 'Martes',
      'Miércoles': 'Miércoles',
      'Jueves': 'Jueves',
      'Viernes': 'Viernes',
      'Sábado': 'Sábado',
      'Domingo': 'Domingo'
    };
    return nombres[dia] || dia;
  }

  // Métodos para el manejo de selección de horarios
  isHorarioSeleccionado(horario: any): boolean {
    return this.esquema.horarios.some(h => 
      h.dia === horario.dia && 
      h.horaInicio === horario.horaInicio && 
      h.horaFin === horario.horaFin
    );
  }

  toggleHorarioSeleccionado(horario: any, event: any) {
    if (event) {
      event.preventDefault();
    }
    
    if (this.isHorarioSeleccionado(horario)) {
      // Quitar el horario
      const index = this.esquema.horarios.findIndex(h => 
        h.dia === horario.dia && 
        h.horaInicio === horario.horaInicio && 
        h.horaFin === horario.horaFin
      );
      if (index > -1) {
        this.esquema.horarios.splice(index, 1);
      }
    } else {
      // Agregar el horario
      this.esquema.horarios.push({
        dia: horario.dia,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      });
    }
  }

  seleccionarTodos() {
    for (const horario of this.horariosDisponibles) {
      if (!this.isHorarioSeleccionado(horario)) {
        this.esquema.horarios.push({
          dia: horario.dia,
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin
        });
      }
    }
  }

  limpiarTodos() {
    this.esquema.horarios = [];
  }

  todosSeleccionados(): boolean {
    return this.horariosDisponibles.length > 0 && 
           this.horariosDisponibles.every(horario => this.isHorarioSeleccionado(horario));
  }

  ningunoSeleccionado(): boolean {
    return this.esquema.horarios.length === 0;
  }

  algunosSeleccionados(): boolean {
    return this.esquema.horarios.length > 0 && !this.todosSeleccionados();
  }

  toggleTodosSeleccionados() {
    if (this.todosSeleccionados()) {
      this.limpiarTodos();
    } else {
      this.seleccionarTodos();
    }
  }

  calcularDuracion(horaInicio: string, horaFin: string): string {
    const inicio = this.timeToMinutes(horaInicio);
    const fin = this.timeToMinutes(horaFin);
    const duracion = fin - inicio;
    
    if (duracion >= 60) {
      const horas = Math.floor(duracion / 60);
      const minutos = duracion % 60;
      return minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
    } else {
      return `${duracion}m`;
    }
  }

  calcularTiempoTotal(): number {
    return this.esquema.horarios.reduce((total, horario) => {
      const inicio = this.timeToMinutes(horario.horaInicio);
      const fin = this.timeToMinutes(horario.horaFin);
      return total + (fin - inicio);
    }, 0);
  }

  calcularTurnosEstimados(): number {
    const totalMinutos = this.calcularTiempoTotal();
    return Math.floor(totalMinutos / this.esquema.intervalo);
  }

  puedeGuardar(): boolean {
    return this.esquema.disponibilidadMedicoId > 0 &&
           this.esquema.horarios.length > 0 &&
           this.esquema.intervalo > 0;
  }

  guardarEsquema(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.puedeGuardar()) {
      this.mensajeError = 'Complete todos los campos requeridos y seleccione al menos un horario.';
      return;
    }

    this.guardando = true;

    // Crear el esquema
    this.esquemaTurnoService.create(this.esquema).subscribe({
      next: (response) => {
        this.guardando = false;
        this.mensajeExito = 'Esquema de turno creado exitosamente';
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          this.activeModal.close(response.data);
        }, 1000);
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al crear el esquema:', error);
        this.mensajeError = error?.error?.message || 'Error al crear el esquema de turno. Intente nuevamente.';
      }
    });
  }

  onCancel() {
    this.activeModal.dismiss();
  }
}
