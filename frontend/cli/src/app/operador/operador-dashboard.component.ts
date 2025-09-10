import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TurnoService } from "../turnos/turno.service";
import { Turno } from "../turnos/turno";
import { DataPackage } from "../data.package";
import { NotificacionService } from "../services/notificacion.service";
import { AuthService } from "../inicio-sesion/auth.service";
import { OperadorService } from "./operador.service"; // Asumiendo que existe este servicio para operadores

@Component({
  selector: "app-operador-dashboard",
  imports: [CommonModule, FormsModule],
  template: `
    <div class="operator-dashboard">
      <!-- Floating Particles Background -->
      <div class="particles-bg">
        <div
          class="particle"
          *ngFor="let p of particles; let i = index"
          [style.left.px]="p.x"
          [style.top.px]="p.y"
          [style.animation-delay.s]="i * 0.2"
        ></div>
      </div>

      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-glow"></div>
        <div class="welcome-section">
          <div class="welcome-content">
            <div class="welcome-icon">
              <i class="fas fa-user-cog"></i>
            </div>
            <div class="welcome-text">
              <h1>¡Bienvenido/a a tu Panel de Operaciones!</h1>
              <p class="operator-info">
                <i class="fas fa-user me-2"></i>
                {{ operatorName }}
              </p>
              <p class="operator-info">
                <i class="fas fa-envelope me-2"></i>
                {{ operatorEmail }}
              </p>
              <p class="tagline">
                Gestiona las operaciones de manera eficiente
              </p>
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
          <p class="section-description">
            Accede rápidamente a las funciones principales
          </p>
        </div>
        <div class="actions-grid">
          <div class="action-card action-turnos" (click)="goToTurnos()">
            <div class="card-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="card-content">
              <h3>Administrar Turnos</h3>
              <p>Ver, agendar y gestionar turnos de pacientes</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="action-card action-operadores" (click)="goToOperadores()">
            <div class="card-icon">
              <i class="fas fa-users-cog"></i>
            </div>
            <div class="card-content">
              <h3>Gestionar Operadores</h3>
              <p>Ver y agregar nuevos operadores</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="action-card action-centros" (click)="goToCentros()">
            <div class="card-icon">
              <i class="fas fa-hospital"></i>
            </div>
            <div class="card-content">
              <h3>Gestionar Centros</h3>
              <p>Administrar centros médicos y especialidades</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div class="action-card action-reportes" (click)="goToReportes()">
            <div class="card-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="card-content">
              <h3>Ver Reportes</h3>
              <p>Analizar métricas y reportes del sistema</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>

          <div
            class="action-card action-notifications"
            (click)="viewNotifications()"
          >
            <div class="card-icon">
              <i class="fas fa-bell"></i>
            </div>
            <div class="card-content">
              <h3>Notificaciones</h3>
              <p>Ver mensajes y alertas del sistema</p>
            </div>
            <div class="notification-badge" *ngIf="contadorNotificaciones > 0">
              <span>{{ contadorNotificaciones }}</span>
              <div class="notification-pulse"></div>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Turnos Gestionados -->
      <div class="managed-appointments">
        <div class="appointments-background"></div>
        <div class="section-header">
          <div class="section-title">
            <div class="title-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="title-content">
              <h2>Turnos Gestionados</h2>
              <p class="section-subtitle">
                Administra los turnos de los pacientes
              </p>
            </div>
          </div>
          <button
            class="btn-schedule-appointment"
            (click)="scheduleAppointment()"
          >
            <div class="btn-icon">
              <i class="fas fa-plus"></i>
            </div>
            <span>Agendar Turno</span>
            <div class="btn-shine"></div>
          </button>
        </div>

        <!-- Filtros Mejorados -->
        <div class="filter-container">
          <div class="filter-tabs">
            <button
              class="filter-tab"
              [class.active]="currentFilter === 'pending'"
              (click)="setFilter('pending')"
            >
              <div class="tab-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="tab-content">
                <span class="tab-label">Pendientes</span>
                <span class="tab-count" *ngIf="getFilterCount('pending') > 0">{{
                  getFilterCount("pending")
                }}</span>
              </div>
              <div class="tab-indicator"></div>
            </button>
            <button
              class="filter-tab"
              [class.active]="currentFilter === 'upcoming'"
              (click)="setFilter('upcoming')"
            >
              <div class="tab-icon">
                <i class="fas fa-calendar"></i>
              </div>
              <div class="tab-content">
                <span class="tab-label">Próximos</span>
                <span
                  class="tab-count"
                  *ngIf="getFilterCount('upcoming') > 0"
                  >{{ getFilterCount("upcoming") }}</span
                >
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
                <span class="tab-count" *ngIf="getFilterCount('past') > 0">{{
                  getFilterCount("past")
                }}</span>
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
                <span class="tab-count">{{ allTurnos.length }}</span>
              </div>
              <div class="tab-indicator"></div>
            </button>
          </div>
        </div>

        <!-- Búsqueda Rápida -->
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Buscar por paciente, médico, centro o ID..."
            [(ngModel)]="searchQuery"
            (input)="applySearch()"
          />
          <i class="fas fa-search search-icon"></i>
        </div>

        <!-- Loading state -->
        <div class="loading-container" *ngIf="isLoadingTurnos">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Cargando turnos...</p>
          </div>
        </div>

        <!-- Appointments grid -->
        <div
          class="appointments-grid"
          *ngIf="!isLoadingTurnos && filteredTurnos.length > 0"
        >
          <div
            class="appointment-card"
            *ngFor="let turno of filteredTurnos; trackBy: trackByTurno"
            [class]="'status-' + turno.status"
          >
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
              <div class="patient-section">
                <div class="patient-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="patient-info">
                  <h4 class="patient-name">{{ turno.patientName }}</h4>
                  <!-- <p class="patient-dni">
                    <i class="fas fa-id-card me-1"></i>
                    DNI: {{ turno.patientDNI }}
                  </p> -->
                </div>
              </div>

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
              <button
                class="action-btn confirm-btn"
                *ngIf="canConfirm(turno)"
                (click)="confirmarTurno(turno)"
                title="Confirmar turno"
              >
                <i class="fas fa-check"></i>
                <span>Confirmar</span>
              </button>

              <button
                class="action-btn reschedule-btn"
                *ngIf="canReschedule(turno)"
                (click)="reprogramarTurno(turno)"
                title="Reagendar turno"
              >
                <i class="fas fa-calendar-alt"></i>
                <span>Reagendar</span>
              </button>

              <button
                class="action-btn cancel-btn"
                *ngIf="canCancel(turno)"
                (click)="cancelarTurno(turno)"
                title="Cancelar turno"
              >
                <i class="fas fa-times"></i>
                <span>Cancelar</span>
              </button>

              <button
                class="action-btn view-btn"
                (click)="verDetalle(turno.id)"
                title="Ver detalle"
              >
                <i class="fas fa-eye"></i>
                <span>Ver</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          class="empty-state"
          *ngIf="!isLoadingTurnos && filteredTurnos.length === 0"
        >
          <div class="empty-illustration">
            <div class="empty-icon">
              <i class="fas fa-calendar-times"></i>
            </div>
            <div class="empty-content">
              <h3>No hay turnos {{ getEmptyStateText() }}</h3>
              <p>{{ getEmptyStateDescription() }}</p>
              <!-- <button
                class="btn btn-primary btn-lg"
                (click)="scheduleAppointment()"
                *ngIf="currentFilter !== 'past'"
              >
                <i class="fas fa-plus me-2"></i>
                Agendar un turno
              </button> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for Cancel -->
      <div class="modal" *ngIf="showReasonModal">
        <div class="modal-content">
          <span
            class="close"
            (click)="closeModal()"
            [style.display]="isSubmitting ? 'none' : 'block'"
            >&times;</span
          >
          <h2>Cancelar Turno</h2>

          <div *ngIf="selectedTurno" class="turno-info">
            <p>
              <strong>Turno:</strong> {{ selectedTurno.day }}/{{
                selectedTurno.month
              }}
              a las {{ selectedTurno.time }}
            </p>
            <p><strong>Paciente:</strong> {{ selectedTurno.patientName }}</p>
            <p><strong>Médico:</strong> {{ selectedTurno.doctor }}</p>
            <p><strong>Lugar:</strong> {{ selectedTurno.location }}</p>
          </div>

          <p>Por favor, proporciona un motivo para cancelar el turno:</p>
          <textarea
            [(ngModel)]="motivo"
            rows="4"
            placeholder="Escribe tu motivo aquí (mínimo 5 caracteres)..."
            [disabled]="isSubmitting"
            class="form-control"
          ></textarea>
          <small class="text-muted"
            >El motivo es obligatorio y debe tener al menos 5 caracteres</small
          >
          <div *ngIf="motivo && motivo.length < 5" class="text-danger mt-1">
            ⚠️ El motivo debe tener al menos 5 caracteres
          </div>

          <div class="modal-actions">
            <button
              class="btn btn-primary"
              (click)="submitReason()"
              [disabled]="
                !motivo.trim() || motivo.trim().length < 5 || isSubmitting
              "
            >
              <span *ngIf="isSubmitting" class="spinner"></span>
              <i *ngIf="!isSubmitting" class="fas fa-times"></i>
              {{ isSubmitting ? "Procesando..." : "Cancelar Turno" }}
            </button>
            <button
              class="btn btn-secondary"
              (click)="closeModal()"
              [disabled]="isSubmitting"
            >
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

    .operator-dashboard {
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

    .operator-info {
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

    .action-turnos .card-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .action-operadores .card-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .action-centros .card-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .action-reportes .card-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .action-notifications .card-icon {
      background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
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
      font-size: 0.95rem;
      margin: 0;
      line-height: 1.4;
    }

    .card-arrow {
      font-size: 1rem;
      color: #adb5bd;
      transition: transform 0.3s ease;
      flex-shrink: 0;
    }

    .action-card:hover .card-arrow {
      transform: translateX(5px);
      color: #667eea;
    }

    .notification-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
      animation: pulse 2s infinite;
    }

    .notification-pulse {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 71, 87, 0.4);
      border-radius: 50%;
      animation: pulse-ring 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    /* Managed Appointments Section */
    .managed-appointments {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 2.5rem;
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
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
      pointer-events: none;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      position: relative;
      z-index: 2;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-icon {
      width: 50px;
      height: 50px;
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
    }

    .section-subtitle {
      color: #6c757d;
      font-size: 1rem;
      margin: 0;
      font-weight: 400;
    }

    .btn-schedule-appointment {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        0 8px 25px rgba(102, 126, 234, 0.3),
        0 4px 12px rgba(102, 126, 234, 0.2);
      position: relative;
      overflow: hidden;
    }

    .btn-schedule-appointment .btn-icon {
      width: 24px;
      height: 24px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-shine {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
      pointer-events: none;
      opacity: 0.5;
    }

    .btn-schedule-appointment:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 
        0 15px 40px rgba(102, 126, 234, 0.4),
        0 8px 20px rgba(102, 126, 234, 0.3);
    }

    /* Filter Container */
    .filter-container {
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 2;
    }

    .filter-tabs {
      display: flex;
      background: #f8f9fa;
      border-radius: 16px;
      padding: 0.5rem;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
      gap: 0.5rem;
    }

    .filter-tab {
      flex: 1;
      background: transparent;
      border: none;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      font-weight: 600;
      color: #6c757d;
    }

    .filter-tab:hover {
      background: rgba(255,255,255,0.5);
    }

    .filter-tab.active {
      background: white;
      color: #2c3e50;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .tab-icon {
      font-size: 1.2rem;
      color: inherit;
    }

    .tab-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tab-label {
      font-size: 1rem;
    }

    .tab-count {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
      padding: 0.2rem 0.6rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .tab-indicator {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid white;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .filter-tab.active .tab-indicator {
      opacity: 1;
    }

    /* Search Container */
    .search-container {
      position: relative;
      margin-bottom: 2rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1.5rem 1rem 3rem;
      border-radius: 16px;
      border: 1px solid #e9ecef;
      background: white;
      font-size: 1rem;
      color: #495057;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    .search-input:focus {
      border-color: #667eea;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
      outline: none;
    }

    .search-icon {
      position: absolute;
      left: 1.5rem;
      top: 50%;
      transform: translateY(-50%);
      color: #adb5bd;
      font-size: 1rem;
    }

    /* Loading Container */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      position: relative;
      z-index: 2;
    }

    .loading-spinner {
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-container p {
      color: #6c757d;
      font-size: 1rem;
      margin: 0;
    }

    /* Appointments Grid */
    .appointments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    .appointment-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 
        0 8px 30px rgba(0,0,0,0.08),
        0 4px 12px rgba(0,0,0,0.04);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      border: 2px solid transparent;
      position: relative;
    }

    .appointment-card:hover {
      transform: translateY(-8px);
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.15),
        0 8px 25px rgba(0,0,0,0.1);
      border-color: rgba(102, 126, 234, 0.2);
    }

    .appointment-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .appointment-card:hover::before {
      opacity: 1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: #f8f9fa;
      border-bottom: 1px solid #f1f3f4;
      position: relative;
      z-index: 2;
    }

    .date-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .date-circle {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .date-circle:hover {
      transform: scale(1.05);
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

    .patient-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .patient-avatar {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f093fb;
      font-size: 1.5rem;
      border: 2px solid rgba(240, 147, 251, 0.1);
    }

    .patient-info h4 {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .patient-info .patient-dni {
      color: #6c757d;
      font-size: 0.85rem;
      margin: 0;
      display: flex;
      align-items: center;
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
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .doctor-info .specialty {
      color: #6c757d;
      font-size: 0.85rem;
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

    .view-btn {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
    }

    .view-btn:hover {
      background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
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
      .operator-dashboard {
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
      
      .appointments-grid {
        grid-template-columns: 1fr;
      }
      
      .filter-tabs {
        flex-direction: column;
      }
      
      .filter-tab {
        width: 100%;
        justify-content: center;
      }
      
      .card-actions {
        justify-content: center;
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
  `,
})
export class OperadorDashboardComponent implements OnInit {
  operatorName: string = "";
  operatorEmail: string = "";
  allTurnos: any[] = [];
  filteredTurnos: any[] = [];
  isLoadingTurnos = false;
  currentFilter: "pending" | "upcoming" | "past" | "all" = "pending";
  searchQuery: string = "";

