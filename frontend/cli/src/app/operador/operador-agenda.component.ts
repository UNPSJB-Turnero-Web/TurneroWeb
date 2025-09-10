import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

// Services
import { TurnoService } from "../turnos/turno.service";
import { EspecialidadService } from "../especialidades/especialidad.service";
import { StaffMedicoService } from "../staffMedicos/staffMedico.service";
import { CentroAtencionService } from "../centrosAtencion/centroAtencion.service";
import { AgendaService } from "../agenda/agenda.service";
import { DiasExcepcionalesService } from "../agenda/dias-excepcionales.service";
import { PacienteService } from "../pacientes/paciente.service";
import { CentrosMapaModalComponent } from "../modal/centros-mapa-modal.component";
import { Turno } from "../turnos/turno";
import { Especialidad } from "../especialidades/especialidad";
import { StaffMedico } from "../staffMedicos/staffMedico";
import { CentroAtencion } from "../centrosAtencion/centroAtencion";
import { Paciente } from "../pacientes/paciente";
import { DataPackage } from "../data.package";
import { UsuarioAuthService } from "../services/UsuarioAuth.service";

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
  // Datos del paciente si está ocupado
  pacienteId?: number;
  pacienteNombre?: string;
  pacienteApellido?: string;
  pacienteDni?: string;
  estadoTurno?: string;
}

