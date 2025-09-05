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
        Gestionar Esquema de Turno - {{ consultorio?.nombre }}
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

      <!-- Panel de Validación de Conflictos -->
      <div *ngIf="validandoConflictos" class="alert alert-info alert-esquema">
        <i class="fa fa-spinner fa-spin me-2"></i>
        Validando conflictos de horarios...
      </div>

      <div *ngIf="conflictosDetectados && tieneConflictos" class="alert alert-warning alert-esquema">
        <div class="d-flex align-items-start">
          <i class="fa fa-exclamation-triangle me-2 mt-1"></i>
          <div>
            <strong>⚠️ Conflictos detectados:</strong>
            
            <!-- Nueva estructura: conflictos array principal -->
            <div *ngIf="conflictosDetectados.conflictos?.length > 0" class="mt-2">
              <small class="fw-bold">🚫 Conflictos:</small>
              <ul class="mb-2 mt-1">
                <li *ngFor="let conflicto of conflictosDetectados.conflictos" class="small">
                  {{ conflicto }}
                </li>
              </ul>
            </div>

            <!-- Advertencias -->
            <div *ngIf="conflictosDetectados.advertencias?.length > 0" class="mt-2">
              <small class="fw-bold">⚠️ Advertencias:</small>
              <ul class="mb-2 mt-1">
                <li *ngFor="let advertencia of conflictosDetectados.advertencias" class="small">
                  {{ advertencia }}
                </li>
              </ul>
            </div>

            <!-- Estructura anterior por compatibilidad -->
            <div *ngIf="conflictosDetectados.conflictosMedico?.length > 0" class="mt-2">
              <small class="fw-bold">👨‍⚕️ Conflictos del médico:</small>
              <ul class="mb-2 mt-1">
                <li *ngFor="let conflicto of conflictosDetectados.conflictosMedico" class="small">
                  {{ conflicto }}
                </li>
              </ul>
            </div>

            <div *ngIf="conflictosDetectados.conflictosConsultorio?.length > 0" class="mt-2">
              <small class="fw-bold">🏥 Conflictos del consultorio:</small>
              <ul class="mb-2 mt-1">
                <li *ngFor="let conflicto of conflictosDetectados.conflictosConsultorio" class="small">
                  {{ conflicto }}
                </li>
              </ul>
            </div>

            <div *ngIf="conflictosDetectados.erroresValidacion?.length > 0" class="mt-2">
              <small class="fw-bold">❌ Errores de validación:</small>
              <ul class="mb-0 mt-1">
                <li *ngFor="let error of conflictosDetectados.erroresValidacion" class="small">
                  {{ error }}
                </li>
              </ul>
            </div>

            <div class="mt-2">
              <small class="text-muted">
                El sistema detectó estos conflictos. Se mostrará un diálogo de confirmación al guardar.
              </small>
            </div>
          </div>
        </div>
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
            {{ formatearHorarios(disp.horarios) }}
          </option>
        </select>
        <div class="form-help mt-2">
          <i class="fa fa-info-circle me-1 text-primary"></i>
          Solo se muestran disponibilidades de médicos asignados a este centro.
          <br>
          <i class="fa fa-magic me-1 text-success"></i>
          <strong>Smart Update:</strong> Si ya existe esquema para este médico, se agregará a los horarios existentes.
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
              Horarios ocupados
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
        [disabled]="!puedeGuardar() || guardando || validandoConflictos"
      >
        <i class="fa" 
           [class.fa-save]="!guardando && !validandoConflictos" 
           [class.fa-spinner]="guardando || validandoConflictos" 
           [class.fa-spin]="guardando || validandoConflictos"></i>
        {{ validandoConflictos ? 'Validando...' : (guardando ? 'Guardando...' : 'Crear Esquema') }}
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
  
  // Validación de conflictos
  validandoConflictos = false;
  conflictosDetectados: any = null;
  tieneConflictos = false;

  constructor(
    public activeModal: NgbActiveModal,
    private esquemaTurnoService: EsquemaTurnoService,
    private disponibilidadMedicoService: DisponibilidadMedicoService
  ) {}

  ngOnInit() {
    console.log('🔄 ngOnInit - Iniciando modal esquema');
    console.log('📋 Datos recibidos:', {
      consultorio: this.consultorio,
      centroId: this.centroId,
      staffMedicos: this.staffMedicos?.length || 0
    });
    
    if (this.consultorio) {
      this.esquema.consultorioId = this.consultorio.id;
      console.log('✅ Consultorio configurado:', this.consultorio);
    } else {
      console.error('❌ No se recibió consultorio en el modal');
    }
    
    if (this.centroId) {
      this.esquema.centroId = this.centroId;
      console.log('🏥 Centro ID configurado:', this.centroId);
    } else {
      console.error('❌ No se recibió centroId en el modal');
    }
    
    console.log('👥 Staff médicos recibidos:', this.staffMedicos?.length || 0);
    console.log('📋 Esquema inicial configurado:', this.esquema);
  }

  ngAfterViewInit() {
    // Cargar datos después de que la vista se inicialice
    setTimeout(() => {
      this.cargarDatos();
    }, 100);
  }

  private cargarDatos() {
    console.log('🔄 Cargando datos del modal...');
    console.log('📊 Estado actual:', {
      centroId: this.centroId,
      consultorio: this.consultorio?.id,
      staffMedicos: this.staffMedicos?.length || 0
    });
    
    this.cargarDisponibilidades();
    this.cargarHorariosConsultorio();
    this.cargarEsquemasExistentes();
  }

  private cargarDisponibilidades() {
    console.log('🏥 Cargando disponibilidades para centro:', this.centroId);
    
    if (!this.centroId) {
      console.error('❌ No se proporcionó centroId - no se pueden cargar disponibilidades');
      this.mensajeError = 'Error: No se pudo identificar el centro de atención';
      return;
    }
    
    if (!this.staffMedicos || this.staffMedicos.length === 0) {
      console.error('❌ No se proporcionaron staffMedicos - no se pueden filtrar disponibilidades');
      this.mensajeError = 'Error: No se encontró personal médico para este centro';
      return;
    }
    
    this.disponibilidadMedicoService.all().subscribe({
      next: (response: any) => {
        console.log('📥 Disponibilidades recibidas del servidor:', response);
        
        if (response && response.data) {
          console.log('📋 Total disponibilidades recibidas:', response.data.length);
          console.log('👥 Staff médicos disponibles en el centro:', this.staffMedicos.map(s => ({id: s.id, medico: s.medico?.nombre + ' ' + s.medico?.apellido})));
          
          // Crear un mapa de staffMedicoId -> staffMedico para búsqueda rápida
          const staffMedicoMap = new Map();
          this.staffMedicos.forEach(staff => {
            staffMedicoMap.set(staff.id, staff);
          });
          
          // Filtrar y enriquecer disponibilidades
          this.disponibilidadesDisponibles = response.data
            .filter((disp: DisponibilidadMedico) => {
              const staffMedico = staffMedicoMap.get(disp.staffMedicoId);
              const perteneceCentro = staffMedico !== undefined;
              
              console.log(`🔍 Disponibilidad ${disp.id}:`, {
                staffMedicoId: disp.staffMedicoId,
                staffEncontrado: !!staffMedico,
                medicoNombre: staffMedico?.medico?.nombre + ' ' + staffMedico?.medico?.apellido,
                pertenece: perteneceCentro
              });
              
              return perteneceCentro;
            })
            .map((disp: DisponibilidadMedico) => {
              // Enriquecer la disponibilidad con el objeto staffMedico completo
              const staffMedico = staffMedicoMap.get(disp.staffMedicoId);
              return {
                ...disp,
                staffMedico: staffMedico
              };
            });
          
          console.log('✅ Disponibilidades filtradas para este centro:', this.disponibilidadesDisponibles.length);
          console.log('📋 Disponibilidades disponibles:', this.disponibilidadesDisponibles);
        } else {
          console.warn('⚠️ Respuesta sin datos válidos');
          this.disponibilidadesDisponibles = [];
        }
      },
      error: (error: any) => {
        console.error('❌ Error al cargar disponibilidades:', error);
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
        
        // Validar conflictos en tiempo real cuando cambia la disponibilidad
        this.validarConflictosEnTiempoReal();
      }
    } else {
      this.disponibilidadSeleccionada = null;
      this.horariosDisponibles = [];
      this.limpiarConflictos();
    }
  }

  private calcularHorariosDisponibles() {
    if (!this.disponibilidadSeleccionada) {
      this.horariosDisponibles = [];
      return;
    }

    console.log('🔄 Calculando horarios disponibles...');
    console.log('👨‍⚕️ Disponibilidad médica:', this.disponibilidadSeleccionada.horarios);
    console.log('🏥 Horarios consultorio:', this.consultorioHorarios);
    console.log('📅 Esquemas existentes:', this.esquemasExistentes);

    // Intersección: horarios del médico que coinciden con horarios del consultorio
    const horariosInterseccion: any[] = [];
    
    for (const horarioMedico of this.disponibilidadSeleccionada.horarios) {
      console.log(`🔍 Procesando horario médico:`, horarioMedico);
      
      // Normalizar el día para la comparación
      const diaMedicoNormalizado = this.normalizarDia(horarioMedico.dia);
      console.log(`📅 Día médico normalizado: "${diaMedicoNormalizado}"`);
      
      const horarioConsultorio = this.consultorioHorarios.find(hc => {
        const diaConsultorioNormalizado = this.normalizarDia(hc.diaSemana);
        console.log(`🔄 Comparando "${diaConsultorioNormalizado}" === "${diaMedicoNormalizado}"`);
        return diaConsultorioNormalizado === diaMedicoNormalizado && hc.activo;
      });
      
      console.log(`🏥 Horario consultorio encontrado:`, horarioConsultorio);
      
      if (horarioConsultorio) {
        // Calcular intersección de horarios
        const inicioMedico = this.timeToMinutes(horarioMedico.horaInicio);
        const finMedico = this.timeToMinutes(horarioMedico.horaFin);
        const inicioConsultorio = this.timeToMinutes(horarioConsultorio.horaInicio);
        const finConsultorio = this.timeToMinutes(horarioConsultorio.horaFin);
        
        console.log(`⏰ Tiempos en minutos:`, {
          medico: `${inicioMedico}-${finMedico}`,
          consultorio: `${inicioConsultorio}-${finConsultorio}`
        });
        
        const inicioInterseccion = Math.max(inicioMedico, inicioConsultorio);
        const finInterseccion = Math.min(finMedico, finConsultorio);
        
        console.log(`🔄 Intersección: ${inicioInterseccion}-${finInterseccion}`);
        
        if (inicioInterseccion < finInterseccion) {
          const horarioInterseccion = {
            dia: horarioMedico.dia,
            horaInicio: this.minutesToTime(inicioInterseccion),
            horaFin: this.minutesToTime(finInterseccion)
          };
          
          console.log(`✅ Intersección válida:`, horarioInterseccion);
          horariosInterseccion.push(horarioInterseccion);
        } else {
          console.log(`❌ No hay intersección válida`);
        }
      } else {
        console.log(`❌ No se encontró horario de consultorio para ${diaMedicoNormalizado}`);
      }
    }

    console.log('🔄 Horarios con intersección:', horariosInterseccion);

    // Filtrar horarios que no están ocupados por esquemas existentes
    this.horariosDisponibles = horariosInterseccion.filter(horario => {
      const estaOcupado = this.esQuemasOcupanHorario(horario);
      console.log(`🔍 Horario ${horario.dia} ${horario.horaInicio}-${horario.horaFin} está ocupado: ${estaOcupado}`);
      return !estaOcupado;
    });

    console.log('✅ Horarios disponibles finales:', this.horariosDisponibles);
  }

  private normalizarDia(dia: string): string {
    // Normalizar y limpiar el nombre del día
    const diasMap: { [key: string]: string } = {
      'lunes': 'Lunes',
      'martes': 'Martes', 
      'miercoles': 'Miércoles',
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sabado': 'Sábado',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    
    const diaLimpio = dia.toLowerCase().trim();
    return diasMap[diaLimpio] || dia;
  }

  private esQuemasOcupanHorario(horario: any): boolean {
    console.log(`🔍 Verificando si horario ${horario.dia} ${horario.horaInicio}-${horario.horaFin} está ocupado...`);
    
    for (const esquema of this.esquemasExistentes) {
      console.log(`📋 Revisando esquema:`, esquema);
      
      for (const horarioEsquema of esquema.horarios) {
        console.log(`⏰ Comparando con horario de esquema:`, horarioEsquema);
        
        // Normalizar días para comparación
        const diaNuevo = this.normalizarDia(horario.dia);
        const diaExistente = this.normalizarDia(horarioEsquema.dia);
        
        console.log(`📅 Comparando días: "${diaNuevo}" vs "${diaExistente}"`);
        
        if (diaExistente === diaNuevo) {
          const inicioNuevo = this.timeToMinutes(horario.horaInicio);
          const finNuevo = this.timeToMinutes(horario.horaFin);
          const inicioExistente = this.timeToMinutes(horarioEsquema.horaInicio);
          const finExistente = this.timeToMinutes(horarioEsquema.horaFin);
          
          console.log(`⏰ Comparando tiempos:`, {
            nuevo: `${inicioNuevo}-${finNuevo}`,
            existente: `${inicioExistente}-${finExistente}`
          });
          
          // Verificar si hay solapamiento
          const haySolapamiento = inicioNuevo < finExistente && finNuevo > inicioExistente;
          console.log(`🔄 ¿Hay solapamiento? ${haySolapamiento}`);
          
          if (haySolapamiento) {
            console.log(`❌ CONFLICTO ENCONTRADO: El horario está ocupado por esquema ${esquema.id}`);
            return true;
          }
        }
      }
    }
    
    console.log(`✅ Horario está libre`);
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

  formatearHorarios(horarios: { dia: string; horaInicio: string; horaFin: string }[]): string {
    return horarios.map(h => this.getDiaNombre(h.dia) + ' ' + h.horaInicio + '-' + h.horaFin).join(', ');
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
    
    const estaSeleccionado = this.isHorarioSeleccionado(horario);
    
    if (estaSeleccionado) {
      // Quitar el horario
      const index = this.esquema.horarios.findIndex(h => 
        h.dia === horario.dia && 
        h.horaInicio === horario.horaInicio && 
        h.horaFin === horario.horaFin
      );
      if (index > -1) {
        this.esquema.horarios.splice(index, 1);
        console.log('✅ Horario removido:', horario);
      }
      
      // Validar conflictos después de remover
      this.validarConflictosEnTiempoReal();
    } else {
      // Agregar el horario y validar conflictos específicos
      const nuevoHorario = {
        dia: horario.dia,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      };
      
      this.esquema.horarios.push(nuevoHorario);
      console.log('➕ Horario agregado:', nuevoHorario);
      
      // Validar este horario específico para conflictos inmediatos
      this.validarConflictoHorario(nuevoHorario);
    }
  }

  seleccionarTodos() {
    const horariosIniciales = [...this.esquema.horarios];
    
    for (const horario of this.horariosDisponibles) {
      if (!this.isHorarioSeleccionado(horario)) {
        const nuevoHorario = {
          dia: horario.dia,
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin
        };
        
        this.esquema.horarios.push(nuevoHorario);
        
        // Validar inmediatamente este horario para conflictos
        // Nota: esto podría mostrar múltiples alertas si hay varios conflictos
        this.validarConflictoHorario(nuevoHorario);
      }
    }
    
    console.log('📋 Selección masiva completada. Horarios agregados:', this.esquema.horarios.length - horariosIniciales.length);
  }

  limpiarTodos() {
    this.esquema.horarios = [];
    // Limpiar conflictos cuando se limpian todos los horarios
    this.limpiarConflictos();
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

    // Asegurar que todos los IDs estén configurados correctamente
    if (this.centroId) {
      this.esquema.centroId = this.centroId;
    }
    
    if (this.consultorio) {
      this.esquema.consultorioId = this.consultorio.id;
    }

    console.log('💾 Guardando esquema con datos:', this.esquema);
    console.log('🔍 Verificación de IDs:', {
      centroId: this.esquema.centroId,
      consultorioId: this.esquema.consultorioId,
      disponibilidadMedicoId: this.esquema.disponibilidadMedicoId,
      staffMedicoId: this.esquema.staffMedicoId,
      horariosCount: this.esquema.horarios.length
    });

    // Primero validar conflictos
    this.validarConflictosAntesDeGuardar();
  }

  /**
   * Valida conflictos antes de guardar el esquema
   */
  private validarConflictosAntesDeGuardar(): void {
    this.validandoConflictos = true;
    this.conflictosDetectados = null;
    this.tieneConflictos = false;

    console.log('🔍 Validando conflictos antes de guardar...');

    this.esquemaTurnoService.validarConflictos(this.esquema).subscribe({
      next: (response) => {
        this.validandoConflictos = false;
        console.log('✅ Respuesta de validación:', response);

        // El backend siempre devuelve status 200, verificamos el contenido de data
        if (response.data) {
          const validacion = response.data;
          
          if (validacion.valido) {
            // No hay conflictos, proceder con el guardado
            console.log('✅ Sin conflictos detectados, procediendo a guardar');
            this.procederConGuardado();
          } else {
            // Hay conflictos, mostrar advertencias
            this.conflictosDetectados = validacion;
            this.tieneConflictos = true;
            this.mostrarConflictos(validacion);
          }
        } else {
          console.error('❌ Error en validación:', response);
          this.mensajeError = 'Error al validar conflictos - respuesta inválida';
        }
      },
      error: (error) => {
        this.validandoConflictos = false;
        console.error('❌ Error al validar conflictos:', error);
        this.mensajeError = 'Error al validar conflictos. Inténtelo nuevamente.';
      }
    });
  }

  /**
   * Muestra los conflictos detectados al usuario
   */
  private mostrarConflictos(validacion: any): void {
    let mensajeConflictos = '⚠️ Se detectaron conflictos:\n\n';

    // La nueva estructura del backend devuelve un array simple de conflictos
    if (validacion.conflictos && validacion.conflictos.length > 0) {
      mensajeConflictos += '🚫 Conflictos detectados:\n';
      validacion.conflictos.forEach((conflicto: any) => {
        mensajeConflictos += `• ${conflicto}\n`;
      });
      mensajeConflictos += '\n';
    }

    // También verificar si hay advertencias
    if (validacion.advertencias && validacion.advertencias.length > 0) {
      mensajeConflictos += '⚠️ Advertencias:\n';
      validacion.advertencias.forEach((advertencia: any) => {
        mensajeConflictos += `• ${advertencia}\n`;
      });
      mensajeConflictos += '\n';
    }

    // Mantener compatibilidad con estructura anterior por si acaso
    if (validacion.conflictosMedico && validacion.conflictosMedico.length > 0) {
      mensajeConflictos += '👨‍⚕️ Conflictos del médico:\n';
      validacion.conflictosMedico.forEach((conflicto: any) => {
        mensajeConflictos += `• ${conflicto}\n`;
      });
      mensajeConflictos += '\n';
    }

    if (validacion.conflictosConsultorio && validacion.conflictosConsultorio.length > 0) {
      mensajeConflictos += '🏥 Conflictos del consultorio:\n';
      validacion.conflictosConsultorio.forEach((conflicto: any) => {
        mensajeConflictos += `• ${conflicto}\n`;
      });
      mensajeConflictos += '\n';
    }

    if (validacion.erroresValidacion && validacion.erroresValidacion.length > 0) {
      mensajeConflictos += '❌ Errores de validación:\n';
      validacion.erroresValidacion.forEach((error: any) => {
        mensajeConflictos += `• ${error}\n`;
      });
      mensajeConflictos += '\n';
    }

    mensajeConflictos += '\n¿Desea continuar de todas formas?';

    if (confirm(mensajeConflictos)) {
      console.log('👤 Usuario decidió continuar a pesar de los conflictos');
      this.procederConGuardado();
    } else {
      console.log('👤 Usuario canceló debido a conflictos');
      this.guardando = false;
    }
  }

  /**
   * Procede con el guardado después de validar conflictos
   */
  private procederConGuardado(): void {
    this.guardando = true;
    // Verificar si ya existe un esquema para esta combinación médico-consultorio
    this.verificarEsquemaExistente();
  }

  private verificarEsquemaExistente(): void {
    console.log('🔍 Verificando esquemas existentes para consultorio:', this.consultorio.id);
    
    if (!this.consultorio?.id) {
      console.error('❌ No se puede verificar esquemas sin consultorio válido');
      this.crearNuevoEsquema();
      return;
    }
    
    this.esquemaTurnoService.getByConsultorio(this.consultorio.id).subscribe({
      next: (response) => {
        console.log('📋 Esquemas en consultorio:', response.data);
        
        // Buscar si hay un esquema existente para el mismo médico (staffMedicoId)
        const esquemaExistente = response.data?.find(esquema => 
          esquema.staffMedicoId === this.esquema.staffMedicoId
        );
        
        if (esquemaExistente) {
          console.log('✏️ Encontrado esquema existente para el mismo médico:', esquemaExistente);
          this.actualizarEsquemaExistente(esquemaExistente);
        } else {
          console.log('📝 No hay esquema existente para este médico, creando nuevo');
          this.crearNuevoEsquema();
        }
      },
      error: (error) => {
        console.error('❌ Error al verificar esquemas existentes:', error);
        // En caso de error, intentar crear directamente
        this.crearNuevoEsquema();
      }
    });
  }

  private actualizarEsquemaExistente(esquemaExistente: EsquemaTurno): void {
    console.log('🔄 Actualizando esquema existente:', esquemaExistente.id);
    
    // Combinar horarios existentes con los nuevos (evitando duplicados exactos)
    const horariosExistentes = esquemaExistente.horarios || [];
    const horariosNuevos = this.esquema.horarios;
    
    console.log('📅 Horarios existentes:', horariosExistentes);
    console.log('📅 Horarios nuevos:', horariosNuevos);
    
    // Filtrar horarios nuevos que no sean duplicados exactos
    const horariosUnicos = horariosNuevos.filter(nuevo => {
      return !horariosExistentes.some(existente => 
        existente.dia === nuevo.dia && 
        existente.horaInicio === nuevo.horaInicio && 
        existente.horaFin === nuevo.horaFin
      );
    });
    
    console.log('🆕 Horarios únicos a agregar:', horariosUnicos);
    
    const horariosCombinados = [...horariosExistentes, ...horariosUnicos];
    
    // Ordenar horarios por día
    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    horariosCombinados.sort((a, b) => {
      const diaA = this.normalizarDia(a.dia);
      const diaB = this.normalizarDia(b.dia);
      return diasOrden.indexOf(diaA) - diasOrden.indexOf(diaB);
    });
    
    console.log('📋 Horarios combinados y ordenados:', horariosCombinados);
    
    // Actualizar el esquema existente
    const esquemaActualizado = {
      ...esquemaExistente,
      horarios: horariosCombinados,
      intervalo: this.esquema.intervalo // Actualizar también el intervalo
    };
    
    this.esquemaTurnoService.update(esquemaExistente.id, esquemaActualizado).subscribe({
      next: (response) => {
        this.guardando = false;
        const mensajeResultado = horariosUnicos.length > 0 
          ? `Esquema actualizado exitosamente. Se agregaron ${horariosUnicos.length} horario(s) nuevo(s).`
          : 'Esquema actualizado exitosamente. No se agregaron horarios nuevos (ya existían).';
        
        this.mensajeExito = mensajeResultado;
        console.log('✅ Esquema actualizado exitosamente:', response);
        
        setTimeout(() => {
          this.activeModal.close(response.data);
        }, 1500);
      },
      error: (error) => {
        this.guardando = false;
        console.error('❌ Error al actualizar el esquema:', error);
        this.mensajeError = error?.error?.status_text || error?.error?.message || 'Error al actualizar el esquema de turno. Intente nuevamente.';
      }
    });
  }

  private crearNuevoEsquema(): void {
    console.log('📝 Creando nuevo esquema');
    
    this.esquemaTurnoService.create(this.esquema).subscribe({
      next: (response) => {
        this.guardando = false;
        this.mensajeExito = 'Esquema de turno creado exitosamente';
        console.log('✅ Esquema creado exitosamente:', response);
        
        setTimeout(() => {
          this.activeModal.close(response.data);
        }, 1000);
      },
      error: (error) => {
        this.guardando = false;
        console.error('❌ Error al crear el esquema:', error);
        console.error('📋 Datos del esquema que causó el error:', this.esquema);
        this.mensajeError = error?.error?.status_text || error?.error?.message || 'Error al crear el esquema de turno. Intente nuevamente.';
      }
    });
  }

  /**
   * Valida conflictos en tiempo real cuando cambian los datos del formulario
   */
  private validarConflictosEnTiempoReal(): void {
    // Solo validar si tenemos datos suficientes
    if (!this.esquema.disponibilidadMedicoId || !this.esquema.consultorioId || this.esquema.horarios.length === 0) {
      this.limpiarConflictos();
      return;
    }

    console.log('🔍 Validando conflictos en tiempo real...');

    this.esquemaTurnoService.validarConflictos(this.esquema).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data) {
          const validacion = response.data;
          
          if (!validacion.valido) {
            // Hay conflictos, mostrarlos visualmente pero sin bloquear
            this.conflictosDetectados = validacion;
            this.tieneConflictos = true;
            console.log('⚠️ Conflictos detectados en tiempo real:', validacion);
          } else {
            // Sin conflictos
            this.limpiarConflictos();
            console.log('✅ Sin conflictos en tiempo real');
          }
        }
      },
      error: (error) => {
        console.error('❌ Error en validación en tiempo real:', error);
        // No mostrar error al usuario para validación en tiempo real
      }
    });
  }

  /**
   * Valida conflictos para un horario específico que se está agregando
   */
  private validarConflictoHorario(horario: any): void {
    // Solo validar si tenemos los datos necesarios
    if (!this.esquema.disponibilidadMedicoId || !this.esquema.consultorioId) {
      return;
    }

    // Crear un esquema temporal con solo este horario para validar
    const esquemaTemporal = {
      ...this.esquema,
      horarios: [horario]
    };

    console.log('🔍 Validando conflicto para horario específico:', horario);
    
    this.esquemaTurnoService.validarConflictos(esquemaTemporal).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data) {
          const validacion = response.data;
          
          if (!validacion.valido && validacion.conflictos && validacion.conflictos.length > 0) {
            // Mostrar mensaje de conflicto inmediatamente
            const conflictoMsg = validacion.conflictos.join('\n\n');
            
            // Mostrar alerta y desmarcar el horario
            alert(`⚠️ No se puede agregar este horario:\n\n${conflictoMsg}`);
            
            // Remover el horario de la selección
            this.esquema.horarios = this.esquema.horarios.filter(h => 
              !(h.dia === horario.dia && h.horaInicio === horario.horaInicio && h.horaFin === horario.horaFin)
            );
            
            console.log('❌ Horario removido por conflicto:', horario);
            
            // Actualizar validación en tiempo real después de remover
            this.validarConflictosEnTiempoReal();
          }
        }
      },
      error: (error) => {
        console.error('❌ Error al validar horario específico:', error);
      }
    });
  }

  /**
   * Limpia los conflictos detectados
   */
  private limpiarConflictos(): void {
    this.conflictosDetectados = null;
    this.tieneConflictos = false;
  }

  onCancel() {
    this.activeModal.dismiss();
  }
}
