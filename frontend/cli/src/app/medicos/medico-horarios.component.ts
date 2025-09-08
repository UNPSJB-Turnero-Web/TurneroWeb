import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';

@Component({
  selector: 'app-medico-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
              <form (ngSubmit)="guardarDisponibilidad()">
                <!-- Horarios por día -->
                <div class="mb-4">
                  <label class="form-label fw-bold">Configuración de Horarios</label>
                  
                  <div *ngFor="let horario of horariosForm; let i = index" class="mb-3">
                    <div class="row align-items-center">
                      <div class="col-3">
                        <label class="form-label small">Día</label>
                        <select class="form-select" [(ngModel)]="horariosForm[i].dia" name="dia{{i}}">
                          <option value="">Seleccionar día...</option>
                          <option *ngFor="let dia of diasSemana" [value]="dia.valor">{{ dia.nombre }}</option>
                        </select>
                      </div>
                      <div class="col-3">
                        <label class="form-label small">Hora Inicio</label>
                        <input type="time" class="form-control" [(ngModel)]="horariosForm[i].horaInicio" name="horaInicio{{i}}" placeholder="--:--">
                      </div>
                      <div class="col-3">
                        <label class="form-label small">Hora Fin</label>
                        <input type="time" class="form-control" [(ngModel)]="horariosForm[i].horaFin" name="horaFin{{i}}" placeholder="--:--">
                      </div>
                      <div class="col-3 d-flex align-items-end">
                        <button type="button" class="btn btn-outline-danger btn-sm" (click)="eliminarHorario(i)" title="Eliminar horario">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <button type="button" class="btn btn-success btn-sm" (click)="agregarHorario()">
                      <i class="fas fa-plus me-1"></i> Agregar Horario
                    </button>
                  </div>
                  
                  <div class="alert alert-info py-2" *ngIf="horariosForm.length === 0">
                    <small>
                      <i class="fas fa-info-circle me-1"></i>
                      Haga clic en "Agregar Horario" para configurar días y horarios de disponibilidad.
                    </small>
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
                    [disabled]="guardando || horariosForm.length === 0">
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

  horariosForm: { dia: string, horaInicio: string, horaFin: string }[] = [];

  diasSemana = [
    { nombre: 'Lunes', valor: 'Lunes' },
    { nombre: 'Martes', valor: 'Martes' },
    { nombre: 'Miércoles', valor: 'Miércoles' },
    { nombre: 'Jueves', valor: 'Jueves' },
    { nombre: 'Viernes', valor: 'Viernes' },
    { nombre: 'Sábado', valor: 'Sábado' },
    { nombre: 'Domingo', valor: 'Domingo' }
  ];

  constructor(
    private router: Router,
    private disponibilidadService: DisponibilidadMedicoService
  ) {}

  ngOnInit() {
    this.cargarDisponibilidades();
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

  agregarHorario() {
    this.horariosForm.push({ dia: '', horaInicio: '08:00', horaFin: '17:00' });
  }

  eliminarHorario(index: number) {
    this.horariosForm.splice(index, 1);
  }

  aplicarPlantilla(tipo: string) {
    this.horariosForm.forEach(horario => {
      switch (tipo) {
        case 'manana':
          horario.horaInicio = '08:00';
          horario.horaFin = '13:00';
          break;
        case 'tarde':
          horario.horaInicio = '14:00';
          horario.horaFin = '19:00';
          break;
        case 'completo':
          horario.horaInicio = '08:00';
          horario.horaFin = '18:00';
          break;
      }
    });
  }

  guardarDisponibilidad() {
    const horarios = this.horariosForm.filter(h => h.dia && h.horaInicio && h.horaFin);
    
    if (horarios.length === 0) {
      alert('Debe configurar al menos un horario');
      return;
    }

    this.guardando = true;
    const staffMedicoId = this.getMedicoIdFromSession();

    if (this.disponibilidades.length > 0) {
      // Actualizar disponibilidad existente
      const disponibilidadExistente = this.disponibilidades[0];
      const operacion = this.disponibilidadService.update(disponibilidadExistente.id!, {
        id: disponibilidadExistente.id!,
        staffMedicoId,
        horarios
      } as DisponibilidadMedico);

      operacion.subscribe({
        next: () => {
          this.guardando = false;
          this.cancelarFormulario();
          this.cargarDisponibilidades();
          alert('Horarios actualizados correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.guardando = false;
          alert('Error al actualizar los horarios');
        }
      });
    } else {
      // Crear nueva disponibilidad
      const operacion = this.disponibilidadService.create({
        id: 0,
        staffMedicoId,
        horarios
      } as DisponibilidadMedico);

      operacion.subscribe({
        next: () => {
          this.guardando = false;
          this.cancelarFormulario();
          this.cargarDisponibilidades();
          alert('Horarios guardados correctamente');
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

    // Cargar datos para edición
    this.horariosForm = disponibilidad.horarios?.map(horario => ({
      dia: horario.dia,
      horaInicio: horario.horaInicio.slice(0, 5),
      horaFin: horario.horaFin.slice(0, 5)
    })) || [];
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
    this.horariosForm = [];
  }

  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
  }

  private getMedicoIdFromSession(): number {
    const medicoId = localStorage.getItem('medicoId');
    return medicoId ? parseInt(medicoId, 10) : 1;
  }
}