@Component({
  selector: "app-operador-agenda",
  standalone: true,
  imports: [CommonModule, FormsModule, CentrosMapaModalComponent],
  template: `
    <div class="container-fluid mt-4">
      <!-- HEADER -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="banner-operador-agenda">
            <div class="header-content">
              <div class="header-actions">
                <button class="btn btn-header-glass" (click)="goBack()">
                  <i class="fas fa-arrow-left"></i>
                  Volver
                </button>
              </div>
              <div class="header-icon">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="header-text">
                <h1>Gestión de Agenda</h1>
                <p>Administra turnos y consulta la disponibilidad médica</p>
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
              <h3>Filtrar Agenda y Turnos</h3>
            </div>
            <div class="filtros-body">
              <!-- Filtro por Especialidad -->
              <div
                class="filtro-step"
                [class.active]="especialidadSeleccionada"
              >
                <div class="step-header">
                  <div class="step-number">1</div>
                  <h4>Especialidad (Opcional)</h4>
                </div>
                <select
                  class="form-control-operador"
                  [(ngModel)]="especialidadSeleccionada"
                  (change)="onEspecialidadChange()"
                  [disabled]="isLoadingEspecialidades"
                >
                  <option value="">Todas las especialidades</option>
                  <option
                    *ngFor="let especialidad of especialidades"
                    [value]="especialidad.nombre"
                  >
                    {{ especialidad.nombre }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingEspecialidades">
                  <i class="fas fa-spinner fa-spin"></i> Cargando
                  especialidades...
                </div>
              </div>

              <!-- Filtro por Staff Médico -->
              <div class="filtro-step" [class.active]="staffMedicoSeleccionado">
                <div class="step-header">
                  <div class="step-number">2</div>
                  <h4>Médico (Opcional)</h4>
                </div>
                <select
                  class="form-control-operador"
                  [(ngModel)]="staffMedicoSeleccionado"
                  (change)="onStaffMedicoChange()"
                  [disabled]="isLoadingStaffMedicos"
                >
                  <option value="">Todos los médicos</option>
                  <option *ngFor="let staff of staffMedicos" [value]="staff.id">
                    {{ staff.medico?.nombre }} {{ staff.medico?.apellido }} -
                    {{ staff.especialidad?.nombre }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingStaffMedicos">
                  <i class="fas fa-spinner fa-spin"></i> Cargando médicos...
                </div>
              </div>

              <!-- Filtro por Centro de Atención -->
              <div
                class="filtro-step"
                [class.active]="centroAtencionSeleccionado"
              >
                <div class="step-header">
                  <div class="step-number">3</div>
                  <h4>Centro de Atención (Opcional)</h4>
                </div>
                <select
                  class="form-control-operador"
                  [(ngModel)]="centroAtencionSeleccionado"
                  (change)="onCentroAtencionChange()"
                  [disabled]="isLoadingCentros"
                >
                  <option value="">Todos los centros</option>
                  <option
                    *ngFor="let centro of centrosAtencion"
                    [value]="centro.id"
                  >
                    {{ centro.nombre }}
                  </option>
                </select>
                <div class="loading-indicator" *ngIf="isLoadingCentros">
                  <i class="fas fa-spinner fa-spin"></i> Cargando centros...
                </div>
              </div>

              <!-- Filtro por Estado de Turno -->
              <div class="filtro-step" [class.active]="estadoSeleccionado">
                <div class="step-header">
                  <div class="step-number">4</div>
                  <h4>Estado de Turno (Opcional)</h4>
                </div>
                <select
                  class="form-control-operador"
                  [(ngModel)]="estadoSeleccionado"
                  (change)="onEstadoChange()"
                >
                  <option value="">Todos los estados</option>
                  <option value="DISPONIBLE">Disponibles</option>
                  <option value="PROGRAMADO">Programados</option>
                  <option value="CONFIRMADO">Confirmados</option>
                  <option value="REAGENDADO">Reagendados</option>
                  <option value="CANCELADO">Cancelados</option>
                  <option value="COMPLETO">Completados</option>
                </select>
              </div>

              <!-- Filtros aplicados -->
              <div class="filtros-aplicados" *ngIf="hayFiltrosAplicados()">
                <h5>Filtros aplicados:</h5>
                <div class="filter-tags">
                  <span class="filter-tag" *ngIf="especialidadSeleccionada">
                    <i class="fas fa-stethoscope"></i>
                    {{ especialidadSeleccionada }}
                    <button type="button" (click)="limpiarEspecialidad()">
                      ×
                    </button>
                  </span>
                  <span class="filter-tag" *ngIf="staffMedicoSeleccionado">
                    <i class="fas fa-user-md"></i>
                    {{ getStaffMedicoNombre(staffMedicoSeleccionado) }}
                    <button type="button" (click)="limpiarStaffMedico()">
                      ×
                    </button>
                  </span>
                  <span class="filter-tag" *ngIf="centroAtencionSeleccionado">
                    <i class="fas fa-hospital"></i>
                    {{ getCentroAtencionNombre(centroAtencionSeleccionado) }}
                    <button type="button" (click)="limpiarCentroAtencion()">
                      ×
                    </button>
                  </span>
                  <span class="filter-tag" *ngIf="estadoSeleccionado">
                    <i class="fas fa-info-circle"></i>
                    {{ getEstadoLabel(estadoSeleccionado) }}
                    <button type="button" (click)="limpiarEstado()">×</button>
                  </span>
                  <button
                    type="button"
                    class="btn btn-clear-filters"
                    (click)="limpiarTodosFiltros()"
                  >
                    <i class="fas fa-times"></i> Limpiar filtros
                  </button>
                </div>
              </div>

              <!-- Acciones -->
              <div class="filtros-actions">
                <button
                  type="button"
                  class="btn btn-operador-primary"
                  (click)="aplicarFiltros()"
                  [disabled]="isLoadingTurnos"
                >
                  <i class="fas fa-search"></i>
                  {{ isLoadingTurnos ? "Cargando..." : "Aplicar Filtros" }}
                </button>

                <button
                  type="button"
                  class="btn btn-operador-secondary"
                  (click)="cargarTodosLosTurnos()"
                  [disabled]="isLoadingTurnos"
                >
                  <i class="fas fa-sync-alt"></i>
                  Actualizar Agenda
                </button>

                <button
                  type="button"
                  class="btn btn-operador-mapa"
                  (click)="mostrarMapaCentros()"
                  [disabled]="isLoadingCentros"
                >
                  <i class="fas fa-map-marked-alt"></i>
                  Ver Mapa de Centros
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AGENDA AGRUPADA POR FECHA -->
      <div class="row" *ngIf="showCalendar">
        <div class="col-12">
          <div class="turnos-card">
            <div class="turnos-header">
              <div class="d-flex justify-content-between align-items-center">
                <h3><i class="fas fa-calendar-alt"></i> Agenda de Turnos</h3>
                <div class="turnos-info">
                  <span class="info-text disponibles">
                    {{ contarTurnosPorEstado("DISPONIBLE") }} Disponibles
                  </span>
                  <span class="info-text ocupados">
                    {{ contarTurnosPorEstado("OCUPADO") }} Ocupados
                  </span>
                  <span class="info-text total">
                    {{ slotsDisponibles.length }} Total
                  </span>
                </div>
              </div>
            </div>

            <div class="turnos-body">
              <!-- Loading State -->
              <div class="loading-turnos" *ngIf="isLoadingTurnos">
                <i class="fas fa-spinner fa-spin"></i>
                Cargando agenda...
              </div>

              <!-- Turnos Agrupados por Fecha -->
              <div
                class="turnos-grouped"
                *ngIf="!isLoadingTurnos && slotsDisponibles.length > 0"
              >
                <div *ngFor="let fecha of fechasOrdenadas" class="fecha-group">
                  <!-- Header de fecha -->
                  <div
                    class="fecha-header"
                    [class.fecha-feriado]="
                      getTipoExcepcion(fecha) === 'FERIADO'
                    "
                  >
                    <div class="fecha-info">
                      <h3 class="fecha-title">
                        <i class="fas fa-calendar-day"></i>
                        {{ formatearFecha(fecha) }}
                      </h3>
                      <div class="fecha-stats">
                        <span class="stat disponibles"
                          >{{
                            contarTurnosPorFechaYEstado(fecha, "DISPONIBLE")
                          }}
                          Disponibles</span
                        >
                        <span class="stat ocupados"
                          >{{
                            contarTurnosPorFechaYEstado(fecha, "OCUPADO")
                          }}
                          Ocupados</span
                        >
                      </div>
                      <!-- Mostrar excepciones del día -->
                      <div
                        class="fecha-exception-badge"
                        *ngIf="getTipoExcepcion(fecha)"
                      >
                        <span class="exception-icon">{{
                          getIconoExcepcion(fecha)
                        }}</span>
                        <span class="exception-label">{{
                          getTipoExcepcionLabel(fecha)
                        }}</span>
                        <span
                          class="exception-description"
                          *ngIf="getDescripcionExcepcion(fecha)"
                        >
                          - {{ getDescripcionExcepcion(fecha) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Slots de la fecha -->
                  <div class="slots-grid">
                    <ng-container
                      *ngFor="let slot of slotsPorFecha[fecha]; let i = index"
                    >
                      <!-- Cabecera de médico unificada (primer slot o cambio de médico) -->
                      <div
                        *ngIf="i === 0 || esCambioMedico(fecha, i)"
                        class="medico-header"
                      >
                        <i class="fas fa-user-md"></i>
                        <span>{{ getNombreMedico(slot) }}</span>
                        <span class="especialidad-badge">{{
                          slot.especialidadStaffMedico
                        }}</span>
                      </div>

                      <div
                        class="slot-card-operador"
                        [class.selected]="slotSeleccionado?.id === slot.id"
                        [class.slot-disponible]="
                          !slot.ocupado && !slotAfectadoPorExcepcion(slot)
                        "
                        [class.slot-ocupado]="slot.ocupado"
                        [class.slot-excepcion]="slotAfectadoPorExcepcion(slot)"
                        (click)="seleccionarSlot(slot, $event)"
                      >
                        <div class="slot-time">
                          <i class="fas fa-clock"></i>
                          {{ slot.horaInicio }} - {{ slot.horaFin }}
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
                        <div
                          class="slot-paciente"
                          *ngIf="slot.ocupado && slot.pacienteNombre"
                        >
                          <div class="paciente-info">
                            <i class="fas fa-user"></i>
                            <strong
                              >{{ slot.pacienteNombre }}
                              {{ slot.pacienteApellido }}</strong
                            >
                          </div>
                          <div class="paciente-dni" *ngIf="slot.pacienteDni">
                            <i class="fas fa-id-card"></i>
                            DNI: {{ slot.pacienteDni }}
                          </div>
                          <div class="turno-estado" *ngIf="slot.estadoTurno">
                            <span
                              class="badge"
                              [ngClass]="getBadgeClass(slot.estadoTurno)"
                            >
                              {{ slot.estadoTurno }}
                            </span>
                          </div>
                        </div>

                        <!-- Estado del slot -->
                        <div class="slot-status">
                          <div
                            *ngIf="slotAfectadoPorExcepcion(slot)"
                            class="status-excepcion"
                          >
                            <i class="fas fa-exclamation-triangle"></i>
                            {{ getTipoExcepcionLabel(slot.fecha) }}
                          </div>
                          <div
                            *ngIf="
                              !slotAfectadoPorExcepcion(slot) && slot.ocupado
                            "
                            class="status-ocupado"
                          >
                            <i class="fas fa-user-check"></i>
                            Ocupado
                          </div>
                          <div
                            *ngIf="
                              !slotAfectadoPorExcepcion(slot) && !slot.ocupado
                            "
                            class="status-disponible"
                          >
                            <i class="fas fa-calendar-plus"></i>
                            Disponible
                          </div>
                        </div>

                        <div
                          class="slot-check"
                          *ngIf="slotSeleccionado?.id === slot.id"
                        >
                          <i class="fas fa-check-circle"></i>
                        </div>
                      </div>
                    </ng-container>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MENSAJE INICIAL -->
      <div class="row" *ngIf="!showCalendar && !isLoadingTurnos">
        <div class="col-12">
          <div class="filtros-inicial-card">
            <div class="filtros-inicial-content">
              <i class="fas fa-calendar-alt"></i>
              <h4>Gestión de Agenda</h4>
              <p>
                Utiliza los filtros para ver y gestionar la agenda de turnos:
              </p>
              <ul>
                <li>
                  <strong>Sin filtros:</strong> Ve toda la agenda disponible
                </li>
                <li>
                  <strong>Por especialidad:</strong> Filtra turnos por
                  especialidad médica
                </li>
                <li>
                  <strong>Por médico:</strong> Ve la agenda de un médico
                  específico
                </li>
                <li>
                  <strong>Por centro:</strong> Filtra por centro de atención
                </li>
                <li>
                  <strong>Por estado:</strong> Ve solo turnos disponibles,
                  ocupados, etc.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- MENSAJE CUANDO NO HAY TURNOS -->
      <div class="row" *ngIf="showCalendar && slotsDisponibles.length === 0">
        <div class="col-12">
          <div class="no-turnos-card">
            <div class="no-turnos-content">
              <i class="fas fa-calendar-times"></i>
              <h4>No hay turnos para mostrar</h4>
              <p>No se encontraron turnos con los filtros seleccionados.</p>
              <p>Intenta cambiar los filtros o cargar toda la agenda.</p>
              <button
                class="btn btn-operador-primary"
                (click)="limpiarTodosFiltros()"
              >
                <i class="fas fa-filter"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- LEYENDA -->
      <div class="row mt-3" *ngIf="showCalendar && slotsDisponibles.length > 0">
        <div class="col-12">
          <div class="legend-card">
            <div class="legend-content">
              <h5>Leyenda:</h5>
              <div class="legend-items">
                <div class="legend-item">
                  <div class="legend-color available"></div>
                  <span>Turnos Disponibles</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color occupied"></div>
                  <span>Turnos Ocupados</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color exception"></div>
                  <span>Afectados por Excepciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLES TURNO -->
    <div *ngIf="showDetailsModal" class="modal-contextual">
      <div
        class="modal-content operador-modal"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h4>
            <i class="fas fa-info-circle"></i>
            {{
              slotSeleccionado?.ocupado
                ? "Detalles del Turno"
                : "Slot Disponible"
            }}
          </h4>
          <button type="button" class="btn-close" (click)="closeDetailsModal()">
            ×
          </button>
        </div>

        <div class="modal-body">
          <div class="turno-details">
            <div class="detail-section">
              <h5><i class="fas fa-calendar"></i> Información del Turno</h5>
              <div class="detail-item">
                <strong>Fecha:</strong>
                {{ formatearFecha(slotSeleccionado!.fecha) }}
              </div>
              <div class="detail-item">
                <strong>Horario:</strong>
                {{ slotSeleccionado?.horaInicio }} -
                {{ slotSeleccionado?.horaFin }}
              </div>
              <div class="detail-item">
                <strong>Médico:</strong>
                {{ getNombreMedico(slotSeleccionado!) }}
              </div>
              <div class="detail-item">
                <strong>Especialidad:</strong>
                {{ slotSeleccionado?.especialidadStaffMedico }}
              </div>
              <div class="detail-item">
                <strong>Consultorio:</strong>
                {{ slotSeleccionado?.consultorioNombre }}
              </div>
              <div class="detail-item">
                <strong>Centro:</strong>
                {{ slotSeleccionado?.nombreCentro }}
              </div>
            </div>

            <!-- Información del paciente si existe -->
            <div
              class="detail-section"
              *ngIf="
                slotSeleccionado?.ocupado && slotSeleccionado?.pacienteNombre
              "
            >
              <h5><i class="fas fa-user"></i> Información del Paciente</h5>
              <div class="detail-item">
                <strong>Nombre:</strong>
                {{ slotSeleccionado?.pacienteNombre }}
                {{ slotSeleccionado?.pacienteApellido }}
              </div>
              <div class="detail-item" *ngIf="slotSeleccionado?.pacienteDni">
                <strong>DNI:</strong>
                {{ slotSeleccionado?.pacienteDni }}
              </div>
              <div class="detail-item" *ngIf="slotSeleccionado?.estadoTurno">
                <strong>Estado:</strong>
                <span
                  class="badge"
                  [ngClass]="getBadgeClass(slotSeleccionado?.estadoTurno)"
                >
                  {{ slotSeleccionado?.estadoTurno }}
                </span>
              </div>
            </div>

            <!-- Estado del slot -->
            <div class="detail-section">
              <h5><i class="fas fa-info"></i> Estado</h5>
              <div class="status-info">
                <div
                  *ngIf="slotAfectadoPorExcepcion(slotSeleccionado!)"
                  class="status-excepcion"
                >
                  <i class="fas fa-exclamation-triangle"></i>
                  Afectado por
                  {{ getTipoExcepcionLabel(slotSeleccionado!.fecha) }}
                  <div
                    *ngIf="getDescripcionExcepcion(slotSeleccionado!.fecha)"
                    class="status-description"
                  >
                    {{ getDescripcionExcepcion(slotSeleccionado!.fecha) }}
                  </div>
                </div>
                <div
                  *ngIf="
                    !slotAfectadoPorExcepcion(slotSeleccionado!) &&
                    slotSeleccionado?.ocupado
                  "
                  class="status-ocupado"
                >
                  <i class="fas fa-user-check"></i>
                  Turno Ocupado
                </div>
                <div
                  *ngIf="
                    !slotAfectadoPorExcepcion(slotSeleccionado!) &&
                    !slotSeleccionado?.ocupado
                  "
                  class="status-disponible"
                >
                  <i class="fas fa-calendar-plus"></i>
                  Slot Disponible para Asignación
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-operador-secondary"
            (click)="closeDetailsModal()"
          >
            Cerrar
          </button>
          <button
            type="button"
            class="btn btn-operador-primary"
            (click)="gestionarTurno()"
            *ngIf="slotSeleccionado?.ocupado"
          >
            <i class="fas fa-edit"></i>
            Gestionar Turno
          </button>
          <button
            type="button"
            class="btn btn-operador-success"
            (click)="asignarTurno()"
            *ngIf="
              !slotSeleccionado?.ocupado &&
              !slotAfectadoPorExcepcion(slotSeleccionado!)
            "
          >
            <i class="fas fa-user-plus"></i>
            Asignar Paciente
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop para cerrar modal -->
    <div
      *ngIf="showDetailsModal"
      class="modal-backdrop"
      (click)="closeDetailsModal()"
    ></div>

    <!-- MODAL DE MAPA DE CENTROS -->
    <app-centros-mapa-modal
      *ngIf="showMapaModal"
      [centros]="centrosAtencionCompletos"
      [especialidades]="especialidadesCompletas"
      [slotsDisponibles]="slotsOriginales"
      [especialidadSeleccionadaInicial]="especialidadSeleccionada"
      (centroSeleccionado)="onCentroSeleccionadoDelMapa($event)"
      (modalCerrado)="cerrarMapaModal()"
    >
    </app-centros-mapa-modal>
  `,
  styles: [
    `
      /* HEADER - Tema operador (azul-verde) */
      .banner-operador-agenda {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .header-text p {
        margin: 0.5rem 0 0 0;
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.95);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      /* FILTROS CARD */
      .filtros-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .filtros-header {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
        border-color: #28a745;
        background: rgba(40, 167, 69, 0.05);
      }

      .step-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .step-number {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.1rem;
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
      }

      .step-header h4 {
        margin: 0;
        color: #495057;
        font-weight: 600;
      }

      .form-control-operador {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
      }

      .form-control-operador:focus {
        outline: none;
        border-color: #28a745;
        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
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
        border-left: 4px solid #28a745;
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
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
      }

      .filter-tag button {
        background: rgba(255, 255, 255, 0.3);
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
        background: rgba(255, 255, 255, 0.5);
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

      /* BOTONES OPERADOR */
      .btn-operador-primary {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
      }

      .btn-operador-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        background: linear-gradient(135deg, #218838 0%, #1c9975 100%);
      }

      .btn-operador-secondary {
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

      .btn-operador-secondary:hover {
        background: #5a6268;
        transform: translateY(-2px);
      }

      .btn-operador-success {
        background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
      }

      .btn-operador-success:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(23, 162, 184, 0.4);
        background: linear-gradient(135deg, #138496 0%, #0f6674 100%);
      }

      .btn-operador-mapa {
        background: linear-gradient(135deg, #fd7e14 0%, #e63946 100%);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 15px rgba(253, 126, 20, 0.3);
      }

      .btn-operador-mapa:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(253, 126, 20, 0.4);
        background: linear-gradient(135deg, #e63946 0%, #dc2626 100%);
      }

      .filtros-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
      }

      /* TURNOS CARD */
      .turnos-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .turnos-header {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 1.5rem;
      }

      .turnos-header h3 {
        margin: 0;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .turnos-info {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .info-text {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.3rem 0.8rem;
        border-radius: 12px;
        font-weight: 500;
      }

      .info-text.disponibles {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .info-text.ocupados {
        background: rgba(220, 53, 69, 0.3);
        border: 1px solid rgba(220, 53, 69, 0.4);
      }

      .info-text.total {
        background: rgba(23, 162, 184, 0.3);
        border: 1px solid rgba(23, 162, 184, 0.4);
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
        border-left: 4px solid #28a745;
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

      .fecha-stats {
        display: flex;
        gap: 1rem;
        margin-left: auto;
      }

      .fecha-stats .stat {
        font-size: 0.8rem;
        padding: 0.25rem 0.6rem;
        border-radius: 10px;
        font-weight: 600;
      }

      .fecha-stats .stat.disponibles {
        background: rgba(40, 167, 69, 0.1);
        color: #28a745;
        border: 1px solid rgba(40, 167, 69, 0.2);
      }

      .fecha-stats .stat.ocupados {
        background: rgba(220, 53, 69, 0.1);
        color: #dc3545;
        border: 1px solid rgba(220, 53, 69, 0.2);
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
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1rem;
      }

      /* CABECERA DE MÉDICOS */
      .medico-header {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        color: white;
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        font-weight: 600;
        margin-bottom: 0.5rem;
        box-shadow: 0 2px 8px rgba(23, 162, 184, 0.2);
        flex-wrap: wrap;
      }

      .medico-header i {
        font-size: 1rem;
      }

      .especialidad-badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 0.25rem 0.6rem;
        border-radius: 12px;
        font-size: 0.8rem;
        margin-left: auto;
      }

      /* SLOT CARDS PARA OPERADOR */
      .slot-card-operador {
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 1.2rem;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .slot-card-operador:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .slot-card-operador.selected {
        border-color: #28a745;
        background: rgba(40, 167, 69, 0.05);
        box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
      }

      .slot-card-operador.slot-disponible {
        border-color: #28a745;
        border-left: 4px solid #28a745;
      }

      .slot-card-operador.slot-disponible:hover {
        border-color: #20c997;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.15);
      }

      .slot-card-operador.slot-ocupado {
        border-color: #dc3545;
        border-left: 4px solid #dc3545;
        background: rgba(220, 53, 69, 0.02);
      }

      .slot-card-operador.slot-ocupado:hover {
        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.15);
      }

      .slot-card-operador.slot-excepcion {
        border-color: #ffc107;
        border-left: 4px solid #ffc107;
        background: rgba(255, 193, 7, 0.02);
        opacity: 0.8;
      }

      .slot-card-operador.slot-excepcion:hover {
        box-shadow: 0 4px 15px rgba(255, 193, 7, 0.15);
      }

      .slot-time {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: #28a745;
        margin-bottom: 0.8rem;
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

      /* INFORMACIÓN DEL PACIENTE */
      .slot-paciente {
        background: rgba(40, 167, 69, 0.05);
        border-radius: 8px;
        padding: 0.8rem;
        margin-bottom: 1rem;
        border-left: 3px solid #28a745;
      }

      .paciente-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.4rem;
        color: #495057;
        font-size: 0.95rem;
      }

      .paciente-dni {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.4rem;
        color: #6c757d;
        font-size: 0.85rem;
      }

      .turno-estado {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* BADGES PARA ESTADOS */
      .badge {
        padding: 0.3rem 0.8rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .badge.bg-warning {
        background: #ffc107 !important;
        color: #212529;
      }

      .badge.bg-success {
        background: #28a745 !important;
        color: white;
      }

      .badge.bg-info {
        background: #17a2b8 !important;
        color: white;
      }

      .badge.bg-danger {
        background: #dc3545 !important;
        color: white;
      }

      .badge.bg-secondary {
        background: #6c757d !important;
        color: white;
      }

      /* STATUS DEL SLOT */
      .slot-status {
        position: absolute;
        top: 0.8rem;
        right: 0.8rem;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.3rem;
      }

      .status-disponible,
      .status-ocupado,
      .status-excepcion {
        padding: 0.3rem 0.6rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      .status-disponible {
        background: #28a745;
        color: white;
      }

      .status-ocupado {
        background: #dc3545;
        color: white;
      }

      .status-excepcion {
        background: #ffc107;
        color: #212529;
      }

      .slot-check {
        position: absolute;
        top: 0.8rem;
        right: 0.8rem;
        color: #28a745;
        font-size: 1.5rem;
        background: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
        z-index: 10;
      }

      /* MENSAJES DE ESTADO */
      .filtros-inicial-card,
      .no-turnos-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        padding: 3rem;
        text-align: center;
      }

      .filtros-inicial-content i,
      .no-turnos-content i {
        font-size: 4rem;
        color: #28a745;
        margin-bottom: 1rem;
      }

      .filtros-inicial-content h4,
      .no-turnos-content h4 {
        color: #495057;
        margin-bottom: 1rem;
      }

      .filtros-inicial-content p,
      .no-turnos-content p {
        color: #6c757d;
        margin-bottom: 0.5rem;
      }

      .filtros-inicial-content ul {
        text-align: left;
        max-width: 600px;
        margin: 1rem auto;
        color: #6c757d;
      }

      .filtros-inicial-content ul li {
        margin-bottom: 0.5rem;
      }

      /* MODAL DETALLES */
      .modal-contextual {
        position: fixed !important;
        top: 50vh !important;
        left: 50vw !important;
        transform: translate(-50%, -50%) !important;
        z-index: 1060;
        max-width: 600px;
        width: 90vw;
        max-height: 90vh;
        animation: modalFadeIn 0.2s ease-out;
        pointer-events: auto;
      }

      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.1);
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

      .operador-modal {
        background: white;
        border-radius: 15px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(40, 167, 69, 0.2);
      }

      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px 15px 0 0;
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
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .detail-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
        border-left: 4px solid #28a745;
      }

      .detail-section h5 {
        margin: 0 0 1rem 0;
        color: #495057;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .detail-item {
        margin-bottom: 0.75rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .detail-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .status-info {
        background: #e3f2fd;
        border-radius: 8px;
        padding: 1rem;
      }

      .status-description {
        margin-top: 0.5rem;
        font-style: italic;
        font-size: 0.9rem;
        color: #6c757d;
      }

      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e9ecef;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        background: #f8f9fa;
        border-radius: 0 0 15px 15px;
      }

      /* LEYENDA */
      .legend-card {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #28a745;
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

      .legend-color.exception {
        background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        border-color: #d39e00;
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

        .operador-modal {
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

        .turnos-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .fecha-stats {
          margin-left: 0;
          margin-top: 0.5rem;
        }
      }
    `,
  ],
})
export class OperadorAgendaComponent implements OnInit, OnDestroy {
  // Estados de carga
  isLoadingTurnos = false;
  isLoadingEspecialidades = false;
  isLoadingStaffMedicos = false;
  isLoadingCentros = false;