  // Notificaciones
  contadorNotificaciones = 0;

  // Modal de cancelación con motivo
  showReasonModal: boolean = false;
  selectedTurno: any = null;
  motivo: string = "";
  isSubmitting: boolean = false;

  // Particles for background animation
  particles: { x: number; y: number }[] = [];

  constructor(
    private router: Router,
    private turnoService: TurnoService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private operadorService: OperadorService // Servicio para operadores
  ) {
    // Obtener datos del usuario autenticado
    this.operatorEmail = this.authService.getUserEmail() || "";
    this.operatorName = this.authService.getUserName() || "";
    this.generateParticles();
  }

  private generateParticles() {
    this.particles = [];
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x:
          Math.random() *
          (typeof window !== "undefined" ? window.innerWidth : 1200),
        y:
          Math.random() *
          (typeof window !== "undefined" ? window.innerHeight : 800),
      });
    }
  }

  ngOnInit() {
    this.cargarTurnos();
    this.cargarContadorNotificaciones();
  }

  getFilterCount(filter: "pending" | "upcoming" | "past" | "all"): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    switch (filter) {
      case "pending":
        return this.allTurnos.filter((turno) => {
          return turno.status === "programado";
        }).length;

      case "upcoming":
        return this.allTurnos.filter((turno) => {
          const fechaTurno = this.parseFecha(turno);
          return (
            fechaTurno >= hoy &&
            (turno.status === "confirmado" || turno.status === "reagendado")
          );
        }).length;

      case "past":
        return this.allTurnos.filter((turno) => {
          const fechaTurno = this.parseFecha(turno);
          return fechaTurno < hoy || turno.status === "completo";
        }).length;

      case "all":
        return this.allTurnos.length;

      default:
        return 0;
    }
  }

  trackByTurno(index: number, turno: any): any {
    return turno.id || index;
  }

  private cargarContadorNotificaciones() {
    const operadorId = parseInt(localStorage.getItem("operadorId") || "0");
    if (operadorId > 0) {
      this.notificacionService
        .contarNotificacionesNoLeidas(operadorId)
        .subscribe({
          next: (count) => {
            this.contadorNotificaciones = count;
          },
          error: (error) => {
            console.error("Error cargando contador de notificaciones:", error);
          },
        });
    }
  }

  cargarTurnos() {
    this.isLoadingTurnos = true;
    console.log("Cargando todos los turnos para operador");

    this.turnoService.all().subscribe({
      next: (dataPackage: DataPackage<Turno[]>) => {
        console.log("Turnos recibidos en dashboard operador:", dataPackage);
        const turnos = dataPackage.data || [];

        // Convertir todos los turnos para el dashboard
        this.allTurnos = turnos.map((turno) =>
          this.convertirTurnoParaDashboard(turno)
        );

        // Aplicar filtro inicial
        this.applyFilter();

        this.isLoadingTurnos = false;
      },
      error: (error) => {
        console.error("Error cargando turnos:", error);
        this.isLoadingTurnos = false;
      },
    });
  }

  applyFilter() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let list = this.allTurnos;

    switch (this.currentFilter) {
      case "pending":
        list = list
          .filter((turno) => turno.status === "programado")
          .sort(
            (a, b) =>
              this.parseFecha(a).getTime() - this.parseFecha(b).getTime()
          );
        break;

      case "upcoming":
        list = list
          .filter((turno) => {
            const fechaTurno = this.parseFecha(turno);
            return (
              fechaTurno >= hoy &&
              (turno.status === "confirmado" || turno.status === "reagendado")
            );
          })
          .sort(
            (a, b) =>
              this.parseFecha(a).getTime() - this.parseFecha(b).getTime()
          );
        break;

      case "past":
        list = list
          .filter((turno) => {
            const fechaTurno = this.parseFecha(turno);
            return fechaTurno < hoy || turno.status === "completo";
          })
          .sort(
            (a, b) =>
              this.parseFecha(b).getTime() - this.parseFecha(a).getTime()
          );
        break;

      case "all":
        list = [...this.allTurnos].sort(
          (a, b) => this.parseFecha(b).getTime() - this.parseFecha(a).getTime()
        );
        break;
    }

    this.filteredTurnos = list;
    this.applySearch(); // Aplicar búsqueda sobre el filtro
  }

  private parseFecha(turno: any): Date {
    const meses = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SEP",
      "OCT",
      "NOV",
      "DIC",
    ];
    const monthIndex = meses.indexOf(turno.month);
    return new Date(
      turno.year || new Date().getFullYear(),
      monthIndex,
      parseInt(turno.day)
    );
  }

  setFilter(filter: "pending" | "upcoming" | "past" | "all") {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applySearch() {
    if (!this.searchQuery.trim()) {
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredTurnos = this.filteredTurnos.filter(
      (turno) =>
        turno.patientName.toLowerCase().includes(query) ||
        turno.doctor.toLowerCase().includes(query) ||
        turno.location.toLowerCase().includes(query) ||
        // turno.patientDNI.includes(query) ||
        turno.id.toString().includes(query)
    );
  }

  // Métodos para verificar qué acciones se pueden realizar
  canPerformActions(turno: any): boolean {
    return turno.status !== "cancelado" && turno.status !== "completo";
  }

  canConfirm(turno: any): boolean {
    return turno.status === "programado" || turno.status === "reagendado";
  }

  canReschedule(turno: any): boolean {
    return (
      turno.status === "programado" ||
      turno.status === "confirmado" ||
      turno.status === "reagendado"
    );
  }

  canCancel(turno: any): boolean {
    return (
      turno.status === "programado" ||
      turno.status === "confirmado" ||
      turno.status === "reagendado"
    );
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      confirmado: "fa-check-circle",
      programado: "fa-clock",
      reagendado: "fa-calendar-alt",
      completo: "fa-check-square",
      cancelado: "fa-times-circle",
    };
    return iconMap[status] || "fa-clock";
  }

  getEmptyStateText(): string {
    switch (this.currentFilter) {
      case "pending":
        return "pendientes";
      case "upcoming":
        return "próximos";
      case "past":
        return "pasados";
      case "all":
        return "registrados";
      default:
        return "";
    }
  }

  getEmptyStateDescription(): string {
    switch (this.currentFilter) {
      case "pending":
        return "No hay turnos pendientes de confirmación.";
      case "upcoming":
        return "No hay turnos próximos programados.";
      case "past":
        return "No hay turnos pasados registrados.";
      case "all":
        return "No hay turnos en el sistema.";
      default:
        return "";
    }
  }

  private convertirTurnoParaDashboard(turno: Turno): any {
    // Parsear fecha sin conversión a UTC para evitar problemas de zona horaria
    const [year, month, day] = turno.fecha.split("-").map(Number);
    const fecha = new Date(year, month - 1, day); // month es 0-indexed
    const meses = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SEP",
      "OCT",
      "NOV",
      "DIC",
    ];

    return {
      id: turno.id,
      day: fecha.getDate().toString().padStart(2, "0"),
      month: meses[fecha.getMonth()],
      year: fecha.getFullYear(),
      time: turno.horaInicio,
      patientName: `${turno.nombrePaciente} ${turno.apellidoPaciente}`,
      doctor: `${turno.staffMedicoNombre} ${turno.staffMedicoApellido}`,
      specialty: turno.especialidadStaffMedico,
      location: turno.nombreCentro,
      status: turno.estado?.toLowerCase() || "programado",
    };
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      confirmado: "Confirmado",
      programado: "Programado",
      reagendado: "Reagendar",
      completo: "Completado",
      cancelado: "Cancelado",
    };
    return statusMap[status] || status;
  }

  confirmarTurno(turno: any) {
    const confirmMessage = `¿Deseas confirmar este turno?\n\nFecha: ${turno.day}/${turno.month}\nHora: ${turno.time}\nPaciente: ${turno.patientName}`;

    if (confirm(confirmMessage)) {
      this.turnoService.confirmar(turno.id).subscribe({
        next: (response) => {
          console.log("Turno confirmado exitosamente:", response);
          // Actualizar el estado localmente
          turno.status = "confirmado";
          // Mostrar mensaje de éxito
          alert("Turno confirmado exitosamente.");
          // Recargar la lista de turnos para reflejar cambios
          this.cargarTurnos();
        },
        error: (error) => {
          console.error("Error confirmando el turno:", error);
          alert(
            "No se pudo confirmar el turno. Por favor, intenta nuevamente."
          );
        },
      });
    }
  }

  reprogramarTurno(turno: any) {
    // Redirigir al componente de reagendamiento con el ID del turno
    this.router.navigate(["/operador-reagendar-turno", turno.id]); // Asumiendo una ruta específica para operador
  }

  cancelarTurno(turno: any) {
    this.selectedTurno = turno;
    this.motivo = "";
    this.showReasonModal = true;
  }

  closeModal() {
    this.showReasonModal = false;
    this.motivo = "";
    this.selectedTurno = null;
    this.isSubmitting = false;
  }

  submitReason() {
    if (!this.motivo.trim()) {
      alert("Por favor, ingresa un motivo.");
      return;
    }

    if (this.motivo.trim().length < 5) {
      alert("El motivo debe tener al menos 5 caracteres.");
      return;
    }

    this.isSubmitting = true;

    this.turnoService
      .updateEstado(this.selectedTurno.id, "CANCELADO", this.motivo.trim())
      .subscribe({
        next: (response) => {
          console.log("Turno cancelado exitosamente:", response);
          alert("Turno cancelado exitosamente.");
          this.cargarTurnos();
          this.closeModal();
        },
        error: (error) => {
          console.error("Error cancelando el turno:", error);
          let errorMessage = "No se pudo cancelar el turno.";
          if (error.error && error.error.status_text) {
            errorMessage += " Motivo: " + error.error.status_text;
          }
          alert(errorMessage);
          this.isSubmitting = false;
        },
      });
  }

  verDetalle(turnoId: number) {
    this.router.navigate(["/turnos", turnoId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/"]);
  }

  scheduleAppointment() {
    this.router.navigate(["/turnos"]); // Ruta para agendar turno como operador
  }

  goToTurnos() {
    this.router.navigate(["/turnos"]);
  }

  goToOperadores() {
    this.router.navigate(["/operadores"]);
  }

  goToCentros() {
    this.router.navigate(["/centros"]);
  }

  goToReportes() {
    this.router.navigate(["/reportes"]);
  }

  viewNotifications() {
    this.router.navigate(["/operador-notificaciones"]); // Ruta adaptada para operador
  }
}
