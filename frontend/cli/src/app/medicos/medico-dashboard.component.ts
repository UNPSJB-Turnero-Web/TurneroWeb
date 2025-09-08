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
          <div class="action-card action-turnos" (click)="verTurnosHoy()">
            <div class="card-icon">
              <i class="fas fa-list-alt"></i>
            </div>
            <div class="card-content">
              <h3>Turnos de Hoy</h3>
              <p>Revisar agenda y citas del día</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          
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
          
          <div class="action-card action-historial" (click)="verHistorial()">
            <div class="card-icon">
              <i class="fas fa-history"></i>
            </div>
            <div class="card-content">
              <h3>Historial Médico</h3>
              <p>Ver historial de consultas pasadas</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
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
        <!-- Turnos de Hoy -->
        <div class="turnos-section">
          <div class="section-background"></div>
          <div class="section-header">
            <div class="section-title">
              <div class="title-icon">
                <i class="fas fa-calendar-day"></i>
              </div>
              <div class="title-content">
                <h2>Turnos de Hoy</h2>
                <p class="section-subtitle">{{ fechaHoy | date:'EEEE, dd MMMM yyyy' }}</p>
              </div>
            </div>
            <button class="btn-view-all" (click)="verTurnosHoy()">
              <span>Ver Todos</span>
              <i class="fas fa-external-link-alt"></i>
            </button>
          </div>

          <div class="turnos-container">
            <div *ngIf="turnosHoy.length === 0" class="empty-state">
              <div class="empty-illustration">
                <div class="empty-icon">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="empty-content">
                  <h3>No hay turnos programados para hoy</h3>
                  <p>Disfruta de tu día libre o revisa la configuración de horarios</p>
                </div>
              </div>
            </div>

            <div class="turnos-grid" *ngIf="turnosHoy.length > 0">
              <div class="turno-card" *ngFor="let turno of turnosHoy.slice(0, 4)" [class]="'status-' + (turno.estado || '').toLowerCase()">>
                <div class="turno-time">
                  <div class="time-circle">
                    <span class="hour">{{ turno.horaInicio }}</span>
                    <span class="duration">{{ turno.horaFin }}</span>
                  </div>
                </div>
                
                <div class="turno-info">
                  <div class="patient-name">{{ turno.nombrePaciente }} {{ turno.apellidoPaciente }}</div>
                  <div class="location-info">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    {{ turno.nombreCentro }} - {{ turno.consultorioNombre }}
                  </div>
                </div>
                
                <div class="turno-status">
                  <span class="status-badge" [class]="'status-' + (turno.estado || '').toLowerCase()">>
                    {{ turno.estado }}
                  </span>
                </div>
              </div>
            </div>

            <div *ngIf="turnosHoy.length > 4" class="more-turnos">
              <button class="btn-more" (click)="verTurnosHoy()">
                <span>Ver {{ turnosHoy.length - 4 }} turnos más</span>
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar - Información Adicional -->
        <div class="sidebar-section">
          <!-- Próximos Turnos -->
          <div class="sidebar-card">
            <div class="card-header">
              <div class="card-title">
                <i class="fas fa-clock me-2"></i>
                Próximos Turnos
              </div>
            </div>
            <div class="card-body">
              <div *ngIf="proximosTurnos.length === 0" class="no-data">
                <i class="fas fa-calendar-times"></i>
                <span>No hay turnos próximos</span>
              </div>
              <div *ngFor="let turno of proximosTurnos.slice(0, 3)" class="proximo-turno">
                <div class="turno-date">
                  <span class="day">{{ turno.fecha | date:'dd' }}</span>
                  <span class="month">{{ turno.fecha | date:'MMM' }}</span>
                </div>
                <div class="turno-details">
                  <div class="time">{{ turno.horaInicio }}</div>
                  <div class="patient">{{ turno.nombrePaciente }}</div>
                </div>
                <div class="turno-badge">
                  <span class="badge" [class]="'badge-' + (turno.estado || '').toLowerCase()">>
                    {{ turno.estado }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notificaciones -->
          <div class="sidebar-card">
            <div class="card-header">
              <div class="card-title">
                <i class="fas fa-bell me-2"></i>
                Notificaciones
              </div>
            </div>
            <div class="card-body">
              <div class="notification-item" *ngIf="stats.turnosPendientes > 0">
                <div class="notification-icon warning">
                  <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-title">Turnos Pendientes</div>
                  <div class="notification-text">{{ stats.turnosPendientes }} turnos por confirmar</div>
                </div>
              </div>
              
              <div class="notification-item" *ngIf="stats.turnosPendientes === 0">
                <div class="notification-icon success">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-title">Todo al día</div>
                  <div class="notification-text">No hay notificaciones pendientes</div>
                </div>
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

    /* Main Content */
    .main-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      position: relative;
      z-index: 10;
    }

    @media (max-width: 1200px) {
      .main-content {
        grid-template-columns: 1fr;
      }
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
  `]
})
export class MedicoDashboardComponent implements OnInit {
  medicoActual: Medico | null = null;
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

  ngOnInit() {
    this.cargarDatosMedico();
    this.cargarEstadisticas();
    this.cargarTurnosHoy();
    this.cargarProximosTurnos();
    this.cargarDisponibilidad();
  }

  private cargarDatosMedico() {
    // TODO: Obtener el médico actual desde la sesión/autenticación
    // Por ahora, simulamos que el médico tiene ID 1
    const medicoId = this.getMedicoIdFromSession();
    
    this.medicoService.findById(medicoId).subscribe({
      next: (medico) => {
        this.medicoActual = medico;
      },
      error: (error) => {
        console.error('Error al cargar datos del médico:', error);
      }
    });
  }

  private cargarEstadisticas() {
    const medicoId = this.getMedicoIdFromSession();
    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
    
    // Turnos de hoy
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaExacta: hoy
    }).subscribe(response => {
      this.stats.turnosHoy = response.data?.length || 0;
    });

    // Turnos de mañana
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaExacta: manana
    }).subscribe(response => {
      this.stats.turnosManana = response.data?.length || 0;
    });

    // Turnos de la semana
    const inicioSemana = this.getStartOfWeek(new Date()).toISOString().split('T')[0];
    const finSemana = this.getEndOfWeek(new Date()).toISOString().split('T')[0];
    
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaDesde: inicioSemana,
      fechaHasta: finSemana
    }).subscribe(response => {
      this.stats.turnosSemana = response.data?.length || 0;
    });

    // Turnos pendientes
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      estado: 'PROGRAMADO'
    }).subscribe(response => {
      this.stats.turnosPendientes = response.data?.length || 0;
    });
  }

  private cargarTurnosHoy() {
    const medicoId = this.getMedicoIdFromSession();
    const hoy = new Date().toISOString().split('T')[0];
    
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaExacta: hoy,
      sortBy: 'horaInicio'
    }).subscribe(response => {
      this.turnosHoy = response.data || [];
    });
  }

  private cargarProximosTurnos() {
    const medicoId = this.getMedicoIdFromSession();
    const manana = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
    
    this.turnoService.searchWithSimpleFilters({
      staffMedicoId: medicoId,
      fechaDesde: manana,
      sortBy: 'fecha',
      size: 10
    }).subscribe(response => {
      this.proximosTurnos = response.data || [];
    });
  }

  private cargarDisponibilidad() {
    const medicoId = this.getMedicoIdFromSession();
    
    this.disponibilidadService.byMedico(medicoId).subscribe({
      next: (response) => {
        this.disponibilidadActual = response.data;
      },
      error: (error) => {
        console.error('Error al cargar disponibilidad:', error);
      }
    });
  }

  // Navigation methods
  verTurnosHoy() {
    this.router.navigate(['/medico-turnos'], { queryParams: { fecha: new Date().toISOString().split('T')[0] } });
  }

  gestionarHorarios() {
    this.router.navigate(['/medico-horarios']);
  }

  verHistorial() {
    this.router.navigate(['/medico-historial']);
  }

  verEstadisticas() {
    this.router.navigate(['/medico-estadisticas']);
  }

  configurarPerfil() {
    this.router.navigate(['/medico-perfil']);
  }

  // Utility methods
  private getMedicoIdFromSession(): number {
    const medicoId = localStorage.getItem('medicoId');
    return medicoId ? parseInt(medicoId, 10) : 1;
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
}