  // Filtros
  especialidadSeleccionada = "";
  staffMedicoSeleccionado: number | null = null;
  centroAtencionSeleccionado: number | null = null;
  estadoSeleccionado = ""; // Nuevo filtro por estado

  // Listas completas (sin filtrar)
  especialidadesCompletas: Especialidad[] = [];
  staffMedicosCompletos: StaffMedico[] = [];
  centrosAtencionCompletos: CentroAtencion[] = [];
  pacientesCompletos: Paciente[] = [];

  // Listas filtradas que se muestran en los dropdowns
  especialidades: Especialidad[] = [];
  staffMedicos: StaffMedico[] = [];
  centrosAtencion: CentroAtencion[] = [];

  // Slots y calendario
  showCalendar = true; // Para operador, mostrar calendario por defecto
  slotsOriginales: SlotDisponible[] = []; // Slots sin filtrar del backend
  slotsDisponibles: SlotDisponible[] = []; // Slots filtrados que se muestran
  slotsPorFecha: { [fecha: string]: SlotDisponible[] } = {};
  fechasOrdenadas: string[] = [];
  semanas: number = 4;

  // Modal de detalles
  showDetailsModal = false;
  slotSeleccionado: SlotDisponible | null = null;

  // Modal de mapa de centros
  showMapaModal = false;

