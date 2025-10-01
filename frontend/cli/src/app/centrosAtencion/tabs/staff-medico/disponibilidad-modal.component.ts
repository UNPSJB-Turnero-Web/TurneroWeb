import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DisponibilidadMedico } from '../../../disponibilidadMedicos/disponibilidadMedico';
import { DisponibilidadMedicoService } from '../../../disponibilidadMedicos/disponibilidadMedico.service';
import { StaffMedico } from '../../../staffMedicos/staffMedico';
import { StaffMedicoService } from '../../../staffMedicos/staffMedico.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-disponibilidad-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <i class="fa" [class.fa-calendar-plus]="!modoEdicion" [class.fa-edit]="modoEdicion" me-2></i>
        {{ modoEdicion ? 'Editar' : 'Nueva' }} Disponibilidad - Dr. {{ staffMedico.medico?.nombre }} {{ staffMedico.medico?.apellido }}
        <span *ngIf="especialidadNombre" class="badge ms-2" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white;">
          {{ especialidadNombre }}
        </span>
      </h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="modal-body">
      <!-- Alert Messages -->
      <div *ngIf="mensajeError" class="alert alert-danger">
        <i class="fa fa-exclamation-triangle me-2"></i>
        {{ mensajeError }}
      </div>

      <div *ngIf="mensajeExito" class="alert alert-success">
        <i class="fa fa-check-circle me-2"></i>
        {{ mensajeExito }}
      </div>

      <form #disponibilidadForm="ngForm">
        <!-- Información del Staff Médico -->
        <div class="mb-4 p-3" style="background: rgba(54, 185, 204, 0.05); border-radius: 10px; border: 1px solid rgba(54, 185, 204, 0.2);">
          <div class="d-flex align-items-center">
            <div class="avatar-medicos me-3">
              Dr
            </div>
            <div>
              <h6 class="mb-1">Dr. {{ staffMedico.medico?.nombre }} {{ staffMedico.medico?.apellido }}</h6>
              <small class="text-muted">
                <i class="fa fa-stethoscope me-1"></i>
                <span *ngIf="especialidadNombre">{{ especialidadNombre }}</span>
                <span *ngIf="!especialidadNombre">{{ staffMedico.especialidad?.nombre }}</span>
                <span class="ms-2">
                  <i class="fa fa-id-badge me-1"></i>Matrícula: {{ staffMedico.medico?.matricula }}
                </span>
              </small>
            </div>
          </div>
        </div>

        <!-- Horarios de Disponibilidad -->
        <div class="form-group-modern mb-4">
          <label class="form-label-modern">
            <i class="fa fa-clock me-2"></i>
            Horarios de Disponibilidad
          </label>
          
          <div *ngFor="let horario of disponibilidad.horarios; let i = index" class="horario-form-row mb-3">
            <div class="row g-2">
              <div class="col-4">
                <label class="form-label-small">Día</label>
                <select
                  [(ngModel)]="horario.dia"
                  [name]="'dia-' + i"
                  class="form-control form-control-sm"
                  required
                >
                  <option value="">Seleccionar día...</option>
                  <option *ngFor="let dia of diasSemana" [value]="dia">{{ getDiaNombre(dia) }}</option>
                </select>
              </div>
              <div class="col-3">
                <label class="form-label-small">Hora Inicio</label>
                <input
                  type="time"
                  class="form-control form-control-sm"
                  [(ngModel)]="horario.horaInicio"
                  [name]="'horaInicio-' + i"
                  required
                />
              </div>
              <div class="col-3">
                <label class="form-label-small">Hora Fin</label>
                <input
                  type="time"
                  class="form-control form-control-sm"
                  [(ngModel)]="horario.horaFin"
                  [name]="'horaFin-' + i"
                  required
                />
              </div>
              <div class="col-2 d-flex align-items-end">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  (click)="removeHorario(i)"
                  [disabled]="disponibilidad.horarios.length <= 1"
                  [title]="disponibilidad.horarios.length <= 1 ? 'Debe configurar al menos un horario' : 'Eliminar horario'"
                >
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            class="btn btn-sm btn-outline-success" 
            (click)="addHorario()"
          >
            <i class="fa fa-plus me-2"></i>
            Agregar Horario
          </button>
          
          <div class="form-help mt-2">
            <small class="text-muted">
              <i class="fa fa-info-circle me-1"></i>
              Configure los días y horarios en los que el médico estará disponible para atender pacientes en este centro.
              {{ modoEdicion ? 'Modifique los horarios existentes según sea necesario.' : 'Puede agregar múltiples horarios, incluso para el mismo día, siempre que no se superpongan.' }}
            </small>
          </div>
        </div>

        <!-- Tabla de Horarios Ocupados -->
        <div class="form-group-modern mt-4" *ngIf="!cargandoDisponibilidades">
          <label class="form-label-modern">
            <i class="fa fa-calendar-alt me-2"></i>
            Horarios Ocupados en Otros Centros o Especialidades
          </label>

          <div class="alert alert-info">
            <i class="fa fa-info-circle me-2"></i>
            Los horarios que se muestran a continuación están ocupados por otras especialidades o centros del médico.
            Asegúrese de no crear conflictos al configurar nuevos horarios.
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th *ngFor="let dia of diasSemana">{{ getDiaNombre(dia) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td *ngFor="let dia of diasSemana" class="horarios-dia-cell">
                    <div *ngIf="tieneHorariosOcupados(dia); else sinHorariosDia">
                      <div *ngFor="let horario of getHorariosOcupadosPorDia(dia)"
                           class="horario-item"
                           [class.otro-centro]="horario.esOtroCentro">
                        <strong>{{ formatearHora(horario.horaInicio) }} - {{ formatearHora(horario.horaFin) }}</strong>
                        <div class="small">{{ horario.especialidad }}</div>
                        <div class="small">
                          {{ horario.centro }}
                          <span *ngIf="horario.esOtroCentro" class="badge bg-danger ms-1">Otro Centro</span>
                        </div>
                      </div>
                    </div>
                    <ng-template #sinHorariosDia>
                      <span class="text-muted">-</span>
                    </ng-template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="cargandoDisponibilidades" class="text-center py-3">
          <i class="fa fa-spinner fa-spin fa-2x text-primary"></i>
          <p class="mt-2 text-muted">Cargando horarios ocupados...</p>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button 
        type="button" 
        class="btn btn-outline-secondary" 
        (click)="activeModal.dismiss()"
        [disabled]="guardando"
      >
        <i class="fa fa-times me-2"></i>
        Cancelar
      </button>
      <button 
        type="button" 
        class="btn btn-success" 
        (click)="guardarDisponibilidad()"
        [disabled]="!puedeGuardar() || guardando"
      >
        <i class="fa" [class.fa-save]="!guardando" [class.fa-spinner]="guardando" [class.fa-spin]="guardando" ></i>
        {{ guardando ? (modoEdicion ? 'Actualizando...' : 'Guardando...') : (modoEdicion ? 'Actualizar Disponibilidad' : 'Guardar Disponibilidad') }}
      </button>
    </div>
  `,
  styles: [`
    .modal-header {
      border-radius: 1rem 1rem 0 0;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #495057;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .btn-close:hover {
      opacity: 1;
    }

    .form-label-modern {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
      display: block;
    }

    .form-label-small {
      font-size: 0.75rem;
      font-weight: 500;
      color: #6c757d;
      margin-bottom: 0.25rem;
      display: block;
    }

    .horario-form-row {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
      border: 1px solid #e9ecef;
    }

    .avatar-medicos {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .form-help {
      background: rgba(13, 110, 253, 0.1);
      padding: 0.5rem;
      border-radius: 0.375rem;
      border-left: 3px solid #0d6efd;
    }

    .alert {
      border-radius: 0.5rem;
      border: none;
    }

    .alert-danger {
      background: rgba(220, 53, 69, 0.1);
      color: #842029;
    }

    .alert-success {
      background: rgba(25, 135, 84, 0.1);
      color: #0f5132;
    }

    .form-control-sm {
      border-radius: 0.375rem;
      border: 1px solid #ced4da;
    }

    .form-control-sm:focus {
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .btn {
      border-radius: 0.375rem;
      font-weight: 500;
    }

    .btn-success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border: none;
    }

    .btn-success:hover {
      background: linear-gradient(135deg, #20c997 0%, #28a745 100%);
      transform: translateY(-1px);
    }

    .btn-outline-secondary {
      border-color: #6c757d;
      color: #6c757d;
    }

    .btn-outline-secondary:hover {
      background-color: #6c757d;
      border-color: #6c757d;
    }

    .fa-spin {
      animation: fa-spin 2s infinite linear;
    }

    @keyframes fa-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* ==== TABLA DE HORARIOS OCUPADOS ==== */
    .table-responsive {
      margin-top: 1rem;
      overflow-x: auto;
    }

    .table {
      margin-bottom: 0;
      font-size: 0.8rem;
    }

    .table thead th {
      background-color: #f8f9fa;
      font-weight: 600;
      text-align: center;
      vertical-align: middle;
      font-size: 0.75rem;
      padding: 0.3rem 0.2rem;
      white-space: nowrap;
    }

    .table tbody td {
      vertical-align: top;
      padding: 0.3rem;
    }

    .horarios-dia-cell {
      width: 14.28%;
      min-width: 85px;
      max-width: 110px;
    }

    .horario-item {
      background-color: rgba(255, 193, 7, 0.1);
      border-left: 2px solid #ffc107;
      padding: 0.25rem;
      margin-bottom: 0.25rem;
      font-size: 0.75rem;
      line-height: 1.2;
    }

    .horario-item:last-child {
      margin-bottom: 0;
    }

    .horario-item.otro-centro {
      background-color: rgba(220, 53, 69, 0.1);
      border-left: 2px solid #dc3545;
    }

    .horario-item strong {
      display: block;
      font-size: 0.75rem;
      margin-bottom: 0.1rem;
    }

    .horario-item .small {
      font-size: 0.7rem;
      line-height: 1.1;
    }

    .badge {
      font-size: 0.6rem;
      padding: 0.1rem 0.3rem;
    }
  `]
})
export class DisponibilidadModalComponent {
  staffMedico: StaffMedico;
  disponibilidad: DisponibilidadMedico;
  disponibilidadExistente?: DisponibilidadMedico; // Para cargar disponibilidad existente
  especialidadId?: number; // ID de especialidad específica
  especialidadNombre?: string; // Nombre de especialidad específica para mostrar
  modoEdicion = false; // Para determinar si estamos editando o creando
  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  mensajeError = '';
  mensajeExito = '';
  guardando = false;
  cargandoDisponibilidades = false;

  // Propiedad para almacenar todas las disponibilidades del médico (validación inter-centro)
  todasLasDisponibilidadesMedico: DisponibilidadMedico[] = [];

  // Mapa para almacenar información de centros y especialidades por staffMedicoId
  staffMedicoInfoMap: Map<number, {centroNombre: string, especialidadNombre: string}> = new Map();

  // Lista de todos los StaffMedico del médico (para mapear centros)
  todosLosStaffMedico: any[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private disponibilidadService: DisponibilidadMedicoService,
    private staffMedicoService: StaffMedicoService
  ) {
    // Inicializar con valores por defecto
    this.staffMedico = {
      id: 0,
      medico: undefined,
      especialidad: undefined,
      centroAtencionId: 0
    };

    this.disponibilidad = {
      id: 0,
      staffMedicoId: 0,
      horarios: []
    };
  }

  ngOnInit(): void {
    // Si hay una disponibilidad existente, cargarla para edición
    if (this.disponibilidadExistente) {
      this.modoEdicion = true;
      this.disponibilidad = {
        ...this.disponibilidadExistente,
        horarios: [...this.disponibilidadExistente.horarios] // Clonar horarios
      };
      console.log('Cargando disponibilidad existente para edición:', this.disponibilidad);
    } else {
      // Modo creación - agregar un horario por defecto
      this.addHorario();
    }

    // Cargar todas las disponibilidades del médico para validación inter-centro
    this.cargarDisponibilidadesMedico();
  }

  /**
   * Carga todas las disponibilidades del médico en todos los centros
   * para poder validar conflictos inter-centro
   */
  private cargarDisponibilidadesMedico(): void {
    if (!this.staffMedico?.medico?.id) {
      console.warn('No se pudo obtener el ID del médico para cargar disponibilidades');
      return;
    }

    this.cargandoDisponibilidades = true;

    // Cargar en paralelo: disponibilidades y todos los staffMedico del médico
    forkJoin({
      disponibilidades: this.disponibilidadService.byMedico(this.staffMedico.medico.id),
      staffMedicos: this.staffMedicoService.getByMedicoId(this.staffMedico.medico.id)
    }).subscribe({
      next: (response) => {
        this.todasLasDisponibilidadesMedico = response.disponibilidades.data || [];
        this.todosLosStaffMedico = response.staffMedicos.data || [];
        this.cargandoDisponibilidades = false;

        console.log('Disponibilidades del médico cargadas:', this.todasLasDisponibilidadesMedico.length);
        console.log('Staff médicos del médico cargados:', this.todosLosStaffMedico.length);
        console.log('Datos de staffMedicos:', this.todosLosStaffMedico);

        // Construir mapa de información de staffMedico
        this.construirMapaStaffMedico();

        // Calcular horarios ocupados para mostrar en el calendario
        this.calcularHorariosOcupadosPorDia();
      },
      error: (error) => {
        console.error('Error al cargar disponibilidades del médico:', error);
        this.cargandoDisponibilidades = false;
        // No es un error crítico, continuar sin validación inter-centro
        this.todasLasDisponibilidadesMedico = [];
        this.todosLosStaffMedico = [];
      }
    });
  }

  /**
   * Obtiene los horarios ocupados agrupados por día de la semana
   * Incluye todas las disponibilidades del médico EXCEPTO la que se está editando
   */
  getHorariosOcupadosPorDia(dia: string): Array<{horaInicio: string, horaFin: string, especialidad?: string, centro?: string, esOtroCentro?: boolean}> {
    const horariosOcupados: Array<{horaInicio: string, horaFin: string, especialidad?: string, centro?: string, esOtroCentro?: boolean}> = [];

    this.todasLasDisponibilidadesMedico.forEach(disponibilidad => {
      // Excluir la disponibilidad que estamos editando actualmente
      if (this.modoEdicion && this.disponibilidadExistente &&
          disponibilidad.id === this.disponibilidadExistente.id) {
        return;
      }

      // Obtener información del centro y especialidad desde la disponibilidad
      let centroNombre = 'Centro desconocido';
      let especialidadNombreDisp = 'Sin especialidad';
      let esOtroCentro = false;

      // Intentar obtener información del staffMedico
      if (disponibilidad.staffMedico) {
        if (disponibilidad.staffMedico.centro) {
          centroNombre = disponibilidad.staffMedico.centro.nombre || `Centro #${disponibilidad.staffMedico.centroAtencionId}`;
        } else if (disponibilidad.staffMedico.centroAtencionId) {
          centroNombre = `Centro #${disponibilidad.staffMedico.centroAtencionId}`;
        }

        // Verificar si es otro centro comparando IDs
        if (disponibilidad.staffMedico.centroAtencionId && this.staffMedico?.centroAtencionId) {
          esOtroCentro = this.staffMedico.centroAtencionId !== disponibilidad.staffMedico.centroAtencionId;
        } else {
          // Si no hay IDs para comparar, comparamos staffMedicoId
          esOtroCentro = disponibilidad.staffMedicoId !== this.staffMedico.id;
        }

        if (disponibilidad.staffMedico.especialidad) {
          especialidadNombreDisp = disponibilidad.staffMedico.especialidad.nombre || 'Sin especialidad';
        }
      } else if (disponibilidad.staffMedicoId) {
        // Si no tenemos el objeto staffMedico completo, usar el mapa de info
        const info = this.staffMedicoInfoMap.get(disponibilidad.staffMedicoId);
        if (info) {
          centroNombre = info.centroNombre;
          especialidadNombreDisp = info.especialidadNombre;
        }
        // Si es el mismo staffMedicoId que el actual, es el mismo centro
        esOtroCentro = disponibilidad.staffMedicoId !== this.staffMedico.id;
      }

      // Revisar todos los horarios de esta disponibilidad
      disponibilidad.horarios.forEach((horario: any) => {
        if (horario.dia === dia) {
          horariosOcupados.push({
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            especialidad: especialidadNombreDisp,
            centro: centroNombre,
            esOtroCentro: esOtroCentro
          });
        }
      });
    });

    // Ordenar por hora de inicio
    return horariosOcupados.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  /**
   * Verifica si hay horarios ocupados para un día específico
   */
  tieneHorariosOcupados(dia: string): boolean {
    return this.getHorariosOcupadosPorDia(dia).length > 0;
  }

  /**
   * Calcula y almacena los horarios ocupados por día para mostrar en el calendario
   */
  private horariosOcupadosPorDia: { [dia: string]: Array<{horaInicio: string, horaFin: string, especialidad?: string}> } = {};

  private calcularHorariosOcupadosPorDia(): void {
    const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

    dias.forEach(dia => {
      this.horariosOcupadosPorDia[dia] = this.getHorariosOcupadosPorDia(dia);
    });
  }

  /**
   * Construye un mapa de información de StaffMedico usando los datos pasados del padre
   */
  private construirMapaStaffMedico(): void {
    console.log('Construyendo mapa de staffMedico. Datos recibidos:', this.todosLosStaffMedico);

    this.todosLosStaffMedico.forEach(staff => {
      if (staff.id) {
        const centroNombre = staff.centro?.nombre || staff.centroAtencion?.nombre || `Centro #${staff.centroAtencionId || 'desconocido'}`;
        const especialidadNombre = staff.especialidad?.nombre || 'Sin especialidad';

        this.staffMedicoInfoMap.set(staff.id, {
          centroNombre: centroNombre,
          especialidadNombre: especialidadNombre
        });

        console.log(`Mapeando staffMedico ${staff.id}: ${centroNombre} - ${especialidadNombre}`);
      }
    });
  }

  addHorario(): void {
    this.disponibilidad.horarios.push({ 
      dia: '', 
      horaInicio: '', 
      horaFin: '' 
    });
  }

  removeHorario(index: number): void {
    if (this.disponibilidad.horarios.length > 1) {
      this.disponibilidad.horarios.splice(index, 1);
    }
  }

  getDiaNombre(dia: string): string {
    const nombres: { [key: string]: string } = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIERCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return nombres[dia] || dia;
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    // Si la hora viene con segundos (HH:MM:SS), quitar los segundos
    return hora.substring(0, 5);
  }

  puedeGuardar(): boolean {
    return this.disponibilidad.horarios.length > 0 && 
           this.disponibilidad.horarios.every(h => 
             h.dia && h.horaInicio && h.horaFin && h.horaInicio < h.horaFin
           );
  }

  private validarHorarios(): string | null {
    // Validar que no haya horarios vacíos
    for (let horario of this.disponibilidad.horarios) {
      if (!horario.dia || !horario.horaInicio || !horario.horaFin) {
        return 'Todos los horarios deben tener día, hora de inicio y hora de fin.';
      }

      if (horario.horaInicio >= horario.horaFin) {
        return 'La hora de inicio debe ser menor a la hora de fin.';
      }
    }

    // Validar que no haya superposición de horarios en el mismo día (dentro de la configuración actual)
    const errorSuperposicionInterna = this.validarSuperposicionesInternas();
    if (errorSuperposicionInterna) {
      return errorSuperposicionInterna;
    }

    // Validar conflictos con horarios existentes en otros centros (validación inter-centro)
    const conflictosInterCentro = this.validarConflictosInterCentro();
    if (conflictosInterCentro.length > 0) {
      // Mostrar los conflictos al usuario y permitir continuar con confirmación
      return null; // Retornar null para que continúe al método guardarDisponibilidad donde se muestra la confirmación
    }

    return null;
  }

  /**
   * Valida que no haya superposiciones dentro de los horarios que se están configurando
   */
  private validarSuperposicionesInternas(): string | null {
    const horariosPorDia = new Map<string, Array<{horaInicio: string, horaFin: string}>>();

    // Agrupar horarios por día
    for (let horario of this.disponibilidad.horarios) {
      if (!horariosPorDia.has(horario.dia)) {
        horariosPorDia.set(horario.dia, []);
      }
      horariosPorDia.get(horario.dia)!.push({
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      });
    }

    // Validar superposición en cada día
    for (let [dia, horarios] of horariosPorDia) {
      // Ordenar horarios por hora de inicio
      horarios.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

      // Verificar superposición entre horarios consecutivos
      for (let i = 0; i < horarios.length - 1; i++) {
        const horarioActual = horarios[i];
        const siguienteHorario = horarios[i + 1];

        if (horarioActual.horaFin > siguienteHorario.horaInicio) {
          return `En ${this.getDiaNombre(dia)}, el horario ${horarioActual.horaInicio}-${horarioActual.horaFin} se superpone con ${siguienteHorario.horaInicio}-${siguienteHorario.horaFin}. Los horarios no pueden superponerse.`;
        }
      }
    }

    return null;
  }

  /**
   * Valida conflictos con horarios existentes en TODOS los centros (validación inter-centro)
   * Retorna un array de mensajes de conflicto
   */
  private validarConflictosInterCentro(): string[] {
    const conflictos: string[] = [];

    // Si no hay disponibilidades cargadas, no podemos validar
    if (!this.todasLasDisponibilidadesMedico || this.todasLasDisponibilidadesMedico.length === 0) {
      return [];
    }

    // Revisar cada horario nuevo contra todas las disponibilidades existentes
    this.disponibilidad.horarios.forEach(nuevoHorario => {

      // Recorrer todas las disponibilidades del médico
      this.todasLasDisponibilidadesMedico.forEach(disponibilidad => {

        // En modo edición, excluir la disponibilidad que estamos editando
        if (this.modoEdicion && this.disponibilidadExistente &&
            disponibilidad.id === this.disponibilidadExistente.id) {
          return;
        }

        // Revisar todos los horarios de esta disponibilidad
        disponibilidad.horarios.forEach((horarioExistente: any) => {
          if (horarioExistente.dia === nuevoHorario.dia) {
            // Verificar si hay solapamiento de horarios
            if (this.horariosSeSolapan(nuevoHorario, horarioExistente)) {

              // Determinar si el conflicto es en el mismo centro o en otro centro
              const esMismoCentro = disponibilidad.staffMedicoId === this.staffMedico.id;

              if (esMismoCentro) {
                // Conflicto en el mismo centro (con otra especialidad)
                const especialidadNombre = this.especialidadNombre || 'la especialidad actual';
                conflictos.push(
                  `${nuevoHorario.dia}: ${nuevoHorario.horaInicio}-${nuevoHorario.horaFin} se superpone con horario existente en ${especialidadNombre} (${horarioExistente.horaInicio}-${horarioExistente.horaFin})`
                );
              } else {
                // CONFLICTO INTERCENTROS - Más crítico
                // Obtener información del centro desde staffMedicoId
                const centroNombre = 'otro centro de atención';
                conflictos.push(
                  `⚠️ CONFLICTO INTER-CENTRO - ${nuevoHorario.dia}: ${nuevoHorario.horaInicio}-${nuevoHorario.horaFin} se superpone con horario en "${centroNombre}" (${horarioExistente.horaInicio}-${horarioExistente.horaFin}). Un médico no puede atender en múltiples centros al mismo tiempo.`
                );
              }
            }
          }
        });
      });
    });

    return conflictos;
  }

  /**
   * Método auxiliar para verificar si dos horarios se solapan
   */
  private horariosSeSolapan(
    horario1: { horaInicio: string, horaFin: string },
    horario2: { horaInicio: string, horaFin: string }
  ): boolean {
    const inicio1 = this.convertirHoraAMinutos(horario1.horaInicio);
    const fin1 = this.convertirHoraAMinutos(horario1.horaFin);
    const inicio2 = this.convertirHoraAMinutos(horario2.horaInicio);
    const fin2 = this.convertirHoraAMinutos(horario2.horaFin);

    // Los horarios se solapan si uno empieza antes de que termine el otro
    return (inicio1 < fin2) && (inicio2 < fin1);
  }

  /**
   * Convertir hora en formato HH:MM a minutos desde medianoche
   */
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  guardarDisponibilidad(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validaciones básicas
    const errorValidacion = this.validarHorarios();
    if (errorValidacion) {
      this.mensajeError = errorValidacion;
      return;
    }

    // Validar conflictos inter-centro y mostrar advertencia si existen
    const conflictosInterCentro = this.validarConflictosInterCentro();
    if (conflictosInterCentro.length > 0) {
      const tieneConflictosIntercentros = conflictosInterCentro.some(c => c.includes('⚠️ CONFLICTO INTER-CENTRO'));

      if (tieneConflictosIntercentros) {
        // Conflictos inter-centro son MUY críticos - el médico no puede estar en dos lugares a la vez
        const mensaje = '🚨 CONFLICTOS CRÍTICOS DETECTADOS 🚨\n\n' +
                       'Un médico no puede atender en múltiples centros al mismo tiempo:\n\n' +
                       conflictosInterCentro.join('\n\n') +
                       '\n\n⚠️ ADVERTENCIA: Estos conflictos pueden causar problemas serios en la programación de turnos.\n\n' +
                       '¿Está SEGURO que desea continuar?';

        if (!confirm(mensaje)) {
          return;
        }
      } else {
        // Conflictos menores (dentro del mismo centro)
        const mensaje = 'Se encontraron conflictos de horarios:\n\n' +
                       conflictosInterCentro.join('\n\n') +
                       '\n\n¿Desea continuar de todas formas?';

        if (!confirm(mensaje)) {
          return;
        }
      }
    }

    this.guardando = true;

    // Asignar el ID del staff médico
    this.disponibilidad.staffMedicoId = this.staffMedico.id!;
    
    // Asignar el ID de especialidad si se proporcionó
    if (this.especialidadId) {
      this.disponibilidad.especialidadId = this.especialidadId;
    }

    // Ordenar los horarios por el orden de los días de la semana
    const diasOrden = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    this.disponibilidad.horarios.sort((a, b) => diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia));

    // Determinar si crear o actualizar
    const operacion = this.modoEdicion 
      ? this.disponibilidadService.update(this.disponibilidad.id!, this.disponibilidad)
      : this.disponibilidadService.create(this.disponibilidad);

    const mensajeExito = this.modoEdicion 
      ? 'Disponibilidad actualizada exitosamente'
      : 'Disponibilidad creada exitosamente';

    operacion.subscribe({
      next: (response) => {
        this.guardando = false;
        this.mensajeExito = mensajeExito;
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          this.activeModal.close(response.data);
        }, 1000);
      },
      error: (error) => {
        this.guardando = false;
        console.error(`Error al ${this.modoEdicion ? 'actualizar' : 'crear'} la disponibilidad:`, error);
        this.mensajeError = error?.error?.message || `Error al ${this.modoEdicion ? 'actualizar' : 'crear'} la disponibilidad. Intente nuevamente.`;
      }
    });
  }
}
