import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DisponibilidadMedico } from '../../../disponibilidadMedicos/disponibilidadMedico';
import { DisponibilidadMedicoService } from '../../../disponibilidadMedicos/disponibilidadMedico.service';
import { StaffMedico } from '../../../staffMedicos/staffMedico';

@Component({
  selector: 'app-disponibilidad-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <i class="fa fa-calendar-plus me-2"></i>
        Gestionar Disponibilidad - Dr. {{ staffMedico.medico?.nombre }} {{ staffMedico.medico?.apellido }}
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
                <i class="fa fa-stethoscope me-1"></i>{{ staffMedico.especialidad?.nombre }}
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
                  title="Eliminar horario"
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
              Configure los días y horarios en los que el médico estará disponible para atender pacientes.
              <br>
              <i class="fa fa-lightbulb me-1 text-warning"></i>
              <strong>Tip:</strong> Puede agregar múltiples franjas horarias para el mismo día (ej: mañana y tarde).
              
            
            </small>
          </div>
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
        {{ guardando ? 'Guardando...' : 'Guardar Disponibilidad' }}
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
  `]
})
export class DisponibilidadModalComponent implements OnInit {
  staffMedico: StaffMedico;
  disponibilidad: DisponibilidadMedico;
  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  
  mensajeError = '';
  mensajeExito = '';
  guardando = false;

  constructor(
    public activeModal: NgbActiveModal,
    private disponibilidadService: DisponibilidadMedicoService
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
    console.log('🔄 Inicializando modal de disponibilidad para:', this.staffMedico);
    
    if (this.staffMedico && this.staffMedico.id) {
      this.cargarDisponibilidadesExistentes();
    } else {
      console.warn('⚠️ No se proporcionó staffMedico válido');
      // Agregar un horario por defecto si no hay médico
      this.addHorario();
    }
  }

  private cargarDisponibilidadesExistentes(): void {
    console.log('📥 Cargando disponibilidades existentes para staffMedico:', this.staffMedico.id);
    
    this.disponibilidadService.byStaffMedico(this.staffMedico.id!).subscribe({
      next: (response) => {
        console.log('✅ Disponibilidades encontradas:', response);
        
        if (response.data && response.data.length > 0) {
          // Cargar la disponibilidad existente
          const disponibilidadExistente = response.data[0];
          console.log('📋 Cargando disponibilidad existente:', disponibilidadExistente);
          
          this.disponibilidad = {
            id: disponibilidadExistente.id,
            staffMedicoId: disponibilidadExistente.staffMedicoId,
            horarios: [...disponibilidadExistente.horarios] // Clonar el array
          };
          
          console.log('📅 Horarios cargados:', this.disponibilidad.horarios);
          
        } else {
          console.log('📝 No hay disponibilidades existentes, creando horario vacío');
          // No hay disponibilidades existentes, agregar un horario vacío
          this.addHorario();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar disponibilidades existentes:', error);
        // En caso de error, agregar un horario por defecto
        this.addHorario();
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

    // Validar que no haya solapamientos de horarios en el mismo día
    const horariosPorDia = new Map<string, any[]>();
    
    // Agrupar horarios por día
    for (let horario of this.disponibilidad.horarios) {
      if (!horariosPorDia.has(horario.dia)) {
        horariosPorDia.set(horario.dia, []);
      }
      horariosPorDia.get(horario.dia)!.push(horario);
    }
    
    // Verificar solapamientos dentro de cada día
    for (let [dia, horarios] of horariosPorDia) {
      for (let i = 0; i < horarios.length; i++) {
        for (let j = i + 1; j < horarios.length; j++) {
          const horario1 = horarios[i];
          const horario2 = horarios[j];
          
          // Convertir a minutos para comparar
          const inicio1 = this.timeToMinutes(horario1.horaInicio);
          const fin1 = this.timeToMinutes(horario1.horaFin);
          const inicio2 = this.timeToMinutes(horario2.horaInicio);
          const fin2 = this.timeToMinutes(horario2.horaFin);
          
          // Verificar solapamiento
          if (inicio1 < fin2 && fin1 > inicio2) {
            return `Hay un solapamiento de horarios en ${this.getDiaNombre(dia)}: ${horario1.horaInicio}-${horario1.horaFin} y ${horario2.horaInicio}-${horario2.horaFin}`;
          }
        }
      }
    }

    return null;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  guardarDisponibilidad(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validaciones
    const errorValidacion = this.validarHorarios();
    if (errorValidacion) {
      this.mensajeError = errorValidacion;
      return;
    }

    this.guardando = true;

    // Asignar el ID del staff médico
    this.disponibilidad.staffMedicoId = this.staffMedico.id!;

    // Ordenar los horarios por el orden de los días de la semana
    const diasOrden = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    this.disponibilidad.horarios.sort((a, b) => diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia));

    // Verificar si es una actualización (tiene ID) o una creación nueva
    if (this.disponibilidad.id && this.disponibilidad.id > 0) {
      console.log('✏️ Actualizando disponibilidad existente:', this.disponibilidad.id);
      this.actualizarDisponibilidad();
    } else {
      console.log('📝 Creando nueva disponibilidad o verificando existentes');
      this.verificarYCrearDisponibilidad();
    }
  }

  private actualizarDisponibilidad(): void {
    this.disponibilidadService.update(this.disponibilidad.id, this.disponibilidad).subscribe({
      next: (response) => {
        this.guardando = false;
        this.mensajeExito = 'Disponibilidad actualizada exitosamente';
        
        setTimeout(() => {
          this.activeModal.close(response.data);
        }, 1000);
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al actualizar la disponibilidad:', error);
        this.mensajeError = error?.error?.message || 'Error al actualizar la disponibilidad. Intente nuevamente.';
      }
    });
  }

  private verificarYCrearDisponibilidad(): void {
    console.log('🔍 Verificando si ya existe disponibilidad para el médico:', this.staffMedico.id);

    // Verificar si ya existe una disponibilidad para este médico
    this.disponibilidadService.byStaffMedico(this.staffMedico.id!).subscribe({
      next: (response) => {
        console.log('📋 Disponibilidades existentes:', response);
        
        if (response.data && response.data.length > 0) {
          // Ya existe una disponibilidad, vamos a actualizarla
          const disponibilidadExistente = response.data[0];
          console.log('✏️ Actualizando disponibilidad existente:', disponibilidadExistente.id);
          
          // Combinar horarios existentes con los nuevos (evitando duplicados exactos)
          const horariosExistentes = disponibilidadExistente.horarios || [];
          const horariosNuevos = this.disponibilidad.horarios;
          
          // Filtrar horarios nuevos que no sean duplicados exactos
          const horariosUnicos = horariosNuevos.filter(nuevo => {
            return !horariosExistentes.some(existente => 
              existente.dia === nuevo.dia && 
              existente.horaInicio === nuevo.horaInicio && 
              existente.horaFin === nuevo.horaFin
            );
          });
          
          const horariosCombinados = [...horariosExistentes, ...horariosUnicos];
          const diasOrden = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
          horariosCombinados.sort((a, b) => diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia));
          
          console.log('📅 Horarios combinados:', horariosCombinados);
          
          // Actualizar la disponibilidad existente
          const disponibilidadActualizada = {
            ...disponibilidadExistente,
            horarios: horariosCombinados
          };
          
          this.disponibilidadService.update(disponibilidadExistente.id, disponibilidadActualizada).subscribe({
            next: (updateResponse) => {
              this.guardando = false;
              this.mensajeExito = `Disponibilidad actualizada exitosamente. Se agregaron ${horariosUnicos.length} horario(s) nuevo(s).`;
              
              setTimeout(() => {
                this.activeModal.close(updateResponse.data);
              }, 1500);
            },
            error: (error) => {
              this.guardando = false;
              console.error('Error al actualizar la disponibilidad:', error);
              this.mensajeError = error?.error?.message || 'Error al actualizar la disponibilidad. Intente nuevamente.';
            }
          });
          
        } else {
          // No existe disponibilidad, crear una nueva
          console.log('📝 Creando nueva disponibilidad');
          this.crearNuevaDisponibilidad();
        }
      },
      error: (error) => {
        console.error('Error al verificar disponibilidades existentes:', error);
        // En caso de error, intentar crear una nueva
        console.log('⚠️ Error al verificar, intentando crear nueva disponibilidad');
        this.crearNuevaDisponibilidad();
      }
    });
  }

  private crearNuevaDisponibilidad(): void {
    this.disponibilidadService.create(this.disponibilidad).subscribe({
      next: (response) => {
        this.guardando = false;
        this.mensajeExito = 'Disponibilidad creada exitosamente';
        
        setTimeout(() => {
          this.activeModal.close(response.data);
        }, 1000);
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al crear la disponibilidad:', error);
        this.mensajeError = error?.error?.message || 'Error al crear la disponibilidad. Intente nuevamente.';
      }
    });
  }
}
