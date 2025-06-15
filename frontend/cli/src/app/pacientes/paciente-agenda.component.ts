import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Services
import { TurnoService } from '../turnos/turno.service';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { AgendaService } from '../agenda/agenda.service';
import { DiasExcepcionalesService } from '../agenda/dias-excepcionales.service';
import { Turno } from '../turnos/turno';
import { Especialidad } from '../especialidades/especialidad';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { DataPackage } from '../data.package';

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
  enMantenimiento?: boolean;
  titulo?: string;
}

@Component({
  selector: 'app-paciente-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="container-fluid mt-4">
      <!-- HEADER -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="banner-paciente-agenda">
            <div class="header-content">
              <div class="header-actions">
                <button class="btn btn-header-glass" (click)="goBack()">
                  <i class="fas fa-arrow-left"></i>
                  Volver
                </button>
              </div>
              <div class="header-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="header-text">
                <h1>Turnos Disponibles</h1>
                <p>Busca y reserva turnos médicos disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTROS DE TURNOS -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="filtros-card">
            <div class="filtros-header">
              <span class="filtros-icon">🔍</span>
              <h3>Filtrar Turnos Disponibles</h3>
            </div>
            
            <div class="filtros-body">
              <!-- Filtro por Especialidad (Obligatorio) -->
              <div class="filtro-step" [class.active]="especialidadSeleccionada">
                <div class="step-header">
                  <div class="step-number">1</div>
                  <h4>Especialidad <span class="required">*</span></h4>
                </div>
                <select 
                  class="form-control-paciente"
                  [(ngModel)]="especialidadSeleccionada"
                  (change)="onEspecialidadChange()"
                  [disabled]="isLoadingEspecialidades">
                  <option value="">Seleccione una especialidad</option>
                  <option *ngFor="let especialidad of especialidades" [value]="especialidad.nombre">
                    {{ especialidad.nombre }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingEspecialidades">
                  <i class="fas fa-spinner fa-spin"></i> Cargando especialidades...
                </div>
              </div>

              <!-- Filtro por Staff Médico (Opcional) -->
              <div class="filtro-step" 
                   [class.active]="staffMedicoSeleccionado"
                   [class.disabled]="!especialidadSeleccionada">
                <div class="step-header">
                  <div class="step-number">2</div>
                  <h4>Médico (Opcional)</h4>
                </div>
                <select 
                  class="form-control-paciente"
                  [(ngModel)]="staffMedicoSeleccionado"
                  (change)="onStaffMedicoChange()"
                  [disabled]="!especialidadSeleccionada || isLoadingStaffMedicos">
                  <option value="">Todos los médicos</option>
                  <option *ngFor="let staff of staffMedicos" [value]="staff.id">
                    {{ staff.medico?.nombre }} {{ staff.medico?.apellido }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingStaffMedicos">
                  <i class="fas fa-spinner fa-spin"></i> Cargando médicos...
                </div>
              </div>

              <!-- Filtro por Centro de Atención (Opcional) -->
              <div class="filtro-step" 
                   [class.active]="centroAtencionSeleccionado"
                   [class.disabled]="!especialidadSeleccionada">
                <div class="step-header">
                  <div class="step-number">3</div>
                  <h4>Centro de Atención (Opcional)</h4>
                </div>
                <select 
                  class="form-control-paciente"
                  [(ngModel)]="centroAtencionSeleccionado"
                  (change)="onCentroAtencionChange()"
                  [disabled]="!especialidadSeleccionada || isLoadingCentros">
                  <option value="">Todos los centros</option>
                  <option *ngFor="let centro of centrosAtencion" [value]="centro.id">
                    {{ centro.nombre }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingCentros">
                  <i class="fas fa-spinner fa-spin"></i> Cargando centros...
                </div>
              </div>

              <!-- Filtros aplicados -->
              <div class="filtros-aplicados" *ngIf="especialidadSeleccionada">
                <h5>Filtros aplicados:</h5>
                <div class="filter-tags">
                  <span class="filter-tag">
                    <i class="fas fa-stethoscope"></i>
                    {{ especialidadSeleccionada }}
                    <button type="button" (click)="limpiarEspecialidad()">×</button>
                  </span>
                  <span class="filter-tag" *ngIf="staffMedicoSeleccionado">
                    <i class="fas fa-user-md"></i>
                    {{ getStaffMedicoNombre(staffMedicoSeleccionado) }}
                    <button type="button" (click)="limpiarStaffMedico()">×</button>
                  </span>
                  <span class="filter-tag" *ngIf="centroAtencionSeleccionado">
                    <i class="fas fa-hospital"></i>
                    {{ getCentroAtencionNombre(centroAtencionSeleccionado) }}
                    <button type="button" (click)="limpiarCentroAtencion()">×</button>
                  </span>
                  <button type="button" class="btn btn-clear-filters" (click)="limpiarTodosFiltros()">
                    <i class="fas fa-times"></i> Limpiar filtros
                  </button>
                </div>
              </div>

              <!-- Acciones -->
              <div class="filtros-actions">
                <button 
                  type="button" 
                  class="btn btn-paciente-primary" 
                  (click)="cargarTurnosConFiltros()"
                  [disabled]="!especialidadSeleccionada || isLoadingTurnos">
                  <i class="fas fa-search"></i>
                  {{ isLoadingTurnos ? 'Buscando...' : 'Buscar Turnos Disponibles' }}
                </button>
                <button 
                  type="button" 
                  class="btn btn-paciente-secondary" 
                  (click)="irASolicitarTurno()">
                  <i class="fas fa-plus"></i>
                  Solicitar Nuevo Turno
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TURNOS DISPONIBLES AGRUPADOS POR FECHA -->
      <div class="row" *ngIf="showCalendar">
        <div class="col-12">
          <div class="turnos-card">
            <div class="turnos-header">
              <div class="d-flex justify-content-between align-items-center">
                <h3><i class="fas fa-calendar-alt"></i> Turnos Disponibles</h3>
                <div class="turnos-info">
                  <span class="info-text">{{ slotsDisponibles.length }} turnos encontrados</span>
                </div>
              </div>
            </div>
            
            <div class="turnos-body">
              <!-- Loading State -->
              <div class="loading-turnos" *ngIf="isLoadingTurnos">
                <i class="fas fa-spinner fa-spin"></i>
                Cargando turnos disponibles...
              </div>

              <!-- Turnos Agrupados por Fecha -->
              <div class="turnos-grouped" *ngIf="!isLoadingTurnos && slotsDisponibles.length > 0">
                <div *ngFor="let fecha of fechasOrdenadas" class="fecha-group">
                  <!-- Header de fecha -->
                  <div class="fecha-header" 
                       [class.fecha-feriado]="getTipoExcepcion(fecha) === 'FERIADO'">
                    <div class="fecha-info">
                      <h3 class="fecha-title">
                        <i class="fas fa-calendar-day"></i>
                        {{ formatearFecha(fecha) }}
                      </h3>
                      <!-- Solo mostrar feriados para pacientes -->
                      <div class="fecha-exception-badge" *ngIf="getTipoExcepcion(fecha) === 'FERIADO'">
                        <span class="exception-icon">🏖️</span>
                        <span class="exception-label">Feriado</span>
                        <span class="exception-description" *ngIf="getDescripcionExcepcion(fecha)">
                          - {{ getDescripcionExcepcion(fecha) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Slots de la fecha -->
                  <div class="slots-grid">
                    <div 
                      *ngFor="let slot of slotsPorFecha[fecha]" 
                      class="slot-card"
                      [class.selected]="slotSeleccionado?.id === slot.id"
                      [class.slot-ocupado]="slot.ocupado || slotAfectadoPorExcepcion(slot)"
                      (click)="seleccionarSlot(slot)">
                      
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

                      <!-- Estado del slot simplificado para pacientes -->
                      <div class="slot-status" *ngIf="slot.ocupado || slotAfectadoPorExcepcion(slot)">
                        <i class="fas fa-lock"></i>
                        Ocupado
                      </div>
                      <div class="slot-status disponible" *ngIf="!slot.ocupado && !slotAfectadoPorExcepcion(slot)">
                        <i class="fas fa-check-circle"></i>
                        Disponible
                      </div>

                      <div class="slot-check" *ngIf="slotSeleccionado?.id === slot.id">
                        <i class="fas fa-check-circle"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MENSAJE CUANDO NO HAY TURNOS -->
      <div class="row" *ngIf="showCalendar && turnosDisponibles.length === 0">
        <div class="col-12">
          <div class="no-turnos-card">
            <div class="no-turnos-content">
              <i class="fas fa-calendar-times"></i>
              <h4>No hay turnos para mostrar</h4>
              <p>No se encontraron turnos con los filtros seleccionados.</p>
              <p>Intenta cambiar los filtros o seleccionar otra fecha.</p>
              <button class="btn btn-paciente-primary" (click)="limpiarTodosFiltros()">
                <i class="fas fa-filter"></i>
                Cambiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- INFORMACIÓN SOBRE LOS COLORES -->
      <div class="row mt-3" *ngIf="showCalendar && turnosDisponibles.length > 0">
        <div class="col-12">
          <div class="legend-card">
            <div class="legend-content">
              <h5>Leyenda:</h5>
              <div class="legend-items">
                <div class="legend-item">
                  <div class="legend-color available"></div>
                  <span>Turnos Disponibles (Hacer clic para reservar)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color occupied"></div>
                  <span>Turnos Ocupados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL RESERVAR TURNO -->
      <div *ngIf="showBookingModal" class="modal-overlay" (click)="closeBookingModal()">
        <div class="modal-content paciente-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h4><i class="fas fa-calendar-plus"></i> Reservar Turno</h4>
            <button type="button" class="btn-close" (click)="closeBookingModal()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="turno-details">
              <div class="detail-item">
                <strong>Especialidad:</strong> {{ selectedTurnoDisponible?.meta?.especialidad }}
              </div>
              <div class="detail-item">
                <strong>Médico:</strong> {{ selectedTurnoDisponible?.meta?.medico }}
              </div>
              <div class="detail-item">
                <strong>Centro:</strong> {{ selectedTurnoDisponible?.meta?.centro }}
              </div>
              <div class="detail-item">
                <strong>Consultorio:</strong> {{ selectedTurnoDisponible?.meta?.consultorio }}
              </div>
              <div class="detail-item">
                <strong>Fecha:</strong> {{ selectedTurnoDisponible?.start | date: 'EEEE, dd MMMM yyyy' }}
              </div>
              <div class="detail-item">
                <strong>Horario:</strong> {{ selectedTurnoDisponible?.start | date: 'HH:mm' }} - {{ selectedTurnoDisponible?.end | date: 'HH:mm' }}
              </div>
            </div>
            
            <div class="confirmation-text">
              <p><strong>¿Deseas reservar este turno?</strong></p>
              <p>Una vez confirmado, el turno quedará reservado a tu nombre.</p>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-paciente-secondary" 
              (click)="closeBookingModal()">
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-paciente-primary" 
              (click)="confirmarReservaTurno()"
              [disabled]="isBooking">
              <i class="fas fa-check"></i>
              {{ isBooking ? 'Reservando...' : 'Confirmar Reserva' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* HEADER */
    .banner-paciente-agenda {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 2rem;
      position: relative;
      min-height: 80px;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }

    .header-icon {
      font-size: 3rem;
      color: white;
      opacity: 1;
      display: flex;
      align-items: center;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .header-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .header-text h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .header-text p {
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    /* FILTROS CARD */
    .filtros-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .filtros-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .filtros-icon {
      font-size: 1.5rem;
    }

    .filtros-header h3 {
      margin: 0;
      font-weight: 600;
    }

    .filtros-body {
      padding: 2rem;
    }

    /* STEPS */
    .filtro-step {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border-radius: 10px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .filtro-step.active {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .filtro-step.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .step-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .step-header h4 {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }

    .form-control-paciente {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control-paciente:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .loading-indicator {
      margin-top: 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    /* FILTROS APLICADOS */
    .filtros-aplicados {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .filtros-aplicados h5 {
      margin: 0 0 1rem 0;
      color: #495057;
      font-weight: 600;
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .filter-tag {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .filter-tag button {
      background: rgba(255,255,255,0.3);
      border: none;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }

    .filter-tag button:hover {
      background: rgba(255,255,255,0.5);
    }

    .btn-clear-filters {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-clear-filters:hover {
      background: #c82333;
    }

    .required {
      color: #dc3545;
      font-weight: bold;
    }

    .btn-paciente-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-paciente-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    .btn-paciente-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-paciente-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    /* TURNOS CARD-BASED FORMAT */
    .turnos-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
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

    .fecha-header.fecha-feriado {
      border-left-color: #dc3545;
      background: linear-gradient(135deg, #f8d7da 0%, #f1aeb5 100%);
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
      color: #721c24;
      border: 2px solid rgba(220, 53, 69, 0.4);
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15);
    }

    .exception-icon {
      font-size: 1rem;
    }

    .exception-label {
      font-weight: 600;
    }

    .exception-description {
      font-style: italic;
      color: #8b2635;
    }

    /* SLOTS GRID */
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
      border-color: #dc3545;
      background: rgba(220, 53, 69, 0.03);
      cursor: not-allowed;
      opacity: 0.7;
    }

    .slot-card.slot-ocupado:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
      margin-bottom: 1rem;
    }

    .location-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
      color: #6c757d;
      font-size: 0.85rem;
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
    }

    .slot-status:not(.disponible) {
      background: #dc3545;
      color: white;
    }

    .slot-status.disponible {
      background: #28a745;
      color: white;
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

    /* NO TURNOS */
    .no-turnos-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      padding: 3rem;
      text-align: center;
    }

    .no-turnos-content i {
      font-size: 4rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .no-turnos-content h4 {
      color: #495057;
      margin-bottom: 1rem;
    }

    .no-turnos-content p {
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }

    .paciente-modal {
      background: white;
      border-radius: 15px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h4 {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #adb5bd;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .turno-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .detail-item {
      margin-bottom: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .confirmation-text {
      margin-top: 1rem;
      padding: 1rem;
      background: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .confirmation-text p {
      margin: 0.5rem 0;
      color: #1565c0;
    }

    .confirmation-text p:first-child {
      font-weight: 600;
      color: #0d47a1;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    /* LEYENDA */
    .legend-card {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
    }

    .legend-content h5 {
      margin-bottom: 0.75rem;
      color: #495057;
      font-weight: 600;
    }

    .legend-items {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 2px solid;
    }

    .legend-color.available {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-color: #1e7e34;
    }

    .legend-color.occupied {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      border-color: #bd2130;
    }

    .legend-item span {
      font-size: 0.9rem;
      color: #6c757d;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.5rem;
        min-height: auto;
      }

      .header-actions {
        order: 1;
        align-self: center;
      }

      .header-icon {
        order: 2;
        font-size: 2.5rem;
      }

      .header-text {
        order: 3;
        text-align: center;
      }

      .header-text h1 {
        font-size: 2rem;
      }

      .filtros-actions {
        flex-direction: column;
      }

      .slots-grid {
        grid-template-columns: 1fr;
      }

      .paciente-modal {
        width: 95%;
        margin: 1rem;
      }

      .fecha-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .filter-tags {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class PacienteAgendaComponent implements OnInit {
  // Estados de carga
  isLoadingTurnos = false;
  isLoadingEspecialidades = false;
  isLoadingStaffMedicos = false;
  isLoadingCentros = false;

  // Filtros
  especialidadSeleccionada = '';
  staffMedicoSeleccionado: number | null = null;
  centroAtencionSeleccionado: number | null = null;

  // Listas para filtros
  especialidades: Especialidad[] = [];
  staffMedicos: StaffMedico[] = [];
  centrosAtencion: CentroAtencion[] = [];

  // Slots y calendario
  showCalendar = false;
  slotsDisponibles: SlotDisponible[] = [];
  slotsPorFecha: { [fecha: string]: SlotDisponible[] } = {};
  fechasOrdenadas: string[] = [];
  turnosDisponibles: any[] = []; // Para compatibilidad con el template
  semanas: number = 4;

  // Modal de reserva
  showBookingModal = false;
  slotSeleccionado: SlotDisponible | null = null;
  selectedTurnoDisponible: any = null; // Para el modal
  isBooking = false;

  constructor(
    private turnoService: TurnoService,
    private especialidadService: EspecialidadService,
    private staffMedicoService: StaffMedicoService,
    private centroAtencionService: CentroAtencionService,
    private agendaService: AgendaService,
    private diasExcepcionalesService: DiasExcepcionalesService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Cargar días excepcionales primero
    this.cargarDiasExcepcionales();
    this.cargarEspecialidades();
  }

  // Cargar días excepcionales para el calendario
  cargarDiasExcepcionales() {
    this.diasExcepcionalesService.cargarDiasExcepcionalesParaCalendario();
  }

  // Cargar especialidades al inicializar
  cargarEspecialidades() {
    this.isLoadingEspecialidades = true;
    this.especialidadService.all().subscribe({
      next: (dataPackage: DataPackage<Especialidad[]>) => {
        this.especialidades = dataPackage.data || [];
        this.isLoadingEspecialidades = false;
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
        this.isLoadingEspecialidades = false;
      }
    });
  }

  // Método llamado cuando cambia la especialidad
  onEspecialidadChange() {
    // Limpiar filtros dependientes
    this.staffMedicoSeleccionado = null;
    this.centroAtencionSeleccionado = null;
    this.staffMedicos = [];
    this.centrosAtencion = [];

    if (this.especialidadSeleccionada) {
      // Cargar staff médicos y centros para la especialidad seleccionada
      this.cargarStaffMedicosPorEspecialidad();
      this.cargarCentrosAtencion();
      // Cargar turnos con la especialidad seleccionada
      this.cargarTurnosConFiltros();
    } else {
      // Si no hay especialidad, ocultar calendario
      this.showCalendar = false;
      this.turnosDisponibles = [];
    }
  }

  // Cargar staff médicos filtrados por especialidad
  cargarStaffMedicosPorEspecialidad() {
    if (!this.especialidadSeleccionada) return;
    
    this.isLoadingStaffMedicos = true;
    this.staffMedicoService.all().subscribe({
      next: (dataPackage: DataPackage<StaffMedico[]>) => {
        // Filtrar staff médicos que tengan la especialidad seleccionada
        this.staffMedicos = (dataPackage.data || []).filter(staff => 
          staff.especialidad?.nombre === this.especialidadSeleccionada
        );
        this.isLoadingStaffMedicos = false;
      },
      error: (error) => {
        console.error('Error cargando staff médicos:', error);
        this.isLoadingStaffMedicos = false;
      }
    });
  }

  // Cargar centros de atención
  cargarCentrosAtencion() {
    this.isLoadingCentros = true;
    this.centroAtencionService.all().subscribe({
      next: (dataPackage: any) => {
        this.centrosAtencion = dataPackage.data || [];
        this.isLoadingCentros = false;
      },
      error: (error) => {
        console.error('Error cargando centros de atención:', error);
        this.isLoadingCentros = false;
      }
    });
  }

  // Método llamado cuando cambia el staff médico
  onStaffMedicoChange() {
    if (this.especialidadSeleccionada && this.slotsDisponibles.length > 0) {
      this.aplicarFiltrosSlots();
      this.agruparSlotsPorFecha();
    }
  }

  // Método llamado cuando cambia el centro de atención
  onCentroAtencionChange() {
    if (this.especialidadSeleccionada && this.slotsDisponibles.length > 0) {
      this.aplicarFiltrosSlots();
      this.agruparSlotsPorFecha();
    }
  }

  // Cargar turnos con filtros aplicados
  cargarTurnosConFiltros() {
    if (!this.especialidadSeleccionada) {
      this.showCalendar = false;
      return;
    }

    this.isLoadingTurnos = true;
    
    // Usar el mismo sistema que el admin para obtener turnos disponibles
    this.agendaService.obtenerTodosLosEventos(this.semanas).subscribe({
      next: (eventosBackend) => {
        // Transformar los eventos del backend en slots
        this.slotsDisponibles = this.mapEventosToSlots(eventosBackend);
        this.aplicarFiltrosSlots();
        this.agruparSlotsPorFecha();
        this.showCalendar = true;
        this.isLoadingTurnos = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error al cargar eventos:', err);
        this.isLoadingTurnos = false;
        this.showCalendar = true;
        this.slotsDisponibles = [];
        this.turnosDisponibles = [];
      }
    });
  }

  // Transformar eventos del backend a slots
  private mapEventosToSlots(eventosBackend: any[]): SlotDisponible[] {
    const slots: SlotDisponible[] = [];

    eventosBackend.forEach(evento => {
      // Validar que el evento tenga los datos necesarios
      if (!evento.fecha || !evento.horaInicio || !evento.horaFin || !evento.esSlot) {
        return;
      }

      slots.push({
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
        esSlot: true
      });
    });

    return slots;
  }

  // Aplicar filtros a los slots
  aplicarFiltrosSlots() {
    let slotsFiltrados = this.slotsDisponibles;

    // Filtrar por especialidad
    if (this.especialidadSeleccionada) {
      slotsFiltrados = slotsFiltrados.filter(slot =>
        slot.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }

    // Filtrar por staff médico si está seleccionado
    if (this.staffMedicoSeleccionado) {
      slotsFiltrados = slotsFiltrados.filter(slot =>
        slot.staffMedicoId === this.staffMedicoSeleccionado
      );
    }

    // Filtrar por centro de atención si está seleccionado
    if (this.centroAtencionSeleccionado) {
      slotsFiltrados = slotsFiltrados.filter(slot =>
        slot.centroId === this.centroAtencionSeleccionado
      );
    }

    this.slotsDisponibles = slotsFiltrados;
    this.turnosDisponibles = slotsFiltrados; // Para compatibilidad con el template
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
  seleccionarSlot(slot: SlotDisponible) {
    if (slot.ocupado) {
      alert('Este turno ya está ocupado. Por favor, selecciona otro horario disponible.');
      return;
    }

    // Verificar si el slot específico está afectado por una excepción
    if (this.slotAfectadoPorExcepcion(slot)) {
      const excepcionesDelDia = this.diasExcepcionalesService.getExcepcionesDelDia(slot.fecha);
      const excepcionAfectante = excepcionesDelDia?.find(exc => {
        if (exc.tipo === 'FERIADO') return true;
        if ((exc.tipo === 'MANTENIMIENTO' || exc.tipo === 'ATENCION_ESPECIAL') && 
            exc.horaInicio && exc.horaFin) {
          const inicioSlot = this.convertirHoraAMinutos(slot.horaInicio);
          const finSlot = this.convertirHoraAMinutos(slot.horaFin);
          const inicioExc = this.convertirHoraAMinutos(exc.horaInicio);
          const finExc = this.convertirHoraAMinutos(exc.horaFin);
          return inicioSlot < finExc && finSlot > inicioExc;
        }
        return false;
      });

      if (excepcionAfectante) {
        const tipoLabel = excepcionAfectante.tipo === 'FERIADO' ? 'Feriado' : 
                          excepcionAfectante.tipo === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Atención Especial';
        alert(`Este horario no está disponible por ${tipoLabel}. Por favor, selecciona otro horario.`);
      } else {
        alert('Este horario no está disponible. Por favor, selecciona otro horario.');
      }
      return;
    }

    this.slotSeleccionado = slot;
    
    // Crear objeto compatible con el modal existente
    this.selectedTurnoDisponible = {
      start: new Date(`${slot.fecha}T${slot.horaInicio}`),
      end: new Date(`${slot.fecha}T${slot.horaFin}`),
      meta: {
        id: slot.id,
        especialidad: slot.especialidadStaffMedico,
        medico: `${slot.staffMedicoNombre} ${slot.staffMedicoApellido}`,
        centro: slot.nombreCentro,
        consultorio: slot.consultorioNombre,
        staffMedicoId: slot.staffMedicoId,
        staffMedicoNombre: slot.staffMedicoNombre,
        staffMedicoApellido: slot.staffMedicoApellido,
        especialidadStaffMedico: slot.especialidadStaffMedico,
        consultorioId: slot.consultorioId,
        consultorioNombre: slot.consultorioNombre,
        centroId: slot.centroId,
        centroAtencionNombre: slot.nombreCentro
      }
    };
    
    this.showBookingModal = true;
  }

  // Navegación y otros métodos
  goBack() {
    this.router.navigate(['/paciente-dashboard']);
  }

  irASolicitarTurno() {
    this.router.navigate(['/paciente-solicitar-turno']);
  }

  // Actualizar slot reservado inmediatamente
  private actualizarSlotReservado(slotId: number) {
    // Encontrar el slot en el array y marcarlo como ocupado
    const slotEncontrado = this.slotsDisponibles.find(slot => slot.id === slotId);
    
    if (slotEncontrado) {
      slotEncontrado.ocupado = true;
      
      // Reagrupar slots por fecha para actualizar la vista
      this.agruparSlotsPorFecha();
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
    }
  }

  // Confirmar reserva de turno
  confirmarReservaTurno() {
    if (!this.selectedTurnoDisponible || !this.slotSeleccionado) return;

    const pacienteId = localStorage.getItem('pacienteId');
    if (!pacienteId) {
      alert('Error: No se encontró la información del paciente. Por favor, inicie sesión nuevamente.');
      return;
    }

    this.isBooking = true;

    const turnoDTO = {
      id: this.slotSeleccionado.id,
      fecha: this.slotSeleccionado.fecha,
      horaInicio: this.slotSeleccionado.horaInicio,
      horaFin: this.slotSeleccionado.horaFin,
      pacienteId: parseInt(pacienteId),
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

    console.log('Enviando turno DTO:', turnoDTO);

    this.http.post(`/rest/turno/asignar`, turnoDTO).subscribe({
      next: () => {
        alert('¡Turno reservado exitosamente!');
        
        // Actualizar inmediatamente el slot en el array local
        this.actualizarSlotReservado(this.slotSeleccionado!.id);
        
        this.closeBookingModal();
        
        // Recargar los turnos para obtener datos actualizados del servidor
        setTimeout(() => {
          this.cargarTurnosConFiltros();
        }, 500);
      },
      error: (err: any) => {
        console.error('Error al reservar el turno:', err);
        alert('No se pudo reservar el turno. Intente nuevamente.');
        this.isBooking = false;
      }
    });
  }

  // Cerrar modal de reserva
  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedTurnoDisponible = null;
    this.slotSeleccionado = null;
    this.isBooking = false;
  }

  // Métodos de limpieza de filtros
  limpiarEspecialidad() {
    this.especialidadSeleccionada = '';
    this.onEspecialidadChange();
  }

  limpiarStaffMedico() {
    this.staffMedicoSeleccionado = null;
    this.onStaffMedicoChange();
  }

  limpiarCentroAtencion() {
    this.centroAtencionSeleccionado = null;
    this.onCentroAtencionChange();
  }

  limpiarTodosFiltros() {
    this.especialidadSeleccionada = '';
    this.staffMedicoSeleccionado = null;
    this.centroAtencionSeleccionado = null;
    this.staffMedicos = [];
    this.centrosAtencion = [];
    this.showCalendar = false;
    this.slotsDisponibles = [];
    this.turnosDisponibles = [];
    this.slotsPorFecha = {};
    this.fechasOrdenadas = [];
  }

  // Métodos auxiliares para obtener nombres
  getStaffMedicoNombre(id: number | null): string {
    if (!id) return 'Cualquier médico';
    const staff = this.staffMedicos.find(s => s.id === id);
    return staff ? `${staff.medico?.nombre} ${staff.medico?.apellido}` : 'Médico no encontrado';
  }

  getCentroAtencionNombre(id: number | null): string {
    if (!id) return 'Cualquier centro';
    const centro = this.centrosAtencion.find(c => c.id === id);
    return centro ? centro.nombre : 'Centro no encontrado';
  }

  // Métodos para manejo de días excepcionales
  esDiaExcepcional(fecha: string): boolean {
    return this.diasExcepcionalesService.esDiaExcepcional(fecha);
  }

  // Verificar si un slot específico está afectado por excepciones
  slotAfectadoPorExcepcion(slot: SlotDisponible): boolean {
    const excepcionesDelDia = this.diasExcepcionalesService.getExcepcionesDelDia(slot.fecha);
    
    if (!excepcionesDelDia || excepcionesDelDia.length === 0) {
      return false;
    }

    for (const excepcion of excepcionesDelDia) {
      // Los feriados afectan todo el día
      if (excepcion.tipo === 'FERIADO') {
        return true;
      }

      // Para mantenimiento y atención especial, verificar horarios específicos
      if ((excepcion.tipo === 'MANTENIMIENTO' || excepcion.tipo === 'ATENCION_ESPECIAL') && 
          excepcion.horaInicio && excepcion.horaFin) {
        
        const inicioSlotMinutos = this.convertirHoraAMinutos(slot.horaInicio);
        const finSlotMinutos = this.convertirHoraAMinutos(slot.horaFin);
        const inicioExcepcionMinutos = this.convertirHoraAMinutos(excepcion.horaInicio);
        const finExcepcionMinutos = this.convertirHoraAMinutos(excepcion.horaFin);

        // Verificar si hay superposición entre el slot y la excepción
        const hayConflicto = inicioSlotMinutos < finExcepcionMinutos && 
                            finSlotMinutos > inicioExcepcionMinutos;

        if (hayConflicto) {
          return true;
        }
      }
    }

    return false;
  }

  // Función auxiliar para convertir hora "HH:mm" a minutos desde medianoche
  convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  getTipoExcepcion(fecha: string): 'FERIADO' | 'ATENCION_ESPECIAL' | 'MANTENIMIENTO' | null {
    return this.diasExcepcionalesService.getTipoExcepcion(fecha);
  }

  getTipoExcepcionLabel(fecha: string): string {
    const tipo = this.getTipoExcepcion(fecha);
    switch (tipo) {
      case 'FERIADO':
        return 'Feriado';
      case 'MANTENIMIENTO':
        return 'Mantenimiento';
      case 'ATENCION_ESPECIAL':
        return 'Atención Especial';
      default:
        return 'Día Excepcional';
    }
  }

  getDescripcionExcepcion(fecha: string): string | null {
    return this.diasExcepcionalesService.getDescripcionExcepcion(fecha);
  }

  getIconoExcepcion(fecha: string): string {
    const tipo = this.getTipoExcepcion(fecha);
    switch (tipo) {
      case 'FERIADO':
        return '🏛️';
      case 'MANTENIMIENTO':
        return '🔧';
      case 'ATENCION_ESPECIAL':
        return '⭐';
      default:
        return '⚠️';
    }
  }

}
