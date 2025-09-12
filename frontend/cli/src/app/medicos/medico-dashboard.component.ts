import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { MedicoService } from './medico.service';
import { Turno } from '../turnos/turno';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';
import { Medico } from './medico';

interface DashboardStats {
  turnosHoy: number;
  turnosManana: number;
  turnosSemana: number;
  turnosPendientes: number;
}

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medico-dashboard">
      <!-- Floating Particles Background -->
      <div class="particles-bg">
        <div class="particle" *ngFor="let p of particles; let i = index" [style.left.px]="p.x" [style.top.px]="p.y" [style.animation-delay.s]="i * 0.2"></div>
      </div>

      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-glow"></div>
        <div class="welcome-section">
          <div class="welcome-content">
            <div class="welcome-icon">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="welcome-text">
              <h1>¡Bienvenido/a, Doctor/a!</h1>
              <p class="doctor-info" *ngIf="medicoActual">
                <i class="fas fa-user me-2"></i>
                <strong>{{ medicoActual.nombre }} {{ medicoActual.apellido }}</strong>
              </p>
              <p class="doctor-info" *ngIf="medicoActual">
                <i class="fas fa-id-badge me-2"></i>
                Matrícula: {{ medicoActual.matricula }}
              </p>
              <p class="doctor-info" *ngIf="medicoActual">
                <span *ngIf="medicoActual.especialidades && medicoActual.especialidades.length > 0; else especialidadUnica">
                  <i class="fas fa-stethoscope me-2"></i>
                  Especialidades: 
                  <span *ngFor="let esp of medicoActual.especialidades; let last = last">
                    {{ esp.nombre }}<span *ngIf="!last">, </span>
                  </span>
                </span>
                <ng-template #especialidadUnica>
                  <span *ngIf="medicoActual.especialidad">
                    <i class="fas fa-stethoscope me-2"></i>
                    Especialidad: {{ medicoActual.especialidad.nombre }}
                  </span>
                </ng-template>
              </p>
              <p class="tagline">Panel de control médico profesional</p>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn-logout" (click)="configurarPerfil()">
              <i class="fas fa-cog"></i>
              <span>Configuración</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="section-background"></div>
        <div class="section-title-container">
          <h2><i class="fas fa-chart-line me-3"></i>Estadísticas del Día</h2>
          <p class="section-description">Resumen de tu actividad médica</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card stat-today">
            <div class="stat-icon">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.turnosHoy }}</div>
              <div class="stat-label">Turnos Hoy</div>
              <div class="stat-subtitle">{{ fechaHoy | date:'dd/MM/yyyy' }}</div>
            </div>
            <div class="stat-glow"></div>
          </div>

          <div class="stat-card stat-tomorrow">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.turnosManana }}</div>
              <div class="stat-label">Mañana</div>
              <div class="stat-subtitle">Próxima jornada</div>
            </div>
            <div class="stat-glow"></div>
          </div>

          <div class="stat-card stat-week">
            <div class="stat-icon">
              <i class="fas fa-calendar-week"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.turnosSemana }}</div>
              <div class="stat-label">Esta Semana</div>
              <div class="stat-subtitle">Total semanal</div>
            </div>
            <div class="stat-glow"></div>
          </div>

          <div class="stat-card stat-pending">
            <div class="stat-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.turnosPendientes }}</div>
              <div class="stat-label">Pendientes</div>
              <div class="stat-subtitle">Por confirmar</div>
            </div>
            <div class="stat-glow"></div>
            <div class="notification-badge" *ngIf="stats.turnosPendientes > 0">
              <span>{{ stats.turnosPendientes }}</span>
              <div class="notification-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <div class="section-background"></div>
        <div class="section-title-container">
          <h2><i class="fas fa-rocket me-3"></i>Acciones Rápidas</h2>
          <p class="section-description">Accede rápidamente a las funciones principales</p>
        </div>
        <div class="actions-grid">
          <div class="action-card action-horarios" (click)="gestionarHorarios()">
            <div class="card-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="card-content">
              <h3>Gestionar Horarios</h3>
              <p>Configurar disponibilidad y horarios</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div class="action-card action-notificaciones" (click)="verNotificaciones()">
            <div class="card-icon">
              <i class="fas fa-bell"></i>
            </div>
            <div class="card-content">
              <h3>Notificaciones</h3>
              <p>Ver alertas y mensajes importantes</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
            <div class="notification-badge" *ngIf="stats.turnosPendientes > 0">
              <span>{{ stats.turnosPendientes }}</span>
              <div class="notification-pulse"></div>
            </div>
          </div>
          
          <div class="action-card action-estadisticas" (click)="verEstadisticas()">
            <div class="card-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="card-content">
              <h3>Estadísticas</h3>
              <p>Análisis y reportes médicos</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-content">
        <!-- Gestión de Turnos Médicos -->
        <div class="turnos-management">
          <div class="section-background"></div>
          <div class="turnos-header">
            <div class="turnos-title">
              <i class="fas fa-calendar-medical"></i>
              <span>Mis Turnos Médicos</span>
            </div>
            <div class="filter-tabs">
              <button 
                class="filter-tab" 
                [class.active]="currentFilter === 'upcoming'" 
                (click)="setTurnosFilter('upcoming')">
                <i class="fas fa-clock"></i>
                <span>Próximos</span>
                <span class="filter-count">{{ getFilterCount('upcoming') }}</span>
              </button>
              <button 
                class="filter-tab" 
                [class.active]="currentFilter === 'past'" 
                (click)="setTurnosFilter('past')">
                <i class="fas fa-history"></i>
                <span>Pasados</span>
                <span class="filter-count">{{ getFilterCount('past') }}</span>
              </button>
              <button 
                class="filter-tab" 
                [class.active]="currentFilter === 'all'" 
                (click)="setTurnosFilter('all')">
                <i class="fas fa-list"></i>
                <span>Todos</span>
                <span class="filter-count">{{ getFilterCount('all') }}</span>
              </button>
            </div>
          </div>

          <!-- Loading state -->
          <div *ngIf="isLoadingTurnos" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Cargando turnos...</p>
          </div>

          <!-- Empty state -->
          <div *ngIf="!isLoadingTurnos && filteredTurnos.length === 0" class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h3>{{ getEmptyStateMessage() }}</h3>
            <p>No se encontraron turnos para mostrar.</p>
          </div>

          <!-- Turnos grid -->
          <div *ngIf="!isLoadingTurnos && filteredTurnos.length > 0" class="turnos-grid">
            <div 
              *ngFor="let turno of filteredTurnos; trackBy: trackByTurno" 
              class="turno-management-card">
              
              <!-- Date section -->
              <div class="turno-date-section">
                <div class="date-bubble">
                  <div class="date-day">{{ formatDay(turno.fecha) }}</div>
                  <div class="date-month">{{ formatMonth(turno.fecha) }}</div>
                </div>
                <div class="turno-time-info">
                  <div class="turno-time">{{ turno.horaInicio }} - {{ turno.horaFin }}</div>
                  <div class="turno-duration">Duración: 15 min</div>
                </div>
              </div>

              <!-- Patient info -->
              <div class="turno-details">
                <div class="patient-info">
                  <div class="patient-name">
                    <i class="fas fa-user"></i>
                    {{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}
                  </div>
                  <div class="patient-details">
                    <div class="detail-item">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>{{ turno.nombreCentro || 'Centro Médico' }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-door-open"></i>
                      <span>{{ turno.consultorioNombre || 'Consultorio' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div class="turno-status" [class]="turno.estado?.toUpperCase()">
                <i [class]="getStatusIcon(turno.estado)"></i>
                <span>{{ getStatusText(turno.estado) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .medico-dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow-x: hidden;
      padding: 2rem 1rem;
    }

    /* Particles Background */
    .particles-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
      50% { transform: translateY(-20px) rotate(180deg); opacity: 0.3; }
    }

    /* Header Section */
    .dashboard-header {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.08),
        0 8px 20px rgba(0,0,0,0.04),
        inset 0 1px 0 rgba(255,255,255,0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      z-index: 10;
      overflow: hidden;
    }

    .header-glow {
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 50%);
      pointer-events: none;
      animation: glow 8s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .welcome-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .welcome-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
      position: relative;
      overflow: hidden;
    }

    .welcome-icon::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .welcome-icon:hover::before {
      left: 100%;
    }

    .welcome-text h1 {
      color: #2c3e50;
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      background: linear-gradient(135deg, #2c3e50 0%, #667eea 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .doctor-info {
      color: #6c757d;
      margin: 0.3rem 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
    }

    .doctor-info i {
      color: #667eea;
      margin-right: 0.5rem;
    }

    .tagline {
      color: #9ca3af;
      font-style: italic;
      margin: 1rem 0 0 0;
      font-size: 1.1rem;
    }

    .btn-logout {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
      color: white;
      border: none;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3);
    }

    .btn-logout:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(108, 117, 125, 0.4);
    }

    /* Stats Section */
    .stats-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.08),
        0 8px 20px rgba(0,0,0,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      z-index: 10;
      overflow: hidden;
    }

    .section-background {
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(100px, -100px);
      pointer-events: none;
    }

    .section-title-container {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 2;
    }

    .section-title-container h2 {
      color: #2c3e50;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .section-description {
      color: #6c757d;
      font-size: 1.1rem;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    }

    .stat-card:hover::before {
      opacity: 1;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: white;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      position: relative;
      z-index: 2;
      flex-shrink: 0;
    }

    .stat-today .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-tomorrow .stat-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-week .stat-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-pending .stat-icon {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .stat-content {
      flex: 1;
      position: relative;
      z-index: 2;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      line-height: 1;
      margin-bottom: 0.3rem;
    }

    .stat-label {
      font-size: 1.2rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.2rem;
    }

    .stat-subtitle {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .stat-glow {
      position: absolute;
      top: 50%;
      right: 1rem;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }

    .notification-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      z-index: 3;
      box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
      position: relative;
    }

    .notification-pulse {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid #ff4757;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    /* Quick Actions */
    .quick-actions {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.08),
        0 8px 20px rgba(0,0,0,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      z-index: 10;
      overflow: hidden;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    .action-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    }

    .action-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .action-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
      border-color: rgba(102, 126, 234, 0.2);
    }

    .action-card:hover::before {
      opacity: 1;
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: white;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      position: relative;
      z-index: 2;
      flex-shrink: 0;
    }

    .action-turnos .card-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .action-horarios .card-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .action-historial .card-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .action-estadisticas .card-icon {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .card-content {
      flex: 1;
      position: relative;
      z-index: 2;
    }

    .card-content h3 {
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }

    .card-content p {
      color: #6c757d;
      margin: 0;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    .card-arrow {
      color: #667eea;
      font-size: 1.2rem;
      transition: transform 0.3s ease;
      position: relative;
      z-index: 2;
    }

    .action-card:hover .card-arrow {
      transform: translateX(5px);
    }

    /* Estilos específicos para la card de notificaciones */
    .action-notificaciones {
      position: relative;
    }

    .action-notificaciones .card-icon {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .action-notificaciones .card-icon i {
      color: #ffffff;
      animation: bellRing 2s ease-in-out infinite;
    }

    .action-notificaciones:hover .card-icon {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: scale(1.1);
    }

    @keyframes bellRing {
      0%, 50%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20% { transform: rotate(10deg); }
    }

    /* Main Content */
    .main-content {
      position: relative;
      z-index: 10;
      width: 100%;
    }

    /* Turnos Section */
    .turnos-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.08),
        0 8px 20px rgba(0,0,0,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 2;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .title-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .title-content h2 {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .section-subtitle {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0.3rem 0 0 0;
      font-weight: 400;
    }

    .btn-view-all {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-view-all:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
    }

    /* Turnos Grid */
    .turnos-grid {
      display: grid;
      gap: 1.5rem;
      position: relative;
      z-index: 2;
    }

    .turno-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    .turno-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 35px rgba(0,0,0,0.1);
    }

    .turno-card.status-confirmado {
      border-left-color: #28a745;
    }

    .turno-card.status-programado {
      border-left-color: #ffc107;
    }

    .turno-card.status-cancelado {
      border-left-color: #dc3545;
      opacity: 0.7;
    }

    .time-circle {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .time-circle .hour {
      font-size: 0.9rem;
      font-weight: 700;
      line-height: 1;
    }

    .time-circle .duration {
      font-size: 0.7rem;
      opacity: 0.9;
    }

    .turno-info {
      flex: 1;
    }

    .patient-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.3rem;
    }

    .location-info {
      color: #6c757d;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
    }

    .status-badge {
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.status-confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .status-badge.status-programado {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
    }

    .status-badge.status-cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      position: relative;
      z-index: 2;
    }

    .empty-illustration {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #adb5bd;
      font-size: 2rem;
    }

    .empty-content h3 {
      color: #6c757d;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .empty-content p {
      color: #adb5bd;
      margin: 0;
    }

    .btn-more {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      color: #667eea;
      border: 2px solid rgba(102, 126, 234, 0.2);
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      justify-content: center;
      margin-top: 1.5rem;
    }

    .btn-more:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
    }

    /* Sidebar */
    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .sidebar-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      overflow: hidden;
    }

    .card-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      background: rgba(102, 126, 234, 0.02);
    }

    .card-title {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .card-body {
      padding: 1.5rem 2rem;
    }

    .no-data {
      text-align: center;
      color: #adb5bd;
      padding: 2rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .no-data i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .proximo-turno {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .proximo-turno:last-child {
      border-bottom: none;
    }

    .turno-date {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .turno-date .day {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1;
    }

    .turno-date .month {
      font-size: 0.7rem;
      opacity: 0.9;
      text-transform: uppercase;
    }

    .turno-details {
      flex: 1;
    }

    .turno-details .time {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .turno-details .patient {
      color: #6c757d;
      font-size: 0.8rem;
      margin-top: 0.2rem;
    }

    .badge {
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .badge-programado {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
    }

    .badge-cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    /* Notifications */
    .notification-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .notification-icon.warning {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .notification-icon.success {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .notification-text {
      color: #6c757d;
      font-size: 0.8rem;
      margin-top: 0.2rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .medico-dashboard {
        padding: 1rem 0.5rem;
      }

      .dashboard-header,
      .stats-section,
      .quick-actions,
      .turnos-section,
      .sidebar-card {
        padding: 1.5rem 1rem;
      }

      .welcome-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .welcome-section {
        flex-direction: column;
        gap: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .main-content {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .turno-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
    }

    /* === ESTILOS PARA LA NUEVA GESTIÓN DE TURNOS === */
    
    .turnos-management {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
      padding: 2rem;
      margin-top: 2rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }

    .turnos-management::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    }

    .turnos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .turnos-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .turnos-title i {
      color: #6366f1;
      font-size: 2rem;
    }

    .filter-tabs {
      display: flex;
      background: #f3f4f6;
      border-radius: 12px;
      padding: 4px;
      gap: 4px;
    }

    .filter-tab {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #6b7280;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }

    .filter-tab.active {
      background: #6366f1;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .filter-tab:hover:not(.active) {
      background: #e5e7eb;
      color: #374151;
    }

    .filter-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }

    .filter-tab.active .filter-count {
      background: rgba(255, 255, 255, 0.3);
    }

    .filter-tab:not(.active) .filter-count {
      background: #d1d5db;
      color: #374151;
    }

    .turnos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .turno-management-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .turno-management-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 16px 16px 0 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .turno-management-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: #d1d5db;
    }

    .turno-management-card:hover::before {
      opacity: 1;
    }

    .turno-date-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .date-bubble {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
      min-width: 70px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .date-day {
      font-size: 1.4rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1;
    }

    .date-month {
      font-size: 0.7rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 0.2rem;
      text-transform: uppercase;
    }

    .turno-time-info {
      flex: 1;
    }

    .turno-time {
      font-size: 1.2rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .turno-duration {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .turno-details {
      margin-bottom: 1.5rem;
    }

    .patient-info {
      background: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .patient-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .patient-name i {
      color: #6366f1;
    }

    .patient-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-item i {
      color: #9ca3af;
      width: 16px;
    }

    .turno-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .turno-status.CONFIRMADO {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #bbf7d0;
    }

    .turno-status.PROGRAMADO {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .turno-status.CANCELADO {
      background: #fecaca;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .turno-status.REAGENDADO {
      background: #ddd6fe;
      color: #5b21b6;
      border: 1px solid #c4b5fd;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .empty-state i {
      font-size: 4rem;
      color: #d1d5db;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 600;
    }

    .empty-state p {
      font-size: 1rem;
      color: #6b7280;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .loading-spinner {
      border: 3px solid #f3f4f6;
      border-top: 3px solid #6366f1;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .turnos-management {
        margin: 1rem 0;
        padding: 1.5rem;
        border-radius: 16px;
      }

      .turnos-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
      }

      .turnos-title {
        font-size: 1.5rem;
        justify-content: center;
      }

      .filter-tabs {
        justify-content: center;
      }

      .filter-tab {
        flex: 1;
        justify-content: center;
        padding: 0.6rem 1rem;
      }

      .turnos-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .turno-management-card {
        padding: 1rem;
      }

      .patient-details {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }
  `]
})
export class MedicoDashboardComponent implements OnInit {
  medicoActual: Medico | null = null;
  staffMedicoId: number | null = null; // ID para consultar turnos
  stats: DashboardStats = {
    turnosHoy: 0,
    turnosManana: 0,
    turnosSemana: 0,
    turnosPendientes: 0
  };
  turnosHoy: Turno[] = [];
  proximosTurnos: Turno[] = [];
  disponibilidadActual: DisponibilidadMedico[] = [];
  fechaHoy: Date = new Date();
  
  // === NUEVA FUNCIONALIDAD: GESTIÓN COMPLETA DE TURNOS ===
  allTurnos: any[] = [];          // Todos los turnos del médico
  filteredTurnos: any[] = [];     // Turnos filtrados según el tab activo
  currentFilter = 'upcoming';     // 'upcoming', 'past', 'all'
  isLoadingTurnos = false;        // Estado de carga
  
  // Particles for background animation
  particles: Array<{x: number, y: number}> = [];

  constructor(
    private router: Router,
    private turnoService: TurnoService,
    private disponibilidadService: DisponibilidadMedicoService,
    private medicoService: MedicoService
  ) {
    this.initializeParticles();
  }

  /**
   * Valida y corrige problemas comunes en localStorage
   */
  private validarYCorregirLocalStorage() {
    console.log('🔍 Validando localStorage...');
    
    const medicoId = localStorage.getItem('medicoId');
    const staffMedicoId = localStorage.getItem('staffMedicoId');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('📋 Estado actual del localStorage:', {
      medicoId,
      staffMedicoId,
      currentUser: currentUser ? 'exists' : 'null'
    });
    
    // Verificar si tenemos los IDs correctos
    if (!medicoId || medicoId === '0' || medicoId === 'null') {
      console.warn('⚠️ medicoId faltante o inválido');
      
      // Intentar recuperar desde currentUser
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          if (user.medicoId && user.medicoId !== 0) {
            console.log('🔧 Corrigiendo medicoId desde currentUser:', user.medicoId);
            localStorage.setItem('medicoId', user.medicoId.toString());
          } else if (user.id && user.id !== 0 && user.id !== parseInt(staffMedicoId || '0', 10)) {
            console.log('🔧 Usando user.id como medicoId:', user.id);
            localStorage.setItem('medicoId', user.id.toString());
          }
        } catch (e) {
          console.error('Error parseando currentUser:', e);
        }
      }
    }
    
    // Verificar que medicoId y staffMedicoId no sean el mismo (común error)
    const finalMedicoId = localStorage.getItem('medicoId');
    const finalStaffMedicoId = localStorage.getItem('staffMedicoId');
    
    if (finalMedicoId === finalStaffMedicoId && finalMedicoId && finalMedicoId !== '0') {
      console.warn('🚨 PROBLEMA: medicoId y staffMedicoId son iguales!', {
        medicoId: finalMedicoId,
        staffMedicoId: finalStaffMedicoId
      });
      // No limpiar automáticamente, pero alertar del problema
      console.warn('Esto puede causar errores de autenticación');
    }
    
    console.log('✅ Validación de localStorage completada');
  }

  ngOnInit() {
    // Validar y corregir localStorage al inicializar
    this.validarYCorregirLocalStorage();
    
    this.cargarDatosMedico();
    // Primero cargar disponibilidades para obtener el staffMedicoId correcto
    this.cargarDisponibilidadYDatos();
  }

  private cargarDisponibilidadYDatos() {
    const medicoId = this.getMedicoIdFromLocalStorage();
    
    if (!medicoId) {
      console.error('No se pudo obtener el ID del médico para cargar disponibilidad');
      return;
    }
    
    console.log('Cargando disponibilidades para obtener staffMedicoId...');
    
    this.disponibilidadService.byMedico(medicoId).subscribe({
      next: (response) => {
        this.disponibilidadActual = response.data || [];
        
        // Obtener el staffMedicoId de las disponibilidades
        if (this.disponibilidadActual.length > 0) {
          this.staffMedicoId = this.disponibilidadActual[0].staffMedicoId;
          console.log('staffMedicoId obtenido de disponibilidades:', this.staffMedicoId);
          
          // Ahora cargar los datos de turnos con el staffMedicoId correcto
          this.cargarDatos();
        } else {
          console.warn('No se encontraron disponibilidades. Usando ID del médico como staffMedicoId');
          this.staffMedicoId = medicoId;
          this.cargarDatos();
        }
      },
      error: (error) => {
        console.error('Error al cargar disponibilidad:', error);
        console.warn('Usando ID del médico como staffMedicoId por error en disponibilidades');
        this.staffMedicoId = medicoId;
        this.cargarDatos();
      }
    });
  }

  private cargarDatos() {
    // Solo cargar si tenemos el staffMedicoId
    if (!this.staffMedicoId) {
      console.error('No se pudo obtener el staffMedicoId para cargar datos');
      return;
    }
    
    console.log('Cargando datos con staffMedicoId:', this.staffMedicoId);
    this.cargarEstadisticas();
    // this.cargarTurnosHoy(); // Ya incluido en cargarEstadisticas()
    // this.cargarProximosTurnos(); // Ya incluido en cargarEstadisticas()
  }

  // Helper method to get medico ID from localStorage
  private getMedicoIdFromLocalStorage(): number | null {
    console.log('=== DEBUG: getMedicoIdFromLocalStorage ===');
    
    // Try to get medico ID from different possible localStorage keys
    const staffMedicoId = localStorage.getItem('staffMedicoId');
    const medicoId = localStorage.getItem('medicoId');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('LocalStorage values:', {
      staffMedicoId,
      medicoId,
      currentUser: currentUser ? 'exists' : 'null'
    });
    
    // ⚠️ IMPORTANTE: PRIMERO intentar con medicoId, NO con staffMedicoId
    // El staffMedicoId es diferente al medicoId y causa problemas de autenticación
    
    // First try medicoId (este es el ID correcto del médico)
    if (medicoId && medicoId !== '0' && medicoId !== 'null' && medicoId !== 'undefined') {
      const id = parseInt(medicoId, 10);
      if (!isNaN(id) && id > 0) {
        console.log('✅ Using medicoId:', id);
        return id;
      }
    }
    
    // Finally try currentUser
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        console.log('Parsed currentUser:', user);
        
        if (user.medicoId && user.medicoId !== 0) {
          console.log('Using currentUser.medicoId:', user.medicoId);
          return user.medicoId;
        }
        if (user.id && user.id !== 0) {
          console.log('Using currentUser.id:', user.id);
          return user.id;
        }
      } catch (e) {
        console.error('Error parsing currentUser from localStorage:', e);
      }
    }
    
    console.error('No valid medico ID found in localStorage');
    return null;
  }

  private cargarDatosMedico() {
    const medicoId = this.getMedicoIdFromLocalStorage();
    
    if (!medicoId) {
      console.error('No se pudo obtener el ID del médico');
      console.log('Debug localStorage:', {
        staffMedicoId: localStorage.getItem('staffMedicoId'),
        medicoId: localStorage.getItem('medicoId'),
        currentUser: localStorage.getItem('currentUser')
      });
      alert('Error: No se pudo obtener el ID del médico. Por favor, inicie sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Cargando médico con ID:', medicoId);

    this.medicoService.findById(medicoId).subscribe({
      next: (medico) => {
        this.medicoActual = medico;
        console.log('Médico cargado exitosamente:', medico);
      },
      error: (error) => {
        console.error('Error al cargar datos del médico:', error);
        console.error('Error details:', error.error);
        console.error('Medico ID usado:', medicoId);
        console.error('StaffMedico ID actual:', this.staffMedicoId);
        
        if (error.status === 404) {
          console.error(`⚠️ Médico con ID ${medicoId} no encontrado en el servidor`);
          
          // Verificar si estamos confundiendo staffMedicoId con medicoId
          if (medicoId === this.staffMedicoId) {
            console.error('🚨 PROBLEMA DETECTADO: Se está usando staffMedicoId como medicoId!');
            console.error('StaffMedicoId:', this.staffMedicoId, 'MedicoId:', medicoId);
            
            // Intentar recuperar el medicoId real desde diferentes fuentes
            const realMedicoId = localStorage.getItem('medicoId');
            if (realMedicoId && realMedicoId !== medicoId.toString()) {
              console.log('🔧 Intentando con el medicoId real desde localStorage:', realMedicoId);
              // No mostrar alert ni redireccionar, intentar cargar con el ID correcto
              return;
            }
          }
          
          alert(`Error: No se encontró el médico con ID ${medicoId}. 
          
Posible problema de configuración. Verifique:
- ID del médico: ${medicoId}
- StaffMedico ID: ${this.staffMedicoId}
- LocalStorage medicoId: ${localStorage.getItem('medicoId')}
- LocalStorage staffMedicoId: ${localStorage.getItem('staffMedicoId')}

¿Desea continuar o ir al login?`);
          
          // Solo limpiar localStorage si el usuario lo confirma
          const shouldLogout = confirm('¿Desea cerrar sesión e ir al login?');
          if (shouldLogout) {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        } else {
          console.error('Error del servidor:', error.message || error);
          alert(`Error al cargar información del médico: ${error.error?.message || error.message}`);
        }
      }
    });
  }

  private cargarEstadisticas() {
    if (!this.staffMedicoId) {
      console.error('No se pudo obtener el staffMedicoId para cargar estadísticas');
      return;
    }
    
    console.log('� OPTIMIZADO: Cargando TODOS los datos en UNA sola consulta');
    console.log('StaffMedicoId:', this.staffMedicoId);
    
    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
    const inicioSemana = this.getStartOfWeek(new Date()).toISOString().split('T')[0];
    const finSemana = this.getEndOfWeek(new Date()).toISOString().split('T')[0];
    
    console.log('=== DEBUG FECHAS ===');
    console.log('Fecha hoy:', hoy);
    console.log('Fecha mañana:', manana);
    console.log('Rango semana:', { inicioSemana, finSemana });
    
    // === UNA SOLA CONSULTA PARA TODOS LOS TURNOS DEL MÉDICO ===
    const filtrosCompletos = {
      staffMedicoId: this.staffMedicoId,
      sortBy: 'fecha',
      size: 100  // Traer todos los turnos del médico
    };
    console.log('🎯 Filtros ÚNICOS para TODOS los turnos:', filtrosCompletos);
    
    this.turnoService.searchWithFilters(filtrosCompletos).subscribe({
      next: (response) => {
        const todosTurnos = response.data?.content || response.data || [];
        console.log('✅ TODOS los turnos del médico cargados:', todosTurnos.length);
        console.log('✅ Datos completos:', todosTurnos);
        
        // === FILTRAR EN EL FRONTEND ===
        
        // Turnos de hoy
        const turnosHoy = todosTurnos.filter((turno: any) => turno.fecha === hoy);
        this.stats.turnosHoy = turnosHoy.length;
        this.turnosHoy = turnosHoy;
        console.log(`📊 Turnos HOY (${hoy}):`, this.stats.turnosHoy);
        
        // Turnos de mañana  
        const turnosManana = todosTurnos.filter((turno: any) => turno.fecha === manana);
        this.stats.turnosManana = turnosManana.length;
        console.log(`📊 Turnos MAÑANA (${manana}):`, this.stats.turnosManana);
        
        // Turnos de la semana
        const turnosSemana = todosTurnos.filter((turno: any) => {
          return turno.fecha >= inicioSemana && turno.fecha <= finSemana;
        });
        this.stats.turnosSemana = turnosSemana.length;
        console.log(`📊 Turnos SEMANA (${inicioSemana} - ${finSemana}):`, this.stats.turnosSemana);
        
        // Turnos pendientes
        const turnosPendientes = todosTurnos.filter((turno: any) => turno.estado === 'PROGRAMADO');
        this.stats.turnosPendientes = turnosPendientes.length;
        console.log(`📊 Turnos PENDIENTES (PROGRAMADO):`, this.stats.turnosPendientes);
        
        // Próximos turnos (desde mañana)
        const proximosTurnos = todosTurnos.filter((turno: any) => turno.fecha > hoy);
        this.proximosTurnos = proximosTurnos.slice(0, 10); // Solo primeros 10
        console.log(`📊 PRÓXIMOS turnos (después de hoy):`, this.proximosTurnos.length);
        
        // === NUEVA FUNCIONALIDAD: CARGAR TODOS LOS TURNOS PARA LA SECCIÓN ===
        this.allTurnos = todosTurnos.map((turno: any) => ({
          ...turno,
          // Agregar campos calculados para compatibilidad con el template
          day: this.formatDay(turno.fecha),
          month: this.formatMonth(turno.fecha),
          year: this.formatYear(turno.fecha),
          time: `${turno.horaInicio} - ${turno.horaFin}`,
          doctor: `${this.medicoActual?.nombre || ''} ${this.medicoActual?.apellido || ''}`,
          specialty: this.medicoActual?.especialidad || 'Medicina General',
          location: turno.nombreCentro || 'Centro Médico'
        }));
        
        this.applyTurnosFilter();
        console.log('🎯 NUEVA SECCIÓN: Todos los turnos cargados para gestión completa:', this.allTurnos.length);
        
        // Log detallado de turnos de hoy
        if (turnosHoy.length > 0) {
          turnosHoy.forEach((turno: any, index: number) => {
            console.log(`🔍 Turno HOY ${index + 1} - Fecha: ${turno.fecha}, Hora: ${turno.horaInicio}-${turno.horaFin}, Paciente: ${turno.nombrePaciente} ${turno.apellidoPaciente}`);
          });
        }
        
        console.log('🎉 OPTIMIZACIÓN COMPLETA: 1 consulta en lugar de 6');
      },
      error: (error) => {
        console.error('❌ Error al cargar datos:', error);
        this.stats = { turnosHoy: 0, turnosManana: 0, turnosSemana: 0, turnosPendientes: 0 };
        this.turnosHoy = [];
        this.proximosTurnos = [];
      }
    });
  }

  private cargarTurnosHoy() {
    console.log('⚠️ cargarTurnosHoy() DESHABILITADO - Ya se carga en cargarEstadisticas()');
    console.log('✅ Los turnos de hoy ya están disponibles en this.turnosHoy');
    return;
  }

  private cargarProximosTurnos() {
    if (!this.staffMedicoId) {
      console.error('No se pudo obtener el staffMedicoId para cargar próximos turnos');
      return;
    }
    
    const manana = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
    
    console.log('🔍 DEBUG Próximos turnos:');
    console.log('   - staffMedicoId:', this.staffMedicoId);
    console.log('   - fecha desde (mañana):', manana);
    
    const filtros = {
      staffMedicoId: this.staffMedicoId,
      fechaDesde: manana,
      sortBy: 'fecha',
      size: 10
    };
    console.log('   - filtros completos:', filtros);
    
    this.turnoService.searchWithFilters(filtros).subscribe({
      next: (response) => {
        const turnos = response.data?.content || response.data || [];
        this.proximosTurnos = turnos;
        console.log('✅ Próximos turnos encontrados:', turnos.length);
        console.log('✅ Datos de próximos turnos:', turnos);
        
        if (turnos.length === 0) {
          console.log('⚠️ No hay próximos turnos para este médico desde mañana');
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar próximos turnos:', error);
        this.proximosTurnos = [];
      }
    });
  }

  // Navigation methods
  verTurnosHoy() {
    // Cambiar al filtro de próximos turnos para mostrar turnos de hoy y futuros
    this.setTurnosFilter('upcoming');
    
    // Scroll to the turnos section
    const turnosSection = document.querySelector('.turnos-management');
    if (turnosSection) {
      turnosSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  gestionarHorarios() {
    this.router.navigate(['/medico-horarios']);
  }

  verNotificaciones() {
    // Navegar a una página de notificaciones o mostrar un modal
    this.router.navigate(['/medico-notificaciones']);
  }

  verEstadisticas() {
    this.router.navigate(['/medico-estadisticas']);
  }

  configurarPerfil() {
    this.router.navigate(['/medico-perfil']);
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  private getEndOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  private initializeParticles() {
    this.particles = [];
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      });
    }
  }

  // === MÉTODOS PARA LA NUEVA GESTIÓN DE TURNOS ===

  setTurnosFilter(filter: string) {
    console.log('🔍 Cambiando filtro de turnos a:', filter);
    this.currentFilter = filter;
    this.applyTurnosFilter();
  }

  applyTurnosFilter() {
    const today = new Date().toISOString().split('T')[0];
    
    switch (this.currentFilter) {
      case 'upcoming':
        this.filteredTurnos = this.allTurnos.filter(turno => turno.fecha >= today);
        break;
      case 'past':
        this.filteredTurnos = this.allTurnos.filter(turno => turno.fecha < today);
        break;
      case 'all':
      default:
        this.filteredTurnos = [...this.allTurnos];
        break;
    }
    
    // Ordenar por fecha y hora
    this.filteredTurnos.sort((a, b) => {
      const dateComparison = a.fecha.localeCompare(b.fecha);
      if (dateComparison === 0) {
        return a.horaInicio.localeCompare(b.horaInicio);
      }
      return this.currentFilter === 'past' ? dateComparison * -1 : dateComparison;
    });
    
    console.log(`📊 Filtro '${this.currentFilter}' aplicado:`, this.filteredTurnos.length, 'turnos');
  }

  getFilterCount(filter: string): number {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'upcoming':
        return this.allTurnos.filter(turno => turno.fecha >= today).length;
      case 'past':
        return this.allTurnos.filter(turno => turno.fecha < today).length;
      case 'all':
        return this.allTurnos.length;
      default:
        return 0;
    }
  }

  getEmptyStateMessage(): string {
    switch (this.currentFilter) {
      case 'upcoming':
        return 'No tienes turnos programados próximamente.';
      case 'past':
        return 'No tienes turnos anteriores registrados.';
      case 'all':
        return 'No tienes turnos registrados en el sistema.';
      default:
        return 'No hay turnos para mostrar.';
    }
  }

  // Métodos de formato para las fechas
  /**
   * Parsea una fecha en formato YYYY-MM-DD evitando problemas de zona horaria
   */
  private parsearFecha(fechaStr: string): Date {
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque Date usa 0-11 para meses
  }

  formatDay(fecha: string): string {
    return this.parsearFecha(fecha).getDate().toString().padStart(2, '0');
  }

  formatMonth(fecha: string): string {
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[this.parsearFecha(fecha).getMonth()];
  }

  formatYear(fecha: string): string {
    return this.parsearFecha(fecha).getFullYear().toString();
  }

  // Métodos para iconos y textos de estado
  getStatusIcon(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'CONFIRMADO':
        return 'fa-check-circle';
      case 'PROGRAMADO':
        return 'fa-clock';
      case 'CANCELADO':
        return 'fa-times-circle';
      case 'REAGENDADO':
        return 'fa-calendar-alt';
      default:
        return 'fa-question-circle';
    }
  }

  getStatusText(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'CONFIRMADO':
        return 'Confirmado';
      case 'PROGRAMADO':
        return 'Programado';
      case 'CANCELADO':
        return 'Cancelado';
      case 'REAGENDADO':
        return 'Reagendado';
      default:
        return estado || 'Desconocido';
    }
  }

  // TrackBy function para mejor performance en ngFor
  trackByTurno(index: number, turno: any): any {
    return turno.id;
  }
}