import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { CentrosMapaModalComponent } from '../modal/centros-mapa-modal.component';
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
    FormsModule,
    CentrosMapaModalComponent
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
                  <h4>Especialidad (Opcional)</h4>
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
                   [class.active]="staffMedicoSeleccionado">
                <div class="step-header">
                  <div class="step-number">2</div>
                  <h4>Médico (Opcional)</h4>
                </div>
                <select 
                  class="form-control-paciente"
                  [(ngModel)]="staffMedicoSeleccionado"
                  (change)="onStaffMedicoChange()"
                  [disabled]="isLoadingStaffMedicos">
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
                   [class.active]="centroAtencionSeleccionado">
                <div class="step-header">
                  <div class="step-number">3</div>
                  <h4>Centro de Atención (Opcional)</h4>
                </div>
                <select 
                  class="form-control-paciente"
                  [(ngModel)]="centroAtencionSeleccionado"
                  (change)="onCentroAtencionChange()"
                  [disabled]="isLoadingCentros">
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
                  (click)="aplicarFiltros()"
                  [disabled]="isLoadingTurnos">
                  <i class="fas fa-search"></i>
                  {{ isLoadingTurnos ? 'Buscando...' : 'Aplicar Filtros' }}
                </button>

                <button 
                  type="button" 
                  class="btn btn-paciente-mapa" 
                  (click)="mostrarMapaCentros()"
                  [disabled]="isLoadingCentros">
                  <i class="fas fa-map-marked-alt"></i>
                  Ver Mapa de Centros Medicos
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
            
            <!-- ... resto del contenido del calendario ... -->
          </div>
        </div>
      </div>

      <!-- MENSAJE INICIAL - INVITA A SELECCIONAR FILTROS -->
      <div class="row" *ngIf="!showCalendar && !isLoadingTurnos">
        <div class="col-12">
          <div class="filtros-inicial-card">
            <div class="filtros-inicial-content">
              <i class="fas fa-filter"></i>
              <h4>Selecciona tus preferencias</h4>
              <p>Para ver los turnos disponibles, selecciona al menos uno de los filtros de arriba:</p>
              <ul>
                <li><strong>Especialidad:</strong> Busca turnos de una especialidad específica</li>
                <li><strong>Médico:</strong> Busca turnos de un médico en particular</li>
                <li><strong>Centro de Atención:</strong> Busca turnos en un centro específico</li>
              </ul>
              <p><small>Puedes combinar varios filtros para refinar tu búsqueda.</small></p>
            </div>
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
                    <ng-container *ngFor="let slot of slotsPorFecha[fecha]; let i = index">
                      <!-- Cabecera de médico unificada (primer slot o cambio de médico) -->
                      <div *ngIf="i === 0 || esCambioMedico(fecha, i)" class="medico-header">
                        <i class="fas fa-user-md"></i>
                        <span>{{ getNombreMedico(slot) }}</span>
                      </div>
                      
                      <div 
                        class="slot-card"
                        [class.selected]="slotSeleccionado?.id === slot.id"
                        [class.slot-ocupado]="slot.ocupado || slotAfectadoPorExcepcion(slot)"
                        (click)="seleccionarSlot(slot, $event)">
                        
                        <div class="slot-time">
                          <i class="fas fa-clock"></i>
                          {{ slot.horaInicio }} - {{ slot.horaFin }}
                        </div>
                        
                        <div class="slot-medico">
                          <i class="fas fa-user-md"></i>
                          <strong>{{ getNombreMedico(slot) }}</strong>
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
                    </ng-container>
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
      <div *ngIf="showBookingModal" 
           class="modal-contextual">
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
                <strong>Fecha:</strong> {{ selectedTurnoDisponible?.start | date: 'EEEE, dd MM yyyy' }}
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

      <!-- Backdrop para cerrar modal cuando se hace clic fuera -->
      <div *ngIf="showBookingModal" 
           class="modal-backdrop" 
           (click)="closeBookingModal()">
      </div>

      <!-- MODAL DE MAPA DE CENTROS -->
      <app-centros-mapa-modal 
        *ngIf="showMapaModal"
        [centros]="centrosAtencionCompletos"
        [especialidades]="especialidadesCompletas"
        [especialidadSeleccionadaInicial]="especialidadSeleccionada"
        (centroSeleccionado)="onCentroSeleccionadoDelMapa($event)"
        (modalCerrado)="cerrarMapaModal()">
      </app-centros-mapa-modal>
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

    .btn-paciente-mapa {
      background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(32, 201, 151, 0.3);
    }

    .btn-paciente-mapa:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(32, 201, 151, 0.4);
      background: linear-gradient(135deg, #1ab394 0%, #148a99 100%);
    }

    .filtros-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
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

    /* CABECERA DE MÉDICOS */
    .medico-header {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-weight: 600;
      margin-bottom: 0.5rem;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
    }

    .medico-header i {
      font-size: 1rem;
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

    /* MODAL CONTEXTUAL */
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
        transform: translate(-50%, -50%) scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1) translateY(0);
      }
    }

    @keyframes backdropFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* MODAL LEGACY (mantener para compatibilidad) */
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
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 15px 50px rgba(0,0,0,0.3);
      border: 1px solid rgba(102, 126, 234, 0.2);
      transform-origin: top left;
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

    /* GEOLOCALIZACIÓN */
    .filtros-ubicacion {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%);
      border-radius: 12px;
      border: 1px solid rgba(116, 185, 255, 0.2);
    }

    .ubicacion-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .ubicacion-icon {
      font-size: 1.5rem;
    }

    .ubicacion-header h4 {
      margin: 0;
      color: #2c5530;
      font-weight: 600;
    }

    .ubicacion-controls {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .btn-location {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border: none;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-location:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
    }

    .btn-location.active {
      background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
      box-shadow: 0 4px 15px rgba(32, 201, 151, 0.4);
    }

    .btn-location-manual {
      background: rgba(116, 185, 255, 0.1);
      border: 2px solid rgba(116, 185, 255, 0.3);
      color: #0984e3;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-location-manual:hover {
      background: rgba(116, 185, 255, 0.2);
      border-color: rgba(116, 185, 255, 0.5);
      transform: translateY(-2px);
    }

    .ubicacion-status, .ubicacion-error {
      margin-top: 0.5rem;
    }

    .location-info {
      color: #28a745;
      font-size: 0.9rem;
    }

    .error-text {
      color: #dc3545;
      font-size: 0.9rem;
    }

    /* MODAL DE UBICACIÓN */
    .location-modal {
      max-width: 500px;
    }

    .location-info {
      background: #e3f2fd;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border-left: 4px solid #2196f3;
    }

    .location-info p {
      margin: 0.5rem 0;
      color: #1565c0;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #495057;
    }

    .location-examples {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
    }

    .location-examples small {
      color: #6c757d;
      line-height: 1.6;
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
        width: 95% !important;
        margin: 0 !important;
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
export class PacienteAgendaComponent implements OnInit, OnDestroy {
  // Estados de carga
  isLoadingTurnos = false;
  isLoadingEspecialidades = false;
  isLoadingStaffMedicos = false;
  isLoadingCentros = false;

  // Filtros
  especialidadSeleccionada = '';
  staffMedicoSeleccionado: number | null = null;
  centroAtencionSeleccionado: number | null = null;

  // Listas completas (sin filtrar)
  especialidadesCompletas: Especialidad[] = [];
  staffMedicosCompletos: StaffMedico[] = [];
  centrosAtencionCompletos: CentroAtencion[] = [];
  
  // Listas filtradas que se muestran en los dropdowns
  especialidades: Especialidad[] = [];
  staffMedicos: StaffMedico[] = [];
  centrosAtencion: CentroAtencion[] = [];

  // Slots y calendario
  showCalendar = false;
  slotsOriginales: SlotDisponible[] = []; // Slots sin filtrar del backend
  slotsDisponibles: SlotDisponible[] = []; // Slots filtrados que se muestran
  slotsPorFecha: { [fecha: string]: SlotDisponible[] } = {};
  fechasOrdenadas: string[] = [];
  turnosDisponibles: any[] = []; // Para compatibilidad con el template
  semanas: number = 4;

  // Modal de reserva
  showBookingModal = false;
  slotSeleccionado: SlotDisponible | null = null;
  selectedTurnoDisponible: any = null; // Para el modal
  isBooking = false;

  // Modal de mapa de centros
  showMapaModal = false;

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
    // Cargar todos los datos necesarios al inicio
    this.cargarDiasExcepcionales();
    this.cargarEspecialidades();
    this.cargarTodosLosStaffMedicos(); // Cargar todos los staff médicos desde el inicio
    this.cargarCentrosAtencion();
    this.cargarTodosLosTurnos(); // Cargar TODOS los turnos disponibles al inicio (pero no mostrarlos)
    
    // Listener para reposicionar modal en resize
    this.resizeListener = () => {
      if (this.showBookingModal) {
        // Reposicionar modal si está abierto
        this.modalPosition = { 
          top: window.innerWidth <= 768 ? window.innerHeight / 2 - 200 : (window.innerHeight - 400) / 2,
          left: window.innerWidth <= 768 ? window.innerWidth / 2 - 200 : (window.innerWidth - 500) / 2
        };
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    // Cleanup resize listener
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  // Cargar días excepcionales para el calendario
  cargarDiasExcepcionales() {
    // Los días excepcionales se extraen automáticamente de los eventos en cargarTurnosConFiltros()
    // No es necesaria una request adicional
    // Los días excepcionales se cargan automáticamente con los eventos
  }

  // Cargar especialidades al inicializar
  cargarEspecialidades() {
    this.isLoadingEspecialidades = true;
    this.especialidadService.all().subscribe({
      next: (dataPackage: DataPackage<Especialidad[]>) => {
        this.especialidadesCompletas = dataPackage.data || [];
        this.especialidades = [...this.especialidadesCompletas]; // Inicialmente mostrar todas
        this.isLoadingEspecialidades = false;
      },
      error: (error) => {
        this.isLoadingEspecialidades = false;
      }
    });
  }

  // Cargar TODOS los staff médicos al inicio (sin filtrar por especialidad)
  cargarTodosLosStaffMedicos() {
    this.isLoadingStaffMedicos = true;
    this.staffMedicoService.all().subscribe({
      next: (dataPackage: DataPackage<StaffMedico[]>) => {
        this.staffMedicosCompletos = dataPackage.data || [];
        this.staffMedicos = [...this.staffMedicosCompletos]; // Inicialmente mostrar todos
        
    
        
       
        
        this.isLoadingStaffMedicos = false;
      },
      error: (error) => {
        console.error('Error cargando staff médicos:', error);
        this.isLoadingStaffMedicos = false;
      }
    });
  }
  // Cargar TODOS los turnos disponibles al inicio (sin filtros)
  cargarTodosLosTurnos() {
    this.isLoadingTurnos = true;
    
    // Llamar al servicio sin filtros para obtener todos los eventos
    this.agendaService.obtenerTodosLosEventos(this.semanas).subscribe({
      next: (eventosBackend) => {
        
        // Guardar TODOS los slots sin filtrar
        this.slotsOriginales = this.mapEventosToSlots(eventosBackend);
        
        // NO mostrar los turnos hasta que se aplique algún filtro
        this.slotsDisponibles = [];
        this.turnosDisponibles = [];
        this.showCalendar = false; // NO mostrar calendario hasta que haya filtros
        
        this.isLoadingTurnos = false;
        this.cdr.detectChanges();
        
        console.log('✅ Turnos cargados en memoria. Esperando filtros para mostrar.');
      },
      error: (err: unknown) => {
        console.error('❌ Error al cargar todos los turnos:', err);
        this.isLoadingTurnos = false;
        this.showCalendar = false;
        this.slotsOriginales = [];
        this.slotsDisponibles = [];
        this.turnosDisponibles = [];
      }
    });
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
        
        console.log('🏥 Staff médicos cargados para especialidad:', this.especialidadSeleccionada);
        console.log('- Total staff médicos filtrados:', this.staffMedicos.length);
        console.log('- IDs de staff médicos:', this.staffMedicos.map(s => ({ id: s.id, nombre: s.medico?.nombre, apellido: s.medico?.apellido })));
        
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
        this.centrosAtencionCompletos = dataPackage.data || [];
        this.centrosAtencion = [...this.centrosAtencionCompletos]; // Inicialmente mostrar todos
        this.isLoadingCentros = false;
      
    
      },
      error: (error) => {
        console.error('Error cargando centros de atención:', error);
        this.isLoadingCentros = false;
      }
    });
  }

  // Método llamado cuando cambia la especialidad
  onEspecialidadChange() {
    this.actualizarFiltrosDinamicos();
    this.aplicarFiltros();
  }

  // Método llamado cuando cambia el staff médico
  onStaffMedicoChange() {
    this.actualizarFiltrosDinamicos();
    this.aplicarFiltros();
  }

  // Método llamado cuando cambia el centro de atención
  onCentroAtencionChange() {
    this.actualizarFiltrosDinamicos();
    this.aplicarFiltros();
  }

  // Actualizar filtros dinámicamente basado en las selecciones actuales
  actualizarFiltrosDinamicos() {
   
    
    // Obtener las opciones disponibles desde los slots originales
    const especialidadesDisponibles = this.obtenerEspecialidadesDisponibles();
    const medicosDisponibles = this.obtenerMedicosDisponibles();
    const centrosDisponibles = this.obtenerCentrosDisponibles();

    // Validar si las selecciones actuales siguen siendo válidas y notificar al usuario
    let mensajesReset: string[] = [];
    
    if (this.especialidadSeleccionada && !especialidadesDisponibles.includes(this.especialidadSeleccionada)) {
      mensajesReset.push(`• La especialidad "${this.especialidadSeleccionada}" no tiene turnos compatibles con los filtros actuales`);
      this.especialidadSeleccionada = '';
    }

    if (this.staffMedicoSeleccionado && !medicosDisponibles.some(m => Number(m.id) === Number(this.staffMedicoSeleccionado))) {
      const nombreMedico = this.getStaffMedicoNombre(this.staffMedicoSeleccionado);
      mensajesReset.push(`• El médico "${nombreMedico}" no tiene turnos compatibles con los filtros actuales`);
      this.staffMedicoSeleccionado = null;
    }

    if (this.centroAtencionSeleccionado && !centrosDisponibles.some(c => Number(c.id) === Number(this.centroAtencionSeleccionado))) {
      const nombreCentro = this.getCentroAtencionNombre(this.centroAtencionSeleccionado);
      mensajesReset.push(`• El centro "${nombreCentro}" no tiene turnos compatibles con los filtros actuales`);
      this.centroAtencionSeleccionado = null;
    }

    // Mostrar mensaje al usuario si hubo resets
    if (mensajesReset.length > 0) {
      const mensaje = `⚠️ Algunos filtros fueron automáticamente removidos porque no tienen turnos disponibles:\n\n${mensajesReset.join('\n')}\n\nPuedes seleccionar nuevos filtros para encontrar turnos disponibles.`;
      setTimeout(() => alert(mensaje), 100); // Timeout para evitar conflictos con otros alerts
    }

    // Actualizar especialidades basándose en médico y/o centro seleccionado
    if (this.staffMedicoSeleccionado || this.centroAtencionSeleccionado) {
      this.especialidades = this.especialidadesCompletas.filter(esp => 
        especialidadesDisponibles.includes(esp.nombre)
      );
    } else {
      this.especialidades = [...this.especialidadesCompletas];
    }

    // Actualizar médicos basándose en especialidad y/o centro seleccionado
    if (this.especialidadSeleccionada || this.centroAtencionSeleccionado) {
      this.staffMedicos = this.staffMedicosCompletos.filter(staff => 
        medicosDisponibles.some(medico => Number(medico.id) === Number(staff.id))
      );
    } else {
      this.staffMedicos = [...this.staffMedicosCompletos];
    }

    // Actualizar centros basándose en especialidad y/o médico seleccionado
    if (this.especialidadSeleccionada || this.staffMedicoSeleccionado) {
      this.centrosAtencion = this.centrosAtencionCompletos.filter(centro => 
        centrosDisponibles.some(c => Number(c.id) === Number(centro.id))
      );
    } else {
      this.centrosAtencion = [...this.centrosAtencionCompletos];
    }

  }

  // Obtener especialidades disponibles basadas en los filtros actuales
  obtenerEspecialidadesDisponibles(): string[] {
    if (!this.slotsOriginales || this.slotsOriginales.length === 0) {
      return [];
    }

    let slotsRelevantes = [...this.slotsOriginales];

    // Filtrar por médico si está seleccionado
    if (this.staffMedicoSeleccionado) {
      slotsRelevantes = slotsRelevantes.filter(slot => 
        Number(slot.staffMedicoId) === Number(this.staffMedicoSeleccionado)
      );
    }

    // Filtrar por centro si está seleccionado
    if (this.centroAtencionSeleccionado) {
      slotsRelevantes = slotsRelevantes.filter(slot => 
        Number(slot.centroId) === Number(this.centroAtencionSeleccionado)
      );
    }

    // Extraer especialidades únicas
    const especialidades = [...new Set(slotsRelevantes.map(slot => slot.especialidadStaffMedico))];
    const especialidadesFiltradas = especialidades.filter(esp => esp && esp.trim());
    
    return especialidadesFiltradas;
  }

  // Obtener médicos disponibles basados en los filtros actuales
  obtenerMedicosDisponibles(): any[] {
    if (!this.slotsOriginales || this.slotsOriginales.length === 0) {
      return [];
    }

    let slotsRelevantes = [...this.slotsOriginales];

    // Filtrar por especialidad si está seleccionada
    if (this.especialidadSeleccionada) {
      slotsRelevantes = slotsRelevantes.filter(slot => 
        slot.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }

    // Filtrar por centro si está seleccionado
    if (this.centroAtencionSeleccionado) {
      slotsRelevantes = slotsRelevantes.filter(slot => 
        Number(slot.centroId) === Number(this.centroAtencionSeleccionado)
      );
    }

    // Extraer médicos únicos
    const medicosUnicos = new Map();
    slotsRelevantes.forEach(slot => {
      if (slot.staffMedicoId && !medicosUnicos.has(slot.staffMedicoId)) {
        medicosUnicos.set(slot.staffMedicoId, {
          id: slot.staffMedicoId,
          nombre: slot.staffMedicoNombre,
          apellido: slot.staffMedicoApellido
        });
      }
    });

    const medicosArray = Array.from(medicosUnicos.values());
    return medicosArray;
  }

  // Obtener centros disponibles basados en los filtros actuales
  obtenerCentrosDisponibles(): any[] {
    if (!this.slotsOriginales || this.slotsOriginales.length === 0) {
      return [];
    }

    let slotsRelevantes = [...this.slotsOriginales];

    // Filtrar por especialidad si está seleccionada
    if (this.especialidadSeleccionada) {
      slotsRelevantes = slotsRelevantes.filter(slot => 
        slot.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }

    // Filtrar por médico si está seleccionado
    if (this.staffMedicoSeleccionado) {
      slotsRelevantes = slotsRelevantes.filter(slot => 
        Number(slot.staffMedicoId) === Number(this.staffMedicoSeleccionado)
      );
    }

    // Extraer centros únicos
    const centrosUnicos = new Map();
    slotsRelevantes.forEach(slot => {
      if (slot.centroId && !centrosUnicos.has(slot.centroId)) {
        centrosUnicos.set(slot.centroId, {
          id: slot.centroId,
          nombre: slot.nombreCentro
        });
      }
    });

    const centrosArray = Array.from(centrosUnicos.values());
    return centrosArray;
  }

  // Nueva función unificada para aplicar filtros (sin hacer llamadas al backend)
  aplicarFiltros() {
    

    
    // Verificar si hay al menos un filtro aplicado
    const hayFiltros = this.especialidadSeleccionada?.trim() || 
                      this.staffMedicoSeleccionado || 
                      this.centroAtencionSeleccionado;
    
    if (!hayFiltros) {
      console.log('❌ No hay filtros aplicados. Ocultando calendario.');
      this.slotsDisponibles = [];
      this.turnosDisponibles = [];
      this.showCalendar = false;
      this.cdr.detectChanges();
      return;
    }
    
    if (!this.slotsOriginales || this.slotsOriginales.length === 0) {
      console.log('❌ No hay slots originales para filtrar');
      this.slotsDisponibles = [];
      this.turnosDisponibles = [];
      this.showCalendar = false;
      this.cdr.detectChanges();
      return;
    }

    let slotsFiltrados = [...this.slotsOriginales];

    // Filtrar por especialidad si está seleccionada
    if (this.especialidadSeleccionada && this.especialidadSeleccionada.trim()) {
      const slotsPrevios = slotsFiltrados.length;
     
      slotsFiltrados = slotsFiltrados.filter(slot =>
        slot.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }

    // Filtrar por staff médico si está seleccionado
    if (this.staffMedicoSeleccionado) {
      const slotsPrevios = slotsFiltrados.length;
      // Convertir ambos valores a number para asegurar comparación correcta
      const staffMedicoIdBuscado = Number(this.staffMedicoSeleccionado);
      
      
      // Buscar específicamente el ID que buscamos
      const slotsConIdBuscado = slotsFiltrados.filter(slot => Number(slot.staffMedicoId) === staffMedicoIdBuscado);
   
      
      slotsFiltrados = slotsFiltrados.filter(slot => {
        const match = Number(slot.staffMedicoId) === staffMedicoIdBuscado;
        return match;
      });
    }

    // Filtrar por centro de atención si está seleccionado
    if (this.centroAtencionSeleccionado) {
      const slotsPrevios = slotsFiltrados.length;
      // Convertir ambos valores a number para asegurar comparación correcta
      const centroIdBuscado = Number(this.centroAtencionSeleccionado);

      
      // Buscar específicamente el ID que buscamos
      const slotsConIdBuscado = slotsFiltrados.filter(slot => Number(slot.centroId) === centroIdBuscado);

      
      slotsFiltrados = slotsFiltrados.filter(slot => {
        const match = Number(slot.centroId) === centroIdBuscado;
        return match;
      });
    }

    // Actualizar las listas con los slots filtrados
    this.slotsDisponibles = slotsFiltrados;
    this.turnosDisponibles = slotsFiltrados;
    
    // Mostrar calendario solo si hay filtros aplicados
    this.showCalendar = true;
    
    // Reagrupar y mostrar
    this.agruparSlotsPorFecha();
    this.cdr.detectChanges();
    
  }

  // Transformar eventos del backend a slots
  private mapEventosToSlots(eventosBackend: any[]): SlotDisponible[] {
    const slots: SlotDisponible[] = [];

    
    eventosBackend.forEach((evento, index) => {
      // Debug: mostrar algunos eventos para ver la estructura

      
      // Validar que el evento tenga los datos necesarios
      if (!evento.fecha || !evento.horaInicio || !evento.horaFin || !evento.esSlot) {
        if (index < 5) {
          console.log(`⚠️ Evento ${index + 1} descartado por falta datos:`, {
            fecha: evento.fecha,
            horaInicio: evento.horaInicio,
            horaFin: evento.horaFin,
            esSlot: evento.esSlot
          });
        }
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
        esSlot: true
      };

      

      slots.push(slot);
    });

    
    

    return slots;
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    // Si es fecha en formato YYYY-MM-DD, parsear sin zona horaria para evitar desfases
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = fecha.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Los meses en JS van de 0-11
      const day = parseInt(parts[2]);
      const fechaObj = new Date(year, month, day);
      const opciones: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return fechaObj.toLocaleDateString('es-ES', opciones);
    }
    
    // Para otros formatos, usar el método original
    const fechaObj = new Date(fecha + 'T00:00:00');
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return fechaObj.toLocaleDateString('es-ES', opciones);
  }

  // Variables para posicionamiento del modal (solo para el modal de reserva)
  modalPosition = { top: 0, left: 0 };
  private resizeListener?: () => void;

  // Seleccionar slot
  seleccionarSlot(slot: SlotDisponible, event?: MouseEvent) {
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

    // Calcular posición del modal cerca del elemento clickeado
    if (event) {
      this.calculateModalPosition(event);
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

  // Calcular posición del modal cerca del elemento clickeado
  private calculateModalPosition(event: MouseEvent) {
    // En pantallas pequeñas, usar posicionamiento centrado
    if (window.innerWidth <= 768) {
      this.modalPosition = { 
        top: window.innerHeight / 2 - 200, 
        left: window.innerWidth / 2 - 200 
      };
      return;
    }

    const target = event.target as HTMLElement;
    const slotCard = target.closest('.slot-card') as HTMLElement;
    
    if (slotCard) {
      const rect = slotCard.getBoundingClientRect();
      const modalWidth = 500; // Ancho aproximado del modal
      const modalHeight = 400; // Alto aproximado del modal
      const offset = 10; // Offset desde el elemento
      
      // Calcular posición preferida (a la derecha del slot)
      let left = rect.right + offset;
      let top = rect.top;
      
      // Verificar si el modal se sale de la pantalla por la derecha
      if (left + modalWidth > window.innerWidth) {
        // Posicionar a la izquierda del slot
        left = rect.left - modalWidth - offset;
      }
      
      // Verificar si el modal se sale de la pantalla por la izquierda
      if (left < 0) {
        // Centrar horizontalmente en la pantalla
        left = (window.innerWidth - modalWidth) / 2;
      }
      
      // Verificar si el modal se sale de la pantalla por abajo
      if (top + modalHeight > window.innerHeight) {
        // Ajustar para que aparezca arriba
        top = window.innerHeight - modalHeight - offset;
      }
      
      // Verificar si el modal se sale de la pantalla por arriba
      if (top < 0) {
        top = offset;
      }
      
      this.modalPosition = { top, left };
    } else {
      // Fallback: centrar el modal
      this.modalPosition = { 
        top: (window.innerHeight - 400) / 2, 
        left: (window.innerWidth - 500) / 2 
      };
    }
  }

  // Navegación y otros métodos
  goBack() {
    this.router.navigate(['/paciente-dashboard']);
  }

  // ==================== MÉTODOS DEL MAPA DE CENTROS ====================
  
  mostrarMapaCentros() {
    this.showMapaModal = true;
  }

  cerrarMapaModal() {
    this.showMapaModal = false;
  }

  onCentroSeleccionadoDelMapa(centro: CentroAtencion) {
    
    // Verificar que el centro tenga turnos disponibles
    const turnosEnCentro = this.slotsOriginales.filter(slot => Number(slot.centroId) === Number(centro.id));
    
    if (turnosEnCentro.length === 0) {
      // No hay turnos en este centro
      alert(`❌ El centro "${centro.nombre}" no tiene turnos disponibles en este momento.\n\nPor favor, selecciona otro centro o intenta más tarde.`);
      return;
    }
    
    // Verificar si hay turnos compatibles con los filtros actuales
    let turnosCompatibles = [...turnosEnCentro];
    
    // Filtrar por especialidad si está seleccionada
    if (this.especialidadSeleccionada && this.especialidadSeleccionada.trim()) {
      turnosCompatibles = turnosCompatibles.filter(slot => 
        slot.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }
    
    // Filtrar por médico si está seleccionado
    if (this.staffMedicoSeleccionado) {
      turnosCompatibles = turnosCompatibles.filter(slot => 
        Number(slot.staffMedicoId) === Number(this.staffMedicoSeleccionado)
      );
    }
    
    if (turnosCompatibles.length === 0) {
      // Hay turnos en el centro pero no compatibles con los filtros actuales
      let mensaje = `⚠️ El centro "${centro.nombre}" tiene turnos disponibles, pero no coinciden con tus filtros actuales:\n\n`;
      
      if (this.especialidadSeleccionada) {
        mensaje += `• Especialidad seleccionada: ${this.especialidadSeleccionada}\n`;
      }
      
      if (this.staffMedicoSeleccionado) {
        const nombreMedico = this.getStaffMedicoNombre(this.staffMedicoSeleccionado);
        mensaje += `• Médico seleccionado: ${nombreMedico}\n`;
      }
      
      mensaje += `\n¿Deseas limpiar los filtros y buscar solo en este centro?`;
      
      if (confirm(mensaje)) {
        // Limpiar otros filtros y solo aplicar el centro
        this.especialidadSeleccionada = '';
        this.staffMedicoSeleccionado = null;
        this.centroAtencionSeleccionado = centro.id || null;
        
        // Actualizar filtros dinámicos y aplicar
        this.actualizarFiltrosDinamicos();
        this.aplicarFiltros();
        
        // Cerrar el modal
        this.cerrarMapaModal();
        
        alert(`✅ Mostrando ${turnosEnCentro.length} turnos disponibles en "${centro.nombre}"`);
      }
      return;
    }
    
    // Todo OK - aplicar el filtro del centro
    this.centroAtencionSeleccionado = centro.id || null;
    
    // Actualizar filtros dinámicos y aplicar
    this.actualizarFiltrosDinamicos();
    this.aplicarFiltros();
    
    // Cerrar el modal
    this.cerrarMapaModal();
    
    // Mostrar mensaje de confirmación
    alert(`✅ Encontrados ${turnosCompatibles.length} turnos disponibles en "${centro.nombre}"`);
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
          this.cargarTodosLosTurnos();
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
    
    // Ocultar calendario cuando no hay filtros
    this.slotsDisponibles = [];
    this.turnosDisponibles = [];
    this.showCalendar = false;
    this.slotsPorFecha = {};
    this.fechasOrdenadas = [];
    
    this.cdr.detectChanges();
  }

  // Métodos auxiliares para obtener nombres
  getStaffMedicoNombre(id: number | null): string {
    if (!id) return 'Cualquier médico';
    
    
    // Mostrar todos los IDs disponibles
    
    // Convertir ambos valores a number para asegurar comparación correcta
    const staff = this.staffMedicos.find(s => Number(s.id) === Number(id));
    if (staff && staff.medico) {
      return `${staff.medico.nombre} ${staff.medico.apellido}`;
    }
    
    // Si no encontramos el staff médico, buscar en los slots disponibles
    const slotConMedico = this.slotsOriginales.find(slot => Number(slot.staffMedicoId) === Number(id));
    if (slotConMedico && slotConMedico.staffMedicoNombre && slotConMedico.staffMedicoApellido) {
      return `${slotConMedico.staffMedicoNombre} ${slotConMedico.staffMedicoApellido}`;
    }
    
    console.warn('❌ Staff médico no encontrado con ID:', id);
    console.log('Estructuras de staff médicos:', this.staffMedicos.map(s => ({
      id: s.id,
      tipo: typeof s.id,
      medicoId: s.medicoId,
      medico: s.medico
    })));
    return 'Médico no encontrado';
  }

  getCentroAtencionNombre(id: number | null): string {
    if (!id) return 'Cualquier centro';
    
    
    // Convertir ambos valores a number para asegurar comparación correcta
    const centro = this.centrosAtencion.find(c => Number(c.id) === Number(id));
    if (!centro) {
      console.warn('❌ Centro no encontrado con ID:', id);
      return 'Centro no encontrado';
    }
    
    return centro.nombre || `Centro #${id}`;
  }

  // Métodos para manejo de días excepcionales
  esDiaExcepcional(fecha: string): boolean {
    return this.diasExcepcionalesService.esDiaExcepcional(fecha);
  }

  // Verificar si un slot específico está afectado por excepciones - Usa servicio centralizado
  slotAfectadoPorExcepcion(slot: SlotDisponible): boolean {
    return this.diasExcepcionalesService.slotAfectadoPorExcepcion(slot);
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

  /**
   * Verifica si el médico ha cambiado respecto al slot anterior
   */
  esCambioMedico(fecha: string, index: number): boolean {
    const slotsDelDia = this.slotsPorFecha[fecha];
    if (!slotsDelDia || index === 0) {
      return false; // No hay cambio si es el primer slot del día
    }
    
    const slotActual = slotsDelDia[index];
    const slotAnterior = slotsDelDia[index - 1];
    
    const medicoActual = `${slotActual.staffMedicoNombre} ${slotActual.staffMedicoApellido}`;
    const medicoAnterior = `${slotAnterior.staffMedicoNombre} ${slotAnterior.staffMedicoApellido}`;
    
    return medicoActual !== medicoAnterior;
  }

  /**
   * Obtiene el nombre completo del médico de un slot
   */
  getNombreMedico(slot: SlotDisponible): string {
    return `${slot.staffMedicoNombre} ${slot.staffMedicoApellido}`;
  }

  // Agrupar slots por fecha para mostrar en el calendario
  private agruparSlotsPorFecha() {
    this.slotsPorFecha = {};
    
    // Agrupar slots por fecha
    this.slotsDisponibles.forEach(slot => {
      if (!this.slotsPorFecha[slot.fecha]) {
        this.slotsPorFecha[slot.fecha] = [];
      }
      this.slotsPorFecha[slot.fecha].push(slot);
    });

    // Ordenar fechas y slots dentro de cada fecha
    this.fechasOrdenadas = Object.keys(this.slotsPorFecha).sort();
    
    // Ordenar slots dentro de cada fecha por hora
    this.fechasOrdenadas.forEach(fecha => {
      this.slotsPorFecha[fecha].sort((a, b) => {
        // Primero por médico
        const medicoA = `${a.staffMedicoNombre} ${a.staffMedicoApellido}`;
        const medicoB = `${b.staffMedicoNombre} ${b.staffMedicoApellido}`;
        if (medicoA !== medicoB) {
          return medicoA.localeCompare(medicoB);
        }
        // Luego por hora
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    });

  }
}
