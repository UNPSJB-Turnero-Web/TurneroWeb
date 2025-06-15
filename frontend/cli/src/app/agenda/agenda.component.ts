import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { AgendaService } from './agenda.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PacienteService } from '../pacientes/paciente.service';
import { HttpClient } from '@angular/common/http';
import { DiasExcepcionalesService } from './dias-excepcionales.service';

interface SlotDisponible {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  staffMedicoId: number;
  staffMedicoNombre: string;
  staffMedicoApellido: string;
  especialidadStaffMedico: string;
  consultorioId: number;
  consultorioNombre: string;
  centroId: number;
  nombreCentro: string;
  ocupado?: boolean;
  esSlot?: boolean;
  pacienteId?: number;
  pacienteNombre?: string;
  pacienteApellido?: string;
  enMantenimiento?: boolean;
  titulo?: string;
}


@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  template: `
    <div class="container mt-4">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="card-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="header-text">
              <h1>Agenda de Turnos</h1>
              <p>Gestione y visualice todos los turnos médicos</p>
            </div>
          </div>
        </div>

        <!-- BODY DEL CARD -->
        <div class="card-body">
          <!-- Formulario de búsqueda modernizado -->
          <div class="search-section">
            <div class="search-card">
              <div class="search-header">
                <span class="search-icon">🔍</span>
                <h3>Filtros de Búsqueda</h3>
              </div>
              <form class="search-form">
                <div class="search-row">
                  <div class="search-field">
                    <label class="search-label">
                      <span class="label-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">🎯</span>
                      Filtrar por
                    </label>
                    <select class="form-control-modern" [(ngModel)]="filterType" name="filterType">
                      <option value="staffMedico">Staff Médico</option>
                      <option value="centroAtencion">Centro de Atención</option>
                      <option value="consultorio">Consultorio</option>
                      <option value="especialidad">Especialidad</option>
                    </select>
                  </div>
                  
                  <div class="search-field">
                    <label class="search-label">
                      <span class="label-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">✍️</span>
                      Valor de búsqueda
                    </label> 
                    <input
                      type="text"
                      class="form-control-modern"
                      [(ngModel)]="filterValue"
                      name="filterValue"
                      placeholder="Ingrese el valor a buscar"
                      list="filterOptions"
                    />
                    <datalist id="filterOptions">
                      <option *ngFor="let option of getFilterOptions()" [value]="option"></option>
                    </datalist>
                  </div>
                </div>
                
                <div class="search-actions">
                  <button type="button" class="btn btn-modern btn-search" (click)="applyFilter()">
                    🔍 Buscar
                  </button>
                  <button type="button" class="btn btn-modern btn-clear" (click)="clearFilter()">
                    🧹 Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- INFORMACIÓN DE TURNOS AFECTADOS -->
          <div class="turnos-afectados-info" *ngIf="turnosAfectados.length > 0">
            <div class="alert">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ turnosAfectados.length }} turnos afectados por días excepcionales se muestran en sus fechas correspondientes con indicadores especiales</span>
            </div>
          </div>
          <!-- TURNOS DISPONIBLES AGRUPADOS POR FECHA -->
          <div class="turnos-card">
            <div class="turnos-header">
              <div class="header-info">
                <h3><i class="fas fa-calendar-alt"></i> Agenda de Turnos</h3>
                <div class="turnos-info">
                  <span class="info-text">{{ slotsDisponibles.length }} turnos encontrados</span>
                  <span class="info-text" *ngIf="turnosAfectados.length > 0">
                    | {{ turnosAfectados.length }} afectados por días excepcionales
                  </span>
                </div>
              </div>
            </div>
            
            <div class="turnos-body">
              <!-- Loading State -->
              <div class="loading-turnos" *ngIf="isLoading">
                <i class="fas fa-spinner fa-spin"></i>
                Cargando agenda...
              </div>

              <!-- Turnos Agrupados por Fecha -->
              <div class="turnos-grouped" *ngIf="!isLoading && slotsDisponibles.length > 0">
                <div *ngFor="let fecha of fechasOrdenadas" class="fecha-group">
                  <!-- Header de fecha -->
                  <div class="fecha-header" 
                       [class.fecha-excepcional]="esDiaExcepcional(fecha)"
                       [class.fecha-feriado]="getTipoExcepcion(fecha) === 'FERIADO'"
                       [class.fecha-mantenimiento]="getTipoExcepcion(fecha) === 'MANTENIMIENTO'"
                       [class.fecha-atencion-especial]="getTipoExcepcion(fecha) === 'ATENCION_ESPECIAL'">
                    <div class="fecha-info">
                      <h3 class="fecha-title">
                        <i class="fas fa-calendar-day"></i>
                        {{ formatearFecha(fecha) }}
                      </h3>
                      <!-- Indicador de día excepcional en header (solo para días excepcionales completos, no slots individuales) -->
                      <div class="fecha-exception-badge" *ngIf="esDiaExcepcional(fecha) && !tieneFranjaHoraria(fecha)">
                        <span class="exception-icon">{{ getIconoExcepcion(fecha) }}</span>
                        <span class="exception-label">{{ getTipoExcepcionLabel(fecha) }} - Día Completo</span>
                        <span class="exception-description" *ngIf="getDescripcionExcepcion(fecha)">
                          - {{ getDescripcionExcepcion(fecha) }}
                        </span>
                      </div>
                      <!-- Indicador si es día con configuración especial pero con franja horaria -->
                      <div class="fecha-exception-badge" *ngIf="esDiaExcepcional(fecha) && tieneFranjaHoraria(fecha)">
                        <span class="exception-icon">{{ getIconoExcepcion(fecha) }}</span>
                        <span class="exception-label">{{ getTipoExcepcionLabel(fecha) }} programado para este día</span>
                        <span class="exception-description" *ngIf="getDescripcionExcepcion(fecha)">
                          - {{ getDescripcionExcepcion(fecha) }}
                        </span>
                      </div>
                      <!-- Indicador si hay slots en mantenimiento en esta fecha -->
                      <div class="fecha-maintenance-badge" *ngIf="!esDiaExcepcional(fecha) && tieneSlotsEnMantenimiento(fecha)">
                        <span class="maintenance-icon">🔧</span>
                        <span class="maintenance-label">Mantenimiento programado para algunos horarios</span>
                      </div>
                    </div>
                  </div>

                  <!-- Slots de la fecha -->
                  <div class="slots-grid">
                    <div 
                      *ngFor="let slot of slotsPorFecha[fecha]" 
                      class="slot-card admin-slot"
                      [class.selected]="slotSeleccionado?.id === slot.id"
                      [class.slot-excepcional]="slotAfectadoPorExcepcion(slot)"
                      [class.slot-feriado]="getTipoExcepcion(slot.fecha) === 'FERIADO' && slotAfectadoPorExcepcion(slot)"
                      [class.slot-mantenimiento-dia]="getTipoExcepcion(slot.fecha) === 'MANTENIMIENTO' && !tieneFranjaHoraria(slot.fecha)"
                      [class.slot-mantenimiento-individual]="slot.enMantenimiento"
                      [class.slot-atencion-especial]="getTipoExcepcion(slot.fecha) === 'ATENCION_ESPECIAL' && slotAfectadoPorExcepcion(slot)"
                      [class.slot-ocupado]="slot.ocupado"
                      (click)="seleccionarSlot(slot, $event)">
                      
                      <div class="slot-time">
                        <i class="fas fa-clock"></i>
                        {{ slot.horaInicio }} - {{ slot.horaFin }}
                      </div>
                      
                      <div class="slot-medico">
                        <i class="fas fa-user-md"></i>
                        <strong>{{ slot.staffMedicoNombre }} {{ slot.staffMedicoApellido }}</strong>
                      </div>
                      
                      <div class="slot-especialidad">
                        <i class="fas fa-stethoscope"></i>
                        {{ slot.especialidadStaffMedico }}
                      </div>
                      
                      <div class="slot-location">
                        <div class="location-line">
                          <i class="fas fa-door-open"></i>
                          {{ slot.consultorioNombre }}
                        </div>
                        <div class="location-line">
                          <i class="fas fa-map-marker-alt"></i>
                          {{ slot.nombreCentro }}
                        </div>
                      </div>

                      <!-- Información del paciente si está ocupado -->
                      <div class="slot-patient" *ngIf="slot.ocupado && slot.pacienteNombre">
                        <div class="patient-info">
                          <i class="fas fa-user"></i>
                          <strong>{{ slot.pacienteNombre }} {{ slot.pacienteApellido }}</strong>
                        </div>
                      </div>

                      <!-- Información de día excepcional -->
                      <div class="slot-exception" *ngIf="slotAfectadoPorExcepcion(slot)">
                        <div class="exception-badge">
                          <span class="exception-icon">{{ getIconoExcepcion(slot.fecha, slot) }}</span>
                          <div class="exception-info">
                            <span class="exception-type">{{ getTipoExcepcionLabel(slot.fecha, slot) }}</span>
                            <span class="exception-description" *ngIf="getDescripcionExcepcion(slot.fecha, slot)">
                              {{ getDescripcionExcepcion(slot.fecha, slot) }}
                            </span>
                          </div>
                        </div>
                        <div class="exception-warning">
                          <i class="fas fa-exclamation-triangle"></i>
                          <span>Este turno no puede realizarse</span>
                        </div>
                      </div>

                      <!-- Estado del slot -->
                      <div class="slot-status special-attention" *ngIf="!slot.enMantenimiento && getTipoExcepcion(slot.fecha) === 'ATENCION_ESPECIAL' && slotAfectadoPorExcepcion(slot)">
                        <i class="fas fa-hospital"></i>
                        Especial
                      </div>
                      <div class="slot-status maintenance" *ngIf="slot.enMantenimiento">
                        <i class="fas fa-wrench"></i>
                        Mantenimiento
                      </div>
                      <div class="slot-status" *ngIf="!slot.enMantenimiento && slot.ocupado">
                        <i class="fas fa-user-check"></i>
                        Asignado
                      </div>
                      <div class="slot-status disponible" *ngIf="!slot.enMantenimiento && !slot.ocupado">
                        <i class="fas fa-plus-circle"></i>
                        Disponible
                      </div>

                      <div class="slot-check" *ngIf="slotSeleccionado?.id === slot.id">
                        <i class="fas fa-check-circle"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- MENSAJE CUANDO NO HAY TURNOS -->
              <div class="no-turnos-content" *ngIf="!isLoading && slotsDisponibles.length === 0">
                <i class="fas fa-calendar-times"></i>
                <h4>No hay turnos para mostrar</h4>
                <p>No se encontraron turnos con los filtros seleccionados.</p>
                <p>Intenta cambiar los filtros o seleccionar otra fecha.</p>
                <button class="btn btn-modern btn-clear" (click)="clearFilter()">
                  <i class="fas fa-filter"></i>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          <!-- MODAL PARA ASIGNAR PACIENTE -->
          <div *ngIf="showModal" 
               class="modal-contextual">
            <div class="modern-modal" (click)="$event.stopPropagation()">
              <div class="modal-header-modern">
                <div class="header-content">
                  <div class="header-icon">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="header-text">
                    <h3>{{ slotSeleccionado?.ocupado ? 'Detalle del Turno' : 'Asignar Turno' }}</h3>
                    <p>{{ slotSeleccionado?.ocupado ? 'Información completa del turno médico' : 'Asignar un paciente a este turno' }}</p>
                  </div>
                </div>
                <button type="button" class="modal-close-btn" (click)="closeModal()">×</button>
              </div>
              
              <div class="modal-body-modern">
                <div class="info-grid-modal">
                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);">👨‍⚕️</span>
                      Médico
                    </div>
                    <div class="info-value-modal">{{ slotSeleccionado?.staffMedicoNombre }} {{ slotSeleccionado?.staffMedicoApellido }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);">🏥</span>
                      Especialidad
                    </div>
                    <div class="info-value-modal">{{ slotSeleccionado?.especialidadStaffMedico }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);">🚪</span>
                      Consultorio
                    </div>
                    <div class="info-value-modal">{{ slotSeleccionado?.consultorioNombre }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">🏢</span>
                      Centro de Atención
                    </div>
                    <div class="info-value-modal">{{ slotSeleccionado?.nombreCentro }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);">📅</span>
                      Fecha y Hora
                    </div>
                    <div class="info-value-modal">{{ formatearFecha(slotSeleccionado?.fecha || '') }} - {{ slotSeleccionado?.horaInicio }} a {{ slotSeleccionado?.horaFin }}</div>
                  </div>

                  <!-- Mostrar paciente asignado si está ocupado -->
                  <div class="info-item-modal" *ngIf="slotSeleccionado?.ocupado && slotSeleccionado?.pacienteNombre">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #e83e8c 0%, #e91e63 100%);">👤</span>
                      Paciente Asignado
                    </div>
                    <div class="info-value-modal">{{ slotSeleccionado?.pacienteNombre }} {{ slotSeleccionado?.pacienteApellido }}</div>
                  </div>

                  <!-- Información de día excepcional si aplica -->
                  <div class="info-item-modal exception-modal" *ngIf="slotSeleccionado && slotAfectadoPorExcepcion(slotSeleccionado)">
                    <div class="info-label-modal">
                      <span class="info-icon-modal exception-icon">{{ getIconoExcepcion(slotSeleccionado.fecha, slotSeleccionado) }}</span>
                      {{ slotSeleccionado.enMantenimiento ? 'Slot en Mantenimiento' : 'Día Excepcional' }}
                    </div>
                    <div class="info-value-modal exception-details">
                      <div class="exception-type-modal">{{ getTipoExcepcionLabel(slotSeleccionado.fecha, slotSeleccionado) }}</div>
                      <div class="exception-description-modal" *ngIf="getDescripcionExcepcion(slotSeleccionado.fecha, slotSeleccionado)">
                        {{ getDescripcionExcepcion(slotSeleccionado.fecha, slotSeleccionado) }}
                      </div>
                      <div class="exception-warning-modal">
                        <i class="fas fa-exclamation-triangle"></i>
                        Este turno no puede realizarse {{ slotSeleccionado.enMantenimiento ? 'debido a mantenimiento programado' : 'en la fecha programada' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección de asignación de paciente (solo si no está ocupado) -->
                <div class="patient-assignment" *ngIf="!slotSeleccionado?.ocupado">
                  <div class="assignment-header">
                    <span class="assignment-icon">👥</span>
                    <h4>Asignar Paciente</h4>
                  </div>
                  <div class="assignment-field">
                    <label class="assignment-label">
                      <span class="label-icon" style="background: linear-gradient(135deg, #e83e8c 0%, #e91e63 100%);">👤</span>
                      Seleccionar Paciente
                    </label>
                    <select
                      class="form-control-modern"
                      [(ngModel)]="pacienteId"
                    >
                      <option value="">Seleccione un paciente...</option>
                      <option *ngFor="let paciente of pacientes" [value]="paciente.id">
                        {{ paciente.nombre }} {{ paciente.apellido }} (ID: {{ paciente.id }})
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="modal-footer-modern">
                <button 
                  type="button" 
                  class="btn btn-modern btn-assign" 
                  (click)="asignarTurno()"
                  *ngIf="!slotSeleccionado?.ocupado"
                  [disabled]="!pacienteId || isAssigning">
                  <i class="fas fa-save"></i>
                  {{ isAssigning ? 'Asignando...' : 'Asignar Turno' }}
                </button>
                <button type="button" class="btn btn-modern btn-cancel" (click)="closeModal()">
                  <i class="fas fa-times"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          <!-- Backdrop para cerrar modal cuando se hace clic fuera -->
          <div *ngIf="showModal" 
               class="modal-backdrop" 
               (click)="closeModal()">
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Default,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  styles: [`
    /* Contenedor principal */
    .container {
      max-width: 95%;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    /* Card principal */
    .modern-card {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      border: none;
      background: white;
      transition: all 0.3s ease;
    }
    
    
    
    /* Header con gradiente calendario */
    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="calendar" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23calendar)"/></svg>');
      opacity: 0.3;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }
    
    .header-icon {
      width: 70px;
      height: 70px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.3);
    }
    
    .header-icon i {
      font-size: 2rem;
      color: white;
    }
    
    .header-text h1 {
      color: white;
      margin: 0;
      font-size: 2.2rem;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
      font-weight: 300;
    }
    
    /* Body del card */
    .card-body {
      padding: 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }
    
    /* Sección de búsqueda modernizada */
    .search-section {
      margin-bottom: 2rem;
    }
    
    .search-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      border: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .search-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    }
    
    .search-icon {
      font-size: 1.5rem;
    }
    
    .search-header h3 {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
      font-size: 1.3rem;
    }
    
    .search-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .search-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    
    .search-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .search-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.95rem;
    }
    
    .label-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      color: white;
      font-weight: bold;
    }
    
    .form-control-modern {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: white;
    }
    
    .form-control-modern:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      background: #fafbff;
    }
    
    .search-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
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
      cursor: pointer;
    }
    
    .btn-search {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }
    
    .btn-clear {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    /* Alertas */
    .alert {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      border: 1px solid #0c5460;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      color: #0c5460;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert i {
      color: #0c5460;
    }

    .turnos-afectados-info {
      margin-bottom: 2rem;
    }

    /* TURNOS CARD-BASED FORMAT */
    .turnos-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
      margin-top: 2rem;
    }

    .turnos-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
    }

    .turnos-header h3 {
      margin: 0;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .header-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .turnos-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .info-text {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .turnos-body {
      padding: 1.5rem;
      min-height: 400px;
    }

    .loading-turnos {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #6c757d;
      font-size: 1.1rem;
    }

    .loading-turnos i {
      margin-right: 0.5rem;
      font-size: 1.2rem;
    }

    .no-turnos-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      color: #6c757d;
    }

    .no-turnos-content i {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-turnos-content h4 {
      color: #495057;
      margin-bottom: 1rem;
    }

    .no-turnos-content p {
      margin-bottom: 0.5rem;
    }

    /* FECHA GROUPS */
    .fecha-group {
      margin-bottom: 2rem;
    }

    .fecha-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px 12px 0 0;
      padding: 1rem 1.5rem;
      border-left: 4px solid #667eea;
      margin-bottom: 1rem;
    }

    .fecha-header.fecha-excepcional {
      border-left-width: 6px;
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    }

    .fecha-header.fecha-feriado {
      border-left-color: #dc3545;
      background: linear-gradient(135deg, #f8d7da 0%, #f1aeb5 100%);
    }

    .fecha-header.fecha-mantenimiento {
      border-left-color: #fd7e14;
      background: linear-gradient(135deg, #ffe8d1 0%, #ffc947 100%);
    }

    .fecha-header.fecha-atencion-especial {
      border-left-color: #6f42c1;
      background: linear-gradient(135deg, #e2d9f3 0%, #c8a4d8 100%);
    }

    .fecha-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .fecha-title {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .fecha-exception-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #2c3e50;
      border: 2px solid rgba(44, 62, 80, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .exception-icon {
      font-size: 1rem;
    }

    .exception-label {
      font-weight: 600;
    }

    .exception-description {
      font-style: italic;
      color: #6c757d;
    }

    .fecha-maintenance-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      background: rgba(253, 126, 20, 0.1);
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      color: #fd7e14;
      border: 1px solid rgba(253, 126, 20, 0.3);
    }

    .maintenance-icon {
      font-size: 1rem;
    }

    .maintenance-label {
      font-weight: 600;
    }

    /* SLOTS GRID */
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .slot-card {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 1.2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .slot-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
    }

    .slot-card.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    .slot-card.slot-ocupado {
      border-color: #28a745;
      background: rgba(40, 167, 69, 0.03);
    }

    .slot-card.slot-ocupado:hover {
      border-color: #28a745;
      background: rgba(40, 167, 69, 0.05);
    }

    /* Admin-specific slot styling */
    .slot-card.admin-slot {
      min-height: 200px;
    }

    /* Exceptional day slots */
    .slot-card.slot-excepcional {
      border-width: 3px;
    }

    .slot-card.slot-feriado {
      border-color: #dc3545;
      background: rgba(220, 53, 69, 0.05);
    }

    .slot-card.slot-mantenimiento {
      border-color: #fd7e14;
      background: rgba(253, 126, 20, 0.05);
    }


    .slot-card.slot-atencion-especial {
      border-color: #6f42c1;
      background: linear-gradient(135deg, rgba(111, 66, 193, 0.08) 0%, rgba(111, 66, 193, 0.03) 100%);
      position: relative;
      overflow: hidden;
    }

    .slot-card.slot-atencion-especial::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #6f42c1, #9c88ff, #6f42c1);
      border-radius: 14px;
      z-index: -1;
      opacity: 0.3;
    }

    .slot-card.slot-atencion-especial:hover {
      border-color: #6f42c1;
      background: linear-gradient(135deg, rgba(111, 66, 193, 0.12) 0%, rgba(111, 66, 193, 0.06) 100%);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(111, 66, 193, 0.25);
    }

    .slot-time {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 0.8rem;
    }

    .slot-medico {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .slot-especialidad {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.8rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .slot-location {
      margin-bottom: 1.2rem;
    }

    .location-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
      color: #6c757d;
      font-size: 0.85rem;
    }

    .slot-patient {
      margin-top: 1rem;
      margin-bottom: 1.2rem;
      padding: 0.5rem;
      background: rgba(40, 167, 69, 0.1);
      border-radius: 8px;
      border-left: 3px solid #28a745;
    }

    .patient-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #28a745;
      font-size: 0.9rem;
    }

    /* Información de día excepcional en slots */
    .slot-exception {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: rgba(220, 53, 69, 0.05);
      border: 2px solid rgba(220, 53, 69, 0.2);
      border-radius: 8px;
      position: relative;
    }

    .slot-card.slot-feriado .slot-exception {
      background: rgba(220, 53, 69, 0.05);
      border-color: rgba(220, 53, 69, 0.3);
    }

    .slot-card.slot-mantenimiento .slot-exception {
      background: rgba(253, 126, 20, 0.05);
      border-color: rgba(253, 126, 20, 0.3);
    }

    .slot-card.slot-atencion-especial .slot-exception {
      background: linear-gradient(135deg, rgba(111, 66, 193, 0.08) 0%, rgba(111, 66, 193, 0.05) 100%);
      border: 2px solid rgba(111, 66, 193, 0.4);
      border-radius: 10px;
      box-shadow: 0 3px 12px rgba(111, 66, 193, 0.15);
    }

    .slot-card.slot-atencion-especial .exception-type {
      color: #6f42c1;
      font-size: 0.95rem;
      text-shadow: 0 1px 2px rgba(111, 66, 193, 0.1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .slot-card.slot-atencion-especial .exception-type::before {
      content: '🏥';
      font-size: 1.1rem;
    }

    .slot-card.slot-atencion-especial .exception-warning {
      color: #6f42c1;
      background: rgba(111, 66, 193, 0.1);
      padding: 0.5rem 0.8rem;
      border-radius: 8px;
      border: 1px solid rgba(111, 66, 193, 0.3);
    }

    .exception-badge {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .exception-icon {
      font-size: 1.2rem;
      margin-top: 0.1rem;
    }

    .exception-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }

    .exception-type {
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
      color: #dc3545;
    }

    .slot-card.slot-mantenimiento .exception-type {
      color: #fd7e14;
    }

    .slot-card.slot-atencion-especial .exception-type {
      color: #6f42c1;
    }

    .exception-description {
      font-size: 0.8rem;
      color: #6c757d;
      font-style: italic;
      line-height: 1.3;
    }

    .exception-warning {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #dc3545;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .slot-card.slot-mantenimiento .exception-warning {
      color: #fd7e14;
    }

    .slot-card.slot-atencion-especial .exception-warning {
      color: #6f42c1;
    }

    .exception-warning i {
      font-size: 0.9rem;
    }

    .slot-status {
      position: absolute;
      top: 0.8rem;
      right: 0.8rem;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      z-index: 10;
    }

    /* Ajustar posición del status en slots con excepciones */
    .slot-card.slot-excepcional .slot-status {
      top: 0.5rem;
      right: 0.5rem;
      font-size: 0.7rem;
      padding: 0.2rem 0.6rem;
    }

    .slot-status:not(.disponible) {
      background: #28a745;
      color: white;
    }

    .slot-status.disponible {
      background: #667eea;
      color: white;
    }

    .slot-status.maintenance {
      background: #fd7e14;
      color: white;
    }

    .slot-status.special-attention {
      background: linear-gradient(135deg, #6f42c1 0%, #9c88ff 100%);
      color: white;
      font-weight: 700;
      box-shadow: 0 3px 10px rgba(111, 66, 193, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.5);
    }

    .slot-check {
      position: absolute;
      top: 0.8rem;
      right: 0.8rem;
      color: #667eea;
      font-size: 1.5rem;
      background: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
    
    /* Modal contextual */
    .modal-contextual {
      position: fixed !important;
      top: 50vh !important;
      left: 50vw !important;
      transform: translate(-50%, -50%) !important;
      z-index: 1060;
      max-width: 500px;
      width: 90vw;
      max-height: 90vh;
      animation: modalFadeIn 0.2s ease-out;
      pointer-events: auto;
    }

    .modal-contextual:hover {
      position: fixed !important;
      top: 50vh !important;
      left: 50vw !important;
      transform: translate(-50%, -50%) !important;
    }

    .modal-contextual * {
      pointer-events: auto;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.1);
      z-index: 1055;
      animation: backdropFadeIn 0.2s ease-out;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes backdropFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modern-modal {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
      border: 1px solid rgba(102, 126, 234, 0.2);
      transform-origin: top left;
    }
    
    .modal-header-modern {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 1.5rem;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .modal-close-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: scale(1.1);
    }
    
    .modal-body-modern {
      padding: 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }
    
    .info-grid-modal {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .info-item-modal {
      background: white;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      border-left: 4px solid #667eea;
    }
    
    .info-label-modal {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }
    
    .info-icon-modal {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: white;
      font-weight: bold;
    }
    
    .info-value-modal {
      font-size: 1rem;
      color: #495057;
      font-weight: 500;
    }

    /* Estilos para información de excepción en modal */
    .info-item-modal.exception-modal {
      border-left-color: #dc3545;
      border-left-width: 6px;
      background: rgba(220, 53, 69, 0.02);
    }

    .exception-icon {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
      font-size: 1rem !important;
    }

    .exception-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .exception-type-modal {
      font-weight: 700;
      font-size: 1rem;
      color: #dc3545;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .exception-description-modal {
      font-size: 0.9rem;
      color: #6c757d;
      font-style: italic;
      line-height: 1.4;
    }

    .exception-warning-modal {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: rgba(220, 53, 69, 0.1);
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #dc3545;
      border: 1px solid rgba(220, 53, 69, 0.2);
    }

    .exception-warning-modal i {
      font-size: 0.9rem;
    }
    
    /* Sección de asignación de paciente */
    .patient-assignment {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      border: 2px solid rgba(102, 126, 234, 0.1);
    }
    
    .assignment-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    }
    
    .assignment-icon {
      font-size: 1.3rem;
    }
    
    .assignment-header h4 {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
    }
    
    .assignment-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .assignment-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.95rem;
    }
    
    .modal-footer-modern {
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 0 0 20px 20px;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    
    .btn-assign {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    /* RESPONSIVE */
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
        font-size: 1.8rem;
      }
      
      .card-body {
        padding: 1rem;
      }
      
      .search-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .search-actions {
        justify-content: stretch;
      }
      
      .btn-modern {
        flex: 1;
        justify-content: center;
      }
      
      .slots-grid {
        grid-template-columns: 1fr;
      }
      
      .info-grid-modal {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .modern-modal {
        width: 95%;
        margin: 1rem;
      }
      
      .modal-footer-modern {
        flex-direction: column;
      }
      
      .modal-footer-modern .btn-modern {
        width: 100%;
        justify-content: center;
      }
      
      .fecha-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class AgendaComponent implements OnInit {
  // Estados de carga
  isLoading = false;
  isAssigning = false;

  // Slots y calendario
  slotsDisponibles: SlotDisponible[] = [];
  slotsPorFecha: { [fecha: string]: SlotDisponible[] } = {};
  fechasOrdenadas: string[] = [];
  turnosAfectados: SlotDisponible[] = []; // Turnos afectados por días excepcionales
  semanas: number = 4;

  // Modal y selección
  showModal = false;
  slotSeleccionado: SlotDisponible | null = null;

  // Filtros (manteniendo compatibilidad con el sistema existente)
  filterType: string = 'staffMedico';
  filterValue: string = '';
  events: any[] = []; // Para mantener compatibilidad con getFilterOptions
  filteredEvents: any[] = []; // Para mantener compatibilidad

  // Pacientes
  pacientes: { id: number; nombre: string; apellido: string }[] = [];
  pacienteId: number | null = null;

  // Variables para posicionamiento del modal contextual
  modalPosition = { top: 0, left: 0 };
  private resizeListener?: () => void;

  constructor(
    private agendaService: AgendaService,
    private pacienteService: PacienteService, // Inyecta el servicio de pacientes
    private http: HttpClient, // Inyecta HttpClient
    private cdr: ChangeDetectorRef,
    private router: Router, // Inyecta el Router
    private diasExcepcionalesService: DiasExcepcionalesService // Inyecta el servicio de días excepcionales
  ) { }

  ngOnInit() {
    this.cargarTodosLosEventos();
    this.cargarPacientes();
    this.diasExcepcionalesService.cargarDiasExcepcionalesParaCalendario();
    
    // Listener para reposicionar modal en resize
    this.resizeListener = () => {
      if (this.showModal) {
        // Reposicionar modal si está abierto
        const modalWidth = 500;
        const modalHeight = 400;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
          this.modalPosition = {
            top: (window.innerHeight - modalHeight) / 2,
            left: (window.innerWidth - Math.min(modalWidth, window.innerWidth - 40)) / 2
          };
        }
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  // Método para cargar eventos desde el backend y convertirlos a slots
  cargarTodosLosEventos(): void {
    this.isLoading = true;
    
    this.agendaService.obtenerTodosLosEventos(this.semanas).subscribe({
      next: (eventosBackend) => {
        // Transformar los eventos del backend en slots
        this.slotsDisponibles = this.mapEventosToSlots(eventosBackend);
        this.events = eventosBackend; // Para compatibilidad con filtros
        this.aplicarFiltrosSlots();
        this.agruparSlotsPorFecha();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error al cargar todos los eventos:', err);
        alert('No se pudieron cargar los eventos. Intente nuevamente.');
        this.isLoading = false;
      }
    });
  }

  // Transformar eventos del backend a slots
  private mapEventosToSlots(eventosBackend: any[]): SlotDisponible[] {
    const slots: SlotDisponible[] = [];
    const slotsAfectados: SlotDisponible[] = [];

    eventosBackend.forEach(evento => {
      // Validar que el evento tenga los datos necesarios
      if (!evento.fecha || !evento.horaInicio || !evento.horaFin || !evento.esSlot) {
        return;
      }

      const slot: SlotDisponible = {
        id: evento.id,
        fecha: evento.fecha,
        horaInicio: evento.horaInicio,
        horaFin: evento.horaFin,
        staffMedicoId: evento.staffMedicoId,
        staffMedicoNombre: evento.staffMedicoNombre,
        staffMedicoApellido: evento.staffMedicoApellido,
        especialidadStaffMedico: evento.especialidadStaffMedico,
        consultorioId: evento.consultorioId,
        consultorioNombre: evento.consultorioNombre,
        centroId: evento.centroId,
        nombreCentro: evento.nombreCentro,
        ocupado: evento.ocupado || false,
        esSlot: true,
        pacienteId: evento.pacienteId,
        pacienteNombre: evento.pacienteNombre,
        pacienteApellido: evento.pacienteApellido,
        enMantenimiento: evento.enMantenimiento || false,
        titulo: evento.titulo
      };

      // DEBUG: Log para slots con mantenimiento
      if (slot.enMantenimiento) {
        console.log(`🔧 SLOT EN MANTENIMIENTO procesado:`, {
          id: slot.id,
          fecha: slot.fecha,
          horario: `${slot.horaInicio}-${slot.horaFin}`,
          titulo: slot.titulo,
          enMantenimiento: slot.enMantenimiento,
          eventoOriginal: evento
        });
      }

      // Incluir TODOS los slots (afectados y no afectados) en la vista principal
      slots.push(slot);

      // Separar solo para conteo los turnos afectados
      if (this.slotAfectadoPorExcepcion(slot)) {
        slotsAfectados.push(slot);
      }
    });

    // Actualizar la lista de turnos afectados solo para el contador informativo
    this.turnosAfectados = slotsAfectados;

    return slots;
  }

  // Aplicar filtros a los slots
  aplicarFiltrosSlots() {
    let slotsFiltrados = this.slotsDisponibles;

    if (this.filterValue) {
      const valorFiltro = this.filterValue.toLowerCase();
      
      slotsFiltrados = slotsFiltrados.filter(slot => {
        switch (this.filterType) {
          case 'staffMedico':
            return `${slot.staffMedicoNombre} ${slot.staffMedicoApellido}`.toLowerCase().includes(valorFiltro);
          case 'centroAtencion':
            return slot.nombreCentro?.toLowerCase().includes(valorFiltro);
          case 'consultorio':
            return slot.consultorioNombre?.toLowerCase().includes(valorFiltro);
          case 'especialidad':
            return slot.especialidadStaffMedico?.toLowerCase().includes(valorFiltro);
          default:
            return true;
        }
      });
    }

    this.slotsDisponibles = slotsFiltrados;
  }

  // Agrupar slots por fecha y ordenar
  agruparSlotsPorFecha() {
    this.slotsPorFecha = {};

    this.slotsDisponibles.forEach(slot => {
      if (!this.slotsPorFecha[slot.fecha]) {
        this.slotsPorFecha[slot.fecha] = [];
      }
      this.slotsPorFecha[slot.fecha].push(slot);
    });

    // DEBUG: Log para investigar el problema de mantenimiento
    Object.keys(this.slotsPorFecha).forEach(fecha => {
      const slotsEnMantenimiento = this.slotsPorFecha[fecha].filter(slot => slot.enMantenimiento);
      if (slotsEnMantenimiento.length > 0) {
        console.log(`🔧 FECHA ${fecha} - Slots en mantenimiento:`, slotsEnMantenimiento.map(s => `${s.horaInicio}-${s.horaFin} (ID: ${s.id}, titulo: ${s.titulo})`));
        console.log(`📋 FECHA ${fecha} - Todos los slots:`, this.slotsPorFecha[fecha].map(s => `${s.horaInicio}-${s.horaFin} (ID: ${s.id}, enMantenimiento: ${s.enMantenimiento}, titulo: ${s.titulo})`));
      }
    });

    // Ordenar slots dentro de cada fecha por hora
    Object.keys(this.slotsPorFecha).forEach(fecha => {
      this.slotsPorFecha[fecha].sort((a, b) => {
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    });

    // Ordenar fechas
    this.fechasOrdenadas = Object.keys(this.slotsPorFecha).sort();
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return fechaObj.toLocaleDateString('es-ES', opciones);
  }

  // Seleccionar slot
  seleccionarSlot(slot: SlotDisponible, event?: MouseEvent) {
    // Calcular posición del modal cerca del elemento clickeado
    if (event) {
      this.calculateModalPosition(event);
    }
    
    this.slotSeleccionado = slot;
    this.showModal = true;
    this.pacienteId = null; // Reset paciente selection
  }

  // Calcular posición del modal contextual
  private calculateModalPosition(event: MouseEvent) {
    const modalWidth = 500;
    const modalHeight = 400;
    const padding = 20;

    // Detectar si es móvil
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // En móviles, centrar en la pantalla
      this.modalPosition = {
        top: (window.innerHeight - modalHeight) / 2,
        left: (window.innerWidth - Math.min(modalWidth, window.innerWidth - 40)) / 2
      };
      return;
    }

    // Posición del click
    let top = event.clientY;
    let left = event.clientX;

    // Ajustar para que no se salga de la pantalla
    if (left + modalWidth + padding > window.innerWidth) {
      left = window.innerWidth - modalWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }

    if (top + modalHeight + padding > window.innerHeight) {
      top = window.innerHeight - modalHeight - padding;
    }
    if (top < padding) {
      top = padding;
    }

    this.modalPosition = { top, left };
  }

  cargarPacientes(): void {
    this.pacienteService.all().subscribe({
      next: (dataPackage) => {
        this.pacientes = dataPackage.data; // Asigna los pacientes recibidos
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
        alert('No se pudieron cargar los pacientes. Intente nuevamente.');
      },
    });
  }

  // Métodos de filtrado
  applyFilter() {
    this.aplicarFiltrosSlots();
    this.agruparSlotsPorFecha();
  }

  clearFilter() {
    this.filterValue = '';
    this.cargarTodosLosEventos(); // Recargar todos los slots
  }

  getFilterOptions(): string[] {
    const allSlots = this.slotsDisponibles;
    
    switch (this.filterType) {
      case 'staffMedico':
        return [...new Set(allSlots.map(slot => `${slot.staffMedicoNombre} ${slot.staffMedicoApellido}`).filter(Boolean))];
      case 'centroAtencion':
        return [...new Set(allSlots.map(slot => slot.nombreCentro).filter(Boolean))];
      case 'consultorio':
        return [...new Set(allSlots.map(slot => slot.consultorioNombre).filter(Boolean))];
      case 'especialidad':
        return [...new Set(allSlots.map(slot => slot.especialidadStaffMedico).filter(Boolean))];
      default:
        return [];
    }
  }

  // Modal methods
  closeModal() {
    this.showModal = false;
    this.slotSeleccionado = null;
    this.pacienteId = null;
  }

  // Métodos para manejo de días excepcionales
  esDiaExcepcional(fecha: string): boolean {
    return this.diasExcepcionalesService.esDiaExcepcional(fecha);
  }

  getTipoExcepcion(fecha: string): 'FERIADO' | 'ATENCION_ESPECIAL' | 'MANTENIMIENTO' | null {
    return this.diasExcepcionalesService.getTipoExcepcion(fecha);
  }

  // Verificar si una fecha tiene slots individuales en mantenimiento (no días excepcionales completos)
  tieneSlotsEnMantenimiento(fecha: string): boolean {
    // Solo contar slots en mantenimiento si NO es un día excepcional completo
    if (this.esDiaExcepcional(fecha) && !this.tieneFranjaHoraria(fecha)) {
      return false; // Es día excepcional completo, no slots individuales
    }
    
    const slotsDelDia = this.slotsPorFecha[fecha] || [];
    return slotsDelDia.some(slot => slot.enMantenimiento);
  }

  // Verificar si un día excepcional tiene franja horaria específica (no es día completo)
  tieneFranjaHoraria(fecha: string): boolean {
    const dias = this.diasExcepcionalesService.getDiasExcepcionalesPorFecha(fecha);
    return dias.some(dia => dia.apertura && dia.cierre);
  }

  // Verificar si un slot específico está afectado por un día excepcional con franja horaria
  slotAfectadoPorExcepcion(slot: SlotDisponible): boolean {
    // Si el slot tiene mantenimiento individual, está afectado
    if (slot.enMantenimiento) {
      return true;
    }
    
    // Si no es un día excepcional, no está afectado
    if (!this.esDiaExcepcional(slot.fecha)) {
      return false;
    }
    
    // Si es día excepcional sin franja horaria (día completo), está afectado
    if (!this.tieneFranjaHoraria(slot.fecha)) {
      return true;
    }
    
    // Verificar si el slot está dentro de la franja horaria específica del día excepcional
    const diasExcepcionales = this.diasExcepcionalesService.getDiasExcepcionalesPorFecha(slot.fecha);
    
    // Convertir horas del slot a objetos Date para comparación
    const horaInicioSlot = this.convertirHoraAMinutos(slot.horaInicio);
    const horaFinSlot = this.convertirHoraAMinutos(slot.horaFin);
    
    return diasExcepcionales.some(dia => {
      if (!dia.apertura || !dia.cierre) return false;
      
      const horaAperturaExcepcion = this.convertirHoraAMinutos(dia.apertura);
      const horaCierreExcepcion = this.convertirHoraAMinutos(dia.cierre);
      
      // Verificar si hay solapamiento entre el slot y el rango excepcional
      return horaInicioSlot < horaCierreExcepcion && horaFinSlot > horaAperturaExcepcion;
    });
  }

  // Función auxiliar para convertir "HH:mm" a minutos desde medianoche
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  getTipoExcepcionLabel(fecha: string, slot?: SlotDisponible): string {
    // Priorizar mantenimiento específico del slot
    if (slot?.enMantenimiento) {
      return 'Mantenimiento';
    }
    
    // Verificar si es día excepcional completo
    const tipo = this.getTipoExcepcion(fecha);
    if (tipo && !this.tieneFranjaHoraria(fecha)) {
      // Es día excepcional completo (sin franja horaria específica)
      switch (tipo) {
        case 'FERIADO':
          return 'Feriado';
        case 'MANTENIMIENTO':
          return 'Mantenimiento del Día';
        case 'ATENCION_ESPECIAL':
          return 'Atención Especial';
        default:
          return 'Día Excepcional';
      }
    }
    
    // Si tiene franja horaria, el día excepcional solo afecta ciertos horarios
    if (tipo && this.tieneFranjaHoraria(fecha)) {
      switch (tipo) {
        case 'FERIADO':
          return 'Feriado ';
        case 'MANTENIMIENTO':
          return 'Mantenimiento ';
        case 'ATENCION_ESPECIAL':
          return 'Atención Especial ';
        default:
          return 'Día Excepcional ';
      }
    }
    
    return 'Normal';
  }

  getDescripcionExcepcion(fecha: string, slot?: SlotDisponible): string | null {
    // Priorizar descripción específica del slot en mantenimiento
    if (slot?.enMantenimiento && slot?.titulo) {
      // El título viene como "MANTENIMIENTO: descripción", extraer solo la descripción
      const match = slot.titulo.match(/MANTENIMIENTO:\s*(.+)/);
      return match ? match[1] : 'Mantenimiento programado en este horario';
    }
    
    // Si es un slot individual en mantenimiento pero no tiene título específico
    if (slot?.enMantenimiento) {
      return 'Mantenimiento programado del slot';
    }
    
    // Para días excepcionales (completos o parciales)
    const descripcionDia = this.diasExcepcionalesService.getDescripcionExcepcion(fecha);
    if (descripcionDia && this.esDiaExcepcional(fecha)) {
      const tieneFramja = this.tieneFranjaHoraria(fecha);
      const tipo = this.getTipoExcepcion(fecha);
      
      // Para atención especial, agregar información sobre el tipo de procedimiento
      if (tipo === 'ATENCION_ESPECIAL') {
        const tipoProcedimiento = this.getTipoProcedimientoFromDescription(descripcionDia);
        const sufijo = tieneFramja ? ` (${slot?.horaInicio} - ${slot?.horaFin})` : ' (día completo)';
        
        if (tipoProcedimiento) {
          return `${this.getTipoProcedimientoLabel(tipoProcedimiento)}: ${descripcionDia}${sufijo}`;
        }
        return `Procedimiento Especial: ${descripcionDia}${sufijo}`;
      }
      
      const sufijo = tieneFramja ? ' (horario específico)' : ' (día completo)';
      return descripcionDia + sufijo;
    }
    
    return descripcionDia;
  }

  getIconoExcepcion(fecha: string, slot?: SlotDisponible): string {
    // Priorizar icono específico del slot en mantenimiento
    if (slot?.enMantenimiento) {
      return '🔧'; // Icono específico para mantenimiento de slot
    }
    
    // Para días excepcionales
    const tipo = this.getTipoExcepcion(fecha);
    if (tipo) {
      const tieneFramja = this.tieneFranjaHoraria(fecha);
      
      switch (tipo) {
        case 'FERIADO':
          return tieneFramja ? '🏛️' : '🏛️';
        case 'MANTENIMIENTO':
          return tieneFramja ? '⚙️' : '🚧'; // Diferente icono para mantenimiento parcial vs completo
        case 'ATENCION_ESPECIAL':
          return tieneFramja ? '⭐' : '🌟';
        default:
          return '⚠️';
      }
    }
    
    return '📅'; // Día normal
  }

  asignarTurno(): void {
    if (!this.pacienteId || !this.slotSeleccionado) {
      alert('Por favor, seleccione un paciente.');
      return;
    }

    // Verificar si es un día excepcional o slot en mantenimiento y confirmar con el usuario
    if (this.slotAfectadoPorExcepcion(this.slotSeleccionado)) {
      const tipoExcepcion = this.getTipoExcepcionLabel(this.slotSeleccionado.fecha, this.slotSeleccionado);
      const descripcion = this.getDescripcionExcepcion(this.slotSeleccionado.fecha, this.slotSeleccionado);
      
      const esMantenimiento = this.slotSeleccionado.enMantenimiento;
      const tituloAdvertencia = esMantenimiento ? 'MANTENIMIENTO PROGRAMADO' : 'DÍA EXCEPCIONAL';
      const motivoDetalle = esMantenimiento ? 
        'Este slot está programado durante un mantenimiento.' :
        'Este turno está programado para un día marcado como "${tipoExcepcion}".';
      
      const mensaje = `⚠️ ADVERTENCIA: ${tituloAdvertencia} ⚠️\n\n` +
                     `${motivoDetalle}\n` +
                     (descripcion ? `Motivo: ${descripcion}\n\n` : '\n') +
                     `El turno NO PODRÁ REALIZARSE en la fecha/horario programado.\n\n` +
                     `¿Está seguro de que desea asignar este turno de todas formas?\n` +
                     `Se recomienda seleccionar otra fecha u horario disponible.`;

      if (!confirm(mensaje)) {
        return; // El usuario canceló la asignación
      }
    }

    this.isAssigning = true;

    const turnoDTO = {
      id: this.slotSeleccionado.id,
      fecha: this.slotSeleccionado.fecha,
      horaInicio: this.slotSeleccionado.horaInicio,
      horaFin: this.slotSeleccionado.horaFin,
      pacienteId: this.pacienteId,
      staffMedicoId: this.slotSeleccionado.staffMedicoId,
      staffMedicoNombre: this.slotSeleccionado.staffMedicoNombre,
      staffMedicoApellido: this.slotSeleccionado.staffMedicoApellido,
      especialidadStaffMedico: this.slotSeleccionado.especialidadStaffMedico,
      consultorioId: this.slotSeleccionado.consultorioId,
      consultorioNombre: this.slotSeleccionado.consultorioNombre,
      centroId: this.slotSeleccionado.centroId,
      nombreCentro: this.slotSeleccionado.nombreCentro,
      estado: 'PROGRAMADO'
    };

    console.log('Enviando turno DTO (admin):', turnoDTO);

    this.http.post(`/rest/turno/asignar`, turnoDTO).subscribe({
      next: () => {
        alert('Turno asignado correctamente.');
        
        // Actualizar inmediatamente el slot en el array local
        this.actualizarSlotAsignado(this.slotSeleccionado!.id);
        
        this.closeModal();
        
        // Recargar los eventos para obtener datos actualizados del servidor
        setTimeout(() => {
          this.cargarTodosLosEventos();
        }, 500);
      },
      error: (err: any) => {
        console.error('Error al asignar el turno:', err);
        alert('No se pudo asignar el turno. Intente nuevamente.');
        this.isAssigning = false;
      },
    });
  }

  // Actualizar slot asignado inmediatamente
  private actualizarSlotAsignado(slotId: number) {
    // Encontrar el slot en el array y marcarlo como ocupado
    const slotEncontrado = this.slotsDisponibles.find(slot => slot.id === slotId);
    
    if (slotEncontrado) {
      slotEncontrado.ocupado = true;
      // Obtener info del paciente seleccionado
      const pacienteSeleccionado = this.pacientes.find(p => p.id === this.pacienteId);
      if (pacienteSeleccionado) {
        slotEncontrado.pacienteId = pacienteSeleccionado.id;
        slotEncontrado.pacienteNombre = pacienteSeleccionado.nombre;
        slotEncontrado.pacienteApellido = pacienteSeleccionado.apellido;
      }
      
      // Reagrupar slots por fecha para actualizar la vista
      this.agruparSlotsPorFecha();
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
    }
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