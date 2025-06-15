import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';
import { AgendaService } from '../agenda/agenda.service';
import { DiasExcepcionalesService } from '../agenda/dias-excepcionales.service';

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
}

@Component({
  selector: 'app-paciente-reagendar-turno',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reagendar-turno-container">
      <!-- Header -->
      <div class="page-header">
        <button class="btn btn-back" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
          Volver
        </button>
        <h1>
          <i class="fas fa-calendar-check"></i>
          Reagendar Turno
        </h1>
      </div>

      <!-- Current Appointment Info -->
      <div class="current-appointment" *ngIf="currentTurno">
        <h2>
          <i class="fas fa-info-circle"></i>
          Turno Actual
        </h2>
        <div class="appointment-info">
          <div class="info-row">
            <strong>Fecha actual:</strong> {{ formatDate(currentTurno.fecha) }}
          </div>
          <div class="info-row">
            <strong>Hora:</strong> {{ currentTurno.horaInicio }} - {{ currentTurno.horaFin }}
          </div>
          <div class="info-row">
            <strong>Médico:</strong> {{ currentTurno.staffMedicoNombre }} {{ currentTurno.staffMedicoApellido }}
          </div>
          <div class="info-row">
            <strong>Especialidad:</strong> {{ currentTurno.especialidadStaffMedico }}
          </div>
          <div class="info-row">
            <strong>Consultorio:</strong> {{ currentTurno.consultorioNombre }}
          </div>
          <div class="info-row">
            <strong>Centro:</strong> {{ currentTurno.nombreCentro }}
          </div>
        </div>
      </div>

      <!-- Available Slots Section -->
      <div class="available-slots">
        <h2>
          <i class="fas fa-calendar-alt"></i>
          Horarios Disponibles del Mismo Médico
        </h2>
        <p class="slots-subtitle">Selecciona un nuevo horario disponible:</p>
        
        <!-- Loading State -->
        <div class="loading-slots" *ngIf="isLoadingSlots">
          <i class="fas fa-spinner fa-spin"></i>
          Cargando horarios disponibles...
        </div>

        <!-- No Slots Available -->
        <div class="no-slots" *ngIf="!isLoadingSlots && slotsDisponibles.length === 0 && currentTurno">
          <i class="fas fa-calendar-times"></i>
          <h3>No hay horarios disponibles</h3>
          <p>No se encontraron horarios disponibles para este médico en las próximas 4 semanas.</p>
          <p class="help-text">Puedes intentar contactar directamente con el centro médico para más opciones.</p>
        </div>

        <!-- Slots Agrupados por Fecha -->
        <div class="slots-grouped" *ngIf="!isLoadingSlots && slotsDisponibles.length > 0">
          <div *ngFor="let fecha of fechasOrdenadas" class="fecha-group">
            <!-- Header de fecha -->
            <div class="fecha-header" 
                 [class.fecha-feriado]="getTipoExcepcion(fecha) === 'FERIADO'">
              <div class="fecha-info">
                <h3 class="fecha-title">
                  <i class="fas fa-calendar-day"></i>
                  {{ formatearFecha(fecha) }}
                </h3>
                <!-- Solo mostrar feriados para pacientes en reagendamiento -->
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
                [class.slot-excepcional]="slotAfectadoPorExcepcion(slot)"
                [class.slot-feriado]="slotAfectadoPorExcepcion(slot) && getTipoExcepcion(slot.fecha) === 'FERIADO'"
                [class.slot-mantenimiento]="slotAfectadoPorExcepcion(slot) && getTipoExcepcion(slot.fecha) === 'MANTENIMIENTO'"
                [class.slot-atencion-especial]="slotAfectadoPorExcepcion(slot) && getTipoExcepcion(slot.fecha) === 'ATENCION_ESPECIAL'"
                [class.slot-no-disponible]="slotAfectadoPorExcepcion(slot)"
                (click)="seleccionarSlot(slot)"
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

                <!-- Estado del slot -->
                <div class="slot-status" *ngIf="slotAfectadoPorExcepcion(slot)">
                  <i class="fas fa-lock"></i>
                  No Disponible
                </div>
                <div class="slot-status disponible" *ngIf="!slotAfectadoPorExcepcion(slot)">
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

      <!-- Confirmation Section -->
      <div class="confirmation-section" *ngIf="slotSeleccionado">
        <h2>
          <i class="fas fa-check-circle"></i>
          Confirmar Reagendamiento
        </h2>
        
        <div class="confirmation-details">
          <div class="change-summary">
            <div class="change-from">
              <h4>Cambiar de:</h4>
              <div class="appointment-summary old">
                <i class="fas fa-calendar-minus"></i>
                <div>
                  <strong>{{ formatDate(currentTurno?.fecha || '') }}</strong><br>
                  <span>{{ currentTurno?.horaInicio }} - {{ currentTurno?.horaFin }}</span>
                </div>
              </div>
            </div>
            
            <div class="change-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
            
            <div class="change-to">
              <h4>Cambiar a:</h4>
              <div class="appointment-summary new">
                <i class="fas fa-calendar-plus"></i>
                <div>
                  <strong>{{ formatDate(slotSeleccionado.fecha) }}</strong><br>
                  <span>{{ slotSeleccionado.horaInicio }} - {{ slotSeleccionado.horaFin }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-cancel"
            (click)="cancelarSeleccion()"
            [disabled]="isProcessing"
          >
            <i class="fas fa-times"></i>
            Cancelar Selección
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            [disabled]="isProcessing"
            (click)="confirmarReagendamiento()"
          >
            <i class="fas fa-calendar-check"></i>
            Confirmar Reagendamiento
          </button>
        </div>
      </div>

      <!-- Processing and Error States -->
      <div class="loading-message" *ngIf="isProcessing">
        <i class="fas fa-spinner fa-spin"></i>
        Procesando reagendamiento...
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
        <button class="btn-retry" (click)="reintentar()" *ngIf="currentTurno">
          <i class="fas fa-redo"></i>
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: `
    .reagendar-turno-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .reagendar-turno-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .page-header h1 {
      color: white;
      font-size: 2.8rem;
      font-weight: 800;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-shadow: 0 4px 12px rgba(0,0,0,0.3);
      background: linear-gradient(45deg, #fff, #f0f8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-back {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .btn-back:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    }

    .btn-header-glass {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .btn-header-glass:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    .btn-cancel {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
    }

    .btn-cancel:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
    }

    .current-appointment {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      border-left: 6px solid #ff6b6b;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .current-appointment::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, #ff6b6b, #ffa500);
      border-radius: 50%;
      opacity: 0.1;
      transform: translate(30px, -30px);
    }

    .current-appointment h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      font-size: 1.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }

    .appointment-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .info-row {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
    }

    .info-row:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
    }

    .info-row strong {
      color: #2c3e50;
      font-weight: 700;
      margin-right: 0.5rem;
      font-size: 0.95rem;
    }

    .available-slots {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .available-slots::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 80px;
      height: 80px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 50%;
      opacity: 0.1;
      transform: translate(-20px, -20px);
    }

    .available-slots h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }

    .slots-subtitle {
      color: #6c757d;
      margin-bottom: 2rem;
      font-size: 1.1rem;
      position: relative;
      z-index: 1;
    }

    .loading-slots {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
      font-size: 1.1rem;
    }

    .loading-slots i {
      font-size: 2rem;
      margin-bottom: 1rem;
      display: block;
    }

    .no-slots {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-slots i {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .no-slots h3 {
      margin-bottom: 1rem;
      color: #495057;
    }

    .help-text {
      font-style: italic;
      margin-top: 1rem;
      font-size: 0.9rem;
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    /* Slots agrupados por fecha */
    .slots-grouped {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .fecha-group {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .fecha-header {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.15);
      border-left: 4px solid rgba(255, 255, 255, 0.3);
    }

    .fecha-header.fecha-excepcional {
      background: rgba(220, 53, 69, 0.1);
      border-left-color: #dc3545;
    }

    .fecha-header.fecha-feriado {
      background: rgba(231, 76, 60, 0.1);
      border-left-color: #e74c3c;
    }

    .fecha-header.fecha-mantenimiento {
      background: rgba(255, 193, 7, 0.1);
      border-left-color: #ffc107;
    }

    .fecha-header.fecha-atencion-especial {
      background: rgba(23, 162, 184, 0.1);
      border-left-color: #17a2b8;
    }

    .fecha-info {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .fecha-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      text-transform: capitalize;
    }

    .fecha-title i {
      font-size: 1.1rem;
      opacity: 0.8;
    }

    .fecha-exception-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      font-size: 0.9rem;
      color: #721c24;
      font-weight: 600;
      border: 2px solid rgba(220, 53, 69, 0.4);
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15);
      margin-top: 0.5rem;
    }

    .exception-icon {
      font-size: 1rem;
    }

    .exception-label {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.5px;
    }

    .exception-description {
      font-style: italic;
      opacity: 0.8;
    }

    .slot-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 1.8rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .slot-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .slot-card:hover {
      border-color: #667eea;
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.25);
    }

    .slot-card:hover::before {
      opacity: 0.05;
    }

    .slot-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: translateY(-8px) scale(1.05);
      box-shadow: 0 20px 50px rgba(102, 126, 234, 0.4);
    }

    .slot-card.selected::before {
      opacity: 0;
    }

    /* Estilos para slots no disponibles */
    .slot-card.slot-no-disponible {
      border-color: #dc3545;
      background: rgba(220, 53, 69, 0.05);
      cursor: not-allowed;
      opacity: 0.7;
    }

    .slot-card.slot-no-disponible:hover {
      transform: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-color: #dc3545;
    }

    .slot-card.slot-no-disponible::before {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      opacity: 0.1;
    }

    .slot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .slot-date {
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .slot-day {
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: capitalize;
    }

    .slot-time {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.8rem;
    }

    .slot-location {
      opacity: 0.8;
      margin-bottom: 1rem;
    }

    .location-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
      font-size: 0.9rem;
    }

    .slot-check {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.9);
      z-index: 3;
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
      z-index: 2;
      margin-bottom:1rem;
    }

    .slot-status:not(.disponible) {
      background: #dc3545;
      color: white;
    }

    .slot-status.disponible {
      background: #28a745;
      color: white;
    }

    .slot-card.selected .slot-location,
    .slot-card.selected .slot-day {
      opacity: 1;
    }

    /* Estilos para días excepcionales */
    .slot-card.slot-excepcional {
      border-left: 4px solid #dc3545;
      background: linear-gradient(135deg, #ffe6e6 0%, #fff0f0 100%);
    }

    .slot-card.slot-feriado {
      border-left: 4px solid #e74c3c;
      background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
    }

    .slot-card.slot-feriado:hover {
      background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
      border-color: #c0392b;
    }

    .slot-card.slot-mantenimiento {
      border-left: 4px solid #f39c12;
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    }

    .slot-card.slot-mantenimiento:hover {
      background: linear-gradient(135deg, #fdcb6e 0%, #f39c12 100%);
      border-color: #e67e22;
    }

    .slot-card.slot-atencion-especial {
      border-left: 4px solid #9b59b6;
      background: linear-gradient(135deg, #f8e6ff 0%, #e8d5ff 100%);
    }

    .slot-card.slot-atencion-especial:hover {
      background: linear-gradient(135deg, #dda0dd 0%, #9b59b6 100%);
      border-color: #8e44ad;
    }

    .slot-exception-indicator {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      background: rgba(220, 53, 69, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #dc3545;
      backdrop-filter: blur(5px);
    }

    .slot-card.slot-feriado .slot-exception-indicator {
      background: rgba(231, 76, 60, 0.15);
      color: #c0392b;
    }

    .slot-card.slot-mantenimiento .slot-exception-indicator {
      background: rgba(243, 156, 18, 0.15);
      color: #e67e22;
    }

    .slot-card.slot-atencion-especial .slot-exception-indicator {
      background: rgba(155, 89, 182, 0.15);
      color: #8e44ad;
    }

    .exception-icon {
      font-size: 0.9rem;
    }

    .exception-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .slot-exception-description {
      margin-top: 0.8rem;
      padding: 0.5rem;
      background: rgba(220, 53, 69, 0.1);
      border-radius: 6px;
      font-size: 0.8rem;
      color: #721c24;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      border-left: 3px solid #dc3545;
    }

    .slot-card.slot-feriado .slot-exception-description {
      background: rgba(231, 76, 60, 0.1);
      color: #922b21;
      border-left-color: #e74c3c;
    }

    .slot-card.slot-mantenimiento .slot-exception-description {
      background: rgba(243, 156, 18, 0.1);
      color: #7d6608;
      border-left-color: #f39c12;
    }

    .slot-card.slot-atencion-especial .slot-exception-description {
      background: rgba(155, 89, 182, 0.1);
      color: #633974;
      border-left-color: #9b59b6;
    }

    /* Animación para días excepcionales */
    .slot-card.slot-excepcional {
      animation: exceptionalPulse 2s infinite;
    }

    @keyframes exceptionalPulse {
      0%, 100% {
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      }
      50% {
        box-shadow: 0 4px 25px rgba(220, 53, 69, 0.2);
      }
    }

    .confirmation-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
      border-left: 6px solid #28a745;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .confirmation-section::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 90px;
      height: 90px;
      background: linear-gradient(45deg, #28a745, #20c997);
      border-radius: 50%;
      opacity: 0.1;
      transform: translate(30px, -30px);
    }

    .confirmation-section h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      font-size: 1.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }

    .change-summary {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 2rem;
      align-items: center;
      margin-bottom: 2rem;
    }

    .change-from h4, .change-to h4 {
      margin-bottom: 1rem;
      color: #6c757d;
      font-size: 1rem;
    }

    .appointment-summary {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 10px;
    }

    .appointment-summary.old {
      background: #fff3cd;
      border: 2px solid #ffeaa7;
    }

    .appointment-summary.new {
      background: #d4edda;
      border: 2px solid #28a745;
    }

    .appointment-summary i {
      font-size: 1.5rem;
    }

    .change-arrow {
      font-size: 1.5rem;
      color: #667eea;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .loading-message, .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .loading-message {
      background: #d1ecf1;
      color: #0c5460;
      justify-content: center;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      justify-content: space-between;
    }

    .btn-retry {
      background: transparent;
      border: 1px solid currentColor;
      color: inherit;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-retry:hover {
      background: currentColor;
      color: white;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .reagendar-turno-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .appointment-info {
        grid-template-columns: 1fr;
      }

      .slots-grid {
        grid-template-columns: 1fr;
      }

      .change-summary {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .change-arrow {
        transform: rotate(90deg);
        justify-self: center;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `
})
export class PacienteReagendarTurnoComponent implements OnInit {
  turnoId: number = 0;
  currentTurno: Turno | null = null;
  slotsDisponibles: SlotDisponible[] = [];
  slotsPorFecha: { [fecha: string]: SlotDisponible[] } = {};
  fechasOrdenadas: string[] = [];
  slotSeleccionado: SlotDisponible | null = null;
  isProcessing: boolean = false;
  isLoadingSlots: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private turnoService: TurnoService,
    private agendaService: AgendaService,
    private diasExcepcionalesService: DiasExcepcionalesService
  ) {}

  ngOnInit() {
    // Cargar días excepcionales primero
    this.cargarDiasExcepcionales();
    
    this.route.params.subscribe(params => {
      this.turnoId = +params['id'];
      this.cargarTurnoActual();
    });
  }

  cargarDiasExcepcionales() {
    this.diasExcepcionalesService.cargarDiasExcepcionalesParaCalendario();
  }

  cargarTurnoActual() {
    this.turnoService.get(this.turnoId).subscribe({
      next: (dataPackage: DataPackage<Turno>) => {
        this.currentTurno = dataPackage.data;
        console.log('Turno cargado para reagendar:', this.currentTurno);
        
        // Cargar slots disponibles del mismo médico
        if (this.currentTurno?.staffMedicoId) {
          this.cargarSlotsDisponibles(this.currentTurno.staffMedicoId);
        }
      },
      error: (error) => {
        console.error('Error cargando turno:', error);
        this.errorMessage = 'No se pudo cargar la información del turno.';
      }
    });
  }

  cargarSlotsDisponibles(staffMedicoId: number) {
    this.isLoadingSlots = true;
    this.errorMessage = '';

    this.agendaService.obtenerSlotsDisponiblesPorMedico(staffMedicoId, 4).subscribe({
      next: (response: any) => {
        // El backend devuelve un Response object con data
        const slots = response.data || response;
        
        this.slotsDisponibles = slots.filter((slot: any) => {
          // Filtrar slots que no sean el turno actual
          if (!this.currentTurno) return true;
          
          const currentDateTime = new Date(`${this.currentTurno.fecha}T${this.currentTurno.horaInicio}`);
          const slotDateTime = new Date(`${slot.fecha}T${slot.horaInicio}`);
          return slotDateTime.getTime() !== currentDateTime.getTime();
        });
        
        console.log('Slots disponibles cargados:', this.slotsDisponibles);
        this.agruparSlotsPorFecha();
        this.isLoadingSlots = false;
      },
      error: (error: any) => {
        console.error('Error cargando slots disponibles:', error);
        this.errorMessage = 'No se pudieron cargar los horarios disponibles.';
        this.isLoadingSlots = false;
      }
    });
  }

  agruparSlotsPorFecha() {
    this.slotsPorFecha = {};
    
    // Agrupar slots por fecha
    this.slotsDisponibles.forEach(slot => {
      if (!this.slotsPorFecha[slot.fecha]) {
        this.slotsPorFecha[slot.fecha] = [];
      }
      this.slotsPorFecha[slot.fecha].push(slot);
    });
    
    // Ordenar fechas y horarios dentro de cada fecha
    this.fechasOrdenadas = Object.keys(this.slotsPorFecha).sort();
    
    // Ordenar horarios dentro de cada fecha
    Object.keys(this.slotsPorFecha).forEach(fecha => {
      this.slotsPorFecha[fecha].sort((a, b) => 
        a.horaInicio.localeCompare(b.horaInicio)
      );
    });
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    };
    return fechaObj.toLocaleDateString('es-ES', options);
  }

  seleccionarSlot(slot: SlotDisponible) {
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
    console.log('Slot seleccionado:', slot);
  }

  cancelarSeleccion() {
    this.slotSeleccionado = null;
  }

  confirmarReagendamiento() {
    if (!this.currentTurno || !this.slotSeleccionado) return;

    this.isProcessing = true;
    this.errorMessage = '';

    const nuevosDatos = {
      fecha: this.slotSeleccionado.fecha,
      horaInicio: this.slotSeleccionado.horaInicio,
      horaFin: this.slotSeleccionado.horaFin,
      pacienteId: this.currentTurno.pacienteId,
      staffMedicoId: this.slotSeleccionado.staffMedicoId,
      consultorioId: this.slotSeleccionado.consultorioId
    };

    this.turnoService.reagendar(this.turnoId, nuevosDatos).subscribe({
      next: (response) => {
        console.log('Turno reagendado exitosamente:', response);
        this.isProcessing = false;
        alert(`¡Turno reagendado exitosamente!\n\nNueva fecha: ${this.formatDate(this.slotSeleccionado!.fecha)}\nNueva hora: ${this.slotSeleccionado!.horaInicio} - ${this.slotSeleccionado!.horaFin}`);
        this.router.navigate(['/paciente-turnos']);
      },
      error: (error) => {
        console.error('Error reagendando turno:', error);
        this.isProcessing = false;
        
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'No se pudo reagendar el turno. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  reintentar() {
    this.errorMessage = '';
    if (this.currentTurno?.staffMedicoId) {
      this.cargarSlotsDisponibles(this.currentTurno.staffMedicoId);
    }
  }

  formatDate(dateString: string): string {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month es 0-indexed
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateShort(dateString: string): string {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month es 0-indexed
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  formatDayOfWeek(dateString: string): string {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month es 0-indexed
    return date.toLocaleDateString('es-ES', {
      weekday: 'long'
    });
  }

  goBack() {
    this.router.navigate(['/paciente-turnos']);
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
        return 'Excepcional';
    }
  }
}