  // Listener para resize
  private resizeListener?: () => void;

  constructor(
    private turnoService: TurnoService,
    private especialidadService: EspecialidadService,
    private staffMedicoService: StaffMedicoService,
    private centroAtencionService: CentroAtencionService,
    private agendaService: AgendaService,
    private diasExcepcionalesService: DiasExcepcionalesService,
    private pacienteService: PacienteService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: UsuarioAuthService
  ) {}

  ngOnInit() {
    // Cargar todos los datos necesarios al inicio
    this.cargarDiasExcepcionales();
    this.cargarEspecialidades();
    this.cargarTodosLosStaffMedicos();
    this.cargarCentrosAtencion();
    this.cargarPacientes();
    this.cargarTodosLosTurnos(); // Cargar TODOS los turnos (ocupados y disponibles)

    // Listener para reposicionar modal en resize
    this.resizeListener = () => {
      if (this.showDetailsModal) {
        // Reposicionar modal si está abierto
        this.cdr.detectChanges();
      }
    };
    window.addEventListener("resize", this.resizeListener);
  }

  ngOnDestroy() {
    // Cleanup resize listener
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
  }

  // ==================== MÉTODOS DE CARGA DE DATOS ====================

  // Cargar días excepcionales para el calendario
  cargarDiasExcepcionales() {
    // Los días excepcionales se extraen automáticamente de los eventos
    // No es necesaria una request adicional
  }

