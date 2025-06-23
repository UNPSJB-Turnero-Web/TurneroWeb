import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnoService } from '../turnos/turno.service';
import { Turno } from '../turnos/turno';
import { DataPackage } from '../data.package';
import { NotificacionService } from '../services/notificacion.service';

@Component({
  selector: 'app-paciente-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="patient-dashboard">
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
              <i class="fas fa-heartbeat"></i>
            </div>
            <div class="welcome-text">
              <h1>¡Bienvenido/a a tu Portal de Salud!</h1>
              <p class="patient-info">
                <i class="fas fa-id-card me-2"></i>
                DNI: {{ patientDNI }}
              </p>
              <p class="tagline">Gestiona tu salud de manera inteligente</p>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn-logout" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              <span>Cerrar Sesión</span>
            </button>
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
          <div class="action-card action-agenda" (click)="viewAgenda()">
            <div class="card-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="card-content">
              <h3>Agenda de turnos</h3>
              <p>Ver horarios disponibles y solicitar citas</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div class="action-card action-profile" (click)="viewProfile()">
            <div class="card-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="card-content">
              <h3>Mi Perfil</h3>
              <p>Ver y actualizar información personal</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div class="action-card action-notifications" (click)="viewNotifications()">
            <div class="card-icon">
              <i class="fas fa-bell"></i>
            </div>
            <div class="card-content">
              <h3>Notificaciones</h3>
              <p>Ver mensajes y alertas del sistema</p>
            </div>
            <div class="notification-badge" *ngIf="contadorNotificaciones > 0">
              <span>{{contadorNotificaciones}}</span>
              <div class="notification-pulse"></div>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
          
          
        </div>
      </div>

      <!-- Mis Turnos -->
      <div class="my-appointments">
        <div class="appointments-background"></div>
        <div class="section-header">
          <div class="section-title">
            <div class="title-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="title-content">
              <h2>Mis Turnos Médicos</h2>
              <p class="section-subtitle">Gestiona tus citas médicas de forma inteligente</p>
            </div>
          </div>
          <button class="btn-schedule-appointment" (click)="scheduleAppointment()">
            <div class="btn-icon">
              <i class="fas fa-plus"></i>
            </div>
            <span>Solicitar Turno</span>
            <div class="btn-shine"></div>
          </button>
        </div>
        
        <!-- Filtros Mejorados -->
        <div class="filter-container">
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              [class.active]="currentFilter === 'upcoming'"
              (click)="setFilter('upcoming')"
            >
              <div class="tab-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="tab-content">
                <span class="tab-label">Próximos</span>
                <span class="tab-count" *ngIf="getFilterCount('upcoming') > 0">{{getFilterCount('upcoming')}}</span>
              </div>
              <div class="tab-indicator"></div>
            </button>
            <button 
              class="filter-tab" 
              [class.active]="currentFilter === 'past'"
              (click)="setFilter('past')"
            >
              <div class="tab-icon">
                <i class="fas fa-history"></i>
              </div>
              <div class="tab-content">
                <span class="tab-label">Pasados</span>
                <span class="tab-count" *ngIf="getFilterCount('past') > 0">{{getFilterCount('past')}}</span>
              </div>
              <div class="tab-indicator"></div>
            </button>
            <button 
              class="filter-tab" 
              [class.active]="currentFilter === 'all'"
              (click)="setFilter('all')"
            >
              <div class="tab-icon">
                <i class="fas fa-list"></i>
              </div>
              <div class="tab-content">
                <span class="tab-label">Todos</span>
                <span class="tab-count">{{allTurnos.length}}</span>
              </div>
              <div class="tab-indicator"></div>
            </button>
          </div>
        </div>
        
        <!-- Loading state -->
        <div class="loading-container" *ngIf="isLoadingTurnos">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Cargando turnos...</p>
          </div>
        </div>
        
        <!-- Appointments grid -->
        <div class="appointments-grid" *ngIf="!isLoadingTurnos && filteredTurnos.length > 0">
          <div class="appointment-card" 
               *ngFor="let turno of filteredTurnos; trackBy: trackByTurno" 
               [class]="'status-' + turno.status">
            
            <!-- Card Header -->
            <div class="card-header">
              <div class="date-container">
                <div class="date-circle">
                  <span class="day">{{ turno.day }}</span>
                  <span class="month">{{ turno.month }}</span>
                </div>
                <div class="year-time">
                  <span class="year">{{ turno.year }}</span>
                  <span class="time">
                    <i class="fas fa-clock me-1"></i>
                    {{ turno.time }}
                  </span>
                </div>
              </div>
              
              <div class="status-badge" [class]="'status-' + turno.status">
                <i class="fas" [class]="getStatusIcon(turno.status)"></i>
                <span>{{ getStatusText(turno.status) }}</span>
              </div>
            </div>
            
            <!-- Card Body -->
            <div class="card-body">
              <div class="doctor-section">
                <div class="doctor-avatar">
                  <i class="fas fa-user-md"></i>
                </div>
                <div class="doctor-info">
                  <h4 class="doctor-name">{{ turno.doctor }}</h4>
                  <p class="specialty">
                    <i class="fas fa-stethoscope me-1"></i>
                    {{ turno.specialty }}
                  </p>
                </div>
              </div>
              
              <div class="location-info">
                <i class="fas fa-map-marker-alt me-2"></i>
                <span>{{ turno.location }}</span>
              </div>
            </div>
            
            <!-- Card Actions -->
            <div class="card-actions" *ngIf="canPerformActions(turno)">
              <button class="action-btn confirm-btn" 
                      *ngIf="canConfirm(turno)"
                      (click)="confirmarTurno(turno)"
                      title="Confirmar turno">
                <i class="fas fa-check"></i>
                <span>Confirmar</span>
              </button>
              
              <button class="action-btn reschedule-btn" 
                      *ngIf="canReschedule(turno)"
                      (click)="reprogramarTurno(turno)"
                      title="Reagendar turno">
                <i class="fas fa-calendar-alt"></i>
                <span>Reagendar</span>
              </button>
              
              <button class="action-btn cancel-btn" 
                      *ngIf="canCancel(turno)"
                      (click)="cancelarTurno(turno)"
                      title="Cancelar turno">
                <i class="fas fa-times"></i>
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div class="empty-state" *ngIf="!isLoadingTurnos && filteredTurnos.length === 0">
          <div class="empty-illustration">
            <div class="empty-icon">
              <i class="fas fa-calendar-times"></i>
            </div>
            <div class="empty-content">
              <h3>No tienes turnos {{ getEmptyStateText() }}</h3>
              <p>{{ getEmptyStateDescription() }}</p>
              <button class="btn btn-primary btn-lg" 
                      (click)="scheduleAppointment()" 
                      *ngIf="currentFilter === 'upcoming' || currentFilter === 'all'">
                <i class="fas fa-plus me-2"></i>
                Solicitar mi primer turno
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for Cancel -->
      <div class="modal" *ngIf="showReasonModal">
        <div class="modal-content">
          <span class="close" (click)="closeModal()" [style.display]="isSubmitting ? 'none' : 'block'">&times;</span>
          <h2>Cancelar Turno</h2>
          
          <div *ngIf="selectedTurno" class="turno-info">
            <p><strong>Turno:</strong> {{ selectedTurno.day }}/{{ selectedTurno.month }} a las {{ selectedTurno.time }}</p>
            <p><strong>Médico:</strong> {{ selectedTurno.doctor }}</p>
            <p><strong>Lugar:</strong> {{ selectedTurno.location }}</p>
          </div>
          
          <p>Por favor, proporciona un motivo para cancelar el turno:</p>
          <textarea 
            [(ngModel)]="motivo" 
            rows="4" 
            placeholder="Escribe tu motivo aquí (mínimo 5 caracteres)..."
            [disabled]="isSubmitting"
            class="form-control"></textarea>
          <small class="text-muted">El motivo es obligatorio y debe tener al menos 5 caracteres</small>
          <div *ngIf="motivo && motivo.length < 5" class="text-danger mt-1">
            ⚠️ El motivo debe tener al menos 5 caracteres
          </div>
          
          <div class="modal-actions">
            <button 
              class="btn btn-primary" 
              (click)="submitReason()"
              [disabled]="!motivo.trim() || motivo.trim().length < 5 || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner"></span>
              <i *ngIf="!isSubmitting" class="fas fa-times"></i>
              {{ isSubmitting ? 'Procesando...' : 'Cancelar Turno' }}
            </button>
            <button 
              class="btn btn-secondary" 
              (click)="closeModal()"
              [disabled]="isSubmitting">
              <i class="fas fa-arrow-left"></i>
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    * {
      box-sizing: border-box;
    }

    .patient-dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      padding: 1.5rem;
      position: relative;
      overflow-x: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* Floating Particles Background */
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
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
      50% { transform: translateY(-100px) rotate(180deg); opacity: 1; }
    }

    /* Header Section */
    .dashboard-header {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.1),
        0 8px 20px rgba(0,0,0,0.06),
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
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
      pointer-events: none;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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
      font-size: 2.5rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
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
      transition: left 0.8s ease;
    }

    .welcome-icon:hover::before {
      left: 100%;
    }

    .welcome-text h1 {
      color: #2c3e50;
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    .patient-info {
      color: #6c757d;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
    }

    .tagline {
      color: #8e9aaf;
      font-size: 1rem;
      font-weight: 400;
      margin: 0;
      font-style: italic;
    }

    .btn-logout {
      background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 1rem;
      box-shadow: 
        0 8px 25px rgba(255, 71, 87, 0.3),
        0 4px 12px rgba(255, 71, 87, 0.2);
      position: relative;
      overflow: hidden;
    }

    .btn-logout::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }

    .btn-logout:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 
        0 15px 40px rgba(255, 71, 87, 0.4),
        0 8px 20px rgba(255, 71, 87, 0.3);
    }

    .btn-logout:hover::before {
      left: 100%;
    }

    /* Quick Actions Section */
    .quick-actions {
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

    .section-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(102,126,234,0.05)"/></svg>') repeat;
      opacity: 0.5;
      pointer-events: none;
    }

    .section-title-container {
      position: relative;
      z-index: 2;
      margin-bottom: 2.5rem;
      text-align: center;
    }

    .section-title-container h2 {
      color: #2c3e50;
      font-size: 2.2rem;
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
      font-weight: 400;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    .action-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      padding: 2rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      box-shadow: 
        0 8px 30px rgba(0,0,0,0.06),
        0 4px 12px rgba(0,0,0,0.04);
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 1.5rem;
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
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.12),
        0 8px 25px rgba(0,0,0,0.08);
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

    .action-agenda .card-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .action-profile .card-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .action-notifications .card-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .action-history .card-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

    /* Mis Turnos Section */
    .my-appointments {
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

    .appointments-background {
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
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .section-subtitle {
      color: #6c757d;
      font-size: 1rem;
      margin: 0.3rem 0 0 0;
      font-weight: 400;
    }

    .btn-schedule-appointment {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1.2rem 2rem;
      border-radius: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 1rem;
      box-shadow: 
        0 8px 25px rgba(102, 126, 234, 0.3),
        0 4px 12px rgba(102, 126, 234, 0.2);
      position: relative;
      overflow: hidden;
    }

    .btn-schedule-appointment::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }

    .btn-schedule-appointment:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 
        0 15px 40px rgba(102, 126, 234, 0.4),
        0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-schedule-appointment:hover::before {
      left: 100%;
    }

    .btn-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Filter Tabs Mejorados */
    .filter-container {
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 2;
    }

    .filter-tabs {
      display: flex;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 20px;
      padding: 0.5rem;
      gap: 0.5rem;
      box-shadow: 
        inset 0 2px 8px rgba(0,0,0,0.05),
        0 2px 8px rgba(0,0,0,0.02);
      border: 1px solid rgba(255, 255, 255, 0.7);
    }

    .filter-tab {
      flex: 1;
      background: transparent;
      border: none;
      padding: 1.2rem 1.5rem;
      border-radius: 16px;
      font-weight: 600;
      font-size: 0.95rem;
      color: #6c757d;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      position: relative;
      overflow: hidden;
    }

    .filter-tab::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 3px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    .filter-tab:hover {
      color: #495057;
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.5);
    }

    .filter-tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 
        0 8px 25px rgba(102, 126, 234, 0.3),
        0 4px 12px rgba(102, 126, 234, 0.2);
      transform: translateY(-2px);
    }

    .filter-tab.active::before {
      width: 100%;
    }

    .tab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .tab-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tab-label {
      font-weight: 600;
    }

    .tab-count {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 0.2rem 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
      min-width: 20px;
      text-align: center;
    }

    .filter-tab.active .tab-count {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    .filter-tab:not(.active) .tab-count {
      background: #e9ecef;
      color: #6c757d;
    }

    /* Loading State */
    .loading-container {
      position: relative;
      z-index: 2;
      padding: 4rem 2rem;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #6c757d;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1.5rem;
    }

    .loading-spinner p {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
    }

    /* Appointments Grid */
    .appointments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    /* Appointment Cards */
    .appointment-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      padding: 0;
      box-shadow: 
        0 10px 30px rgba(0,0,0,0.08),
        0 4px 12px rgba(0,0,0,0.04);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      border: 2px solid transparent;
      overflow: hidden;
      position: relative;
    }

    .appointment-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
      pointer-events: none;
    }

    .appointment-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.15),
        0 8px 25px rgba(0,0,0,0.08);
      border-color: rgba(102, 126, 234, 0.2);
    }

    /* Status-based card styling */
    .appointment-card.status-confirmado {
      border-left: 6px solid #28a745;
    }

    .appointment-card.status-programado {
      border-left: 6px solid #ffc107;
    }

    .appointment-card.status-reagendado {
      border-left: 6px solid #17a2b8;
    }

    .appointment-card.status-cancelado {
      border-left: 6px solid #dc3545;
      opacity: 0.7;
    }

    .appointment-card.status-completo {
      border-left: 6px solid #6f42c1;
    }

    /* Card Header */
    .card-header {
      padding: 1.5rem 2rem 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      z-index: 2;
    }

    .date-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .date-circle {
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
      position: relative;
      overflow: hidden;
    }

    .date-circle::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }

    .date-circle:hover::before {
      left: 100%;
    }

    .date-circle .day {
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1;
    }

    .date-circle .month {
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0.9;
      text-transform: uppercase;
    }

    .year-time {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .year-time .year {
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .year-time .time {
      color: #667eea;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    /* Status Badge */
    .status-badge {
      padding: 0.6rem 1.2rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }

    .status-badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .status-badge:hover::before {
      left: 100%;
    }

    .status-badge.status-confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .status-badge.status-programado {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
    }

    .status-badge.status-reagendado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
    }

    .status-badge.status-cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    .status-badge.status-completo {
      background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%);
      color: white;
    }

    /* Card Body */
    .card-body {
      padding: 0 2rem 1.5rem 2rem;
      position: relative;
      z-index: 2;
    }

    .doctor-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .doctor-avatar {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
      font-size: 1.5rem;
      border: 2px solid rgba(102, 126, 234, 0.1);
    }

    .doctor-info h4 {
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .doctor-info .specialty {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .location-info {
      display: flex;
      align-items: center;
      color: #6c757d;
      font-size: 0.9rem;
      background: #f8f9fa;
      padding: 0.8rem;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    /* Card Actions */
    .card-actions {
      padding: 1rem 2rem 1.5rem 2rem;
      border-top: 1px solid #f1f3f4;
      display: flex;
      gap: 0.8rem;
      flex-wrap: wrap;
      position: relative;
      z-index: 2;
    }

    .action-btn {
      flex: 1;
      min-width: 110px;
      padding: 0.8rem 1rem;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .action-btn:hover::before {
      left: 100%;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }

    .confirm-btn:hover {
      background: linear-gradient(135deg, #218838 0%, #1abc9c 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
    }

    .reschedule-btn {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
    }

    .reschedule-btn:hover {
      background: linear-gradient(135deg, #138496 0%, #117a8b 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(23, 162, 184, 0.4);
    }

    .cancel-btn {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    }

    .cancel-btn:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
    }

    /* Empty State */
    .empty-state {
      position: relative;
      z-index: 2;
      padding: 4rem 2rem;
    }

    .empty-illustration {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      border: 2px solid #e9ecef;
    }

    .empty-icon i {
      font-size: 3rem;
      color: #6c757d;
      opacity: 0.7;
    }

    .empty-content h3 {
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }

    .empty-content p {
      color: #6c757d;
      font-size: 1rem;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(8px);
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      max-width: 500px;
      width: 90%;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.2),
        0 8px 25px rgba(0, 0, 0, 0.15);
      position: relative;
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      cursor: pointer;
      font-size: 1.5rem;
      color: #6c757d;
      transition: color 0.3s ease;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f8f9fa;
    }

    .close:hover {
      color: #343a40;
      background: #e9ecef;
    }

    .modal-content h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: #2c3e50;
      font-weight: 700;
    }

    .modal-content p {
      margin: 0 0 1.5rem 0;
      color: #6c757d;
      line-height: 1.5;
    }

    .turno-info {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      border-left: 4px solid #667eea;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .turno-info p {
      margin: 0.5rem 0;
      font-size: 0.95rem;
      font-weight: 500;
    }

    textarea {
      width: 100%;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 1rem;
      font-size: 1rem;
      color: #495057;
      margin-bottom: 1rem;
      resize: none;
      font-family: inherit;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    textarea:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
      outline: none;
    }

    textarea:disabled {
      background-color: #f8f9fa;
      opacity: 0.6;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.8rem 1.8rem;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      position: relative;
      overflow: hidden;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .text-danger {
      color: #dc3545 !important;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .text-muted {
      color: #6c757d !important;
      font-size: 0.9rem;
    }

    .me-1 { margin-right: 0.25rem; }
    .me-2 { margin-right: 0.5rem; }
    .me-3 { margin-right: 1rem; }
    .mt-1 { margin-top: 0.25rem; }

    /* Responsive Design */
    @media (max-width: 768px) {
      .patient-dashboard {
        padding: 1rem;
      }
      
      .dashboard-header,
      .quick-actions,
      .my-appointments {
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      
      .welcome-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .welcome-text h1 {
        font-size: 2rem;
      }
      
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .action-card {
        padding: 1.5rem;
      }
      
      .appointments-grid {
        grid-template-columns: 1fr;
      }
      
      .filter-tabs {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .filter-tab {
        padding: 1rem;
      }
      
      .tab-content {
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .modal-content {
        padding: 1.5rem;
        margin: 1rem;
      }
      
      .card-actions {
        flex-direction: column;
      }
      
      .action-btn {
        min-width: auto;
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .welcome-text h1 {
        font-size: 1.75rem;
      }
      
      .section-title-container h2 {
        font-size: 1.75rem;
      }
      
      .title-content h2 {
        font-size: 1.5rem;
      }
      
      .date-circle {
        width: 60px;
        height: 60px;
      }
      
      .date-circle .day {
        font-size: 1.2rem;
      }
      
      .date-circle .month {
        font-size: 0.7rem;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
   

    /* === Loading State === */
    .loading-container {
      position: relative;
      z-index: 2;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: #6c757d;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1.5rem;
    }

    .loading-spinner p {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
    }

    /* === Appointments Grid === */
    .appointments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    /* === Appointment Cards === */
    .appointment-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      padding: 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      border: 2px solid transparent;
      overflow: hidden;
      position: relative;
    }

    .appointment-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
      pointer-events: none;
    }

    .appointment-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      border-color: rgba(102, 126, 234, 0.2);
    }

    /* Status-based card styling */
    .appointment-card.status-confirmado {
      border-left: 6px solid #28a745;
    }

    .appointment-card.status-programado {
      border-left: 6px solid #ffc107;
    }

    .appointment-card.status-reagendado {
      border-left: 6px solid #17a2b8;
    }

    .appointment-card.status-cancelado {
      border-left: 6px solid #dc3545;
      opacity: 0.7;
    }

    .appointment-card.status-completo {
      border-left: 6px solid #6f42c1;
    }

    /* === Card Header === */
    .card-header {
      padding: 1.5rem 2rem 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      z-index: 2;
    }

    .date-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .date-circle {
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
      position: relative;
      overflow: hidden;
    }

    .date-circle::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }

    .date-circle:hover::before {
      left: 100%;
    }

    .date-circle .day {
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1;
    }

    .date-circle .month {
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0.9;
      text-transform: uppercase;
    }

    .year-time {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .year-time .year {
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .year-time .time {
      color: #667eea;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    /* === Status Badge === */
    .status-badge {
      padding: 0.6rem 1.2rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }

    .status-badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .status-badge:hover::before {
      left: 100%;
    }

    .status-badge.status-confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .status-badge.status-programado {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
    }

    .status-badge.status-reagendado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
    }

    .status-badge.status-cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    .status-badge.status-completo {
      background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%);
      color: white;
    }

    /* === Card Body === */
    .card-body {
      padding: 0 2rem 1.5rem 2rem;
      position: relative;
      z-index: 2;
    }

    .doctor-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .doctor-avatar {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
      font-size: 1.5rem;
      border: 2px solid rgba(102, 126, 234, 0.1);
    }

    .doctor-info h4 {
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .doctor-info .specialty {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .location-info {
      display: flex;
      align-items: center;
      color: #6c757d;
      font-size: 0.9rem;
      background: #f8f9fa;
      padding: 0.8rem;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    /* === Card Actions === */
    .card-actions {
      padding: 1rem 2rem 1.5rem 2rem;
      border-top: 1px solid #f1f3f4;
      display: flex;
      gap: 0.8rem;
      flex-wrap: wrap;
      position: relative;
      z-index: 2;
    }

    .action-btn {
      flex: 1;
      min-width: 110px;
      padding: 0.8rem 1rem;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .action-btn:hover::before {
      left: 100%;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }

    .confirm-btn:hover {
      background: linear-gradient(135deg, #218838 0%, #1abc9c 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
    }

    .reschedule-btn {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
    }

    .reschedule-btn:hover {
      background: linear-gradient(135deg, #138496 0%, #117a8b 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(23, 162, 184, 0.4);
    }

    .cancel-btn {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    }

    .cancel-btn:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
    }

    /* === Empty State === */
    .empty-state {
      position: relative;
      z-index: 2;
      padding: 4rem 2rem;
    }

    .empty-illustration {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      border: 2px solid #e9ecef;
    }

    .empty-icon i {
      font-size: 3rem;
      color: #6c757d;
      opacity: 0.7;
    }

    .empty-content h3 {
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }

    .empty-content p {
      color: #6c757d;
      font-size: 1rem;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    .close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      cursor: pointer;
      font-size: 1.5rem;
      color: #6c757d;
      transition: color 0.3s ease;
    }

    .close:hover {
      color: #343a40;
    }

    h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      color: #2c3e50;
    }

    p {
      margin: 0 0 1.5rem 0;
      color: #6c757d;
      line-height: 1.5;
    }

    textarea {
      width: 100%;
      border: 1px solid #ced4da;
      border-radius: 8px;
      padding: 0.8rem;
      font-size: 1rem;
      color: #495057;
      margin-bottom: 1.5rem;
      resize: none;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .turno-info {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      border-left: 4px solid #667eea;
    }

    .turno-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }

    .form-control {
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      outline: none;
    }

    .form-control:disabled {
      background-color: #e9ecef;
      opacity: 0.6;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 0.125rem solid transparent;
      border-top: 0.125rem solid currentColor;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .patient-dashboard {
        padding: 1rem;
      }
      
      .welcome-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .appointment-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .appointment-actions {
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .btn-confirm, .btn-secondary, .btn-danger {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
        min-width: auto;
      }

      /* Modal Styles */
      .modal-content {
        padding: 1.5rem;
      }

      h2 {
        font-size: 1.25rem;
      }

      p {
        font-size: 0.9rem;
      }

      textarea {
        padding: 0.6rem;
        font-size: 0.9rem;
      }
    }
   }
  `
})
export class PacienteDashboardComponent implements OnInit {
  patientDNI: string = '';
  proximosTurnos: any[] = [];
  allTurnos: any[] = [];
  filteredTurnos: any[] = [];
  isLoadingTurnos = false;
  currentFilter: 'upcoming' | 'past' | 'all' = 'upcoming';

  // Notificaciones
  contadorNotificaciones = 0;

  // Modal de cancelación con motivo
  showReasonModal: boolean = false;
  selectedTurno: any = null;
  motivo: string = '';
  isSubmitting: boolean = false;

  // Particles for background animation
  particles: { x: number; y: number }[] = [];

  constructor(
    private router: Router,
    private turnoService: TurnoService,
    private notificacionService: NotificacionService
  ) {
    this.patientDNI = localStorage.getItem('patientDNI') || '';
    this.generateParticles();
  }

  private generateParticles() {
    this.particles = [];
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
      });
    }
  }

  ngOnInit() {
    this.cargarTurnosPaciente();
    this.cargarContadorNotificaciones();
  }

  getFilterCount(filter: 'upcoming' | 'past' | 'all'): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'upcoming':
        return this.allTurnos.filter(turno => {
          const fechaTurno = this.parseFecha(turno);
          return fechaTurno >= hoy && 
                 (turno.status === 'confirmado' || 
                  turno.status === 'programado' ||
                  turno.status === 'reagendado');
        }).length;
        
      case 'past':
        return this.allTurnos.filter(turno => {
          const fechaTurno = this.parseFecha(turno);
          return fechaTurno < hoy || turno.status === 'completo';
        }).length;
        
      case 'all':
        return this.allTurnos.length;
        
      default:
        return 0;
    }
  }

  trackByTurno(index: number, turno: any): any {
    return turno.id || index;
  }

  private cargarContadorNotificaciones() {
    const pacienteId = parseInt(localStorage.getItem('pacienteId') || '0');
    if (pacienteId > 0) {
      this.notificacionService.contarNotificacionesNoLeidas(pacienteId).subscribe({
        next: (count) => {
          this.contadorNotificaciones = count;
        },
        error: (error) => {
          console.error('Error cargando contador de notificaciones:', error);
        }
      });
    }
  }

  cargarTurnosPaciente() {
    // Intentar obtener el ID del paciente de diferentes formas
    let pacienteId = localStorage.getItem('pacienteId');
    
    if (!pacienteId) {
      // Si no hay pacienteId, intentar obtenerlo de patientData
      const patientDataStr = localStorage.getItem('patientData');
      if (patientDataStr) {
        try {
          const patientData = JSON.parse(patientDataStr);
          pacienteId = patientData.id?.toString();
          // Guardarlo para futuras consultas
          if (pacienteId) {
            localStorage.setItem('pacienteId', pacienteId);
          }
        } catch (e) {
          console.error('Error parsing patient data:', e);
        }
      }
    }

    if (!pacienteId) {
      console.error('No se encontró ID del paciente en localStorage');
      return;
    }

    this.isLoadingTurnos = true;
    console.log('Cargando todos los turnos para paciente ID:', pacienteId);
    
    this.turnoService.getByPacienteId(parseInt(pacienteId)).subscribe({
      next: (dataPackage: DataPackage<Turno[]>) => {
        console.log('Turnos recibidos en dashboard:', dataPackage);
        const turnos = dataPackage.data || [];
        
        // Convertir todos los turnos para el dashboard
        this.allTurnos = turnos.map(turno => this.convertirTurnoParaDashboard(turno));
        
        // Aplicar filtro inicial
        this.applyFilter();
        
        this.isLoadingTurnos = false;
      },
      error: (error) => {
        console.error('Error cargando turnos:', error);
        this.isLoadingTurnos = false;
      }
    });
  }

  applyFilter() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    switch (this.currentFilter) {
      case 'upcoming':
        this.filteredTurnos = this.allTurnos.filter(turno => {
          const fechaTurno = this.parseFecha(turno);
          return fechaTurno >= hoy && 
                 (turno.status === 'confirmado' || 
                  turno.status === 'programado' ||
                  turno.status === 'reagendado');
        }).sort((a, b) => this.parseFecha(a).getTime() - this.parseFecha(b).getTime());
        break;
        
      case 'past':
        this.filteredTurnos = this.allTurnos.filter(turno => {
          const fechaTurno = this.parseFecha(turno);
          return fechaTurno < hoy || turno.status === 'completo';
        }).sort((a, b) => this.parseFecha(b).getTime() - this.parseFecha(a).getTime());
        break;
        
      case 'all':
        this.filteredTurnos = [...this.allTurnos].sort((a, b) => this.parseFecha(b).getTime() - this.parseFecha(a).getTime());
        break;
    }
  }

  private parseFecha(turno: any): Date {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const monthIndex = meses.indexOf(turno.month);
    return new Date(turno.year || new Date().getFullYear(), monthIndex, parseInt(turno.day));
  }

  setFilter(filter: 'upcoming' | 'past' | 'all') {
    this.currentFilter = filter;
    this.applyFilter();
  }

  // Métodos para verificar qué acciones se pueden realizar
  canPerformActions(turno: any): boolean {
    return turno.status !== 'cancelado' && turno.status !== 'completo';
  }

  canConfirm(turno: any): boolean {
    return turno.status === 'programado' || turno.status === 'reagendado';
  }

  canReschedule(turno: any): boolean {
    return turno.status === 'programado' || turno.status === 'confirmado' || turno.status === 'reagendado';
  }

  canCancel(turno: any): boolean {
    return turno.status === 'programado' || turno.status === 'confirmado' || turno.status === 'reagendado';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'confirmado': 'fa-check-circle',
      'programado': 'fa-clock',
      'reagendado': 'fa-calendar-alt',
      'completo': 'fa-check-square',
      'cancelado': 'fa-times-circle'
    };
    return iconMap[status] || 'fa-clock';
  }

  getEmptyStateText(): string {
    switch (this.currentFilter) {
      case 'upcoming': return 'próximos';
      case 'past': return 'pasados';
      case 'all': return 'registrados';
      default: return '';
    }
  }

  getEmptyStateDescription(): string {
    switch (this.currentFilter) {
      case 'upcoming': return '¡Programa tu próxima cita médica!';
      case 'past': return 'Aún no has tenido consultas médicas.';
      case 'all': return '¡Programa tu primera cita médica!';
      default: return '';
    }
  }

  private convertirTurnoParaDashboard(turno: Turno): any {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = turno.fecha.split('-').map(Number);
    const fecha = new Date(year, month - 1, day); // month es 0-indexed
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    
    return {
      id: turno.id,
      day: fecha.getDate().toString().padStart(2, '0'),
      month: meses[fecha.getMonth()],
      year: fecha.getFullYear(),
      time: turno.horaInicio,
      doctor: `${turno.staffMedicoNombre} ${turno.staffMedicoApellido}`,
      specialty: turno.especialidadStaffMedico,
      location: turno.nombreCentro,
      status: turno.estado?.toLowerCase() || 'programado'
    };
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmado': 'Confirmado',
      'programado': 'Programado',
      'reagendado': 'Reagendar',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  confirmarTurno(turno: any) {
    const confirmMessage = `¿Deseas confirmar este turno?\n\nFecha: ${turno.day}/${turno.month}\nHora: ${turno.time}\nMédico: ${turno.doctor}`;
    
    if (confirm(confirmMessage)) {
      this.turnoService.confirmar(turno.id).subscribe({
        next: (response) => {
          console.log('Turno confirmado exitosamente:', response);
          // Actualizar el estado localmente
          turno.status = 'confirmado';
          // Mostrar mensaje de éxito
          alert('Turno confirmado exitosamente. Te esperamos en la fecha y hora programada.');
          // Recargar la lista de turnos para reflejar cambios
          this.cargarTurnosPaciente();
        },
        error: (error) => {
          console.error('Error confirmando el turno:', error);
          alert('No se pudo confirmar el turno. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  reprogramarTurno(turno: any) {
    // Redirigir al componente de reagendamiento con el ID del turno
    this.router.navigate(['/paciente-reagendar-turno', turno.id]);
  }

  cancelarTurno(turno: any) {
    this.selectedTurno = turno;
    this.motivo = '';
    this.showReasonModal = true;
  }

  closeModal() {
    this.showReasonModal = false;
    this.motivo = '';
    this.selectedTurno = null;
    this.isSubmitting = false;
  }

  submitReason() {
    if (!this.motivo.trim()) {
      alert('Por favor, ingresa un motivo.');
      return;
    }

    if (this.motivo.trim().length < 5) {
      alert('El motivo debe tener al menos 5 caracteres.');
      return;
    }

    this.isSubmitting = true;

    // Solo se usa para cancelar, ya que reagendar redirige a otro componente
    this.turnoService.updateEstado(this.selectedTurno.id, 'CANCELADO', this.motivo.trim()).subscribe({
      next: (response) => {
        console.log('Turno cancelado exitosamente:', response);
        alert('Turno cancelado exitosamente.');
        this.cargarTurnosPaciente();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error cancelando el turno:', error);
        let errorMessage = 'No se pudo cancelar el turno.';
        if (error.error && error.error.status_text) {
          errorMessage += ' Motivo: ' + error.error.status_text;
        }
        alert(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('patientDNI');
    this.router.navigate(['/']);
  }



  scheduleAppointment() {
    this.router.navigate(['/paciente-agenda']);
  }

  viewAgenda() {
    this.router.navigate(['/paciente-agenda']);
  }

  viewProfile() {
    // Navegar a la ruta específica para el perfil del paciente
    this.router.navigate(['/paciente-perfil']);
  }

  viewNotifications() {
    this.router.navigate(['/paciente-notificaciones']);
  }

  
}
