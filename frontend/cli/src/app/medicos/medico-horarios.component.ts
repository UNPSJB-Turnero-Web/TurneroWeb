import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';

interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

@Component({
  selector: 'app-medico-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0">Gestión de Horarios</h1>
            <button class="btn btn-outline-secondary" (click)="volverAlDashboard()">
              <i class="fas fa-arrow-left me-2"></i>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Disponibilidades Actuales -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="fas fa-calendar-alt me-2"></i>
                Mis Horarios Actuales
              </h6>
              <button 
                class="btn btn-primary btn-sm" 
                (click)="mostrarFormulario = !mostrarFormulario">
                <i class="fas fa-plus me-2" *ngIf="!mostrarFormulario"></i>
                <i class="fas fa-times me-2" *ngIf="mostrarFormulario"></i>
                {{ mostrarFormulario ? 'Cancelar' : 'Nuevo Horario' }}
              </button>
            </div>
            <div class="card-body">
              <div *ngIf="cargando" class="text-center py-4">
                <div class="spinner-border" role="status"></div>
                <p class="mt-2 text-muted">Cargando horarios...</p>
              </div>

              <div *ngIf="!cargando && disponibilidades.length === 0" class="text-center py-5">
                <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No tienes horarios configurados</h5>
                <p class="text-muted mb-4">Configura tus horarios de disponibilidad para que los pacientes puedan agendar turnos contigo.</p>
                <button class="btn btn-primary" (click)="mostrarFormulario = true">
                  <i class="fas fa-plus me-2"></i>
                  Configurar Primer Horario
                </button>
              </div>

              <div *ngIf="!cargando && disponibilidades.length > 0">
                <div class="row">
                  <div class="col-md-6 mb-3" *ngFor="let disponibilidad of disponibilidades">
                    <div class="card border">
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <h6 class="card-title mb-0">
                            <i class="fas fa-clock me-2"></i>
                            Disponibilidad #{{ disponibilidad.id }}
                          </h6>
                          <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                    type="button" 
                                    data-bs-toggle="dropdown">
                              <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                              <li>
                                <a class="dropdown-item" (click)="editarDisponibilidad(disponibilidad)">
                                  <i class="fas fa-edit me-2"></i>
                                  Editar
                                </a>
                              </li>
                              <li>
                                <a class="dropdown-item text-danger" (click)="eliminarDisponibilidad(disponibilidad)">
                                  <i class="fas fa-trash me-2"></i>
                                  Eliminar
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        <div *ngFor="let horario of disponibilidad.horarios" class="mb-2">
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark fw-normal">
                              <strong>{{ horario.dia }}:</strong>
                              {{ horario.horaInicio | slice:0:5 }} - {{ horario.horaFin | slice:0:5 }}
                            </span>
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

      <!-- Formulario para nueva disponibilidad -->
      <div class="row" *ngIf="mostrarFormulario">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-plus-circle me-2"></i>
                {{ modoEdicion ? 'Editar' : 'Nueva' }} Disponibilidad
              </h6>
            </div>
            <div class="card-body">
              <form [formGroup]="horarioForm" (ngSubmit)="guardarDisponibilidad()">
                <!-- Selector de días múltiples -->
                <div class="mb-4">
                  <label class="form-label fw-bold">Días de la semana</label>
                  <div class="row">
                    <div class="col-md-3 col-sm-6 mb-2" *ngFor="let dia of diasSemana">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          [value]="dia.valor"
                          [id]="'dia-' + dia.valor"
                          (change)="onDiaChange($event, dia.valor)">
                        <label class="form-check-label" [for]="'dia-' + dia.valor">
                          {{ dia.nombre }}
                        </label>
                      </div>
                    </div>
                  </div>
                  <small class="form-text text-muted">Selecciona uno o más días para aplicar el mismo horario.</small>
                </div>

                <!-- Horarios por día -->
                <div formArrayName="horarios" class="mb-4">
                  <label class="form-label fw-bold">Configuración de Horarios</label>
                  
                  <div *ngIf="horariosFormArray.length === 0" class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Selecciona al menos un día para configurar los horarios.
                  </div>

                  <div *ngFor="let horarioGroup of horariosFormArray.controls; let i = index" 
                       [formGroupName]="i" 
                       class="card mb-3">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-md-3">
                          <label class="form-label">Día</label>
                          <input 
                            type="text" 
                            class="form-control" 
                            formControlName="dia" 
                            readonly>
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">Hora Inicio</label>
                          <input 
                            type="time" 
                            class="form-control" 
                            formControlName="horaInicio"
                            [class.is-invalid]="horarioGroup.get('horaInicio')?.invalid && horarioGroup.get('horaInicio')?.touched">
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">Hora Fin</label>
                          <input 
                            type="time" 
                            class="form-control" 
                            formControlName="horaFin"
                            [class.is-invalid]="horarioGroup.get('horaFin')?.invalid && horarioGroup.get('horaFin')?.touched">
                        </div>
                        <div class="col-md-2">
                          <label class="form-label">&nbsp;</label>
                          <button 
                            type="button" 
                            class="btn btn-outline-danger d-block w-100" 
                            (click)="removerHorario(i)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                        <div class="col-md-1">
                          <div class="form-check form-switch">
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              formControlName="activo"
                              [id]="'activo-' + i">
                            <label class="form-check-label" [for]="'activo-' + i">
                              Activo
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Plantillas rápidas -->
                <div class="mb-4">
                  <label class="form-label fw-bold">Plantillas Rápidas</label>
                  <div class="row">
                    <div class="col-md-3 mb-2">
                      <button 
                        type="button" 
                        class="btn btn-outline-info w-100" 
                        (click)="aplicarPlantilla('manana')">
                        <i class="fas fa-sun me-2"></i>
                        Turno Mañana
                        <br><small>08:00 - 13:00</small>
                      </button>
                    </div>
                    <div class="col-md-3 mb-2">
                      <button 
                        type="button" 
                        class="btn btn-outline-warning w-100" 
                        (click)="aplicarPlantilla('tarde')">
                        <i class="fas fa-cloud-sun me-2"></i>
                        Turno Tarde
                        <br><small>14:00 - 19:00</small>
                      </button>
                    </div>
                    <div class="col-md-3 mb-2">
                      <button 
                        type="button" 
                        class="btn btn-outline-primary w-100" 
                        (click)="aplicarPlantilla('completo')">
                        <i class="fas fa-clock me-2"></i>
                        Jornada Completa
                        <br><small>08:00 - 18:00</small>
                      </button>
                    </div>
                    <div class="col-md-3 mb-2">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary w-100" 
                        (click)="aplicarPlantilla('personalizado')">
                        <i class="fas fa-cogs me-2"></i>
                        Personalizado
                        <br><small>Configurar</small>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    (click)="cancelarFormulario()">
                    <i class="fas fa-times me-2"></i>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="horarioForm.invalid || guardando">
                    <i class="fas fa-spinner fa-spin me-2" *ngIf="guardando"></i>
                    <i class="fas fa-save me-2" *ngIf="!guardando"></i>
                    {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Consejos y ayuda -->
      <div class="row" *ngIf="!mostrarFormulario">
        <div class="col-12">
          <div class="card border-info">
            <div class="card-header bg-info text-white">
              <h6 class="mb-0">
                <i class="fas fa-lightbulb me-2"></i>
                Consejos para la gestión de horarios
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6><i class="fas fa-check text-success me-2"></i>Buenas Prácticas:</h6>
                  <ul class="list-unstyled">
                    <li class="mb-1">
                      <i class="fas fa-dot-circle text-primary me-2"></i>
                      Mantén horarios consistentes por día
                    </li>
                    <li class="mb-1">
                      <i class="fas fa-dot-circle text-primary me-2"></i>
                      Deja tiempo entre turnos para descanso
                    </li>
                    <li class="mb-1">
                      <i class="fas fa-dot-circle text-primary me-2"></i>
                      Actualiza tus horarios con anticipación
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6><i class="fas fa-info text-info me-2"></i>Información Importante:</h6>
                  <ul class="list-unstyled">
                    <li class="mb-1">
                      <i class="fas fa-dot-circle text-warning me-2"></i>
                      Los cambios afectan turnos futuros
                    </li>
                    <li class="mb-1">
                      <i class="fas fa-dot-circle text-warning me-2"></i>
                      Se notificará a pacientes afectados
                    </li>
                    <li class="mb-1">
                      <i class="fas fa-dot-circle text-warning me-2"></i>
                      Revisa conflictos antes de confirmar
                    </li>
                  </ul>
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
    }

    .form-check-input:checked {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }

    .dropdown-toggle::after {
      display: none;
    }

    .badge {
      font-size: 0.875rem;
    }

    .list-unstyled li {
      display: flex;
      align-items: center;
    }

    .btn-outline-info:hover,
    .btn-outline-warning:hover,
    .btn-outline-primary:hover {
      transform: translateY(-1px);
    }
  `]
})
export class MedicoHorariosComponent implements OnInit {
  disponibilidades: DisponibilidadMedico[] = [];
  mostrarFormulario = false;
  modoEdicion = false;
  disponibilidadEditando: DisponibilidadMedico | null = null;
  cargando = false;
  guardando = false;

  horarioForm!: FormGroup;
  diasSeleccionados: Set<string> = new Set();

  diasSemana = [
    { nombre: 'Lunes', valor: 'LUNES' },
    { nombre: 'Martes', valor: 'MARTES' },
    { nombre: 'Miércoles', valor: 'MIÉRCOLES' },
    { nombre: 'Jueves', valor: 'JUEVES' },
    { nombre: 'Viernes', valor: 'VIERNES' },
    { nombre: 'Sábado', valor: 'SÁBADO' },
    { nombre: 'Domingo', valor: 'DOMINGO' }
  ];

  constructor(
    private router: Router,
    private disponibilidadService: DisponibilidadMedicoService,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarDisponibilidades();
  }

  private inicializarFormulario() {
    this.horarioForm = this.fb.group({
      horarios: this.fb.array([])
    });
  }

  get horariosFormArray(): FormArray {
    return this.horarioForm.get('horarios') as FormArray;
  }

  cargarDisponibilidades() {
    this.cargando = true;
    const medicoId = this.getMedicoIdFromSession();

    this.disponibilidadService.byMedico(medicoId).subscribe({
      next: (response) => {
        this.disponibilidades = response.data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar disponibilidades:', error);
        this.cargando = false;
      }
    });
  }

  onDiaChange(event: any, dia: string) {
    if (event.target.checked) {
      this.diasSeleccionados.add(dia);
      this.agregarHorarioDia(dia);
    } else {
      this.diasSeleccionados.delete(dia);
      this.removerHorarioDia(dia);
    }
  }

  private agregarHorarioDia(dia: string) {
    const horarioGroup = this.fb.group({
      dia: [dia, Validators.required],
      horaInicio: ['08:00', Validators.required],
      horaFin: ['17:00', Validators.required],
      activo: [true]
    });

    this.horariosFormArray.push(horarioGroup);
  }

  private removerHorarioDia(dia: string) {
    const index = this.horariosFormArray.controls.findIndex(
      control => control.get('dia')?.value === dia
    );
    if (index >= 0) {
      this.horariosFormArray.removeAt(index);
    }
  }

  removerHorario(index: number) {
    const horarioControl = this.horariosFormArray.at(index);
    const dia = horarioControl.get('dia')?.value;
    this.diasSeleccionados.delete(dia);
    this.horariosFormArray.removeAt(index);
  }

  aplicarPlantilla(tipo: string) {
    const horariosActuales = this.horariosFormArray.controls;
    
    horariosActuales.forEach(control => {
      switch (tipo) {
        case 'manana':
          control.patchValue({
            horaInicio: '08:00',
            horaFin: '13:00'
          });
          break;
        case 'tarde':
          control.patchValue({
            horaInicio: '14:00',
            horaFin: '19:00'
          });
          break;
        case 'completo':
          control.patchValue({
            horaInicio: '08:00',
            horaFin: '18:00'
          });
          break;
        case 'personalizado':
          // Permitir al usuario personalizar
          break;
      }
    });
  }

  guardarDisponibilidad() {
    if (this.horarioForm.valid) {
      this.guardando = true;
      
      const staffMedicoId = this.getMedicoIdFromSession();
      const horariosActivos = this.horariosFormArray.value.filter((horario: any) => horario.activo);

      const operacion = this.modoEdicion 
        ? this.disponibilidadService.update(this.disponibilidadEditando!.id!, {
            id: this.disponibilidadEditando!.id!,
            staffMedicoId,
            horarios: horariosActivos
          } as DisponibilidadMedico)
        : this.disponibilidadService.create({
            staffMedicoId,
            horarios: horariosActivos
          } as DisponibilidadMedico);

      operacion.subscribe({
        next: () => {
          this.guardando = false;
          this.cancelarFormulario();
          this.cargarDisponibilidades();
          alert(this.modoEdicion ? 'Horarios actualizados correctamente' : 'Horarios guardados correctamente');
        },
        error: (error) => {
          console.error('Error al guardar:', error);
          this.guardando = false;
          alert('Error al guardar los horarios');
        }
      });
    }
  }

  editarDisponibilidad(disponibilidad: DisponibilidadMedico) {
    this.modoEdicion = true;
    this.disponibilidadEditando = disponibilidad;
    this.mostrarFormulario = true;

    // Limpiar formulario actual
    this.horariosFormArray.clear();
    this.diasSeleccionados.clear();

    // Cargar datos para edición
    disponibilidad.horarios?.forEach(horario => {
      this.diasSeleccionados.add(horario.dia);
      const horarioGroup = this.fb.group({
        dia: [horario.dia, Validators.required],
        horaInicio: [horario.horaInicio.slice(0, 5), Validators.required],
        horaFin: [horario.horaFin.slice(0, 5), Validators.required],
        activo: [true]
      });
      this.horariosFormArray.push(horarioGroup);
    });
  }

  eliminarDisponibilidad(disponibilidad: DisponibilidadMedico) {
    if (confirm('¿Estás seguro de eliminar esta disponibilidad? Esta acción no se puede deshacer.')) {
      if (disponibilidad.id) {
        this.disponibilidadService.remove(disponibilidad.id!).subscribe({
          next: () => {
            this.cargarDisponibilidades();
            alert('Disponibilidad eliminada correctamente');
          },
          error: (error: any) => {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar la disponibilidad');
          }
        });
      }
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.disponibilidadEditando = null;
    this.horariosFormArray.clear();
    this.diasSeleccionados.clear();
  }

  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
  }

  private getMedicoIdFromSession(): number {
    const medicoId = localStorage.getItem('medicoId');
    return medicoId ? parseInt(medicoId, 10) : 1;
  }
}