  // Cargar especialidades al inicializar
  cargarEspecialidades() {
    this.isLoadingEspecialidades = true;
    this.especialidadService.all().subscribe({
      next: (dataPackage: DataPackage<Especialidad[]>) => {
        this.especialidadesCompletas = dataPackage.data || [];
        this.especialidades = [...this.especialidadesCompletas];
        this.isLoadingEspecialidades = false;
      },
      error: (error) => {
        console.error("Error cargando especialidades:", error);
        this.isLoadingEspecialidades = false;
      },
    });
  }

  // Cargar TODOS los staff médicos al inicio
  cargarTodosLosStaffMedicos() {
    this.isLoadingStaffMedicos = true;
    this.staffMedicoService.all().subscribe({
      next: (dataPackage: DataPackage<StaffMedico[]>) => {
        this.staffMedicosCompletos = dataPackage.data || [];
        this.staffMedicos = [...this.staffMedicosCompletos];
        this.isLoadingStaffMedicos = false;
      },
      error: (error) => {
        console.error("Error cargando staff médicos:", error);
        this.isLoadingStaffMedicos = false;
      },
    });
  }

  // Cargar centros de atención
  cargarCentrosAtencion() {
    this.isLoadingCentros = true;
    this.centroAtencionService.all().subscribe({
      next: (dataPackage: any) => {
        this.centrosAtencionCompletos = dataPackage.data || [];
        this.centrosAtencion = [...this.centrosAtencionCompletos];
        this.isLoadingCentros = false;
      },
      error: (error) => {
        console.error("Error cargando centros de atención:", error);
        this.isLoadingCentros = false;
      },
    });
  }

