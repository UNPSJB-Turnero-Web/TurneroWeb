import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EsquemaTurno } from '../../../esquemaTurno/esquemaTurno';
import { EsquemaTurnoService } from '../../../esquemaTurno/esquemaTurno.service';
import { Consultorio } from '../../../consultorios/consultorio';
import { StaffMedico } from '../../../staffMedicos/staffMedico';
import { DisponibilidadMedico } from '../../../disponibilidadMedicos/disponibilidadMedico';
import { DisponibilidadMedicoService } from '../../../disponibilidadMedicos/disponibilidadMedico.service';

@Component({
  selector: 'app-esquema-turno-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    /* ==== MODAL PRINCIPAL ==== */
    .modal-esquema-body {
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    }

    .modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1.5rem 2rem;
      position: relative;
      overflow: hidden;
    }

    .modal-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      transform: rotate(45deg);
      pointer-events: none;
    }

    .modal-title {
      font-weight: 600;
      font-size: 1.3rem;
      margin: 0;
      z-index: 1;
      position: relative;
    }

    .btn-close {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      width: 35px;
      height: 35px;
      opacity: 1;
      color: white;
      transition: all 0.3s ease;
    }

    .btn-close:hover {
      background: rgba(255,255,255,0.3);
      transform: scale(1.1);
    }

    /* ==== CARDS Y SECCIONES ==== */
    .section-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid rgba(102, 126, 234, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .section-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }

    .section-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.12);
    }

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 1.2rem;
      color: #2c3e50;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .section-icon {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 10px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.8rem;
      font-size: 1.1rem;
    }

    /* ==== CONSULTORIO INFO ==== */
    .consultorio-info {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border: 1px solid #2196f3;
      border-radius: 12px;
      padding: 1.2rem;
    }

    .avatar-consultorio {
      background: linear-gradient(135deg, #2196f3, #1976d2);
      color: white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    /* ==== FORMULARIOS MODERNOS ==== */
    .form-group-modern {
      margin-bottom: 2rem;
    }

    .form-label-modern {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.8rem;
      font-size: 0.95rem;
    }

    .form-control-modern {
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 0.8rem 1rem;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-control-modern:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      outline: none;
    }

    .form-help {
      font-size: 0.85rem;
      color: #6c757d;
      display: flex;
      align-items: center;
    }

    /* ==== ALERTAS MEJORADAS ==== */
    .alert-esquema {
      border: none;
      border-radius: 10px;
      padding: 1rem 1.2rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .alert-success {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .alert-danger {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .alert-info {
      background: linear-gradient(135deg, #cce7ff 0%, #b3d9ff 100%);
      color: #004085;
      border-left: 4px solid #007bff;
    }

    /* ==== ANÁLISIS VISUAL ==== */
    .interseccion-visual {
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
      border-radius: 15px;
      padding: 1.5rem;
      margin: 1rem 0;
      border: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .interseccion-step {
      margin-bottom: 1.5rem;
      padding: 1.2rem;
      border-radius: 12px;
      background: white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border-left: 4px solid transparent;
      transition: all 0.3s ease;
      position: relative;
    }

    .interseccion-step:nth-child(1) { border-left-color: #007bff; }
    .interseccion-step:nth-child(2) { border-left-color: #28a745; }
    .interseccion-step:nth-child(3) { border-left-color: #ffc107; }
    .interseccion-step:nth-child(4) { border-left-color: #17a2b8; }

    .interseccion-step:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.12);
    }
    
    .interseccion-title {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      color: #2c3e50;
      font-weight: 600;
      font-size: 1rem;
    }
    
    .interseccion-title.resultado {
      color: #28a745;
      font-size: 1.1rem;
    }
    
    .step-number {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.8rem;
      font-weight: bold;
      font-size: 0.9rem;
      box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
    }

    .step-number.resultado {
      background: linear-gradient(135deg, #28a745, #20c997);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3); }
      50% { box-shadow: 0 3px 15px rgba(40, 167, 69, 0.5); }
      100% { box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3); }
    }

    /* ==== HORARIOS Y BADGES ==== */
    .horarios-referencia {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .horario-ref {
      margin-bottom: 0.8rem;
      padding: 0.8rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 5px rgba(0,0,0,0.05);
    }

    .horario-ref:last-child {
      margin-bottom: 0;
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
    }

    .bg-primary { background: linear-gradient(135deg, #007bff, #0056b3) !important; }
    .bg-success { background: linear-gradient(135deg, #28a745, #1e7e34) !important; }
    .bg-warning { background: linear-gradient(135deg, #ffc107, #e0a800) !important; }
    .bg-info { background: linear-gradient(135deg, #17a2b8, #138496) !important; }

    /* ==== TABLA MEJORADA ==== */
    .horarios-tabla-container {
      margin-top: 1rem;
    }

    .table {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 3px 15px rgba(0,0,0,0.08);
      margin-bottom: 0;
    }

    .table thead {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .table th {
      border: none;
      font-weight: 600;
      padding: 1rem 0.8rem;
      font-size: 0.9rem;
    }

    .table td {
      padding: 0.8rem;
      border-color: #f1f3f4;
      vertical-align: middle;
    }

    .table-striped tbody tr:nth-of-type(odd) {
      background: rgba(102, 126, 234, 0.03);
    }

    .table-hover tbody tr:hover {
      background: rgba(102, 126, 234, 0.08);
      transform: scale(1.01);
      transition: all 0.2s ease;
    }

    .form-check-input {
      border-radius: 4px;
      border: 2px solid #ddd;
      transition: all 0.2s ease;
    }

    .form-check-input:checked {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-color: #667eea;
    }

    /* ==== HORARIOS FORMATO HORIZONTAL ==== */
    .horarios-horizontal {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .horario-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .horario-chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-color: #667eea;
    }

    .dia-badge {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-weight: 600;
      font-size: 0.8rem;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      min-width: 45px;
      text-align: center;
    }

    .hora-range {
      color: #495057;
      font-weight: 500;
      font-size: 0.9rem;
      min-width: 85px;
    }

    .estado-badge {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .estado-badge.activo {
      background: #28a745;
      color: white;
    }

    .estado-badge.inactivo {
      background: #6c757d;
      color: white;
    }

    @media (max-width: 768px) {
      .horarios-horizontal {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .horario-chip {
        justify-content: space-between;
      }
    }

    /* ==== BOTONES ==== */
    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 8px;
      padding: 0.7rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c757d;
      border: none;
      border-radius: 8px;
      padding: 0.7rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #545b62;
      transform: translateY(-1px);
    }

    /* ==== LOADING Y ESTADOS ==== */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      border-radius: 15px;
    }

    .spinner-border {
      color: #667eea;
    }

    /* ==== MENSAJES VACÍOS ==== */
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
      background: #f8f9fa;
      border-radius: 10px;
      margin: 1rem 0;
    }

    .empty-state i {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #dee2e6;
    }

    /* ==== RESPONSIVE ==== */
    @media (max-width: 768px) {
      .modal-esquema-body {
        padding: 1rem;
      }
      
      .section-card {
        padding: 1rem;
      }
      
      .interseccion-step {
        padding: 1rem;
      }
      
      .step-number {
        width: 30px;
        height: 30px;
        font-size: 0.8rem;
      }
    }

    /* ==== ANIMACIONES ==== */
    .fade-in {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .slide-in {
      animation: slideIn 0.6s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    
    .horario-ref {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 10px;
      min-width: 200px;
    }
    
    .horario-ref.ocupado {
      background: #fff3cd;
      border-color: #ffeaa7;
    }
    
    .medico-horarios .horario-ref {
      border-left: 4px solid #007bff;
    }
    
    .consultorio-horarios .horario-ref {
      border-left: 4px solid #28a745;
    }
    
    .esquemas-existentes .horario-ref {
      border-left: 4px solid #ffc107;
    }
    
    .horarios-tabla-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  `],
  template: `
    <!-- Modal Header -->
    <div class="modal-header">
      <h4 class="modal-title">
        <i class="fa fa-calendar-plus me-2"></i>
        Nuevo Esquema de Turno - {{ consultorio?.nombre }}
      </h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="onCancel()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="modal-body modal-esquema-body fade-in">
      <!-- Información del Consultorio -->
      <div class="section-card slide-in">
        <div class="section-title">
          <div class="section-icon">
            <i class="fa fa-building"></i>
          </div>
          Información del Consultorio
        </div>
        <div class="consultorio-info">
          <div class="d-flex align-items-center">
            <div class="avatar-consultorio me-3">
              {{ consultorio?.nombre?.charAt(0) }}
            </div>
            <div>
              <h6 class="mb-1 text-primary fw-bold">{{ consultorio?.nombre }}</h6>
              <small class="text-muted">
                <i class="fa fa-hashtag me-1"></i>
                Consultorio #{{ consultorio?.numero }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensajes de Error/Éxito -->
      <div *ngIf="mensajeError" class="alert alert-danger alert-esquema">
        <i class="fa fa-exclamation-triangle me-2"></i>
        {{ mensajeError }}
      </div>

      <div *ngIf="mensajeExito" class="alert alert-success alert-esquema">
        <i class="fa fa-check-circle me-2"></i>
        {{ mensajeExito }}
      </div>

      <!-- Seleccionar Disponibilidad Médica -->
      <div class="section-card slide-in">
        <div class="section-title">
          <div class="section-icon">
            <i class="fa fa-user-md"></i>
          </div>
          Seleccionar Disponibilidad Médica
        </div>
        <div class="form-group-modern">
          <select 
            class="form-control form-control-modern"
            [(ngModel)]="esquema.disponibilidadMedicoId"
            name="disponibilidadMedico"
            (change)="onDisponibilidadChange()"
            required
          >
            <option [ngValue]="null">
              <i class="fa fa-hand-point-right"></i>
              Seleccione una disponibilidad...
            </option>
            <option *ngFor="let disp of disponibilidadesDisponibles" [value]="disp.id">
              👨‍⚕️ {{ disp.staffMedico?.medico?.nombre }} {{ disp.staffMedico?.medico?.apellido }} - 
              🕐 {{ formatearHorarios(disp.horarios) }}
            </option>
          </select>
          <div class="form-help mt-2">
            <i class="fa fa-info-circle me-1 text-primary"></i>
            Solo se muestran disponibilidades de médicos asignados a este centro.
          </div>
        </div>
      </div>

      <!-- Horarios del Consultorio -->
      <div class="section-card slide-in">
        <div class="section-title">
          <div class="section-icon">
            <i class="fa fa-clock"></i>
          </div>
          Horarios de Atención del Consultorio
        </div>
        <div class="horarios-consultorio-info">
          <div *ngIf="consultorioHorarios.length > 0; else noHorariosConsultorio">
            <!-- Formato horizontal compacto -->
            <div class="horarios-horizontal">
              <div *ngFor="let horario of consultorioHorarios" class="horario-chip">
                <span class="dia-badge">{{ getDiaNombre(horario.diaSemana) }}</span>
                <span class="hora-range">
                  {{ horario.horaInicio }} - {{ horario.horaFin }}
                </span>
                <span class="estado-badge" [class.activo]="horario.activo" [class.inactivo]="!horario.activo">
                  <i class="fa" [class.fa-check]="horario.activo" [class.fa-times]="!horario.activo"></i>
                </span>
              </div>
            </div>
          </div>
          <ng-template #noHorariosConsultorio>
            <div class="empty-state">
              <i class="fa fa-exclamation-triangle"></i>
              <p class="mb-0">Este consultorio no tiene horarios de atención configurados.</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Análisis de Intersección -->
      <div *ngIf="disponibilidadSeleccionada" class="section-card slide-in">
        <div class="section-title">
          <div class="section-icon">
            <i class="fa fa-calculator"></i>
          </div>
          Análisis de Intersección de Horarios
        </div>

        <!-- Visualización del proceso de intersección -->
        <div class="interseccion-visual">

          <!-- 1. Disponibilidad del Médico -->
          <div class="interseccion-step">
            <h6 class="interseccion-title">
              <span class="step-number">1</span>
              <i class="fa fa-user-md me-2"></i>
              Disponibilidad del Médico Seleccionado
            </h6>
            <div class="horarios-referencia medico-horarios">
              <div class="horario-ref">
                <strong>{{ disponibilidadSeleccionada.staffMedico?.medico?.nombre }} {{ disponibilidadSeleccionada.staffMedico?.medico?.apellido }}</strong>
                <br>
                <div *ngFor="let horario of disponibilidadSeleccionada.horarios">
                  <span class="badge bg-primary">{{ getDiaNombre(horario.dia) }}</span>
                  <span class="ms-2">{{ horario.horaInicio }} - {{ horario.horaFin }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Horarios ocupados en este consultorio -->
          <div class="interseccion-step">
            <h6 class="interseccion-title">
              <span class="step-number">2</span>
              <i class="fa fa-calendar-times me-2"></i>
              Horarios ocupados en este consultorio
            </h6>
            <div class="horarios-referencia esquemas-existentes">
              <div *ngFor="let esquema of esquemasEnConsultorioActual" class="horario-ref ocupado">
                <strong>{{ esquema.staffMedico?.medico?.nombre }} {{ esquema.staffMedico?.medico?.apellido }}</strong>
                <br>
                <span *ngFor="let horario of esquema.horarios; let last = last" class="me-1">
                  <span class="badge bg-success">{{ getDiaNombre(horario.dia) }}</span>
                  <span class="ms-1">{{ horario.horaInicio }}-{{ horario.horaFin }}</span>{{ !last ? ', ' : '' }}
                </span>
              </div>
              <div *ngIf="esquemasEnConsultorioActual.length === 0" class="text-muted">
                <i class="fa fa-check-circle me-2"></i>
                No hay esquemas ocupando horarios en este consultorio
              </div>
            </div>

            <!-- Información sobre otros consultorios -->
            <div *ngIf="esquemasEnOtrosConsultorios.length > 0" class="mt-3">
              <div class="alert alert-warning" style="padding: 0.75rem; font-size: 0.9rem;">
                <i class="fa fa-info-circle me-2"></i>
                <strong>ℹ️ Información:</strong>
                Hay {{ esquemasEnOtrosConsultorios.length }} esquema(s) en otros consultorios del centro.
                Revise la columna "Conflictos" en la tabla de abajo para evitar asignar el mismo médico en horarios ocupados.
              </div>
            </div>
          </div>

          <!-- 3. Resultado de la Intersección -->
          <div class="interseccion-step">
            <h6 class="interseccion-title resultado">
              <span class="step-number resultado">⚡</span>
              <i class="fa fa-check-double me-2"></i>
              Horarios Disponibles para Asignar
            </h6>
            
            <div *ngIf="horariosDisponibles.length > 0; else noResultados" class="horarios-tabla-container">
              <div class="alert alert-success">
                <i class="fa fa-lightbulb me-2"></i>
                <strong>{{ horariosDisponibles.length }} horario(s) disponible(s)</strong> encontrado(s) para asignar al esquema.
                Seleccione los que desea incluir y ajuste los horarios dentro del rango disponible:
              </div>
              
              <!-- Alerta informativa sobre conflictos -->
              <div *ngIf="esquemasEnOtrosConsultorios.length > 0" class="alert alert-warning mb-3">
                <i class="fa fa-exclamation-triangle me-2"></i>
                <strong>⚠️ Atención:</strong> Hay {{ esquemasEnOtrosConsultorios.length }} esquema(s) en otros consultorios del centro.
                Revise la columna <strong>"Conflictos"</strong> para evitar asignar el mismo médico en horarios ocupados.
              </div>

              <!-- Error de validación -->
              <div *ngIf="errorValidacion" class="alert alert-danger">
                <i class="fa fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> {{ errorValidacion }}
              </div>
              
              <!-- Tabla de horarios disponibles para seleccionar -->
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 50px;" class="text-center">
                        <input type="checkbox"
                               class="form-check-input"
                               [checked]="todosSeleccionados()"
                               [indeterminate]="algunosSeleccionados()"
                               (change)="toggleTodosSeleccionados()">
                      </th>
                      <th style="width: 100px;">Día</th>
                      <th style="width: 280px;">Horario</th>
                      <th>Conflictos</th>
                      <th style="width: 80px;" class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let horario of horariosDisponibles; let i = index"
                        [class.table-success]="isHorarioSeleccionado(horario) && !getConflictoEnOtrosConsultorios(horario).esElMismoMedico"
                        [class.table-danger]="getConflictoEnOtrosConsultorios(horario).esElMismoMedico"
                        [class.disabled]="getConflictoEnOtrosConsultorios(horario).esElMismoMedico">
                      <td class="text-center align-middle">
                        <input type="checkbox"
                               class="form-check-input"
                               [checked]="isHorarioSeleccionado(horario)"
                               [disabled]="getConflictoEnOtrosConsultorios(horario).esElMismoMedico"
                               (change)="toggleHorarioSeleccionado(horario, null)">
                      </td>
                      <td class="align-middle">
                        <span class="badge bg-primary">{{ getDiaNombre(horario.dia) }}</span>
                      </td>
                      <td class="align-middle">
                        <div class="d-flex gap-2 align-items-center mb-1">
                          <input type="time"
                                 class="form-control form-control-sm"
                                 [value]="getHorarioPersonalizado(horario, 'inicio')"
                                 (change)="actualizarHorarioPersonalizado(horario, 'inicio', $event)"
                                 [disabled]="!isHorarioSeleccionado(horario) || getConflictoEnOtrosConsultorios(horario).esElMismoMedico"
                                 style="width: 110px;">
                          <span class="text-muted">-</span>
                          <input type="time"
                                 class="form-control form-control-sm"
                                 [value]="getHorarioPersonalizado(horario, 'fin')"
                                 (change)="actualizarHorarioPersonalizado(horario, 'fin', $event)"
                                 [disabled]="!isHorarioSeleccionado(horario) || getConflictoEnOtrosConsultorios(horario).esElMismoMedico"
                                 style="width: 110px;">
                        </div>
                        <small class="text-muted">Disponible: {{ horario.horaInicio }} - {{ horario.horaFin }}</small>
                      </td>
                      <td class="align-middle">
                        <div *ngIf="getConflictoEnOtrosConsultorios(horario) as conflicto">
                          <div *ngIf="conflicto.tieneConflicto">
                            <span *ngIf="conflicto.esElMismoMedico"
                                  class="badge bg-danger mb-1"
                                  [title]="'El mismo médico ya está asignado en ' + (conflicto.consultorio || 'otro consultorio') + ' en el horario ' + conflicto.horarioConflictivo">
                              <i class="fa fa-exclamation-triangle me-1"></i>¡Conflicto!
                            </span>
                            <div class="small text-muted">
                              <i class="fa fa-user me-1"></i>{{ conflicto.esElMismoMedico ? 'Mismo médico' : conflicto.medico }}
                              <span *ngIf="conflicto.consultorio && conflicto.consultorio !== 'Sin asignar'">
                                <br><i class="fa fa-building me-1"></i>{{ conflicto.consultorio }}
                              </span>
                              <br><i class="fa fa-clock me-1"></i>{{ conflicto.horarioConflictivo }}
                            </div>
                          </div>
                          <span *ngIf="!conflicto.tieneConflicto" class="badge bg-success">
                            <i class="fa fa-check me-1"></i>Disponible
                          </span>
                        </div>
                      </td>
                      <td class="align-middle text-center">
                        <button type="button"
                                class="btn btn-sm"
                                [class.btn-warning]="isHorarioSeleccionado(horario)"
                                [class.btn-success]="!isHorarioSeleccionado(horario)"
                                [class.btn-secondary]="getConflictoEnOtrosConsultorios(horario).esElMismoMedico"
                                [disabled]="getConflictoEnOtrosConsultorios(horario).esElMismoMedico"
                                (click)="toggleHorarioSeleccionado(horario, null)">
                          <i class="fa"
                             [class.fa-minus]="isHorarioSeleccionado(horario)"
                             [class.fa-plus]="!isHorarioSeleccionado(horario)"
                             [class.fa-ban]="getConflictoEnOtrosConsultorios(horario).esElMismoMedico"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Controles rápidos -->
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <button type="button"
                          class="btn btn-sm btn-outline-success me-2"
                          (click)="seleccionarTodos()"
                          [disabled]="todosSeleccionados()">
                    <i class="fa fa-check-double"></i>
                    Todos
                  </button>
                  <button type="button"
                          class="btn btn-sm btn-outline-secondary"
                          (click)="limpiarTodos()"
                          [disabled]="ningunoSeleccionado()">
                    <i class="fa fa-times"></i>
                    Ninguno
                  </button>
                </div>
                <small class="text-muted">
                  <strong>{{ esquema.horarios.length }}</strong> horario(s) seleccionado(s)
                </small>
              </div>
            </div>

            <ng-template #noResultados>
              <div class="alert alert-warning">
                <i class="fa fa-exclamation-triangle me-2"></i>
                <strong>No hay horarios disponibles.</strong>
                No hay intersección entre la disponibilidad del médico y los horarios del consultorio,
                o todos están ocupados.
              </div>
            </ng-template>
          </div> <!-- Cierre interseccion-step resultado -->
        </div> <!-- Cierre interseccion-visual -->

        <!-- Configuración del Esquema -->
        <div *ngIf="esquema.horarios.length > 0" class="mt-4">
          <h6 class="mb-3">
            <i class="fa fa-cog me-2"></i>
            Configuración
          </h6>

          <div class="row align-items-end">
            <div class="col-md-4">
              <label class="form-label-small">Intervalo de Turnos</label>
              <select
                [(ngModel)]="esquema.intervalo"
                name="intervalo"
                class="form-control form-control-sm"
                required
              >
                <option value="15">15 minutos</option>
                <option value="20">20 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </div>
            <div class="col-md-8">
              <div class="alert alert-info mb-0" style="padding: 0.5rem; font-size: 0.85rem;">
                <strong>{{ calcularTurnosEstimados() }} turnos</strong> estimados
                ({{ calcularTiempoTotal() }} min totales ÷ {{ esquema.intervalo }} min/turno)
              </div>
            </div>
          </div>
        </div>
        
        <!-- Advertencia de horarios inválidos -->
        <div *ngIf="tieneHorariosInvalidos()" class="alert alert-warning mt-3">
          <i class="fa fa-exclamation-triangle me-2"></i>
          <strong>Advertencia:</strong> Algunos horarios están fuera del rango disponible del médico:
          <ul class="mb-0 mt-2">
            <li *ngFor="let horarioInvalido of getHorariosInvalidos()">{{ horarioInvalido }}</li>
          </ul>
          <small class="d-block mt-2">
            <i class="fa fa-info-circle me-1"></i>
            Ajuste los horarios dentro del rango disponible para poder guardar el esquema.
          </small>
        </div>
      </div> <!-- Cierre section-card -->
    </div> <!-- Cierre modal-body -->

    <!-- Modal Footer -->
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="onCancel()">
        <i class="fa fa-times me-2"></i>
        Cancelar
      </button>
      <button 
        type="button" 
        class="btn btn-success btn-crear-esquema"
        (click)="guardarEsquema()"
        [disabled]="!puedeGuardar() || guardando"
      >
        <i class="fa" [class.fa-save]="!guardando" [class.fa-spinner]="guardando" [class.fa-spin]="guardando"></i>
        {{ guardando ? 'Guardando...' : 'Crear Esquema' }}
      </button>
    </div>
  `
})
export class EsquemaTurnoModalComponent implements OnInit, AfterViewInit {
  @Input() consultorio!: Consultorio;
  @Input() centroId!: number;
  @Input() staffMedicos: StaffMedico[] = [];
  @Input() esquemaEditar?: EsquemaTurno;
  
  esquema: EsquemaTurno = {
    id: 0,
    consultorioId: 0,
    disponibilidadMedicoId: 0,
    staffMedicoId: 0,
    centroId: 0,
    horarios: [],
    intervalo: 30
  };

  disponibilidadesDisponibles: DisponibilidadMedico[] = [];
  disponibilidadSeleccionada: DisponibilidadMedico | null = null;
  consultorioHorarios: any[] = [];
  horariosDisponibles: any[] = [];
  esquemasExistentes: EsquemaTurno[] = [];
  esquemasEnConsultorioActual: EsquemaTurno[] = [];
  esquemasEnOtrosConsultorios: EsquemaTurno[] = [];
  
  // Propiedades para manejar rangos personalizables
  horariosPersonalizados: { [key: string]: { horaInicio: string; horaFin: string; } } = {};
  // Mapa para rastrear qué horarios originales están seleccionados (key = día-horaInicio-horaFin del horario ORIGINAL)
  horariosSeleccionadosMap: Map<string, { dia: string; horaInicio: string; horaFin: string }> = new Map();
  errorValidacion = '';

  mensajeError = '';
  mensajeExito = '';
  guardando = false;

  constructor(
    public activeModal: NgbActiveModal,
    private esquemaTurnoService: EsquemaTurnoService,
    private disponibilidadMedicoService: DisponibilidadMedicoService
  ) {}

  ngOnInit() {
    console.log('🔄 ngOnInit - Iniciando modal esquema');
    console.log('📋 Datos recibidos:', {
      consultorio: this.consultorio,
      centroId: this.centroId,
      staffMedicos: this.staffMedicos?.length || 0,
      esquemaEditar: this.esquemaEditar
    });

    if (this.consultorio) {
      this.esquema.consultorioId = this.consultorio.id;
      console.log('✅ Consultorio configurado:', this.consultorio);
      console.log('🏥 Centro ID:', this.centroId);
      console.log('👥 Staff médicos recibidos:', this.staffMedicos?.length || 0);
    } else {
      console.error('❌ No se recibió consultorio en el modal');
    }

    // Asignar el centroId al esquema para evitar error en backend
    if (this.centroId) {
      this.esquema.centroId = this.centroId;
      console.log('🏥 CentroId asignado al esquema:', this.esquema.centroId);
    }

    // Si estamos editando, cargar los datos del esquema
    if (this.esquemaEditar) {
      console.log('✏️ Modo edición activado - cargando datos del esquema:', this.esquemaEditar);
      this.esquema = { ...this.esquemaEditar };
      this.esquema.disponibilidadMedicoId = this.esquemaEditar.disponibilidadMedicoId || 0;
      this.esquema.intervalo = this.esquemaEditar.intervalo || 30;
    }
  }

  ngAfterViewInit() {
    // Cargar datos después de que la vista se inicialice
    setTimeout(() => {
      this.cargarDatos();
    }, 100);
  }

  private cargarDatos() {
    console.log('🔄 Cargando datos del modal...');
    console.log('📊 Estado actual:', {
      centroId: this.centroId,
      consultorio: this.consultorio?.id,
      staffMedicos: this.staffMedicos?.length || 0
    });
    
    this.cargarDisponibilidades();
    this.cargarHorariosConsultorio();
    this.cargarEsquemasExistentes();
  }

  private cargarDisponibilidades() {
    console.log('🏥 Cargando disponibilidades para centro:', this.centroId);
    
    if (!this.centroId) {
      console.error('❌ No se proporcionó centroId - no se pueden cargar disponibilidades');
      this.mensajeError = 'Error: No se pudo identificar el centro de atención';
      return;
    }
    
    if (!this.staffMedicos || this.staffMedicos.length === 0) {
      console.error('❌ No se proporcionaron staffMedicos - no se pueden filtrar disponibilidades');
      this.mensajeError = 'Error: No se encontró personal médico para este centro';
      return;
    }
    
    this.disponibilidadMedicoService.all().subscribe({
      next: (response: any) => {
        console.log('📥 Disponibilidades recibidas del servidor:', response);
        
        if (response && response.data) {
          console.log('📋 Total disponibilidades recibidas:', response.data.length);
          console.log('👥 Staff médicos disponibles en el centro:', this.staffMedicos.map(s => ({id: s.id, medico: s.medico?.nombre + ' ' + s.medico?.apellido})));
          
          // Crear un mapa de staffMedicoId -> staffMedico para búsqueda rápida
          const staffMedicoMap = new Map();
          this.staffMedicos.forEach(staff => {
            staffMedicoMap.set(staff.id, staff);
          });
          
          // Filtrar y enriquecer disponibilidades
          this.disponibilidadesDisponibles = response.data
            .filter((disp: DisponibilidadMedico) => {
              const staffMedico = staffMedicoMap.get(disp.staffMedicoId);
              const perteneceCentro = staffMedico !== undefined;
              
              console.log(`🔍 Disponibilidad ${disp.id}:`, {
                staffMedicoId: disp.staffMedicoId,
                staffEncontrado: !!staffMedico,
                medicoNombre: staffMedico?.medico?.nombre + ' ' + staffMedico?.medico?.apellido,
                pertenece: perteneceCentro
              });
              
              return perteneceCentro;
            })
            .map((disp: DisponibilidadMedico) => {
              // Enriquecer la disponibilidad con el objeto staffMedico completo
              const staffMedico = staffMedicoMap.get(disp.staffMedicoId);
              return {
                ...disp,
                staffMedico: staffMedico
              };
            });
          
          console.log('✅ Disponibilidades filtradas para este centro:', this.disponibilidadesDisponibles.length);
          console.log('📋 Disponibilidades disponibles:', this.disponibilidadesDisponibles);

          // Si estamos editando, pre-seleccionar la disponibilidad
          if (this.esquemaEditar && this.esquema.disponibilidadMedicoId) {
            console.log('✏️ Modo edición - buscando disponibilidad con ID:', this.esquema.disponibilidadMedicoId);
            const disponibilidadEditada = this.disponibilidadesDisponibles.find(
              d => d.id === this.esquema.disponibilidadMedicoId
            );

            if (disponibilidadEditada) {
              console.log('✅ Disponibilidad encontrada, cargando horarios...');
              this.onDisponibilidadChange();
            } else {
              console.warn('⚠️ No se encontró la disponibilidad con ID:', this.esquema.disponibilidadMedicoId);
            }
          }
        } else {
          console.warn('⚠️ Respuesta sin datos válidos');
          this.disponibilidadesDisponibles = [];
        }
      },
      error: (error: any) => {
        console.error('❌ Error al cargar disponibilidades:', error);
        this.mensajeError = 'Error al cargar las disponibilidades médicas';
      }
    });
  }

  private cargarHorariosConsultorio() {
    // Simular horarios del consultorio
    this.consultorioHorarios = [
      { diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Martes', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Miércoles', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Jueves', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Viernes', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Sábado', horaInicio: '08:00', horaFin: '19:00', activo: true },
      { diaSemana: 'Domingo', horaInicio: '08:00', horaFin: '19:00', activo: true }
    ];
  }

  private cargarEsquemasExistentes() {
    if (this.centroId) {
      // CORRECCIÓN: Cargar TODOS los esquemas del centro (no solo del consultorio)
      // para validar conflictos en otros consultorios del mismo centro
      this.esquemaTurnoService.getByCentroAtencion(this.centroId).subscribe({
        next: (response) => {
          this.esquemasExistentes = response.data || [];

          // IMPORTANTE: Excluir el esquema que estamos editando de los esquemas ocupados
          if (this.esquemaEditar && this.esquemaEditar.id) {
            console.log('✏️ Excluyendo esquema en edición (ID:', this.esquemaEditar.id, ') de esquemas ocupados');
            this.esquemasExistentes = this.esquemasExistentes.filter(
              esq => esq.id !== this.esquemaEditar!.id
            );
          }

          // Separar esquemas por consultorio para mostrar información más clara
          this.esquemasEnConsultorioActual = this.esquemasExistentes.filter(
            esq => esq.consultorioId === this.consultorio?.id
          );

          this.esquemasEnOtrosConsultorios = this.esquemasExistentes.filter(
            esq => esq.consultorioId !== this.consultorio?.id && esq.consultorioId !== null
          );

          console.log('📋 Esquemas existentes en el centro:', this.esquemasExistentes.length);
          console.log('🏥 Esquemas en consultorio actual:', this.esquemasEnConsultorioActual.length);
          console.log('🏢 Esquemas en otros consultorios:', this.esquemasEnOtrosConsultorios.length);
          console.log('🔍 Esquemas por consultorio:', this.esquemasExistentes.reduce((acc, esq) => {
            const consultorio = esq.consultorio?.nombre || 'Sin asignar';
            acc[consultorio] = (acc[consultorio] || 0) + 1;
            return acc;
          }, {} as any));
        },
        error: (error) => {
          console.error('Error al cargar esquemas existentes:', error);
        }
      });
    }
  }

  onDisponibilidadChange() {
    const disponibilidadId = this.esquema.disponibilidadMedicoId;
    console.log('Disponibilidad seleccionada ID:', disponibilidadId);

    if (disponibilidadId) {
      this.disponibilidadSeleccionada = this.disponibilidadesDisponibles.find(d => d.id === Number(disponibilidadId)) || null;
      console.log('Disponibilidad seleccionada:', this.disponibilidadSeleccionada);

      if (this.disponibilidadSeleccionada) {
        this.esquema.staffMedicoId = this.disponibilidadSeleccionada.staffMedicoId;
        this.calcularHorariosDisponibles();

        // Si estamos editando, pre-seleccionar los horarios del esquema
        if (this.esquemaEditar && this.esquemaEditar.horarios && this.esquemaEditar.horarios.length > 0) {
          console.log('✏️ Modo edición - pre-seleccionando horarios:', this.esquemaEditar.horarios);
          setTimeout(() => {
            this.cargarHorariosEditados();
          }, 100);
        }
      }
    } else {
      this.disponibilidadSeleccionada = null;
      this.horariosDisponibles = [];
    }
  }

  private cargarHorariosEditados(): void {
    if (!this.esquemaEditar || !this.esquemaEditar.horarios) return;

    // Limpiar selecciones previas
    this.horariosSeleccionadosMap.clear();

    // Para cada horario del esquema editado, encontrar el horario disponible correspondiente
    for (const horarioEditado of this.esquemaEditar.horarios) {
      // Buscar en horariosDisponibles el horario que coincida con este día
      const horarioDisponible = this.horariosDisponibles.find(hd =>
        this.normalizarDia(hd.dia) === this.normalizarDia(horarioEditado.dia)
      );

      if (horarioDisponible) {
        const key = this.getHorarioKey(horarioDisponible);

        // Guardar la personalización del horario editado
        this.horariosPersonalizados[key] = {
          horaInicio: horarioEditado.horaInicio,
          horaFin: horarioEditado.horaFin
        };

        // Agregar al mapa de seleccionados
        this.horariosSeleccionadosMap.set(key, {
          dia: horarioEditado.dia,
          horaInicio: horarioEditado.horaInicio,
          horaFin: horarioEditado.horaFin
        });

        console.log('✅ Horario pre-seleccionado:', horarioEditado);
      } else {
        console.warn('⚠️ No se encontró horario disponible para:', horarioEditado);
      }
    }

    // Sincronizar con esquema.horarios
    this.sincronizarEsquemaHorarios();
    console.log('✅ Horarios editados cargados:', this.esquema.horarios);
  }

  private calcularHorariosDisponibles() {
    if (!this.disponibilidadSeleccionada) {
      this.horariosDisponibles = [];
      return;
    }

    console.log('🔍 === CALCULANDO HORARIOS DISPONIBLES ===');
    console.log('📅 Disponibilidad médica:', this.disponibilidadSeleccionada.horarios);
    console.log('🏥 Horarios consultorio:', this.consultorioHorarios);

    // Intersección: horarios del médico que coinciden con horarios del consultorio
    const horariosInterseccion: any[] = [];
    
    for (const horarioMedico of this.disponibilidadSeleccionada.horarios) {
      console.log(`\n🔍 Procesando día: ${horarioMedico.dia}`);
      console.log(`👨‍⚕️ Horario médico: ${horarioMedico.horaInicio} - ${horarioMedico.horaFin}`);
      
      // CORRECCIÓN: Normalizar comparación de días (ignorar case y tildes)
      const horarioConsultorio = this.consultorioHorarios.find(hc =>
        this.normalizarDia(hc.diaSemana) === this.normalizarDia(horarioMedico.dia) && hc.activo
      );
      
      console.log(`🏥 Horario consultorio encontrado:`, horarioConsultorio);
      
      if (horarioConsultorio) {
        // Calcular intersección de horarios
        const inicioMedico = this.timeToMinutes(horarioMedico.horaInicio);
        const finMedico = this.timeToMinutes(horarioMedico.horaFin);
        const inicioConsultorio = this.timeToMinutes(horarioConsultorio.horaInicio);
        const finConsultorio = this.timeToMinutes(horarioConsultorio.horaFin);
        
        console.log(`🔢 Conversión a minutos:`);
        console.log(`   Médico: ${inicioMedico} - ${finMedico}`);
        console.log(`   Consultorio: ${inicioConsultorio} - ${finConsultorio}`);
        
        const inicioInterseccion = Math.max(inicioMedico, inicioConsultorio);
        const finInterseccion = Math.min(finMedico, finConsultorio);
        
        console.log(`⚡ Intersección: ${inicioInterseccion} - ${finInterseccion}`);
        
        if (inicioInterseccion < finInterseccion) {
          const horarioInterseccionado = {
            dia: horarioMedico.dia,
            horaInicio: this.minutesToTime(inicioInterseccion),
            horaFin: this.minutesToTime(finInterseccion)
          };
          horariosInterseccion.push(horarioInterseccionado);
          console.log(`✅ Horario agregado:`, horarioInterseccionado);
        } else {
          console.log(`❌ No hay intersección válida`);
        }
      } else {
        console.log(`❌ No se encontró horario de consultorio para el día ${horarioMedico.dia}`);
        console.log(`🔍 Días disponibles en consultorio:`, this.consultorioHorarios.map(h => h.diaSemana));
      }
    }

    console.log(`\n📋 Total horarios con intersección: ${horariosInterseccion.length}`);

    // NUEVA LÓGICA: En lugar de filtrar completamente, dividir horarios en segmentos disponibles
    this.horariosDisponibles = [];
    for (const horario of horariosInterseccion) {
      const segmentosLibres = this.calcularSegmentosLibres(horario);
      this.horariosDisponibles.push(...segmentosLibres);
    }

    console.log(`\n🎯 RESULTADO FINAL: ${this.horariosDisponibles.length} horarios disponibles:`, this.horariosDisponibles);
    console.log('🔍 === FIN CÁLCULO ===\n');
  }

  /**
   * Nuevo método que divide un horario en segmentos libres,
   * excluyendo las partes ocupadas por esquemas existentes.
   *
   * IMPORTANTE: Bloqueamos horarios del MISMO MÉDICO en TODOS los consultorios del centro,
   * ya que un médico no puede estar en dos lugares al mismo tiempo.
   * También bloqueamos horarios de otros médicos en el MISMO CONSULTORIO.
   */
  private calcularSegmentosLibres(horario: any): any[] {
    const segmentosLibres: any[] = [];
    const inicioTotal = this.timeToMinutes(horario.horaInicio);
    const finTotal = this.timeToMinutes(horario.horaFin);

    // Recolectar horarios ocupados:
    // 1. Todos los esquemas del MISMO CONSULTORIO (cualquier médico)
    // 2. Todos los esquemas del MISMO MÉDICO (en cualquier consultorio del centro)
    const staffMedicoIdSeleccionado = this.disponibilidadSeleccionada?.staffMedicoId;

    const horariosOcupados = this.esquemasExistentes
      .filter(esquema => {
        // Incluir si es del mismo consultorio O del mismo médico
        return esquema.consultorioId === this.consultorio?.id ||
               esquema.staffMedicoId === staffMedicoIdSeleccionado;
      })
      .flatMap(esquema => esquema.horarios)
      .filter(h => this.normalizarDia(h.dia) === this.normalizarDia(horario.dia))
      .map(h => ({
        inicio: this.timeToMinutes(h.horaInicio),
        fin: this.timeToMinutes(h.horaFin)
      }))
      .sort((a, b) => a.inicio - b.inicio);

    console.log(`🔍 Calculando segmentos libres para ${horario.dia} ${horario.horaInicio}-${horario.horaFin}`);
    console.log(`📅 Horarios ocupados (mismo consultorio + mismo médico):`, horariosOcupados.map(h => `${this.minutesToTime(h.inicio)}-${this.minutesToTime(h.fin)}`));

    if (horariosOcupados.length === 0) {
      // No hay ocupación, todo el horario está libre
      segmentosLibres.push(horario);
      console.log(`✅ Todo libre: ${horario.horaInicio}-${horario.horaFin}`);
      return segmentosLibres;
    }

    let puntoActual = inicioTotal;

    for (const ocupado of horariosOcupados) {
      // Si hay espacio libre antes de este horario ocupado
      if (puntoActual < ocupado.inicio) {
        const segmentoLibre = {
          dia: horario.dia,
          horaInicio: this.minutesToTime(puntoActual),
          horaFin: this.minutesToTime(Math.min(ocupado.inicio, finTotal))
        };
        segmentosLibres.push(segmentoLibre);
        console.log(`✅ Segmento libre: ${segmentoLibre.horaInicio}-${segmentoLibre.horaFin}`);
      }

      // Mover el punto actual al final de este horario ocupado
      puntoActual = Math.max(puntoActual, ocupado.fin);

      // Si ya cubrimos todo el horario, salir
      if (puntoActual >= finTotal) {
        break;
      }
    }

    // Si queda tiempo libre después del último horario ocupado
    if (puntoActual < finTotal) {
      const segmentoLibre = {
        dia: horario.dia,
        horaInicio: this.minutesToTime(puntoActual),
        horaFin: this.minutesToTime(finTotal)
      };
      segmentosLibres.push(segmentoLibre);
      console.log(`✅ Segmento libre final: ${segmentoLibre.horaInicio}-${segmentoLibre.horaFin}`);
    }

    console.log(`� Total segmentos libres para ${horario.dia}: ${segmentosLibres.length}`);
    return segmentosLibres;
  }


  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private normalizarDia(dia: string): string {
    return dia
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Elimina tildes y diacríticos
  }

  getDiaNombre(dia: string): string {
    const nombres: { [key: string]: string } = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIERCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return nombres[this.normalizarDia(dia)] || dia;
  }

  formatearHorarios(horarios: { dia: string; horaInicio: string; horaFin: string }[]): string {
    return horarios.map(h => this.getDiaNombre(h.dia) + ' ' + h.horaInicio + '-' + h.horaFin).join(', ');
  }

  // Métodos para el manejo de selección de horarios
  isHorarioSeleccionado(horario: any): boolean {
    const key = this.getHorarioKey(horario);
    return this.horariosSeleccionadosMap.has(key);
  }

  toggleHorarioSeleccionado(horario: any, event: any) {
    if (event) {
      event.preventDefault();
    }

    const key = this.getHorarioKey(horario);

    if (this.isHorarioSeleccionado(horario)) {
      // Quitar el horario del mapa
      this.horariosSeleccionadosMap.delete(key);
    } else {
      // Agregar el horario al mapa (usar personalizado si existe, sino el original)
      const horarioAgregar = this.horariosPersonalizados[key] || {
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      };

      this.horariosSeleccionadosMap.set(key, {
        dia: horario.dia,
        horaInicio: horarioAgregar.horaInicio,
        horaFin: horarioAgregar.horaFin
      });
    }

    // Sincronizar esquema.horarios con el mapa
    this.sincronizarEsquemaHorarios();
  }

  seleccionarTodos() {
    for (const horario of this.horariosDisponibles) {
      // No seleccionar si ya está seleccionado o si tiene conflicto con el mismo médico
      const conflicto = this.getConflictoEnOtrosConsultorios(horario);
      if (!this.isHorarioSeleccionado(horario) && !conflicto.esElMismoMedico) {
        const key = this.getHorarioKey(horario);
        const horarioAgregar = this.horariosPersonalizados[key] || {
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin
        };

        this.horariosSeleccionadosMap.set(key, {
          dia: horario.dia,
          horaInicio: horarioAgregar.horaInicio,
          horaFin: horarioAgregar.horaFin
        });
      }
    }
    this.sincronizarEsquemaHorarios();
  }

  limpiarTodos() {
    this.horariosSeleccionadosMap.clear();
    this.sincronizarEsquemaHorarios();
  }

  // Sincroniza esquema.horarios con el mapa de horarios seleccionados
  private sincronizarEsquemaHorarios(): void {
    this.esquema.horarios = Array.from(this.horariosSeleccionadosMap.values());
  }

  todosSeleccionados(): boolean {
    return this.horariosDisponibles.length > 0 && 
           this.horariosDisponibles.every(horario => this.isHorarioSeleccionado(horario));
  }

  ningunoSeleccionado(): boolean {
    return this.esquema.horarios.length === 0;
  }

  algunosSeleccionados(): boolean {
    return this.esquema.horarios.length > 0 && !this.todosSeleccionados();
  }

  toggleTodosSeleccionados() {
    if (this.todosSeleccionados()) {
      this.limpiarTodos();
    } else {
      this.seleccionarTodos();
    }
  }

  calcularDuracion(horaInicio: string, horaFin: string): string {
    const inicio = this.timeToMinutes(horaInicio);
    const fin = this.timeToMinutes(horaFin);
    const duracion = fin - inicio;
    
    if (duracion >= 60) {
      const horas = Math.floor(duracion / 60);
      const minutos = duracion % 60;
      return minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
    } else {
      return `${duracion}m`;
    }
  }

  calcularTiempoTotal(): number {
    return this.esquema.horarios.reduce((total, horario) => {
      const inicio = this.timeToMinutes(horario.horaInicio);
      const fin = this.timeToMinutes(horario.horaFin);
      return total + (fin - inicio);
    }, 0);
  }

  calcularTurnosEstimados(): number {
    const totalMinutos = this.calcularTiempoTotal();
    return Math.floor(totalMinutos / this.esquema.intervalo);
  }

  // Métodos para manejar horarios personalizables
  private getHorarioKey(horario: any): string {
    return `${horario.dia}-${horario.horaInicio}-${horario.horaFin}`;
  }

  getHorarioPersonalizado(horario: any, tipo: 'inicio' | 'fin'): string {
    const key = this.getHorarioKey(horario);
    if (this.horariosPersonalizados[key]) {
      return tipo === 'inicio' ? this.horariosPersonalizados[key].horaInicio : this.horariosPersonalizados[key].horaFin;
    }
    // Si no hay personalización, usar los valores originales
    return tipo === 'inicio' ? horario.horaInicio : horario.horaFin;
  }

  actualizarHorarioPersonalizado(horario: any, tipo: 'inicio' | 'fin', event: any): void {
    const key = this.getHorarioKey(horario);
    const nuevoValor = event.target.value;
    
    if (!this.horariosPersonalizados[key]) {
      this.horariosPersonalizados[key] = {
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      };
    }
    
    // Actualizar el valor correspondiente sin validaciones restrictivas
    if (tipo === 'inicio') {
      this.horariosPersonalizados[key].horaInicio = nuevoValor;
      
      // Solo asegurar que la hora de inicio no sea mayor o igual que la de fin
      if (this.timeToMinutes(nuevoValor) >= this.timeToMinutes(this.horariosPersonalizados[key].horaFin)) {
        // Ajustar la hora de fin para que sea al menos 30 minutos después
        const nuevaHoraFin = this.addMinutes(nuevoValor, 30);
        this.horariosPersonalizados[key].horaFin = nuevaHoraFin;
      }
    } else {
      this.horariosPersonalizados[key].horaFin = nuevoValor;
      
      // Solo asegurar que la hora de fin no sea menor o igual que la de inicio
      if (this.timeToMinutes(nuevoValor) <= this.timeToMinutes(this.horariosPersonalizados[key].horaInicio)) {
        // Ajustar la hora de inicio para que sea al menos 30 minutos antes
        const nuevaHoraInicio = this.subtractMinutes(nuevoValor, 30);
        this.horariosPersonalizados[key].horaInicio = nuevaHoraInicio;
      }
    }
    
    // Limpiar mensaje de error anterior
    this.limpiarErrorValidacion();
    
    // Actualizar el horario en el esquema si está seleccionado
    this.actualizarEsquemaConHorarioPersonalizado(horario);
  }

  private actualizarEsquemaConHorarioPersonalizado(horarioOriginal: any): void {
    const key = this.getHorarioKey(horarioOriginal);

    if (this.isHorarioSeleccionado(horarioOriginal)) {
      // Actualizar el horario en el mapa con los valores personalizados
      if (this.horariosPersonalizados[key]) {
        this.horariosSeleccionadosMap.set(key, {
          dia: horarioOriginal.dia,
          horaInicio: this.horariosPersonalizados[key].horaInicio,
          horaFin: this.horariosPersonalizados[key].horaFin
        });

        // Sincronizar con esquema.horarios
        this.sincronizarEsquemaHorarios();
      }
    }
  }

  private addMinutes(time: string, minutes: number): string {
    const totalMinutes = this.timeToMinutes(time) + minutes;
    return this.minutesToTime(totalMinutes);
  }

  private subtractMinutes(time: string, minutes: number): string {
    const totalMinutes = this.timeToMinutes(time) - minutes;
    return this.minutesToTime(totalMinutes);
  }

  // Métodos para manejo de errores de validación
  private limpiarErrorValidacion(): void {
    this.errorValidacion = '';
  }

  // Métodos para obtener información de horarios ocupados en otros consultorios
  getHorariosOcupadosEnOtrosConsultorios(dia: string): Array<{
    horaInicio: string,
    horaFin: string,
    medico: string,
    consultorio: string,
    medicoId: number
  }> {
    const horariosOcupados: Array<{
      horaInicio: string,
      horaFin: string,
      medico: string,
      consultorio: string,
      medicoId: number
    }> = [];

    for (const esquema of this.esquemasEnOtrosConsultorios) {
      for (const horario of esquema.horarios) {
        if (this.normalizarDia(horario.dia) === this.normalizarDia(dia)) {
          horariosOcupados.push({
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            medico: `${esquema.staffMedico?.medico?.nombre} ${esquema.staffMedico?.medico?.apellido}`,
            consultorio: esquema.consultorio?.nombre || 'Sin asignar',
            medicoId: esquema.staffMedicoId || 0
          });
        }
      }
    }

    return horariosOcupados.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  tieneHorariosOcupadosEnOtrosConsultorios(dia: string): boolean {
    return this.getHorariosOcupadosEnOtrosConsultorios(dia).length > 0;
  }

  /**
   * Verifica si un horario específico tiene conflicto con horarios ocupados en otros consultorios
   * Retorna información del conflicto si existe
   */
  getConflictoEnOtrosConsultorios(horario: any): {
    tieneConflicto: boolean,
    medico?: string,
    consultorio?: string,
    horarioConflictivo?: string,
    esElMismoMedico?: boolean
  } {
    const horariosOcupados = this.getHorariosOcupadosEnOtrosConsultorios(horario.dia);
    const inicioSeleccionado = this.timeToMinutes(horario.horaInicio);
    const finSeleccionado = this.timeToMinutes(horario.horaFin);

    for (const ocupado of horariosOcupados) {
      const inicioOcupado = this.timeToMinutes(ocupado.horaInicio);
      const finOcupado = this.timeToMinutes(ocupado.horaFin);

      // Verificar si hay solapamiento
      if (inicioSeleccionado < finOcupado && finSeleccionado > inicioOcupado) {
        return {
          tieneConflicto: true,
          medico: ocupado.medico,
          consultorio: ocupado.consultorio,
          horarioConflictivo: `${ocupado.horaInicio}-${ocupado.horaFin}`,
          esElMismoMedico: ocupado.medicoId === this.disponibilidadSeleccionada?.staffMedicoId
        };
      }
    }

    return { tieneConflicto: false };
  }

  // Métodos para verificar si los horarios están dentro del rango (sin bloquear)
  tieneHorariosInvalidos(): boolean {
    return this.esquema.horarios.some(horario => this.esHorarioInvalido(horario));
  }

  private esHorarioInvalido(horario: any): boolean {
    // Buscar el horario original disponible correspondiente
    // CORRECCIÓN: buscar por día Y rango de horas para manejar múltiples horarios del mismo día
    const minutosInicio = this.timeToMinutes(horario.horaInicio);
    const minutosFin = this.timeToMinutes(horario.horaFin);

    const horarioOriginal = this.horariosDisponibles.find(h =>
      this.normalizarDia(h.dia) === this.normalizarDia(horario.dia) &&
      this.timeToMinutes(h.horaInicio) <= minutosInicio &&
      this.timeToMinutes(h.horaFin) >= minutosFin
    );

    if (!horarioOriginal) return true;

    const minutosOriginalInicio = this.timeToMinutes(horarioOriginal.horaInicio);
    const minutosOriginalFin = this.timeToMinutes(horarioOriginal.horaFin);

    return minutosInicio < minutosOriginalInicio ||
           minutosFin > minutosOriginalFin ||
           minutosInicio >= minutosFin;
  }

  getHorariosInvalidos(): string[] {
    const invalidos = this.esquema.horarios
      .filter(horario => this.esHorarioInvalido(horario))
      .map(horario => {
        // CORRECCIÓN: buscar el horario disponible correcto para múltiples rangos del mismo día
        const minutosInicio = this.timeToMinutes(horario.horaInicio);
        const minutosFin = this.timeToMinutes(horario.horaFin);

        const horarioOriginal = this.horariosDisponibles.find(h =>
          this.normalizarDia(h.dia) === this.normalizarDia(horario.dia) &&
          this.timeToMinutes(h.horaInicio) <= minutosInicio &&
          this.timeToMinutes(h.horaFin) >= minutosFin
        );

        const rangoDisponible = horarioOriginal ? `${horarioOriginal.horaInicio}-${horarioOriginal.horaFin}` : 'N/A';
        return `${this.getDiaNombre(horario.dia)}: ${horario.horaInicio}-${horario.horaFin} (disponible: ${rangoDisponible})`;
      });

    return invalidos;
  }

  puedeGuardar(): boolean {
    return this.esquema.disponibilidadMedicoId > 0 &&
           this.esquema.horarios.length > 0 &&
           this.esquema.intervalo > 0 &&
           !this.tieneHorariosInvalidos();
  }

  guardarEsquema(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.puedeGuardar()) {
      this.mensajeError = 'Complete todos los campos requeridos y seleccione al menos un horario.';
      return;
    }

    // Verificar y asignar centroId si no está presente
    if (!this.esquema.centroId || this.esquema.centroId === 0) {
      this.esquema.centroId = this.centroId;
      console.log('🏥 Asignando centroId al esquema:', this.centroId);
    }

    console.log('🚀 Guardando esquema:', this.esquema);
    console.log('📍 Centro ID en esquema:', this.esquema.centroId);

    this.guardando = true;

    // El backend ahora maneja automáticamente la actualización si ya existe un esquema
    // con la misma disponibilidad, combinando los horarios
    this.esquemaTurnoService.create(this.esquema).subscribe({
      next: (response) => {
        this.guardando = false;
        this.mensajeExito = 'Esquema de turno guardado exitosamente';

        setTimeout(() => {
          this.activeModal.close(response.data);
        }, 1000);
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar el esquema:', error);
        this.mensajeError = error?.error?.message || error?.error?.status_text || 'Error al guardar el esquema de turno. Intente nuevamente.';
      }
    });
  }

  onCancel() {
    this.activeModal.dismiss();
  }
}
