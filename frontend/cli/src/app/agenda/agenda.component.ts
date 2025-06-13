import { Component, ChangeDetectionStrategy, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { CalendarEvent, CalendarEventTitleFormatter, CalendarDateFormatter } from 'angular-calendar';
import { AgendaService } from './agenda.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarModule } from 'angular-calendar';
import { PacienteService } from '../pacientes/paciente.service'; // Importa el servicio de pacientes
import { HttpClient } from '@angular/common/http'; // Importa HttpClient
import { DiasExcepcionalesService } from './dias-excepcionales.service'; // Importa el servicio de días excepcionales
import { startOfWeek, format } from 'date-fns'; // Importar date-fns para manejo de fechas
import { es } from 'date-fns/locale'; // Importar locale español


@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CalendarModule,
  ],
  providers: [
    CalendarEventTitleFormatter, 
    CalendarDateFormatter,
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  template: `
    <div class="container mt-4">
      <div class="card modern-card">
        <!-- HEADER MODERNO -->
        <div class="banner-agenda">
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

          <!-- Navegación entre semanas modernizada -->
          <div class="week-navigation">
            <button type="button" class="btn btn-modern btn-nav" (click)="changeWeek(-1)">
              ← Semana anterior
            </button>
            <div class="current-week">
              <span class="week-icon">📅</span>
              <span class="week-text">{{ viewDate | date: 'MMMM yyyy' }}</span>
            </div>
            <button type="button" class="btn btn-modern btn-nav" (click)="changeWeek(1)">
              Semana siguiente →
            </button>
          </div>

          <!-- Vista del calendario modernizada -->
          <div class="calendar-container">
            <mwl-calendar-week-view
              [viewDate]="viewDate"
              [events]="filteredEvents"
              [hourSegments]="6"
              [dayStartHour]="8"
              [dayEndHour]="20"
              [weekStartsOn]="1"
              [locale]="locale"
              (eventClicked)="handleEvent($event)">
            </mwl-calendar-week-view>
          </div>

          <!-- Modal modernizado para detalles del evento -->
          <div *ngIf="selectedEvent" class="modern-modal-overlay" (click)="closeModal()">
            <div class="modern-modal" (click)="$event.stopPropagation()">
              <div class="m
              header-modern">
                <div class="header-content">
                  <div class="header-icon">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="header-text">
                    <h3>Detalle del Turno</h3>
                    <p>Información completa del turno médico</p>
                  </div>
                </div>
                <button type="button" class="modal-close-btn" (click)="closeModal()">×</button>
              </div>
              
              <div class="modal-body-modern">
                <div class="info-grid-modal">
                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">📋</span>
                      Título
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.title }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);">👨‍⚕️</span>
                      Médico
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.meta?.staffMedicoNombre }} {{ selectedEvent.meta?.staffMedicoApellido }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);">🏥</span>
                      Especialidad
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.meta?.especialidadStaffMedico }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);">🚪</span>
                      Consultorio
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.meta?.consultorioNombre }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">🏢</span>
                      Centro de Atención
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.meta?.centroAtencionNombre }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);">🕐</span>
                      Hora Inicio
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.start | date: 'yyyy-MM-dd HH:mm' }}</div>
                  </div>

                  <div class="info-item-modal">
                    <div class="info-label-modal">
                      <span class="info-icon-modal" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">🕕</span>
                      Hora Fin
                    </div>
                    <div class="info-value-modal">{{ selectedEvent.end | date: 'yyyy-MM-dd HH:mm' }}</div>
                  </div>
                </div>

                <!-- Sección de asignación de paciente -->
                <div class="patient-assignment">
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
                <button type="button" class="btn btn-modern btn-assign" (click)="asignarTurno()">
                  💾 Asignar Turno
                </button>
                <button type="button" class="btn btn-modern btn-cancel" (click)="closeModal()">
                  ❌ Cerrar
                </button>
              </div>
            </div>
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
    
    .modern-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
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
    
    /* Navegación de semanas */
    .week-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 15px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
    }
    
    .btn-nav {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .current-week {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 1.1rem;
    }
    
    .week-icon {
      font-size: 1.3rem;
    }
    
    /* Contenedor del calendario */
    .calendar-container {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      margin-bottom: 2rem;
    }
    
    /* Estilos para angular-calendar */
    .mwl-calendar-week-view {
      border: 1px solid #e9ecef;
      border-radius: 12px;
      background: #fff;
      padding: 1rem;
      height: 600px;
      overflow-y: auto;
    }
    
    .mwl-calendar-week-view .cal-day-column {
      border-right: 1px solid #e9ecef;
    }
    
    .mwl-calendar-week-view .cal-hour-segment {
      background-color: #fafbff;
      border-bottom: 1px solid #f1f3f4;
    }
    
    .mwl-calendar-week-view .cal-event {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: none;
      font-weight: 500;
    }
    
    .mwl-calendar-week-view .cal-day-headers .cal-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 2px solid #667eea;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .past-day {
      background-color: rgba(255, 204, 204, 0.3) !important;
    }
    
    /* Modal modernizado */
    .modern-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      backdrop-filter: blur(5px);
      animation: fadeIn 0.3s ease;
    }
    
    .modern-modal {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
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
    
    /* Animaciones */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(30px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }

    /* Estilos específicos para días excepcionales */
    :host ::ng-deep .cal-event[title*="FERIADO"] {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
      border: 2px solid #721c24 !important;
      color: white !important;
      font-weight: bold !important;
      position: relative;
      overflow: hidden;
    }

    :host ::ng-deep .cal-event[title*="FERIADO"]:before {
      content: '🏛️';
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 12px;
    }

    :host ::ng-deep .cal-event[title*="MANTENIMIENTO"] {
      background: linear-gradient(135deg, #fd7e14 0%, #e55a00 100%) !important;
      border: 2px solid #c2410c !important;
      color: white !important;
      font-weight: bold !important;
      position: relative;
      overflow: hidden;
    }

    :host ::ng-deep .cal-event[title*="MANTENIMIENTO"]:before {
      content: '🔧';
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 12px;
    }

    :host ::ng-deep .cal-event[title*="ATENCION_ESPECIAL"] {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%) !important;
      border: 2px solid #c69500 !important;
      color: #212529 !important;
      font-weight: bold !important;
      position: relative;
      overflow: hidden;
    }

    :host ::ng-deep .cal-event[title*="ATENCION_ESPECIAL"]:before {
      content: '⭐';
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 12px;
    }

    /* Días excepcionales en el encabezado del calendario */
    :host ::ng-deep .cal-day-headers .cal-header.exceptional-day {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
      color: white !important;
      position: relative;
    }

    :host ::ng-deep .cal-day-headers .cal-header.exceptional-day:after {
      content: '⚠️';
      position: absolute;
      top: 2px;
      right: 4px;
      font-size: 10px;
    }

    /* Columnas de días excepcionales */
    :host ::ng-deep .cal-day-column.exceptional-day {
      background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(200, 35, 51, 0.05) 100%) !important;
      border-left: 3px solid #dc3545 !important;
    }

    /* Mejorar visibilidad de eventos en días excepcionales */
    :host ::ng-deep .cal-event.exceptional-event {
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3) !important;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3); }
      50% { box-shadow: 0 6px 12px rgba(220, 53, 69, 0.5); }
      100% { box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3); }
    }
    
    /* ============================================
       ESTILOS PARA DÍAS EXCEPCIONALES - COLUMNAS COMPLETAS
       ============================================ */
    
    /* Días excepcionales - FERIADO (Rojo intenso) */
    :host ::ng-deep .cal-day-column.dia-feriado {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
      border-left: 4px solid #c0392b !important;
      border-right: 4px solid #c0392b !important;
      position: relative;
    }
    
    :host ::ng-deep .cal-day-column.dia-feriado::before {
      content: '🏛️ FERIADO';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(192, 57, 43, 0.95);
      color: white;
      text-align: center;
      padding: 0.5rem;
      font-weight: bold;
      font-size: 0.8rem;
      z-index: 10;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    :host ::ng-deep .cal-day-column.dia-feriado .cal-hour-segment {
      background: rgba(255, 107, 107, 0.1) !important;
      border-bottom: 1px solid rgba(192, 57, 43, 0.3) !important;
    }
    
    :host ::ng-deep .cal-day-column.dia-feriado .cal-hour-segment:hover {
      background: rgba(255, 107, 107, 0.2) !important;
    }
    
    /* Días excepcionales - MANTENIMIENTO (Naranja) */
    :host ::ng-deep .cal-day-column.dia-mantenimiento {
      background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%) !important;
      border-left: 4px solid #d68910 !important;
      border-right: 4px solid #d68910 !important;
      position: relative;
    }
    
    :host ::ng-deep .cal-day-column.dia-mantenimiento::before {
      content: '🔧 MANTENIMIENTO';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(214, 137, 16, 0.95);
      color: white;
      text-align: center;
      padding: 0.5rem;
      font-weight: bold;
      font-size: 0.8rem;
      z-index: 10;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    :host ::ng-deep .cal-day-column.dia-mantenimiento .cal-hour-segment {
      background: rgba(243, 156, 18, 0.1) !important;
      border-bottom: 1px solid rgba(214, 137, 16, 0.3) !important;
    }
    
    :host ::ng-deep .cal-day-column.dia-mantenimiento .cal-hour-segment:hover {
      background: rgba(243, 156, 18, 0.2) !important;
    }
    
    /* Días excepcionales - ATENCIÓN ESPECIAL (Púrpura) */
    :host ::ng-deep .cal-day-column.dia-atencion-especial {
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%) !important;
      border-left: 4px solid #7d3c98 !important;
      border-right: 4px solid #7d3c98 !important;
      position: relative;
    }
    
    :host ::ng-deep .cal-day-column.dia-atencion-especial::before {
      content: '⭐ ATENCIÓN ESPECIAL';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(125, 60, 152, 0.95);
      color: white;
      text-align: center;
      padding: 0.5rem;
      font-weight: bold;
      font-size: 0.8rem;
      z-index: 10;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    :host ::ng-deep .cal-day-column.dia-atencion-especial .cal-hour-segment {
      background: rgba(155, 89, 182, 0.1) !important;
      border-bottom: 1px solid rgba(125, 60, 152, 0.3) !important;
    }
    
    :host ::ng-deep .cal-day-column.dia-atencion-especial .cal-hour-segment:hover {
      background: rgba(155, 89, 182, 0.2) !important;
    }
    
    /* Animación para días excepcionales */
    :host ::ng-deep .cal-day-column.dia-feriado,
    :host ::ng-deep .cal-day-column.dia-mantenimiento,
    :host ::ng-deep .cal-day-column.dia-atencion-especial {
      animation: exceptionalColumnPulse 3s ease-in-out infinite;
    }
    
    @keyframes exceptionalColumnPulse {
      0%, 100% {
        box-shadow: 0 0 20px rgba(220, 53, 69, 0.3);
      }
      50% {
        box-shadow: 0 0 30px rgba(220, 53, 69, 0.6);
      }
    }
    
    /* Ajustar headers para días excepcionales */
    :host ::ng-deep .cal-day-headers .cal-header.dia-feriado {
      background: linear-gradient(135deg, #c0392b 0%, #a93226 100%) !important;
      color: white !important;
      font-weight: bold !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
      position: relative;
    }
    
    :host ::ng-deep .cal-day-headers .cal-header.dia-feriado::after {
      content: ' 🏛️';
      font-size: 1.2em;
    }
    
    :host ::ng-deep .cal-day-headers .cal-header.dia-mantenimiento {
      background: linear-gradient(135deg, #d68910 0%, #b7950b 100%) !important;
      color: white !important;
      font-weight: bold !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
    }
    
    :host ::ng-deep .cal-day-headers .cal-header.dia-mantenimiento::after {
      content: ' 🔧';
      font-size: 1.2em;
    }
    
    :host ::ng-deep .cal-day-headers .cal-header.dia-atencion-especial {
      background: linear-gradient(135deg, #7d3c98 0%, #6c3483 100%) !important;
      color: white !important;
      font-weight: bold !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
    }
    
    :host ::ng-deep .cal-day-headers .cal-header.dia-atencion-especial::after {
      content: ' ⭐';
      font-size: 1.2em;
    }
    
    /* Configuración de nombres de días en español */
    :host ::ng-deep .cal-day-headers .cal-header:nth-child(1):not(.dia-feriado):not(.dia-mantenimiento):not(.dia-atencion-especial)::before {
      content: 'Lunes ';
    }
    
    :host ::ng-deep .cal-day-headers .cal-header:nth-child(2):not(.dia-feriado):not(.dia-mantenimiento):not(.dia-atencion-especial)::before {
      content: 'Martes ';
    }
    
    :host ::ng-deep .cal-day-headers .cal-header:nth-child(3):not(.dia-feriado):not(.dia-mantenimiento):not(.dia-atencion-especial)::before {
      content: 'Miércoles ';
    }
    
    :host ::ng-deep .cal-day-headers .cal-header:nth-child(4):not(.dia-feriado):not(.dia-mantenimiento):not(.dia-atencion-especial)::before {
      content: 'Jueves ';
    }
    
    :host ::ng-deep .cal-day-headers .cal-header:nth-child(5):not(.dia-feriado):not(.dia-mantenimiento):not(.dia-atencion-especial)::before {
      content: 'Viernes ';
    }
    
    :host ::ng-deep .cal-day-headers .cal-header:nth-child(6):not(.dia-feriado):not(.dia-mantenimiento):not(.dia-atencion-especial)::before {
      content: 'Sábado ';
    }
    
    :host ::ng-deep .cal-day-headers .cal-header:nth-child(7):not(.dia-feriado):not(.dia-mantenimiento):not(.dia-atencion-especial)::before {
      content: 'Domingo ';
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
      
      .week-navigation {
        flex-direction: column;
        gap: 1rem;
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
      
      .mwl-calendar-week-view {
        height: 400px;
      }
    }
  `]
})
export class AgendaComponent implements OnInit {
  viewDate: Date = new Date(); // Fecha actual para el calendario
  locale: string = 'es'; // Configurar idioma español

  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  semanas: number = 4; // Número de semanas para generar eventos
  selectedEvent: CalendarEvent | null = null; // Evento seleccionado
  filterType: string = 'staffMedico';
  filterValue: string = '';
  pacientes: { id: number; nombre: string; apellido: string }[] = []; // Lista de pacientes
  pacienteId: number | null = null; // Variable para almacenar el ID del paciente seleccionado

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
    this.cargarPacientes(); // Carga la lista de pacientes
    this.diasExcepcionalesService.cargarDiasExcepcionalesParaCalendario(); // Carga días excepcionales
  }

  // Método para cargar eventos desde el backend
  cargarTodosLosEventos(): void {
    const semanas = this.semanas; // Número de semanas para generar los eventos

    this.agendaService.obtenerTodosLosEventos(semanas).subscribe({
      next: (eventosBackend) => {
        // console.log('Eventos recibidos desde el backend:', eventosBackend);

        // Transformar los eventos del backend en objetos CalendarEvent
        this.events = this.mapEsquemasToEvents(eventosBackend);
        this.filteredEvents = this.events; // Inicialmente, los eventos filtrados son todos los eventos

        // console.log('Eventos filtrados asignados al calendario:', this.filteredEvents);
        this.cdr.detectChanges(); // Forzar la detección de cambios
        
        // Aplicar estilos a columnas de días excepcionales después de un breve delay
        setTimeout(() => {
          this.aplicarEstilosColumnasExcepcionales();
        }, 200);
      },
      error: (err: unknown) => {
        console.error('Error al cargar todos los eventos:', err);
        alert('No se pudieron cargar los eventos. Intente nuevamente.');
      }
    });
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

  handleEvent(eventObj: any) {
    this.selectedEvent = eventObj.event; // Asigna el evento seleccionado
    console.log('Evento seleccionado:', this.selectedEvent);
  }
  closeModal() {
    this.selectedEvent = null; // Limpia el evento seleccionado
  }

  applyFilter() {
    if (!this.filterValue) {
      this.filteredEvents = this.events;
      return;
    }
    this.filteredEvents = this.events.filter(event => {
      const valorFiltro = this.filterValue.toLowerCase();
      switch (this.filterType) {
        case 'staffMedico':
            return `${event.meta?.staffMedicoNombre} ${event.meta?.staffMedicoApellido}`.toLowerCase().includes(valorFiltro);
        case 'centroAtencion':
          return event.meta?.centroAtencionNombre?.toLowerCase().includes(valorFiltro);
        case 'consultorio':
          return event.meta?.consultorioNombre?.toLowerCase().includes(valorFiltro);
        case 'especialidad':
          return event.meta?.especialidadStaffMedico?.toLowerCase().includes(valorFiltro);
        default:
          return true;
      }
    });
  }

  clearFilter() {
    this.filterValue = '';
    this.filteredEvents = this.events;
  }

  getFilterOptions(): string[] {
    switch (this.filterType) {
      case 'staffMedico':
      return [...new Set(this.events.map(event => `${event.meta?.staffMedicoNombre} ${event.meta?.staffMedicoApellido}`).filter(Boolean))];
      case 'centroAtencion':
      return [...new Set(this.events.map(event => event.meta?.centroAtencionNombre).filter(Boolean))];
      case 'consultorio':
      return [...new Set(this.events.map(event => event.meta?.consultorioNombre).filter(Boolean))];
      case 'especialidad':
      return [...new Set(this.events.map(event => event.meta?.especialidadStaffMedico).filter(Boolean))];
      default:
      return [];
    }
  }

  private mapEsquemasToEvents(eventosBackend: any[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    // console.log('Eventos recibidos desde el backend:', eventosBackend);

    eventosBackend.forEach(evento => {
      // Validar que el evento tenga los datos necesarios
      if (!evento.fecha || !evento.horaInicio || !evento.horaFin) {
        console.warn('Evento con datos incompletos:', evento);
        return; // Ignorar eventos incompletos
      }

      const start = new Date(`${evento.fecha}T${evento.horaInicio}`);
      const end = new Date(`${evento.fecha}T${evento.horaFin}`);

      // Validar que las fechas sean válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Evento con fechas inválidas:', evento);
        return; // Ignorar eventos con fechas inválidas
      }

      // Verificar si es un día excepcional
      const fechaEvento = evento.fecha; // formato yyyy-mm-dd
      const esDiaExcepcional = this.diasExcepcionalesService.esDiaExcepcional(fechaEvento);
      const tipoExcepcion = this.diasExcepcionalesService.getTipoExcepcion(fechaEvento);
      const descripcionExcepcion = this.diasExcepcionalesService.getDescripcionExcepcion(fechaEvento);

      // Aplicar colores basándose en el estado (frontend)
      let color;
      if (esDiaExcepcional) {
        // Día excepcional - color rojo
        color = { 
          primary: '#dc3545', 
          secondary: '#f8d7da' 
        };
      } else if (evento.ocupado) {
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
      let title;
      // Formatear hora de inicio para mostrar en el título
      const horaInicio = start.getHours().toString().padStart(2, '0') + ':' + 
                        start.getMinutes().toString().padStart(2, '0');
      
      if (esDiaExcepcional) {
        title = `⚠️ ${tipoExcepcion}: ${descripcionExcepcion || 'Día excepcional'}<br>${horaInicio}`;
      } else {
        title = evento.ocupado ? 
          `Ocupado - ${evento.staffMedicoNombre} ${evento.staffMedicoApellido}<br>${horaInicio}` : 
          `Disponible - ${evento.staffMedicoNombre} ${evento.staffMedicoApellido}<br>${horaInicio}`;
      }

      // Crear el evento y agregarlo a la lista
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
          // Datos de día excepcional
          esDiaExcepcional: esDiaExcepcional,
          tipoExcepcion: tipoExcepcion,
          descripcionExcepcion: descripcionExcepcion
        }
      });
    });

    // console.log('Eventos generados:', events); // Depuración: Verifica cuántos eventos se generan
    return events;
  }

  changeWeek(direction: number): void {
    const currentDate = this.viewDate;
    this.viewDate = new Date(currentDate.setDate(currentDate.getDate() + direction * 7));
    
    // Recargar eventos al cambiar de semana para obtener datos actualizados
    this.cargarTodosLosEventos();
    
    // Recargar días excepcionales para la nueva fecha
    this.diasExcepcionalesService.cargarDiasExcepcionalesParaCalendario();
    
    // Aplicar estilos a columnas de días excepcionales después de un breve delay
    setTimeout(() => {
      this.aplicarEstilosColumnasExcepcionales();
    }, 100);
    
    // console.log('Nueva fecha de vista:', this.viewDate);
  }

  /**
   * Aplica estilos CSS a las columnas del calendario para días excepcionales
   */
  private aplicarEstilosColumnasExcepcionales(): void {
    // Obtener la fecha de inicio de la semana actual (lunes) usando UTC para evitar offset
    const inicioSemana = startOfWeek(this.viewDate, { weekStartsOn: 1 }); // 1 = lunes
    
    console.log('Fecha de vista actual:', this.viewDate);
    console.log('Inicio de semana (lunes):', inicioSemana);

    // Obtener todas las columnas del calendario
    const columnas = document.querySelectorAll('.cal-day-column');
    const headers = document.querySelectorAll('.cal-day-headers .cal-header');

    console.log('Columnas encontradas:', columnas.length);
    console.log('Headers encontrados:', headers.length);

    // Limpiar clases previas
    columnas.forEach(columna => {
      columna.classList.remove('dia-feriado', 'dia-mantenimiento', 'dia-atencion-especial');
    });
    headers.forEach(header => {
      header.classList.remove('dia-feriado', 'dia-mantenimiento', 'dia-atencion-especial');
    });

    // Aplicar clases para cada día de la semana (lunes a domingo)
    for (let i = 0; i < 7; i++) {
      // Crear nueva fecha basada en el inicio de semana y sumar días
      const fechaDia = new Date(inicioSemana.getTime() + (i * 24 * 60 * 60 * 1000));
      
      // Formatear fecha como string en formato UTC para evitar offset de zona horaria
      const year = fechaDia.getUTCFullYear();
      const month = String(fechaDia.getUTCMonth() + 1).padStart(2, '0');
      const day = String(fechaDia.getUTCDate()).padStart(2, '0');
      const fechaStr = `${year}-${month}-${day}`;

      console.log(`Día ${i}: ${fechaStr}, Es excepcional: ${this.diasExcepcionalesService.esDiaExcepcional(fechaStr)}`);

      if (this.diasExcepcionalesService.esDiaExcepcional(fechaStr)) {
        const tipoExcepcion = this.diasExcepcionalesService.getTipoExcepcion(fechaStr);
        console.log(`Tipo de excepción para ${fechaStr}:`, tipoExcepcion);
        
        let claseCSS = '';

        switch (tipoExcepcion) {
          case 'FERIADO':
            claseCSS = 'dia-feriado';
            break;
          case 'MANTENIMIENTO':
            claseCSS = 'dia-mantenimiento';
            break;
          case 'ATENCION_ESPECIAL':
            claseCSS = 'dia-atencion-especial';
            break;
        }

        if (claseCSS && columnas[i] && headers[i]) {
          console.log(`Aplicando clase ${claseCSS} a columna ${i}`);
          columnas[i].classList.add(claseCSS);
          headers[i].classList.add(claseCSS);
        }
      }
    }
  }
  
  asignarTurno(): void {
    if (!this.pacienteId) {
      alert('Por favor, seleccione un paciente.');
      return;
    }

    // Crear fechas locales sin conversión a UTC
    const startDate = this.selectedEvent?.start;
    const endDate = this.selectedEvent?.end;
    
    if (!startDate) {
      alert('Error: Fecha de inicio no válida.');
      return;
    }
    
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
      id: this.selectedEvent?.meta?.id, // ID dinámico del turno
      fecha: fechaLocal, // Fecha en formato local
      horaInicio: horaInicioLocal, // Hora en formato local
      horaFin: horaFinLocal, // Hora en formato local
      pacienteId: this.pacienteId, // ID del paciente seleccionado
      staffMedicoId: this.selectedEvent?.meta?.staffMedicoId,
      staffMedicoNombre: this.selectedEvent?.meta?.staffMedicoNombre,
      staffMedicoApellido: this.selectedEvent?.meta.staffMedicoApellido, // Agregar el apellido del médico
      especialidadStaffMedico: this.selectedEvent?.meta?.especialidadStaffMedico,
    
      consultorioId: this.selectedEvent?.meta?.consultorioId,
      consultorioNombre: this.selectedEvent?.meta?.consultorioNombre,
      centroId: this.selectedEvent?.meta?.centroId,
      nombreCentro: this.selectedEvent?.meta?.centroAtencionNombre,
      estado: 'PROGRAMADO', // Estado inicial del turno
    };

    console.log('Enviando turno DTO (admin):', turnoDTO); // Debug log

    this.http.post(`/rest/turno/asignar`, turnoDTO).subscribe({
      next: () => {
        alert('Turno asignado correctamente.');
        this.closeModal(); // Cerrar el modal después de asignar el turno
        
        // Actualizar inmediatamente el slot en el calendario local
        this.actualizarSlotAsignado(this.selectedEvent);
        
        // Recargar los eventos para obtener datos actualizados del servidor
        setTimeout(() => {
          this.cargarTodosLosEventos();
        }, 500);
      },
      error: (err: any) => {
        console.error('Error al asignar el turno:', err);
        alert('No se pudo asignar el turno. Intente nuevamente.');
      },
    });
  }

  // Actualizar slot asignado inmediatamente en el calendario local
  private actualizarSlotAsignado(slot: CalendarEvent | null) {
    if (!slot) return;
    
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
      this.applyFilter();
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
    }
  }
}