  // Cargar pacientes
  cargarPacientes() {
    this.pacienteService.all().subscribe({
      next: (dataPackage: DataPackage<Paciente[]>) => {
        this.pacientesCompletos = dataPackage.data || [];
      },
      error: (error) => {
        console.error("Error cargando pacientes:", error);
      },
    });
  }

  // Cargar TODOS los turnos disponibles y ocupados al inicio
  cargarTodosLosTurnos() {
    this.isLoadingTurnos = true;

    // Llamar al servicio para obtener todos los eventos (slots y turnos)
    this.agendaService.obtenerTodosLosEventos(this.semanas).subscribe({
      next: (eventosBackend) => {
        // Guardar TODOS los slots
        this.slotsOriginales = this.mapEventosToSlots(eventosBackend);

        // Para operador, mostrar todos los turnos por defecto
        this.slotsDisponibles = [...this.slotsOriginales];
        this.showCalendar = true;

        // Agrupar y ordenar
        this.agruparSlotsPorFecha();

        this.isLoadingTurnos = false;
        this.cdr.detectChanges();

        console.log(
          "✅ Agenda del operador cargada:",
          this.slotsOriginales.length,
          "slots"
        );
      },
      error: (err: unknown) => {
        console.error("❌ Error al cargar la agenda:", err);
        this.isLoadingTurnos = false;
        this.showCalendar = false;
        this.slotsOriginales = [];
        this.slotsDisponibles = [];
      },
    });
  }

  // ==================== MÉTODOS DE FILTRADO ====================

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

  // Método llamado cuando cambia el estado
  onEstadoChange() {
    this.aplicarFiltros();
  }

