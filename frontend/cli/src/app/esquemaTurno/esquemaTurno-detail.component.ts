import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EsquemaTurnoService } from './esquemaTurno.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { ConsultorioService } from '../consultorios/consultorio.service';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { EsquemaTurno } from './esquemaTurno';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { Consultorio } from '../consultorios/consultorio';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-esquema-turno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4" *ngIf="esquema">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="card-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="header-text">
              <h1>{{ esNuevo ? 'Nuevo Esquema de Turno' : 'Esquema #' + esquema.id }}</h1>
              <p>{{ esNuevo ? 'Configure un nuevo esquema de turnos' : 'Gestione el esquema de turnos' }}</p>
            </div>
          </div>
        </div>

        <!-- BODY DEL CARD -->
        <div class="card-body">
          <!-- MODO VISTA -->
          <div *ngIf="!modoEdicion">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--staff-medico-gradient);">👨‍⚕️</span>
                  Disponibilidad Médica
                </div>
                <div class="info-value">
                  {{ getDisponibilidadLabelForCurrent() }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--centro-atencion-gradient);">🏥</span>
                  Centro de Atención
                </div>
                <div class="info-value">
                  {{ getCentroNombre() }}
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--consultorios-gradient);">🚪</span>
                  Consultorio
                </div>
                <div class="info-value">
                  <span *ngIf="esquema.consultorioId && getConsultorioNombre(); else sinConsultorio">
                    {{ getConsultorioNombre() }}
                  </span>
                  <ng-template #sinConsultorio>
                    <span class="text-danger">
                      <i class="fas fa-exclamation-triangle me-1"></i>
                      Sin consultorio asignado
                    </span>
                    <small class="d-block text-warning mt-1">
                      <i class="fas fa-edit me-1"></i>
                      Este esquema requiere un consultorio específico para funcionar correctamente
                    </small>
                  </ng-template>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--esquema-turno-gradient);">⏱️</span>
                  Intervalo
                </div>
                <div class="info-value">
                  {{ esquema.intervalo }} minutos
                </div>
              </div>


              <div class="info-item full-width">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--disponibilidad-gradient);">🕐</span>
                  Horarios de Disponibilidad
                </div>
                <div class="horarios-disponibles">
                  <div *ngFor="let horario of esquema.horariosDisponibilidad" class="horario-card">
                    <span class="dia-label">{{ horario.dia }}</span>
                    <span class="hora-label">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                  </div>
                  <div *ngIf="!esquema.horariosDisponibilidad || esquema.horariosDisponibilidad.length === 0" 
                       class="no-horarios">
                    Sin horarios configurados
                  </div>
                </div>
              </div>

              <!-- Horarios del Consultorio -->
              <div class="info-item full-width" *ngIf="getConsultorioSeleccionado()">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--consultorios-gradient);">🏢</span>
                  Horarios de Atención del Consultorio
                </div>
                <div class="consultorio-horarios">                 
                  <!-- Horarios específicos por día -->
                  <div *ngIf="getConsultorioSeleccionado()?.horariosSemanales && getConsultorioSeleccionado()?.horariosSemanales!.length > 0"
                       class="horarios-especificos">
                    <h6>Horarios por Día</h6>
                    <div class="horarios-disponibles">
                      <div *ngFor="let horario of getConsultorioSeleccionado()?.horariosSemanales" 
                           class="horario-card consultorio"
                           [class.inactivo]="!horario.activo">
                        <span class="dia-label">{{ horario.diaSemana }}</span>
                        <span class="hora-label" *ngIf="horario.activo && horario.horaApertura && horario.horaCierre">
                          {{ horario.horaApertura }} - {{ horario.horaCierre }}
                        </span>
                        <span class="hora-label cerrado" *ngIf="!horario.activo">CERRADO</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Sin horarios configurados -->
                  <div *ngIf="!getConsultorioSeleccionado()?.horariosSemanales || getConsultorioSeleccionado()?.horariosSemanales!.length === 0"
                       class="no-horarios">
                    El consultorio no tiene horarios de atención configurados
                  </div>
                  
                  <div class="form-help">
                    <i class="fas fa-info-circle text-info me-1"></i>
                    Horarios de atención del consultorio seleccionado (solo informativo).
                  </div>
                </div>
              </div>

              <div class="info-item full-width" *ngIf="esquema.horarios && esquema.horarios.length > 0">
                <div class="info-label">
                  <span class="info-icon" style="background: var(--esquema-turno-gradient);">📅</span>
                  Horarios del Esquema
                </div>
                <div class="horarios-esquema">
                  <div *ngFor="let horario of esquema.horarios" class="horario-card">
                    <span class="dia-label">{{ horario.dia }}</span>
                    <span class="hora-label">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MODO EDICIÓN -->
          <form *ngIf="modoEdicion" (ngSubmit)="save()" #form="ngForm">
            <div class="row">
              <!-- Disponibilidad Médica -->
              <div class="col-12">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--staff-medico-gradient);">👨‍⚕️</span>
                    Disponibilidad Médica
                  </label>
                  <select
                    [(ngModel)]="selectedDisponibilidadId"
                    name="disponibilidadMedicoId"
                    class="form-control form-control-modern"
                    required
                    (change)="onDisponibilidadChange()"
                  >
                    <option [ngValue]="null">Seleccione una disponibilidad...</option>
                    <option *ngFor="let disp of disponibilidadesMedico" [ngValue]="disp.id">
                      {{ getDisponibilidadLabel(disp) }}
                    </option>
                  </select>
                  <div class="form-help">
                    Seleccione la disponibilidad médica base para el esquema.
                  </div>
                </div>
              </div>

              <!-- Centro de Atención (readonly) -->
              <div class="col-md-6" *ngIf="esquema.centroId">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--centro-atencion-gradient);">🏥</span>
                    Centro de Atención
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-modern"
                    [value]="getCentroNombre()"
                    readonly
                  />
                  <div class="form-help">
                    Centro asignado automáticamente según el médico seleccionado.
                  </div>
                </div>
              </div>

              <!-- Consultorio -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--consultorios-gradient);">🚪</span>
                    Consultorio <span class="text-danger">*</span>
                  </label>
                  <select
                    [(ngModel)]="esquema.consultorioId"
                    name="consultorioId"
                    class="form-control form-control-modern"
                    required
                    (change)="onConsultorioChange()"
                  >
                    <option [ngValue]="null">Seleccione un consultorio...</option>
                    <option *ngFor="let consultorio of consultorios" [value]="consultorio.id">
                      {{ consultorio.nombre }}
                    </option>
                  </select>
                  <div class="form-help">
                    <i class="fas fa-exclamation-triangle text-warning me-1"></i>
                    <strong>Campo obligatorio:</strong> Debe seleccionar un consultorio específico para este esquema de turnos.
                  </div>
                </div>
              </div>

              <!-- Intervalo -->
              <div class="col-md-6">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--esquema-turno-gradient);">⏱️</span>
                    Intervalo (minutos)
                  </label>
                  <input
                    type="number"
                    class="form-control form-control-modern"
                    [(ngModel)]="esquema.intervalo"
                    name="intervalo"
                    required
                    min="1"
                    placeholder="15"
                  />
                  <div class="form-help">
                    Duración de cada turno en minutos.
                  </div>
                </div>
              </div>
                <!-- Horarios del Consultorio Seleccionado (readonly) -->
              <div class="col-12" *ngIf="consultorioHorarios && consultorioHorarios.length > 0">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--consultorios-gradient);">🏢</span>
                    Horarios de Atención del Consultorio
                  </label>
                  <div class="horarios-table">
                    <div class="table-header">
                      <span>Día</span>
                      <span>Hora Inicio</span>
                      <span>Hora Fin</span>
                    </div>
                    <div *ngFor="let horario of consultorioHorarios" class="table-row consultorio-row">
                      <span>{{ horario.dia }}</span>
                      <span>{{ horario.horaInicio }}</span>
                      <span>{{ horario.horaFin }}</span>
                    </div>
                  </div>
                  <div class="form-help">
                    <i class="fas fa-info-circle text-info me-1"></i>
                    Horarios de atención del consultorio seleccionado. Configure los horarios del esquema dentro de estos horarios.
                  </div>
                </div>
              </div>


              <!-- Horarios de Disponibilidad (readonly) -->
              <div class="col-12" *ngIf="esquema.horariosDisponibilidad && esquema.horariosDisponibilidad.length > 0">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--disponibilidad-gradient);">🕐</span>
                    Horarios de Disponibilidad del Médico
                  </label>
                  <div class="horarios-table">
                    <div class="table-header">
                      <span>Día</span>
                      <span>Hora Inicio</span>
                      <span>Hora Fin</span>
                    </div>
                    <div *ngFor="let horario of esquema.horariosDisponibilidad" class="table-row">
                      <span>{{ horario.dia }}</span>
                      <span>{{ horario.horaInicio }}</span>
                      <span>{{ horario.horaFin }}</span>
                    </div>
                  </div>
                  <div class="form-help">
                    Horarios base del médico según su disponibilidad.
                  </div>
                </div>
              </div>

              <!-- Horarios del Consultorio -->
              <div class="col-12" *ngIf="getConsultorioSeleccionado()">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--consultorios-gradient);">🏢</span>
                    Horarios de Atención del Consultorio
                  </label>
                  
                  <div *ngIf="getConsultorioSeleccionado()?.horariosSemanales && getConsultorioSeleccionado()?.horariosSemanales!.length > 0"
                       class="horarios-especificos">
                    <h6>Horarios por Día</h6>
                    <div class="horarios-disponibles">
                      <div *ngFor="let horario of getConsultorioSeleccionado()?.horariosSemanales" 
                           class="horario-card consultorio"
                           [class.inactivo]="!horario.activo">
                        <span class="dia-label">{{ horario.diaSemana }}</span>
                        <span class="hora-label" *ngIf="horario.activo && horario.horaApertura && horario.horaCierre">
                          {{ horario.horaApertura }} - {{ horario.horaCierre }}
                        </span>
                        <span class="hora-label cerrado" *ngIf="!horario.activo">CERRADO</span>
                      </div>
                    </div>
                  </div>
                  
                  <div *ngIf="!getConsultorioSeleccionado()?.horariosSemanales || getConsultorioSeleccionado()?.horariosSemanales!.length === 0"
                       class="no-horarios">
                    El consultorio no tiene horarios de atención configurados
                  </div>
                  
                  <div class="form-help">
                    <i class="fas fa-info-circle text-info me-1"></i>
                    Horarios de atención del consultorio seleccionado (solo informativo).
                  </div>
                </div>
              </div>

              <!-- Horarios Disponibles (Traspolación) -->
              <div class="col-12" *ngIf="horariosDisponibles && horariosDisponibles.length > 0">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">✅</span>
                    Horarios Disponibles (Intersección)
                  </label>
                  <div class="horarios-disponibles-agrupados">
                    <div *ngFor="let dia of getDiasDisponibles()" class="dia-grupo">
                      <h6 class="dia-grupo-titulo">{{ dia }}</h6>
                      <div class="segmentos-dia">
                        <div *ngFor="let horario of getSegmentosDisponiblesDelDia(dia)" 
                             class="horario-card disponible clickeable"
                             [class.seleccionado]="esHorarioSeleccionado(horario)"
                             (click)="seleccionarHorarioDisponible(horario)"
                             [title]="esHorarioSeleccionado(horario) ? 'Horario ya seleccionado - Click para deseleccionar' : 'Click para agregar este horario al esquema'">
                          <span class="hora-label">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                          <div class="selection-indicator">
                            <i *ngIf="esHorarioSeleccionado(horario)" class="fas fa-check-circle"></i>
                            <i *ngIf="!esHorarioSeleccionado(horario)" class="fas fa-plus-circle"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="action-buttons">
                    <button 
                      type="button" 
                      class="btn btn-select-all" 
                      (click)="seleccionarTodosLosHorarios()"
                      [disabled]="!horariosDisponibles || horariosDisponibles.length === 0"
                      title="Seleccionar todos los horarios disponibles"
                    >
                      <i class="fas fa-check-double me-2"></i>
                      Seleccionar Todos
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-clear-all" 
                      (click)="limpiarTodosLosHorarios()"
                      [disabled]="!esquema.horarios || esquema.horarios.length === 0"
                      title="Limpiar todos los horarios del esquema"
                    >
                      <i class="fas fa-eraser me-2"></i>
                      Limpiar Todo
                    </button>
                  </div>
                  <div class="form-help">
                    <i class="fas fa-mouse-pointer text-success me-1"></i>
                    <strong>Horarios clickeables:</strong> Haga click en cualquier segmento disponible para agregarlo al esquema. Los horarios ya seleccionados aparecen marcados con ✓ y pueden clickearse nuevamente para deseleccionarlos. Puede tener múltiples horarios por día.
                  </div>
                </div>
              </div>

              <!-- Horarios Ocupados por Otros Esquemas -->
              <div class="col-12" *ngIf="horariosOcupados && horariosOcupados.length > 0">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">🚫</span>
                    Horarios Ya Ocupados
                  </label>
                  <div class="horarios-disponibles">
                    <div *ngFor="let horario of horariosOcupados" class="horario-card ocupado">
                      <span class="dia-label">{{ horario.dia }}</span>
                      <span class="hora-label">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                      <small class="medico-label">{{ horario.medicoNombre }}</small>
                    </div>
                  </div>
                  <div class="form-help">
                    <i class="fas fa-ban text-danger me-1"></i>
                    <strong>Horarios no disponibles:</strong> Estos horarios ya están ocupados por otros esquemas en el mismo consultorio.
                  </div>
                </div>
              </div>

              <!-- Alerta si no hay horarios disponibles -->
              <div class="col-12" *ngIf="esquema.horariosDisponibilidad && esquema.horariosDisponibilidad.length > 0 && 
                                        consultorioHorarios && consultorioHorarios.length > 0 && 
                                        (!horariosDisponibles || horariosDisponibles.length === 0)">
                <div class="alert alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  <strong>Sin horarios compatibles:</strong> 
                  <span *ngIf="horariosOcupados && horariosOcupados.length > 0">
                    Todos los horarios están ocupados por otros esquemas, o no hay coincidencias entre la disponibilidad médica y los horarios del consultorio.
                  </span>
                  <span *ngIf="!horariosOcupados || horariosOcupados.length === 0">
                    No hay coincidencias entre los horarios de disponibilidad del médico y los horarios de atención del consultorio.
                  </span>
                  Por favor, seleccione otra combinación.
                </div>
              </div>

              <!-- Horarios del Esquema -->
              <div class="col-12">
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="form-icon" style="background: var(--esquema-turno-gradient);">📅</span>
                    Horarios del Esquema
                  </label>
                  
                  <div *ngFor="let horario of esquema.horarios; let i = index" class="horario-form-row">
                    <div class="row g-2">
                      <div class="col-4">
                        <select
                          [(ngModel)]="horario.dia"
                          [name]="'dia-' + i"
                          class="form-control form-control-sm"
                          required
                        >
                          <option value="">Seleccionar día...</option>
                          <option *ngFor="let dia of getDiasDisponibles()" [value]="dia">{{ dia }}</option>
                        </select>
                      </div>
                      <div class="col-3">
                        <input
                          type="time"
                          class="form-control form-control-sm"
                          [(ngModel)]="horario.horaInicio"
                          [name]="'horaInicio-' + i"
                          [min]="getRangoHorarioDisponible(horario.dia)?.horaInicio || ''"
                          [max]="getRangoHorarioDisponible(horario.dia)?.horaFin || ''"
                          [title]="horario.dia ? 'Disponible de ' + getRangoHorarioDisponible(horario.dia)?.horaInicio + ' a ' + getRangoHorarioDisponible(horario.dia)?.horaFin : 'Seleccione primero un día'"
                          required
                        />
                      </div>
                      <div class="col-3">
                        <input
                          type="time"
                          class="form-control form-control-sm"
                          [(ngModel)]="horario.horaFin"
                          [name]="'horaFin-' + i"
                          [min]="getRangoHorarioDisponible(horario.dia)?.horaInicio || ''"
                          [max]="getRangoHorarioDisponible(horario.dia)?.horaFin || ''"
                          [title]="horario.dia ? 'Disponible de ' + getRangoHorarioDisponible(horario.dia)?.horaInicio + ' a ' + getRangoHorarioDisponible(horario.dia)?.horaFin : 'Seleccione primero un día'"
                          required
                        />
                      </div>
                      <div class="col-2">
                        <button
                          type="button"
                          class="btn btn-delete-small"
                          (click)="removeHorario(i)"
                          title="Eliminar horario"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    class="btn btn-add-horario" 
                    (click)="addHorario()"
                    [disabled]="!horariosDisponibles || horariosDisponibles.length === 0"
                    [title]="(!horariosDisponibles || horariosDisponibles.length === 0) ? 'Debe seleccionar una disponibilidad médica y un consultorio primero' : 'Agregar nuevo horario'"
                  >
                    <i class="fas fa-plus me-2"></i>
                    Agregar Horario
                  </button>
                  
                  <div class="form-help">
                    <i class="fas fa-info-circle text-info me-1"></i>
                    Configure los horarios específicos para este esquema. Los horarios deben estar dentro de los rangos disponibles mostrados arriba.
                    <div *ngIf="!horariosDisponibles || horariosDisponibles.length === 0" class="text-warning mt-1">
                      <i class="fas fa-exclamation-triangle me-1"></i>
                      Seleccione primero una disponibilidad médica y un consultorio para habilitar la configuración de horarios.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- FOOTER DEL CARD -->
        <div class="card-footer">
          <div class="d-flex gap-2 flex-wrap">
            <!-- Botones en modo vista -->
            <ng-container *ngIf="!modoEdicion">
              <button type="button" class="btn btn-modern btn-back" (click)="goBack()">
                ← Volver
              </button>
              <button type="button" class="btn btn-modern btn-edit" (click)="activarEdicion()">
                ✏️ Editar
              </button>
              <button 
                type="button" 
                class="btn btn-modern btn-delete ms-auto" 
                (click)="remove(esquema)"
                *ngIf="esquema.id"
              >
                🗑️ Eliminar
              </button>
            </ng-container>

            <!-- Botones en modo edición -->
            <ng-container *ngIf="modoEdicion">
              <button 
                type="submit" 
                class="btn btn-modern btn-save" 
                [disabled]="allFieldsEmpty()"
                (click)="save()"
              >
                💾 Guardar
              </button>
              <button type="button" class="btn btn-modern btn-cancel" (click)="cancelar()">
                ❌ Cancelar
              </button>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos modernos para Esquema Turno Detail */
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .modern-card {
      border-radius: 1.5rem;
      overflow: hidden;
      border: none;
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      background: white;
      backdrop-filter: blur(20px);
    }
    
    .card-header {
      background: var(--esquema-turno-gradient);
      border: none;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: rotate(45deg);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 2;
    }
    
    .header-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--esquema-turno-primary);
      font-size: 1.5rem;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .header-text h1 {
      color: white;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 1rem;
    }
    
    .card-body {
      padding: 2rem;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .info-item {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 15px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    .info-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    
    .info-item.full-width {
      grid-column: 1 / -1;
    }
    
    .info-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    
    .info-value {
      font-size: 1.1rem;
      color: #343a40;
      font-weight: 500;
    }
    
    .horarios-disponibles, .horarios-esquema {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    
    .horario-card {
      background: var(--esquema-turno-gradient);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 3px 10px var(--esquema-turno-shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      min-width: 120px;
    }
    
    .dia-label {
      font-size: 0.8rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .hora-label {
      font-weight: 600;
    }
    
    .no-horarios {
      color: #6c757d;
      font-style: italic;
      padding: 1rem;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 10px;
    }
    
    /* Estilos específicos para horarios del consultorio */
    .consultorio-horarios {
      margin-top: 0.5rem;
    }
    
    .horario-default {
      margin-bottom: 1.5rem;
    }
    
    .horario-default h6 {
      color: #495057;
      font-weight: 600;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .horarios-especificos {
      margin-top: 1rem;
    }
    
    .horarios-especificos h6 {
      color: #495057;
      font-weight: 600;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .horario-card.consultorio {
      background: var(--consultorios-gradient);
      color: white;
      border: 2px solid transparent;
    }
    
    .horario-card.consultorio.inactivo {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      opacity: 0.7;
    }
    
    .hora-label.cerrado {
      color: #f8f9fa;
      font-weight: 500;
      font-style: italic;
    }

    .horario-card.disponible {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: 2px solid #20c997;
      animation: pulse-glow 2s infinite;
      position: relative;
    }

    .horario-card.clickeable {
      cursor: pointer;
      transition: all 0.3s ease;
      user-select: none;
    }

    .horario-card.clickeable:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 8px 25px rgba(32, 201, 151, 0.6);
      animation: none;
    }

    .horario-card.seleccionado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      border-color: #17a2b8;
      animation: none;
      box-shadow: 0 4px 15px rgba(23, 162, 184, 0.5);
    }

    .horario-card.seleccionado:hover {
      background: linear-gradient(135deg, #138496 0%, #117a8b 100%);
      box-shadow: 0 8px 25px rgba(23, 162, 184, 0.7);
    }

    .selection-indicator {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .selection-indicator .fa-check-circle {
      color: #28a745;
    }

    .selection-indicator .fa-plus-circle {
      color: #6c757d;
    }

    .horario-card.clickeable:hover .selection-indicator .fa-plus-circle {
      color: #28a745;
      animation: bounce 0.6s ease-in-out;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-4px);
      }
      60% {
        transform: translateY(-2px);
      }
    }
    
    @keyframes pulse-glow {
      0% { 
        box-shadow: 0 0 5px rgba(32, 201, 151, 0.7);
      }
      50% { 
        box-shadow: 0 0 20px rgba(32, 201, 151, 0.9), 0 0 30px rgba(32, 201, 151, 0.5);
      }
      100% { 
        box-shadow: 0 0 5px rgba(32, 201, 151, 0.7);
      }
    }

    .alert {
      border-radius: 15px;
      padding: 1rem 1.5rem;
      margin: 1rem 0;
      border: none;
      font-weight: 500;
    }

    .alert-warning {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      color: #856404;
      border-left: 4px solid #ffc107;
    }

    .alert-danger {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .horario-card.ocupado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      border: 2px solid #dc3545;
      position: relative;
      opacity: 0.9;
    }

    .horario-card.ocupado::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        rgba(255,255,255,0.1),
        rgba(255,255,255,0.1) 10px,
        transparent 10px,
        transparent 20px
      );
      pointer-events: none;
    }

    .medico-label {
      font-size: 0.7rem;
      opacity: 0.8;
      font-style: italic;
      margin-top: 0.25rem;
      display: block;
    }
    
    /* Estilos del formulario */
    .form-group-modern {
      margin-bottom: 2rem;
    }
    
    .form-label-modern {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .form-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    
    .form-control-modern {
      border: 2px solid #b8e6b8;
      border-radius: 15px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, #f8fffe 0%, #e8f5e8 100%);
      color: #2d5a3d;
    }
    
    .form-control-modern:focus {
      border-color: #4a9960;
      box-shadow: 0 0 0 0.2rem rgba(74, 153, 96, 0.25);
      outline: 0;
      background: linear-gradient(135deg, #ffffff 0%, #f0f8f0 100%);
    }
    
    .form-control-modern:hover {
      border-color: #82d982;
      background: linear-gradient(135deg, #fbfffa 0%, #ecf7ec 100%);
    }
    
    .form-help {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.5rem;
      font-style: italic;
    }
    
    .horarios-table {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e9ecef;
    }
    
    .table-header {
      background: var(--esquema-turno-gradient);
      color: white;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }
    
    .table-row:hover {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    
    .table-row:last-child {
      border-bottom: none;
    }

    .table-row.consultorio-row {
      background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
      border-left: 4px solid var(--consultorios-primary, #3b82f6);
    }
    
    .table-row.consultorio-row:hover {
      background: linear-gradient(135deg, #e6f3ff 0%, #dbeafe 100%);
    }
    
    .horario-form-row {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid #e9ecef;
    }
    
    .form-control-sm {
      border-radius: 8px;
      border: 2px solid #a8d8ea;
      padding: 0.375rem 0.75rem;
      background: linear-gradient(135deg, #f7fcff 0%, #e8f4f8 100%);
      color: #2c5282;
      transition: all 0.3s ease;
    }
    
    .form-control-sm:focus {
      border-color: #3182ce;
      box-shadow: 0 0 0 0.15rem rgba(49, 130, 206, 0.25);
      outline: 0;
      background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
    }
    
    .form-control-sm:hover {
      border-color: #63b3ed;
      background: linear-gradient(135deg, #fbfeff 0%, #ecf5f9 100%);
    }
    
    .btn-delete-small {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.5rem;
      font-size: 0.8rem;
      transition: all 0.3s ease;
      width: 100%;
    }
    
    .btn-delete-small:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220,53,69,0.4);
    }
    
    .btn-add-horario {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      border-radius: 15px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }
    
    .btn-add-horario:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40,167,69,0.4);
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
      margin: 1rem 0;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-select-all {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
    }

    .btn-select-all:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,123,255,0.4);
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    }

    .btn-clear-all {
      background: linear-gradient(135deg, #fd7e14 0%, #e55100 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
    }

    .btn-clear-all:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(253,126,20,0.4);
      background: linear-gradient(135deg, #e55100 0%, #bf360c 100%);
    }

    .btn-select-all:disabled,
    .btn-clear-all:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .horarios-disponibles-agrupados {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }

    .dia-grupo {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 15px;
      padding: 1rem;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .dia-grupo-titulo {
      color: #495057;
      font-weight: 700;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 0.5rem;
      border-radius: 10px;
      margin: -0.5rem -0.5rem 0.75rem -0.5rem;
    }

    .segmentos-dia {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }

    .horarios-disponibles-agrupados .horario-card {
      min-width: auto;
      padding: 0.5rem 0.75rem;
    }

    .horarios-disponibles-agrupados .dia-label {
      display: none; /* No necesario en la vista agrupada */
    }
    
    /* Footer y botones */
    .card-footer {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: none;
      padding: 1.5rem 2rem;
    }
    
    .btn-modern {
      border-radius: 25px;
      padding: 0.7rem 1.5rem;
      font-weight: 600;
      border: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-back {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    .btn-edit {
      background: var(--esquema-turno-gradient);
      color: white;
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }
    
    .btn-save {
      background: var(--esquema-turno-gradient);
      color: white;
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #212529;
    }
    
    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    .btn-modern:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .card-header {
        padding: 1.5rem;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .header-text h1 {
        font-size: 1.5rem;
      }
      
      .card-body {
        padding: 1rem;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .horarios-disponibles, .horarios-esquema {
        justify-content: center;
      }
      
      .table-header, .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        text-align: center;
      }
      
      .d-flex {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .ms-auto {
        margin-left: 0 !important;
      }
    }
  `]
})
export class EsquemaTurnoDetailComponent {
  esquema: EsquemaTurno = {
    id: 0,
    staffMedicoId: null as any,
    consultorioId: null as any,
    disponibilidadMedicoId: null as any,
    centroId: null as any,
    horarios: [],
    intervalo: 15,
  } as EsquemaTurno;
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];
  disponibilidadesMedico: DisponibilidadMedico[] = [];
  selectedDisponibilidadId: number | null = null;
  consultorioHorarios: any[] = []; // Horarios del consultorio seleccionado
  horariosDisponibles: any[] = []; // Horarios resultantes de la traspolación
  esquemasPreviosConsultorio: EsquemaTurno[] = []; // Esquemas ya existentes en el consultorio
  horariosOcupados: any[] = []; // Horarios ya ocupados por otros esquemas
  modoEdicion = false;
  esNuevo = false;

  // ==================== NAVIGATION PARAMETERS (SRP) ====================
  fromCentro: string | null = null;
  returnTab: string | null = null;

  diasSemana: string[] = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  diasSemanaMap: { [key: string]: string } = {
    'Monday': 'LUNES',
    'Tuesday': 'MARTES', 
    'Wednesday': 'MIÉRCOLES',
    'Thursday': 'JUEVES',
    'Friday': 'VIERNES',
    'Saturday': 'SÁBADO',
    'Sunday': 'DOMINGO',
    'LUNES': 'LUNES',
    'MARTES': 'MARTES',
    'MIÉRCOLES': 'MIÉRCOLES',
    'MIERCOLES': 'MIÉRCOLES', // Sin tilde -> con tilde
    'JUEVES': 'JUEVES',
    'VIERNES': 'VIERNES',
    'SÁBADO': 'SÁBADO',
    'SABADO': 'SÁBADO', // Sin tilde -> con tilde
    'DOMINGO': 'DOMINGO'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private esquemaTurnoService: EsquemaTurnoService,
    private staffMedicoService: StaffMedicoService,
    private consultorioService: ConsultorioService,
    private disponibilidadMedicoService: DisponibilidadMedicoService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    // Read navigation parameters
    this.fromCentro = this.route.snapshot.queryParamMap.get('fromCentro');
    this.returnTab = this.route.snapshot.queryParamMap.get('returnTab');
    
    // Cargar datos dependientes primero
    this.loadStaffMedicos(() => {
      this.loadDisponibilidadesMedico(() => {
        // Una vez cargados todos los datos, procesar el esquema
        this.get();
      });
    });
  }

  // Helper methods for template binding to replace arrow functions
  getDisponibilidadById(): DisponibilidadMedico | undefined {
    return this.disponibilidadesMedico.find(d => d.id === this.esquema.disponibilidadMedicoId);
  }

  getDisponibilidadLabelForCurrent(): string {
    const disp = this.getDisponibilidadById();
    return disp ? this.getDisponibilidadLabel(disp) : '';
  }

  getConsultorioNombre(): string {
    const consultorio = this.consultorios.find(c => c.id === this.esquema.consultorioId);
    return consultorio?.nombre || 'Sin consultorio';
  }

  getConsultorioSeleccionado(): Consultorio | undefined {
    return this.consultorios.find(c => c.id === this.esquema.consultorioId);
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'esquema-turno/new') {
      this.modoEdicion = true;
      this.esNuevo = true;
      
      // Auto-completar con parámetros de query si vienen del centro de atención
      const consultorioId = this.route.snapshot.queryParamMap.get('consultorioId');
      const centroAtencionId = this.route.snapshot.queryParamMap.get('centroAtencionId');
      
      if (consultorioId && centroAtencionId) {
        this.esquema.consultorioId = Number(consultorioId);
        this.esquema.centroId = Number(centroAtencionId);
        
        // Cargar consultorios para el centro específico
        this.loadConsultorios(Number(centroAtencionId));
      }
    } else if (path === 'esquema-turno/:id') {
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      this.esNuevo = false;

      const idParam = this.route.snapshot.paramMap.get('id');
      if (!idParam) {
        console.error('El ID proporcionado no es válido.');
        return;
      }

      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }

      this.esquemaTurnoService.get(id).subscribe({
        next: (dataPackage) => {
          if (!dataPackage || !dataPackage.data) {
            console.error('No se recibieron datos del esquema de turno');
            this.modalService.alert('Error', 'No se pudieron cargar los datos del esquema de turno.');
            return;
          }

          this.esquema = <EsquemaTurno>dataPackage.data;

          // Validar que el esquema se haya asignado correctamente
          if (!this.esquema) {
            console.error('El esquema de turno está vacío');
            this.modalService.alert('Error', 'Los datos del esquema de turno están vacíos.');
            return;
          }

          // Convertir los días al formato esperado
          if (this.esquema.horarios && Array.isArray(this.esquema.horarios)) {
            this.esquema.horarios = this.esquema.horarios.map(horario => ({
              ...horario,
              dia: this.diasSemanaMap[horario.dia] || horario.dia, // Convertir el día si es necesario
            }));
          } else {
            // Si no hay horarios, inicializar como array vacío
            this.esquema.horarios = [];
          }

          // Asignar la disponibilidad seleccionada
          this.selectedDisponibilidadId = this.esquema.disponibilidadMedicoId ?? null;
          
          // Si hay una disponibilidad asociada, cargar sus horarios
          if (this.esquema.disponibilidadMedicoId) {
            const disp = this.disponibilidadesMedico.find(d => d.id === this.esquema.disponibilidadMedicoId);
            if (disp && disp.horarios) {
              this.esquema.horariosDisponibilidad = disp.horarios.map(horario => ({
                dia: horario.dia,
                horaInicio: horario.horaInicio,
                horaFin: horario.horaFin
              }));
            } else {
              this.esquema.horariosDisponibilidad = [];
            }
          } else {
            this.esquema.horariosDisponibilidad = [];
          }

          // Cargar consultorios si hay un centro asociado
          if (this.esquema.centroId) {
            this.loadConsultorios(this.esquema.centroId, () => {
              // Una vez cargados los consultorios, cargar horarios del consultorio si está seleccionado
              if (this.esquema.consultorioId) {
                this.onConsultorioChange();
              }
            });
          }
          
          // Si hay consultorio seleccionado, cargar esquemas previos
          if (this.esquema.consultorioId) {
            this.loadEsquemasPreviosConsultorio(() => {
              this.calcularHorariosDisponibles();
            });
          }
        },
        error: (err) => {
          console.error('Error al cargar el esquema de turno:', err);
          this.modalService.alert('Error', 'No se pudo cargar el esquema de turno.');
        }
      });
    }
  }

  loadDisponibilidadesMedico(callback?: () => void): void {
    this.disponibilidadMedicoService.all().subscribe(dp => {
      this.disponibilidadesMedico = dp.data as DisponibilidadMedico[];
      if (callback) callback();
    });
  }

  loadStaffMedicos(callback?: () => void): void {
    this.staffMedicoService.all().subscribe(dp => {
      this.staffMedicos = dp.data as StaffMedico[];
      if (callback) callback();
    });
  }

  onDisponibilidadChange(): void {
    const disp = this.disponibilidadesMedico.find(d => d.id === this.selectedDisponibilidadId);
    if (disp) {
      this.esquema.staffMedicoId = disp.staffMedicoId;
      
      if (disp.horarios && Array.isArray(disp.horarios)) {
        this.esquema.horariosDisponibilidad = disp.horarios.map(horario => ({
          dia: horario.dia,
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin
        }));
      } else {
        this.esquema.horariosDisponibilidad = [];
      }
      
      this.esquema.disponibilidadMedicoId = disp.id;

      // Obtener el staff médico asociado
      const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
      if (staff) {
        this.esquema.centroId = staff.centro?.id ?? 0; // Asignar el centroId si existe, o 0 como valor predeterminado
      } else {
        this.esquema.centroId = 0; // Si no hay staff asociado, asignar 0 como valor predeterminado
      }
    }

    // Cargar los consultorios asociados al centro de atención
    if (this.esquema.centroId) {
      this.loadConsultorios(this.esquema.centroId, () => {
        // Después de cargar consultorios, calcular horarios si ya hay consultorio seleccionado
        if (this.esquema.consultorioId) {
          this.onConsultorioChange();
        }
      });
    } else {
      this.consultorios = []; // Limpiar consultorios si no hay centro asociado
      this.horariosDisponibles = []; // Limpiar horarios disponibles
    }
  }

  onConsultorioChange(): void {
    if (this.esquema.consultorioId) {
      // Buscar el consultorio seleccionado en la lista de consultorios cargados
      const consultorioSeleccionado = this.consultorios.find(c => c.id === Number(this.esquema.consultorioId));
      
      if (consultorioSeleccionado) {
        console.log('Consultorio seleccionado:', consultorioSeleccionado);
        
        // Extraer y formatear los horarios del consultorio para mostrarlos
        if (consultorioSeleccionado.horariosSemanales && consultorioSeleccionado.horariosSemanales.length > 0) {
          this.consultorioHorarios = consultorioSeleccionado.horariosSemanales
            .filter(horario => horario.activo && horario.horaApertura && horario.horaCierre)
            .map(horario => ({
              dia: horario.diaSemana,
              horaInicio: horario.horaApertura,
              horaFin: horario.horaCierre
            }));
          
          console.log('✅ Horarios del consultorio procesados:', this.consultorioHorarios);
        } else {
          this.consultorioHorarios = [];
          console.warn('⚠️ El consultorio seleccionado no tiene horarios configurados');
        }
      } else {
        this.consultorioHorarios = [];
      }
    } else {
      // Si no hay consultorio seleccionado, limpiar los horarios
      this.consultorioHorarios = [];
      this.horariosDisponibles = [];
    }

    // Calcular horarios disponibles después de cambiar el consultorio
    this.loadEsquemasPreviosConsultorio(() => {
      this.calcularHorariosDisponibles();
    });
  }
  loadConsultorios(centroId: number, callback?: () => void): void {
    this.consultorioService.getByCentroAtencion(centroId).subscribe({
      next: (dp) => {
        this.consultorios = dp.data as Consultorio[];
        console.log('Consultorios cargados:', this.consultorios);

        // Asignar el consultorioId al modelo si está disponible
        if (this.esquema.consultorioId) {
          const consultorio = this.consultorios.find(c => c.id === this.esquema.consultorioId);
          if (consultorio) {
            this.esquema.consultorioId = consultorio.id;
          } else {
            console.warn('El consultorio asociado no se encuentra en la lista de consultorios cargados.');
          }
        }
        
        // Ejecutar callback si se proporciona
        if (callback) {
          callback();
        }
      },
      error: () => {
        console.error('Error al cargar los consultorios.');
        this.consultorios = [];
      }
    });
  }

  getCentroNombre(): string {
    const staff = this.staffMedicos.find(s => s.id === this.esquema.staffMedicoId);
    return staff?.centro?.nombre ?? '';
  }



  getDisponibilidadLabel(disp: DisponibilidadMedico): string {
    const staff = this.staffMedicos.find(s => s.id === disp.staffMedicoId);
    if (!staff) return `ID ${disp.id}`;

    const medicoNombre = staff.medico ? `${staff.medico.nombre} ${staff.medico.apellido}` : 'Sin médico';
    const especialidadNombre = staff.especialidad ? staff.especialidad.nombre : 'Sin especialidad';

    const horarios = disp.horarios
      .map(horario => `${horario.dia}: ${horario.horaInicio}-${horario.horaFin}`)
      .join(', ');

    return `${medicoNombre} (${especialidadNombre}) - ${horarios}`;
  }

  save(): void {
    // Asegurar que se use la disponibilidad seleccionada
    if (this.selectedDisponibilidadId) {
      this.esquema.disponibilidadMedicoId = this.selectedDisponibilidadId;
    }

    const payload = { ...this.esquema };

    // Agregar un log para verificar el contenido del payload
    console.log('Payload enviado al backend:', payload);

    // Validar que los campos requeridos no sean null (incluyendo consultorio que ahora es obligatorio)
    if (!payload.disponibilidadMedicoId || !payload.staffMedicoId || !payload.centroId || !payload.consultorioId) {
      this.modalService.alert('Error', 'Debe completar todos los campos obligatorios (médico, disponibilidad, centro y consultorio).');
      return;
    }
    
    // Validar que hay horarios configurados
    if (!payload.horarios || payload.horarios.length === 0) {
      this.modalService.alert('Error', 'Debe configurar al menos un horario para el esquema.');
      return;
    }

    // Validar que todos los horarios estén dentro de los rangos disponibles y no tengan conflictos
    for (const horario of payload.horarios) {
      const rangoDisponible = this.getRangoHorarioDisponible(horario.dia);
      const detalleConflicto = this.obtenerDetalleConflicto(horario.dia, horario.horaInicio, horario.horaFin);
      
      if (!rangoDisponible) {
        this.modalService.alert('Error', `El día ${horario.dia} no está disponible. Seleccione un día de los horarios disponibles.`);
        return;
      }
      
      if (detalleConflicto) {
        this.modalService.alert('Error de Conflicto', `El horario para ${horario.dia} (${horario.horaInicio} - ${horario.horaFin}) tiene conflicto: ${detalleConflicto}. Por favor, seleccione otro horario.`);
        return;
      }
      
      if (!this.validarHorarioEsquema(horario.dia, horario.horaInicio, horario.horaFin)) {
        this.modalService.alert('Error', `El horario para ${horario.dia} (${horario.horaInicio} - ${horario.horaFin}) está fuera del rango disponible (${rangoDisponible.horaInicio} - ${rangoDisponible.horaFin}). Por favor, ajuste los horarios dentro de los rangos permitidos.`);
        return;
      }
    }

    this.esquemaTurnoService.create(payload).subscribe({
      next: () => {
        this.navigateBack();
      },
      error: (err) => {
        console.error('Error al guardar el esquema de turno:', err);
        this.modalService.alert('Error', 'Error al guardar el esquema de turno.');
      }
    });
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelar(): void {
    this.modoEdicion = false;
    if (this.esNuevo) {
      this.navigateBack();
    } else {
      this.get(); // Recargar datos originales
    }
  }

  goBack(): void {
    this.navigateBack();
  }

  private navigateBack(): void {
    if (this.fromCentro && this.returnTab) {
      this.router.navigate(['/centrosAtencion', this.fromCentro], {
        queryParams: { activeTab: this.returnTab }
      });
    } else if (this.fromCentro) {
      this.router.navigate(['/centrosAtencion', this.fromCentro]);
    } else {
      this.router.navigate(['/esquema-turno']);
    }
  }

  remove(esquema: EsquemaTurno): void {
    this.modalService
      .confirm(
        "Eliminar Esquema de Turno",
        "¿Está seguro que desea eliminar este esquema de turno?",
        "Si elimina el esquema no podrá recuperarlo luego"
      )
      .then(() => {
        this.esquemaTurnoService.remove(esquema.id).subscribe({
          next: () => this.router.navigate(['/esquema-turno']),
          error: (err) => {
            const msg = err?.error?.message || "Error al eliminar el esquema de turno.";
            this.modalService.alert("Error", msg);
            console.error("Error al eliminar esquema de turno:", err);
          }
        });
      });
  }

  allFieldsEmpty(): boolean {
    return !this.esquema.disponibilidadMedicoId || 
           !this.esquema.intervalo ||
           !this.esquema.consultorioId ||
           !this.esquema.horarios ||
           this.esquema.horarios.length === 0;
  }

  addHorario(): void {
    if (!this.esquema.horarios) {
      this.esquema.horarios = [];
    }
    this.esquema.horarios.push({ dia: '', horaInicio: '', horaFin: '' });
  }

  /**
   * Selecciona un horario disponible y lo agrega al esquema
   */
  seleccionarHorarioDisponible(horarioDisponible: any): void {
    if (!this.esquema.horarios) {
      this.esquema.horarios = [];
    }

    // Verificar si este horario específico ya está seleccionado
    const horarioYaSeleccionado = this.esHorarioSeleccionado(horarioDisponible);
    
    if (horarioYaSeleccionado) {
      // Si ya está seleccionado, lo deseleccionamos
      this.esquema.horarios = this.esquema.horarios.filter(horario => 
        !(this.normalizarDia(horario.dia) === this.normalizarDia(horarioDisponible.dia) &&
          horario.horaInicio === horarioDisponible.horaInicio &&
          horario.horaFin === horarioDisponible.horaFin)
      );
      return;
    }

    // Verificar si hay horarios existentes para ese día
    const horariosDelMismoDia = this.esquema.horarios.filter(h => 
      this.normalizarDia(h.dia) === this.normalizarDia(horarioDisponible.dia)
    );

    if (horariosDelMismoDia.length > 0) {
      // Preguntar si desea agregar otro horario para el mismo día
      const horariosExistentes = horariosDelMismoDia
        .map(h => `${h.horaInicio} - ${h.horaFin}`)
        .join(', ');
      
      const mensaje = `Ya hay ${horariosDelMismoDia.length} horario(s) para ${horarioDisponible.dia} (${horariosExistentes}). ¿Desea agregar este horario adicional (${horarioDisponible.horaInicio} - ${horarioDisponible.horaFin})?`;
      
      this.modalService.confirm(
        'Agregar Horario Adicional',
        mensaje,
        'Se permitirán múltiples horarios para el mismo día'
      ).then(() => {
        // Agregar horario adicional
        this.esquema.horarios.push({
          dia: horarioDisponible.dia,
          horaInicio: horarioDisponible.horaInicio,
          horaFin: horarioDisponible.horaFin
        });
      });
    } else {
      // Agregar primer horario para este día
      this.esquema.horarios.push({
        dia: horarioDisponible.dia,
        horaInicio: horarioDisponible.horaInicio,
        horaFin: horarioDisponible.horaFin
      });
    }
  }

  /**
   * Verifica si un horario disponible ya está seleccionado en el esquema
   */
  esHorarioSeleccionado(horarioDisponible: any): boolean {
    if (!this.esquema.horarios || this.esquema.horarios.length === 0) {
      return false;
    }

    return this.esquema.horarios.some(horario => 
      this.normalizarDia(horario.dia) === this.normalizarDia(horarioDisponible.dia) &&
      horario.horaInicio === horarioDisponible.horaInicio &&
      horario.horaFin === horarioDisponible.horaFin
    );
  }

  /**
   * Selecciona todos los horarios disponibles
   */
  seleccionarTodosLosHorarios(): void {
    if (!this.horariosDisponibles || this.horariosDisponibles.length === 0) {
      return;
    }

    this.modalService.confirm(
      'Seleccionar Todos los Horarios',
      '¿Desea agregar todos los horarios disponibles al esquema?',
      'Esto reemplazará cualquier horario existente'
    ).then(() => {
      this.esquema.horarios = this.horariosDisponibles.map(horario => ({
        dia: horario.dia,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      }));
    });
  }

  /**
   * Limpia todos los horarios del esquema
   */
  limpiarTodosLosHorarios(): void {
    if (!this.esquema.horarios || this.esquema.horarios.length === 0) {
      return;
    }

    this.modalService.confirm(
      'Limpiar Horarios',
      '¿Desea eliminar todos los horarios del esquema?',
      'Esta acción no se puede deshacer'
    ).then(() => {
      this.esquema.horarios = [];
    });
  }

  removeHorario(index: number): void {
    if (this.esquema.horarios && this.esquema.horarios.length > index) {
      this.esquema.horarios.splice(index, 1);
    }
  }

  loadEsquemasPreviosConsultorio(callback?: () => void): void {
    if (!this.esquema.consultorioId || !this.esquema.centroId) {
      this.esquemasPreviosConsultorio = [];
      this.horariosOcupados = [];
      if (callback) callback();
      return;
    }

    // Usar el endpoint del centro que sabemos que existe y filtrar por consultorio
    this.esquemaTurnoService.getByCentroAtencion(this.esquema.centroId).subscribe({
      next: (dp) => {
        // Filtrar esquemas del mismo consultorio (excluyendo el actual si estamos editando)
        this.esquemasPreviosConsultorio = (dp.data as EsquemaTurno[] || [])
          .filter(esquema => 
            esquema.consultorioId === this.esquema.consultorioId && 
            esquema.id !== this.esquema.id
          );
        
        // Extraer horarios ocupados
        this.horariosOcupados = [];
        for (const esquema of this.esquemasPreviosConsultorio) {
          if (esquema.horarios && Array.isArray(esquema.horarios)) {
            for (const horario of esquema.horarios) {
              this.horariosOcupados.push({
                ...horario,
                esquemaId: esquema.id,
                medicoNombre: this.getMedicoNombre(esquema.staffMedicoId)
              });
            }
          }
        }
        
        console.log('Esquemas previos del consultorio:', this.esquemasPreviosConsultorio);
        console.log('Horarios ocupados:', this.horariosOcupados);
        
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error al cargar esquemas previos del consultorio:', err);
        this.esquemasPreviosConsultorio = [];
        this.horariosOcupados = [];
        if (callback) callback();
      }
    });
  }

  private getMedicoNombre(staffMedicoId: number): string {
    const staff = this.staffMedicos.find(s => s.id === staffMedicoId);
    return staff?.medico ? `${staff.medico.nombre} ${staff.medico.apellido}` : 'Desconocido';
  }

  // ==================== MÉTODOS DE TRASPOLACIÓN ====================

  /**
   * Calcula la intersección entre horarios de disponibilidad médica y horarios del consultorio
   */
  private calcularHorariosDisponibles(): void {
    this.horariosDisponibles = [];

    if (!this.esquema.horariosDisponibilidad || this.esquema.horariosDisponibilidad.length === 0) {
      console.warn('No hay horarios de disponibilidad médica');
      return;
    }

    if (!this.consultorioHorarios || this.consultorioHorarios.length === 0) {
      console.warn('No hay horarios de consultorio');
      return;
    }

    // Para cada día de la semana, calcular la intersección de horarios
    for (const horarioMedico of this.esquema.horariosDisponibilidad) {
      const diaMedicoNormalizado = this.normalizarDia(horarioMedico.dia);
      
      const horarioConsultorio = this.consultorioHorarios.find(hc => {
        const diaConsultorioNormalizado = this.normalizarDia(hc.dia);
        const coincide = diaMedicoNormalizado === diaConsultorioNormalizado;
        
        console.log(`Comparando días:
          - Médico: "${horarioMedico.dia}" -> normalizado: "${diaMedicoNormalizado}"
          - Consultorio: "${hc.dia}" -> normalizado: "${diaConsultorioNormalizado}"
          - Coincide: ${coincide}`);
        
        return coincide;
      });

      if (horarioConsultorio) {
        console.log(`✅ Encontrada coincidencia para ${diaMedicoNormalizado}:`, {
          medico: horarioMedico,
          consultorio: horarioConsultorio
        });
        
        const interseccion = this.calcularInterseccionHorario(horarioMedico, horarioConsultorio);
        if (interseccion) {
          // Descontar horarios ya ocupados por otros esquemas
          const horariosLibres = this.descontarHorariosOcupados(interseccion);
          this.horariosDisponibles.push(...horariosLibres);
        }
      } else {
        console.log(`❌ No se encontró horario de consultorio para ${diaMedicoNormalizado}`);
      }
    }

    console.log('Horarios disponibles calculados:', this.horariosDisponibles);
  }

  /**
   * Descuenta horarios ya ocupados de un horario disponible, devolviendo segmentos libres
   */
  private descontarHorariosOcupados(horarioDisponible: any): any[] {
    const dia = horarioDisponible.dia;
    const inicioDisponible = this.timeToMinutes(horarioDisponible.horaInicio);
    const finDisponible = this.timeToMinutes(horarioDisponible.horaFin);

    // Obtener horarios ocupados para este día
    const ocupadosDelDia = this.horariosOcupados
      .filter(ocupado => this.normalizarDia(ocupado.dia) === this.normalizarDia(dia))
      .map(ocupado => ({
        inicio: this.timeToMinutes(ocupado.horaInicio),
        fin: this.timeToMinutes(ocupado.horaFin),
        medicoNombre: ocupado.medicoNombre
      }))
      .sort((a, b) => a.inicio - b.inicio);

    if (ocupadosDelDia.length === 0) {
      // No hay conflictos, devolver el horario completo
      return [horarioDisponible];
    }

    const segmentosLibres = [];
    let puntoInicio = inicioDisponible;

    for (const ocupado of ocupadosDelDia) {
      // Si hay espacio antes del horario ocupado
      if (puntoInicio < ocupado.inicio) {
        const inicioSegmento = Math.max(puntoInicio, inicioDisponible);
        const finSegmento = Math.min(ocupado.inicio, finDisponible);
        
        if (inicioSegmento < finSegmento) {
          segmentosLibres.push({
            dia: dia,
            horaInicio: this.minutesToTime(inicioSegmento),
            horaFin: this.minutesToTime(finSegmento)
          });
        }
      }
      
      // Mover el punto de inicio después del horario ocupado
      puntoInicio = Math.max(puntoInicio, ocupado.fin);
    }

    // Agregar segmento final si queda espacio
    if (puntoInicio < finDisponible) {
      segmentosLibres.push({
        dia: dia,
        horaInicio: this.minutesToTime(puntoInicio),
        horaFin: this.minutesToTime(finDisponible)
      });
    }

    return segmentosLibres;
  }

  /**
   * Calcula la intersección de horarios entre disponibilidad médica y consultorio para un día específico
   */
  private calcularInterseccionHorario(horarioMedico: any, horarioConsultorio: any): any | null {
    const inicioMedico = this.timeToMinutes(horarioMedico.horaInicio);
    const finMedico = this.timeToMinutes(horarioMedico.horaFin);
    const inicioConsultorio = this.timeToMinutes(horarioConsultorio.horaInicio);
    const finConsultorio = this.timeToMinutes(horarioConsultorio.horaFin);

    // Calcular el inicio más tardío y el fin más temprano
    const inicioInterseccion = Math.max(inicioMedico, inicioConsultorio);
    const finInterseccion = Math.min(finMedico, finConsultorio);

    // Si hay intersección válida (el inicio es antes que el fin)
    if (inicioInterseccion < finInterseccion) {
      return {
        dia: this.normalizarDia(horarioMedico.dia),
        horaInicio: this.minutesToTime(inicioInterseccion),
        horaFin: this.minutesToTime(finInterseccion)
      };
    }

    return null; // No hay intersección
  }

  /**
   * Convierte un tiempo en formato HH:mm a minutos desde medianoche
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convierte minutos desde medianoche a formato HH:mm
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Normaliza el nombre del día a formato estándar
   */
  private normalizarDia(dia: string): string {
    if (!dia) return '';
    
    const diaUpperCase = dia.toUpperCase();
    
    // Primero intentar con el mapeo directo
    if (this.diasSemanaMap[diaUpperCase]) {
      return this.diasSemanaMap[diaUpperCase];
    }
    
    // Si no encuentra, normalizar quitando tildes y espacios
    const diaNormalizado = diaUpperCase
      .replace(/Á/g, 'A')
      .replace(/É/g, 'E') 
      .replace(/Í/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ú/g, 'U')
      .replace(/\s+/g, '')
      .trim();
    
    // Mapeo manual para casos específicos
    switch (diaNormalizado) {
      case 'SABADO': return 'SÁBADO';
      case 'MIERCOLES': return 'MIÉRCOLES';
      case 'LUNES': return 'LUNES';
      case 'MARTES': return 'MARTES';
      case 'JUEVES': return 'JUEVES';
      case 'VIERNES': return 'VIERNES';
      case 'DOMINGO': return 'DOMINGO';
      default: return this.diasSemanaMap[diaNormalizado] || diaUpperCase;
    }
  }

  /**
   * Obtiene los días disponibles para agregar horarios al esquema (sin duplicados)
   */
  getDiasDisponibles(): string[] {
    const dias = this.horariosDisponibles.map(h => h.dia);
    return [...new Set(dias)]; // Eliminar duplicados
  }

  /**
   * Obtiene el rango de horarios disponibles para un día específico
   * Si hay múltiples segmentos, devuelve el rango completo (desde el inicio más temprano al fin más tardío)
   */
  getRangoHorarioDisponible(dia: string): { horaInicio: string; horaFin: string } | null {
    const horariosDelDia = this.horariosDisponibles.filter(h => h.dia === dia);
    if (horariosDelDia.length === 0) return null;

    // Si solo hay un horario, devolverlo directamente
    if (horariosDelDia.length === 1) {
      return { 
        horaInicio: horariosDelDia[0].horaInicio, 
        horaFin: horariosDelDia[0].horaFin 
      };
    }

    // Si hay múltiples horarios, calcular el rango completo
    const inicios = horariosDelDia.map(h => this.timeToMinutes(h.horaInicio));
    const fines = horariosDelDia.map(h => this.timeToMinutes(h.horaFin));
    
    return {
      horaInicio: this.minutesToTime(Math.min(...inicios)),
      horaFin: this.minutesToTime(Math.max(...fines))
    };
  }

  /**
   * Obtiene todos los segmentos de horarios disponibles para un día específico
   */
  getSegmentosDisponiblesDelDia(dia: string): any[] {
    return this.horariosDisponibles.filter(h => h.dia === dia);
  }

  /**
   * Valida si un horario del esquema está dentro de los horarios disponibles
   */
  validarHorarioEsquema(dia: string, horaInicio: string, horaFin: string): boolean {
    // Obtener todos los segmentos disponibles para este día
    const segmentosDisponibles = this.getSegmentosDisponiblesDelDia(dia);
    if (segmentosDisponibles.length === 0) return false;

    const inicioMinutos = this.timeToMinutes(horaInicio);
    const finMinutos = this.timeToMinutes(horaFin);

    // Verificar si el horario completo cabe en alguno de los segmentos disponibles
    for (const segmento of segmentosDisponibles) {
      const inicioSegmento = this.timeToMinutes(segmento.horaInicio);
      const finSegmento = this.timeToMinutes(segmento.horaFin);

      if (inicioMinutos >= inicioSegmento && finMinutos <= finSegmento) {
        return true; // El horario cabe completamente en este segmento
      }
    }

    return false; // No cabe en ningún segmento disponible
  }

  /**
   * Verifica si un horario tiene conflicto con horarios ya ocupados
   */
  verificarConfictoConHorariosOcupados(dia: string, horaInicio: string, horaFin: string): boolean {
    const inicioNuevo = this.timeToMinutes(horaInicio);
    const finNuevo = this.timeToMinutes(horaFin);

    const ocupadosDelDia = this.horariosOcupados
      .filter(ocupado => this.normalizarDia(ocupado.dia) === this.normalizarDia(dia));

    for (const ocupado of ocupadosDelDia) {
      const inicioOcupado = this.timeToMinutes(ocupado.horaInicio);
      const finOcupado = this.timeToMinutes(ocupado.horaFin);

      // Verificar si hay solapamiento
      if (!(finNuevo <= inicioOcupado || inicioNuevo >= finOcupado)) {
        return true; // Hay conflicto
      }
    }

    return false; // No hay conflicto
  }

  /**
   * Obtiene información detallada del conflicto si existe
   */
  obtenerDetalleConflicto(dia: string, horaInicio: string, horaFin: string): string | null {
    const inicioNuevo = this.timeToMinutes(horaInicio);
    const finNuevo = this.timeToMinutes(horaFin);

    const ocupadosDelDia = this.horariosOcupados
      .filter(ocupado => this.normalizarDia(ocupado.dia) === this.normalizarDia(dia));

    for (const ocupado of ocupadosDelDia) {
      const inicioOcupado = this.timeToMinutes(ocupado.horaInicio);
      const finOcupado = this.timeToMinutes(ocupado.horaFin);

      // Verificar si hay solapamiento
      if (!(finNuevo <= inicioOcupado || inicioNuevo >= finOcupado)) {
        return `Conflicto con esquema de ${ocupado.medicoNombre} (${ocupado.horaInicio} - ${ocupado.horaFin})`;
      }
    }

    return null;
  }
}