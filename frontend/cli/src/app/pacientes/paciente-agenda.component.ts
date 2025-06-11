import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarModule, CalendarEvent, CalendarEventTitleFormatter, CalendarDateFormatter, CalendarView } from 'angular-calendar';
import { HttpClient } from '@angular/common/http';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

// Services
import { TurnoService } from '../turnos/turno.service';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { AgendaService } from '../agenda/agenda.service';
import { Turno } from '../turnos/turno';
import { Especialidad } from '../especialidades/especialidad';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-paciente-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule
  ],
  providers: [CalendarEventTitleFormatter, CalendarDateFormatter],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

      <!-- CALENDARIO DE TURNOS DISPONIBLES -->
      <div class="row" *ngIf="showCalendar">
        <div class="col-12">
          <div class="calendar-card">
            <div class="calendar-header">
              <div class="d-flex justify-content-between align-items-center">
                <h3><i class="fas fa-calendar-alt"></i> Turnos Disponibles</h3>
                <div class="calendar-navigation">
                  <button 
                    type="button" 
                    class="btn btn-header-glass" 
                    (click)="previousWeek()">
                    <i class="fas fa-chevron-left"></i> Anterior
                  </button>
                  <span class="current-period">
                    {{ viewDate | date: 'MMMM yyyy' }}
                  </span>
                  <button 
                    type="button" 
                    class="btn btn-header-glass" 
                    (click)="nextWeek()">
                    Siguiente <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="calendar-body">
              <mwl-calendar-week-view
                [viewDate]="viewDate"
                [events]="turnosDisponibles"
                [hourSegments]="4"
                [dayStartHour]="7"
                [dayEndHour]="20"
                [weekStartsOn]="1"
                [weekendDays]="[0, 6]"
                [hourSegmentHeight]="60"
                [hourSegmentModifier]="2"
                (eventClicked)="onTurnoDisponibleSelected($event)"
                (eventTimesChanged)="onEventTimesChanged($event)">
              </mwl-calendar-week-view>
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

    /* ACCIONES */
    .filtros-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    /* CALENDARIO */
    .calendar-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .calendar-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
    }

    .calendar-header h3 {
      margin: 0;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .calendar-navigation {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .current-period {
      font-weight: 600;
      font-size: 1.2rem;
      color: white;
      min-width: 200px;
      text-align: center;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .calendar-body {
      padding: 1rem;
      min-height: 600px;
    }

    /* ESTILOS ESPECÍFICOS PARA ANGULAR-CALENDAR */
    :host ::ng-deep .cal-week-view {
      background-color: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    :host ::ng-deep .cal-day-headers {
      border-bottom: 2px solid #667eea;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    :host ::ng-deep .cal-day-headers .cal-header {
      padding: 1rem 0.5rem;
      font-weight: 600;
      color: #495057;
      text-align: center;
      border-right: 1px solid #dee2e6;
    }

    :host ::ng-deep .cal-day-headers .cal-header:last-child {
      border-right: none;
    }

    :host ::ng-deep .cal-day-columns {
      min-height: 500px;
    }

    :host ::ng-deep .cal-day-column {
      border-right: 1px solid #dee2e6;
      position: relative;
    }

    :host ::ng-deep .cal-day-column:last-child {
      border-right: none;
    }

    :host ::ng-deep .cal-hour-segment {
      border-bottom: 1px solid #f1f3f4;
      padding: 0;
      position: relative;
    }

    :host ::ng-deep .cal-hour:nth-child(odd) .cal-hour-segment {
      border-bottom: 1px solid #e9ecef;
    }

    :host ::ng-deep .cal-time {
      font-size: 0.75rem;
      color: #6c757d;
      padding: 0.25rem 0.5rem;
      width: 60px;
      text-align: right;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
    }

    :host ::ng-deep .cal-event {
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 1px;
    }

    :host ::ng-deep .cal-event:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    :host ::ng-deep .cal-event-title {
      font-weight: 600;
    }

    :host ::ng-deep .cal-starts-within-week .cal-event {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    :host ::ng-deep .cal-ends-within-week .cal-event {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    /* Eventos disponibles - Verde */
    :host ::ng-deep .cal-event[style*="background-color: rgb(40, 167, 69)"] {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
      color: white !important;
      border: 2px solid #1e7e34 !important;
      cursor: pointer !important;
    }

    :host ::ng-deep .cal-event[style*="background-color: rgb(40, 167, 69)"]:hover {
      background: linear-gradient(135deg, #218838 0%, #1abc9c 100%) !important;
      transform: scale(1.05) !important;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
    }

    /* Eventos ocupados - Rojo */
    :host ::ng-deep .cal-event[style*="background-color: rgb(220, 53, 69)"] {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
      color: white !important;
      border: 2px solid #bd2130 !important;
      cursor: not-allowed !important;
      opacity: 0.8;
      position: relative;
    }

    :host ::ng-deep .cal-event[style*="background-color: rgb(220, 53, 69)"]:hover {
      opacity: 0.9;
      transform: none !important;
    }

    /* Agregar ícono de candado para turnos ocupados */
    :host ::ng-deep .cal-event[style*="background-color: rgb(220, 53, 69)"]:before {
      content: "🔒";
      position: absolute;
      top: 2px;
      right: 4px;
      font-size: 10px;
    }

    :host ::ng-deep .cal-week-view .cal-day-headers {
      display: flex;
    }

    :host ::ng-deep .cal-week-view .cal-day-columns {
      display: flex;
      flex: 1;
    }

    :host ::ng-deep .cal-week-view .cal-day-column {
      flex: 1;
      min-height: 500px;
    }

    :host ::ng-deep .cal-day-headers .cal-header {
      color: #2c3e50;
      text-align: center;
      border-right: 1px solid #e9ecef;
    }

    :host ::ng-deep .cal-day-headers .cal-header:last-child {
      border-right: none;
    }

    :host ::ng-deep .cal-day-column {
      border-right: 1px solid #e9ecef;
      min-width: 150px;
    }

    :host ::ng-deep .cal-day-column:last-child {
      border-right: none;
    }

    :host ::ng-deep .cal-hour-segment {
      border-bottom: 1px solid #f1f3f4;
      background-color: #fafbff;
      min-height: 40px;
    }

    :host ::ng-deep .cal-hour-segment:hover {
      background-color: #f0f8ff;
    }

    :host ::ng-deep .cal-time {
      font-size: 0.85rem;
      color: #6c757d;
      padding: 0.25rem;
    }

    :host ::ng-deep .cal-event {
      border-radius: 6px;
      border: none;
      font-weight: 500;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin: 1px;
      transition: all 0.2s ease;
    }

    :host ::ng-deep .cal-event:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    :host ::ng-deep .cal-event-title {
      font-size: 0.8rem;
      font-weight: 600;
    }

    :host ::ng-deep .cal-week-view .cal-hour-rows {
      overflow: visible;
    }

    :host ::ng-deep .cal-week-view .cal-time-events {
      position: relative;
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

      .calendar-navigation {
        flex-direction: column;
        gap: 0.5rem;
      }

      .current-period {
        min-width: auto;
        margin: 0.5rem 0;
      }

      .btn-nav {
        width: 100%;
        justify-content: center;
      }

      .paciente-modal {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class PacienteAgendaComponent implements OnInit {
  // Vista del calendario
  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView;
  
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

  // Calendario
  viewDate = new Date();
  showCalendar = false;
  turnosDisponibles: CalendarEvent[] = [];
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  semanas: number = 4;

  // Modal de reserva
  showBookingModal = false;
  selectedTurnoDisponible: CalendarEvent | null = null;
  isBooking = false;

  constructor(
    private turnoService: TurnoService,
    private especialidadService: EspecialidadService,
    private staffMedicoService: StaffMedicoService,
    private centroAtencionService: CentroAtencionService,
    private agendaService: AgendaService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarEspecialidades();
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
    if (this.especialidadSeleccionada && this.events.length > 0) {
      this.aplicarFiltros();
    }
  }

  // Método llamado cuando cambia el centro de atención
  onCentroAtencionChange() {
    if (this.especialidadSeleccionada && this.events.length > 0) {
      this.aplicarFiltros();
    }
  }

  // Cargar turnos con filtros aplicados (usando el sistema del admin)
  cargarTurnosConFiltros() {
    if (!this.especialidadSeleccionada) {
      this.showCalendar = false;
      return;
    }

    this.isLoadingTurnos = true;
    
    // Usar el mismo sistema que el admin para obtener turnos disponibles
    this.agendaService.obtenerTodosLosEventos(this.semanas).subscribe({
      next: (eventosBackend) => {
        // Transformar los eventos del backend en objetos CalendarEvent
        this.events = this.mapEsquemasToEvents(eventosBackend);
        this.aplicarFiltros();
        this.showCalendar = true;
        this.isLoadingTurnos = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error al cargar eventos:', err);
        this.isLoadingTurnos = false;
        this.showCalendar = true;
        this.turnosDisponibles = [];
      }
    });
  }

  // Aplicar filtros a los eventos cargados
  aplicarFiltros() {
    let eventosFiltrados = this.events;

    // Filtrar por especialidad
    if (this.especialidadSeleccionada) {
      eventosFiltrados = eventosFiltrados.filter(event =>
        event.meta?.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }

    // Filtrar por staff médico si está seleccionado
    if (this.staffMedicoSeleccionado) {
      eventosFiltrados = eventosFiltrados.filter(event =>
        event.meta?.staffMedicoId === this.staffMedicoSeleccionado
      );
    }

    // Filtrar por centro de atención si está seleccionado
    if (this.centroAtencionSeleccionado) {
      eventosFiltrados = eventosFiltrados.filter(event =>
        event.meta?.centroId === this.centroAtencionSeleccionado
      );
    }

    // Mostrar TODOS los slots (tanto disponibles como ocupados)
    eventosFiltrados = eventosFiltrados.filter(event =>
      event.meta?.esSlot === true
    );

    this.turnosDisponibles = eventosFiltrados;
  }

  // Transformar eventos del backend (igual que en el admin)
  private mapEsquemasToEvents(eventosBackend: any[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    eventosBackend.forEach(evento => {
      // Validar que el evento tenga los datos necesarios
      if (!evento.fecha || !evento.horaInicio || !evento.horaFin) {
        console.warn('Evento con datos incompletos:', evento);
        return;
      }

      const start = new Date(`${evento.fecha}T${evento.horaInicio}`);
      const end = new Date(`${evento.fecha}T${evento.horaFin}`);

      // Validar que las fechas sean válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Evento con fechas inválidas:', evento);
        return;
      }

      // Aplicar colores basándose en el estado (frontend)
      let color;
      if (evento.ocupado) {
        // Slot ocupado - color rojo
        color = { 
          primary: '#dc3545', 
          secondary: '#f8d7da' 
        };
      } else {
        // Slot disponible - color verde
        color = { 
          primary: '#28a745', 
          secondary: '#d4edda' 
        };
      }

      // Título dinámico basado en el estado
      const title = evento.ocupado ? 
        `Ocupado - ${evento.staffMedicoNombre} ${evento.staffMedicoApellido}` : 
        `Disponible - ${evento.staffMedicoNombre} ${evento.staffMedicoApellido}`;

      events.push({
        start,
        end,
        title: title,
        color: color,
        meta: {
          id: evento.id,
          staffMedicoNombre: evento.staffMedicoNombre,
          staffMedicoApellido: evento.staffMedicoApellido,
          especialidadStaffMedico: evento.especialidadStaffMedico,
          centroId: evento.centroId,
          staffMedicoId: evento.staffMedicoId,
          consultorioId: evento.consultorioId,
          consultorioNombre: evento.consultorioNombre,
          centroAtencionNombre: evento.nombreCentro,
          esSlot: evento.esSlot,
          ocupado: evento.ocupado,
          // Datos para el modal
          especialidad: evento.especialidadStaffMedico,
          medico: `${evento.staffMedicoNombre} ${evento.staffMedicoApellido}`,
          centro: evento.nombreCentro,
          consultorio: evento.consultorioNombre
        }
      });
    });

    return events;
  }

  // Manejar clic en turno disponible
  onTurnoDisponibleSelected(event: any) {
    const turno = event.event;
    
    // Verificar si es un slot válido
    if (!turno.meta?.esSlot) {
      return;
    }

    // Si el slot está ocupado, mostrar mensaje informativo
    if (turno.meta?.ocupado) {
      alert('Este turno ya está ocupado. Por favor, selecciona otro horario disponible.');
      return;
    }

    // Solo permitir reservar turnos disponibles (no ocupados)
    this.selectedTurnoDisponible = turno;
    this.showBookingModal = true;
  }

  // Confirmar reserva de turno
  confirmarReservaTurno() {
    if (!this.selectedTurnoDisponible) return;

    const pacienteId = localStorage.getItem('pacienteId');
    if (!pacienteId) {
      alert('Error: No se encontró la información del paciente. Por favor, inicie sesión nuevamente.');
      return;
    }

    this.isBooking = true;

    // Crear fechas locales sin conversión a UTC
    const startDate = this.selectedTurnoDisponible.start;
    const endDate = this.selectedTurnoDisponible.end;
    
    // Formatear fecha y hora en horario local (sin UTC)
    const fechaLocal = startDate.getFullYear() + '-' + 
                      String(startDate.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(startDate.getDate()).padStart(2, '0');
    
    const horaInicioLocal = String(startDate.getHours()).padStart(2, '0') + ':' + 
                           String(startDate.getMinutes()).padStart(2, '0') + ':' + 
                           String(startDate.getSeconds()).padStart(2, '0');
    
    const horaFinLocal = endDate ? 
                        String(endDate.getHours()).padStart(2, '0') + ':' + 
                        String(endDate.getMinutes()).padStart(2, '0') + ':' + 
                        String(endDate.getSeconds()).padStart(2, '0') : '';

    const turnoDTO = {
      id: this.selectedTurnoDisponible.meta?.id,
      fecha: fechaLocal,
      horaInicio: horaInicioLocal,
      horaFin: horaFinLocal,
      pacienteId: parseInt(pacienteId),
      staffMedicoId: this.selectedTurnoDisponible.meta?.staffMedicoId,
      staffMedicoNombre: this.selectedTurnoDisponible.meta?.staffMedicoNombre,
      staffMedicoApellido: this.selectedTurnoDisponible.meta?.staffMedicoApellido,
      especialidadStaffMedico: this.selectedTurnoDisponible.meta?.especialidadStaffMedico,
      consultorioId: this.selectedTurnoDisponible.meta?.consultorioId,
      consultorioNombre: this.selectedTurnoDisponible.meta?.consultorioNombre,
      centroId: this.selectedTurnoDisponible.meta?.centroId,
      nombreCentro: this.selectedTurnoDisponible.meta?.centroAtencionNombre,
      estado: 'PROGRAMADO'
    };

    console.log('Enviando turno DTO:', turnoDTO); // Debug log

    this.http.post(`/rest/turno/asignar`, turnoDTO).subscribe({
      next: () => {
        alert('¡Turno reservado exitosamente!');
        
        // Actualizar inmediatamente el slot en el calendario local
        if (this.selectedTurnoDisponible) {
          this.actualizarSlotReservado(this.selectedTurnoDisponible);
        }
        
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
    this.isBooking = false;
  }

  // Actualizar slot reservado inmediatamente en el calendario local
  private actualizarSlotReservado(slot: CalendarEvent) {
    // Encontrar el slot en el array de eventos y marcarlo como ocupado
    const eventoEncontrado = this.events.find(event => 
      event.meta?.id === slot.meta?.id &&
      event.start.getTime() === slot.start.getTime()
    );
    
    if (eventoEncontrado) {
      // Actualizar metadatos
      eventoEncontrado.meta.ocupado = true;
      eventoEncontrado.title = 'Ocupado';
      eventoEncontrado.color = { primary: '#dc3545', secondary: '#f8d7da' };
      
      // Aplicar filtros nuevamente para actualizar la vista
      this.aplicarFiltros();
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
    }
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
    this.turnosDisponibles = [];
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

  // Navegación del calendario
  previousWeek() {
    this.viewDate = subWeeks(this.viewDate, 1);
    // Recargar turnos si hay filtros aplicados
    if (this.especialidadSeleccionada) {
      this.cargarTurnosConFiltros();
    }
  }

  nextWeek() {
    this.viewDate = addWeeks(this.viewDate, 1);
    // Recargar turnos si hay filtros aplicados
    if (this.especialidadSeleccionada) {
      this.cargarTurnosConFiltros();
    }
  }

  // Método para manejar cambios en los eventos (requerido por el calendario)
  onEventTimesChanged(event: any) {
    // Este método es requerido por el calendario pero no lo usamos para cambiar eventos
    // ya que los pacientes solo pueden reservar, no mover eventos
  }

  goBack() {
    this.router.navigate(['/paciente-dashboard']);
  }

  irASolicitarTurno() {
    this.router.navigate(['/paciente-solicitar-turno']);
  }
}