  // Actualizar filtros dinámicamente basado en las selecciones actuales
  actualizarFiltrosDinamicos() {
    // Obtener las opciones disponibles desde los slots originales
    const especialidadesDisponibles = this.obtenerEspecialidadesDisponibles();
    const medicosDisponibles = this.obtenerMedicosDisponibles();
    const centrosDisponibles = this.obtenerCentrosDisponibles();

    // Actualizar especialidades
    if (this.staffMedicoSeleccionado || this.centroAtencionSeleccionado) {
      this.especialidades = this.especialidadesCompletas.filter((esp) =>
        especialidadesDisponibles.includes(esp.nombre)
      );
    } else {
      this.especialidades = [...this.especialidadesCompletas];
    }

    // Actualizar médicos
    if (this.especialidadSeleccionada || this.centroAtencionSeleccionado) {
      this.staffMedicos = this.staffMedicosCompletos.filter((staff) =>
        medicosDisponibles.some(
          (medico) => Number(medico.id) === Number(staff.id)
        )
      );
    } else {
      this.staffMedicos = [...this.staffMedicosCompletos];
    }

    // Actualizar centros
    if (this.especialidadSeleccionada || this.staffMedicoSeleccionado) {
      this.centrosAtencion = this.centrosAtencionCompletos.filter((centro) =>
        centrosDisponibles.some((c) => Number(c.id) === Number(centro.id))
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

    if (this.staffMedicoSeleccionado) {
      slotsRelevantes = slotsRelevantes.filter(
        (slot) =>
          Number(slot.staffMedicoId) === Number(this.staffMedicoSeleccionado)
      );
    }

    if (this.centroAtencionSeleccionado) {
      slotsRelevantes = slotsRelevantes.filter(
        (slot) =>
          Number(slot.centroId) === Number(this.centroAtencionSeleccionado)
      );
    }

    const especialidades = [
      ...new Set(slotsRelevantes.map((slot) => slot.especialidadStaffMedico)),
    ];
    return especialidades.filter((esp) => esp && esp.trim());
  }

  // Obtener médicos disponibles basados en los filtros actuales
  obtenerMedicosDisponibles(): any[] {
    if (!this.slotsOriginales || this.slotsOriginales.length === 0) {
      return [];
    }

    let slotsRelevantes = [...this.slotsOriginales];

    if (this.especialidadSeleccionada) {
      slotsRelevantes = slotsRelevantes.filter(
        (slot) => slot.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }

    if (this.centroAtencionSeleccionado) {
      slotsRelevantes = slotsRelevantes.filter(
        (slot) =>
          Number(slot.centroId) === Number(this.centroAtencionSeleccionado)
      );
    }

    const medicosUnicos = new Map();
    slotsRelevantes.forEach((slot) => {
      if (slot.staffMedicoId && !medicosUnicos.has(slot.staffMedicoId)) {
        medicosUnicos.set(slot.staffMedicoId, {
          id: slot.staffMedicoId,
          nombre: slot.staffMedicoNombre,
          apellido: slot.staffMedicoApellido,
        });
      }
    });

    return Array.from(medicosUnicos.values());
  }

  // Obtener centros disponibles basados en los filtros actuales
  obtenerCentrosDisponibles(): any[] {
    if (!this.slotsOriginales || this.slotsOriginales.length === 0) {
      return [];
    }

    let slotsRelevantes = [...this.slotsOriginales];

    if (this.especialidadSeleccionada) {
      slotsRelevantes = slotsRelevantes.filter(
        (slot) => slot.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }

    if (this.staffMedicoSeleccionado) {
      slotsRelevantes = slotsRelevantes.filter(
        (slot) =>
          Number(slot.staffMedicoId) === Number(this.staffMedicoSeleccionado)
      );
    }

    const centrosUnicos = new Map();
    slotsRelevantes.forEach((slot) => {
      if (slot.centroId && !centrosUnicos.has(slot.centroId)) {
        centrosUnicos.set(slot.centroId, {
          id: slot.centroId,
          nombre: slot.nombreCentro,
        });
      }
    });

    return Array.from(centrosUnicos.values());
  }

  // Aplicar filtros a los slots
  aplicarFiltros() {
    let slotsFiltrados = [...this.slotsOriginales];

    // Filtrar por especialidad
    if (this.especialidadSeleccionada && this.especialidadSeleccionada.trim()) {
      slotsFiltrados = slotsFiltrados.filter(
        (slot) => slot.especialidadStaffMedico === this.especialidadSeleccionada
      );
    }

    // Filtrar por staff médico
    if (this.staffMedicoSeleccionado) {
      const staffMedicoIdBuscado = Number(this.staffMedicoSeleccionado);
      slotsFiltrados = slotsFiltrados.filter(
        (slot) => Number(slot.staffMedicoId) === staffMedicoIdBuscado
      );
    }

    // Filtrar por centro de atención
    if (this.centroAtencionSeleccionado) {
      const centroIdBuscado = Number(this.centroAtencionSeleccionado);
      slotsFiltrados = slotsFiltrados.filter(
        (slot) => Number(slot.centroId) === centroIdBuscado
      );
    }

    // Filtrar por estado
    if (this.estadoSeleccionado) {
      switch (this.estadoSeleccionado) {
        case "DISPONIBLE":
          slotsFiltrados = slotsFiltrados.filter(
            (slot) => !slot.ocupado && !this.slotAfectadoPorExcepcion(slot)
          );
          break;
        case "PROGRAMADO":
        case "CONFIRMADO":
        case "REAGENDADO":
        case "CANCELADO":
        case "COMPLETO":
          slotsFiltrados = slotsFiltrados.filter(
            (slot) => slot.estadoTurno === this.estadoSeleccionado
          );
          break;
      }
    }

    // Actualizar las listas con los slots filtrados
    this.slotsDisponibles = slotsFiltrados;
    this.showCalendar = true;

    // Reagrupar y mostrar
    this.agruparSlotsPorFecha();
    this.cdr.detectChanges();

    console.log("🔍 Filtros aplicados:", {
      especialidad: this.especialidadSeleccionada,
      medico: this.staffMedicoSeleccionado,
      centro: this.centroAtencionSeleccionado,
      estado: this.estadoSeleccionado,
      resultados: slotsFiltrados.length,
    });
  }

  // ==================== MÉTODOS DE TRANSFORMACIÓN DE DATOS ====================

  // Transformar eventos del backend a slots
  private mapEventosToSlots(eventosBackend: any[]): SlotDisponible[] {
    const slots: SlotDisponible[] = [];

    eventosBackend.forEach((evento, index) => {
      // Validar que el evento tenga los datos necesarios
      if (!evento.fecha || !evento.horaInicio || !evento.horaFin) {
        return;
      }

      // Si es un slot disponible
      if (evento.esSlot) {
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
        };

        // Si está ocupado, agregar información del paciente
        if (evento.ocupado && evento.pacienteId) {
          slot.pacienteId = evento.pacienteId;
          slot.pacienteNombre = evento.pacienteNombre;
          slot.pacienteApellido = evento.pacienteApellido;
          slot.pacienteDni = evento.pacienteDni;
          slot.estadoTurno = evento.estadoTurno || "PROGRAMADO";
        }

        slots.push(slot);
      }
    });

    return slots;
  }

  // ==================== MÉTODOS DE INTERFAZ ====================

  // Seleccionar slot para ver detalles
  seleccionarSlot(slot: SlotDisponible, event?: MouseEvent) {
    this.slotSeleccionado = slot;
    this.showDetailsModal = true;
  }

  // Cerrar modal de detalles
  closeDetailsModal() {
    this.showDetailsModal = false;
    this.slotSeleccionado = null;
  }

  // Gestionar turno existente
  gestionarTurno() {
    if (!this.slotSeleccionado) return;

    // Navegar al módulo de gestión de turnos con el ID
    this.router.navigate(["/turnos"], {
      queryParams: {
        turnoId: this.slotSeleccionado.id,
        pacienteId: this.slotSeleccionado.pacienteId,
      },
    });
  }

  // Asignar paciente a slot disponible
  asignarTurno() {
    if (!this.slotSeleccionado) return;

    // Navegar al módulo de turnos para crear uno nuevo
    this.router.navigate(["/turnos"], {
      queryParams: {
        slotId: this.slotSeleccionado.id,
        fecha: this.slotSeleccionado.fecha,
        horaInicio: this.slotSeleccionado.horaInicio,
        horaFin: this.slotSeleccionado.horaFin,
        staffMedicoId: this.slotSeleccionado.staffMedicoId,
        accion: "crear",
      },
    });
  }

  // ==================== MÉTODOS DEL MAPA DE CENTROS ====================

  mostrarMapaCentros() {
    this.showMapaModal = true;
  }

  cerrarMapaModal() {
    this.showMapaModal = false;
  }

  onCentroSeleccionadoDelMapa(centro: CentroAtencion) {
    this.centroAtencionSeleccionado = centro.id || null;
    this.actualizarFiltrosDinamicos();
    this.aplicarFiltros();
    this.cerrarMapaModal();
  }

  // ==================== MÉTODOS DE NAVEGACIÓN ====================

  goBack() {
    this.router.navigate(["/operador-dashboard"]);
  }

  // ==================== MÉTODOS DE LIMPIEZA DE FILTROS ====================

  limpiarEspecialidad() {
    this.especialidadSeleccionada = "";
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

  limpiarEstado() {
    this.estadoSeleccionado = "";
    this.onEstadoChange();
  }

  limpiarTodosFiltros() {
    this.especialidadSeleccionada = "";
    this.staffMedicoSeleccionado = null;
    this.centroAtencionSeleccionado = null;
    this.estadoSeleccionado = "";

    // Para operador, mantener calendario visible con todos los turnos
    this.slotsDisponibles = [...this.slotsOriginales];
    this.showCalendar = true;
    this.agruparSlotsPorFecha();

    this.cdr.detectChanges();
  }

  // ==================== MÉTODOS AUXILIARES ====================

  // Verificar si hay filtros aplicados
  hayFiltrosAplicados(): boolean {
    return (
      (this.especialidadSeleccionada?.trim() ||
        this.staffMedicoSeleccionado ||
        this.centroAtencionSeleccionado ||
        this.estadoSeleccionado) !== null
    );
  }

  // Obtener nombres para mostrar
  getStaffMedicoNombre(id: number | null): string {
    if (!id) return "Cualquier médico";

    const staff = this.staffMedicos.find((s) => Number(s.id) === Number(id));
    if (staff && staff.medico) {
      return `${staff.medico.nombre} ${staff.medico.apellido}`;
    }

    const slotConMedico = this.slotsOriginales.find(
      (slot) => Number(slot.staffMedicoId) === Number(id)
    );
    if (
      slotConMedico &&
      slotConMedico.staffMedicoNombre &&
      slotConMedico.staffMedicoApellido
    ) {
      return `${slotConMedico.staffMedicoNombre} ${slotConMedico.staffMedicoApellido}`;
    }

    return "Médico no encontrado";
  }

  getCentroAtencionNombre(id: number | null): string {
    if (!id) return "Cualquier centro";

    const centro = this.centrosAtencion.find(
      (c) => Number(c.id) === Number(id)
    );
    if (!centro) {
      return "Centro no encontrado";
    }

    return centro.nombre || `Centro #${id}`;
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case "DISPONIBLE":
        return "Disponibles";
      case "PROGRAMADO":
        return "Programados";
      case "CONFIRMADO":
        return "Confirmados";
      case "REAGENDADO":
        return "Reagendados";
      case "CANCELADO":
        return "Cancelados";
      case "COMPLETO":
        return "Completados";
      default:
        return estado;
    }
  }

  // Obtener clase CSS para badges de estado
  getBadgeClass(estado?: string): string {
    switch (estado) {
      case "PROGRAMADO":
        return "bg-warning";
      case "CONFIRMADO":
        return "bg-success";
      case "REAGENDADO":
        return "bg-info";
      case "CANCELADO":
        return "bg-danger";
      case "COMPLETO":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  }

  // ==================== MÉTODOS DE CONTEO Y ESTADÍSTICAS ====================

  // Contar turnos por estado
  contarTurnosPorEstado(estado: string): number {
    switch (estado) {
      case "DISPONIBLE":
        return this.slotsDisponibles.filter(
          (slot) => !slot.ocupado && !this.slotAfectadoPorExcepcion(slot)
        ).length;
      case "OCUPADO":
        return this.slotsDisponibles.filter((slot) => slot.ocupado).length;
      default:
        return this.slotsDisponibles.filter(
          (slot) => slot.estadoTurno === estado
        ).length;
    }
  }

  // Contar turnos por fecha y estado
  contarTurnosPorFechaYEstado(fecha: string, estado: string): number {
    const slotsDelDia = this.slotsPorFecha[fecha] || [];

    switch (estado) {
      case "DISPONIBLE":
        return slotsDelDia.filter(
          (slot) => !slot.ocupado && !this.slotAfectadoPorExcepcion(slot)
        ).length;
      case "OCUPADO":
        return slotsDelDia.filter((slot) => slot.ocupado).length;
      default:
        return slotsDelDia.filter((slot) => slot.estadoTurno === estado).length;
    }
  }

  // ==================== MÉTODOS PARA MANEJO DE FECHAS Y EXCEPCIONES ====================

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = fecha.split("-");
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const fechaObj = new Date(year, month, day);
      const opciones: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return fechaObj.toLocaleDateString("es-ES", opciones);
    }

    const fechaObj = new Date(fecha + "T00:00:00");
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return fechaObj.toLocaleDateString("es-ES", opciones);
  }

  // Verificar si un slot específico está afectado por excepciones
  slotAfectadoPorExcepcion(slot: SlotDisponible): boolean {
    return this.diasExcepcionalesService.slotAfectadoPorExcepcion(slot);
  }

  getTipoExcepcion(
    fecha: string
  ): "FERIADO" | "ATENCION_ESPECIAL" | "MANTENIMIENTO" | null {
    return this.diasExcepcionalesService.getTipoExcepcion(fecha);
  }

  getTipoExcepcionLabel(fecha: string): string {
    const tipo = this.getTipoExcepcion(fecha);
    switch (tipo) {
      case "FERIADO":
        return "Feriado";
      case "MANTENIMIENTO":
        return "Mantenimiento";
      case "ATENCION_ESPECIAL":
        return "Atención Especial";
      default:
        return "Día Excepcional";
    }
  }

  getDescripcionExcepcion(fecha: string): string | null {
    return this.diasExcepcionalesService.getDescripcionExcepcion(fecha);
  }

  getIconoExcepcion(fecha: string): string {
    const tipo = this.getTipoExcepcion(fecha);
    switch (tipo) {
      case "FERIADO":
        return "🏛️";
      case "MANTENIMIENTO":
        return "🔧";
      case "ATENCION_ESPECIAL":
        return "⭐";
      default:
        return "⚠️";
    }
  }

  // Verificar si el médico ha cambiado respecto al slot anterior
  esCambioMedico(fecha: string, index: number): boolean {
    const slotsDelDia = this.slotsPorFecha[fecha];
    if (!slotsDelDia || index === 0) {
      return false;
    }

    const slotActual = slotsDelDia[index];
    const slotAnterior = slotsDelDia[index - 1];

    const medicoActual = `${slotActual.staffMedicoNombre} ${slotActual.staffMedicoApellido}`;
    const medicoAnterior = `${slotAnterior.staffMedicoNombre} ${slotAnterior.staffMedicoApellido}`;

    return medicoActual !== medicoAnterior;
  }

  // Obtener el nombre completo del médico de un slot
  getNombreMedico(slot: SlotDisponible): string {
    return `${slot.staffMedicoNombre} ${slot.staffMedicoApellido}`;
  }

  // Agrupar slots por fecha para mostrar en el calendario
  private agruparSlotsPorFecha() {
    this.slotsPorFecha = {};

    // Agrupar slots por fecha
    this.slotsDisponibles.forEach((slot) => {
      if (!this.slotsPorFecha[slot.fecha]) {
        this.slotsPorFecha[slot.fecha] = [];
      }
      this.slotsPorFecha[slot.fecha].push(slot);
    });

    // Ordenar fechas y slots dentro de cada fecha
    this.fechasOrdenadas = Object.keys(this.slotsPorFecha).sort();

    // Ordenar slots dentro de cada fecha por médico y luego por hora
    this.fechasOrdenadas.forEach((fecha) => {
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
