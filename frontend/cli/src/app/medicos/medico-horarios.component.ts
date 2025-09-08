import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';

@Component({
  selector: 'app-medico-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medico-horarios">
      <!-- Floating Particles Background -->
      <div class="particles-bg">
        <div class="particle" *ngFor="let p of particles; let i = index" [style.left.px]="p.x" [style.top.px]="p.y" [style.animation-delay.s]="i * 0.2"></div>
      </div>

      <!-- Header Section -->
      <div class="header-section">
        <div class="header-glow"></div>
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="header-text">
              <h1>Gestión de Horarios</h1>
              <p class="header-subtitle">Configura tu disponibilidad médica</p>
            </div>
          </div>
          <button class="btn-back" (click)="volverAlDashboard()">
            <i class="fas fa-arrow-left"></i>
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-section" *ngIf="!mostrarFormulario">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ disponibilidades.length }}</div>
            <div class="stat-label">Configuraciones</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalHorarios() }}</div>
            <div class="stat-label">Horarios Activos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-week"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getDiasActivos() }}</div>
            <div class="stat-label">Días de la Semana</div>
          </div>
        </div>
      </div>

      <!-- Horarios Actuales -->
      <div class="horarios-section" *ngIf="!mostrarFormulario">
        <div class="section-background"></div>
        <div class="section-header">
          <div class="section-title">
            <div class="title-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="title-content">
              <h2>Mis Horarios Configurados</h2>
              <p class="section-subtitle">Gestiona tu disponibilidad semanal</p>
            </div>
          </div>
          <button class="btn-add-schedule" (click)="toggleFormulario()">
            <i class="fas fa-plus" *ngIf="disponibilidades.length === 0"></i>
            <i class="fas fa-edit" *ngIf="disponibilidades.length > 0"></i>
            <span>{{ disponibilidades.length === 0 ? 'Nuevo Horario' : 'Editar Horarios' }}</span>
          </button>
        </div>

        <!-- Loading State -->
        <div class="loading-container" *ngIf="cargando">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Cargando horarios...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!cargando && disponibilidades.length === 0">
          <div class="empty-illustration">
            <div class="empty-icon">
              <i class="fas fa-calendar-times"></i>
            </div>
            <div class="empty-content">
              <h3>No tienes horarios configurados</h3>
              <p>Configura tus horarios de disponibilidad para que los pacientes puedan agendar turnos contigo</p>
              <button class="btn-primary-action" (click)="toggleFormulario()">
                <i class="fas fa-plus me-2"></i>
                Configurar Primer Horario
              </button>
            </div>
          </div>
        </div>

        <!-- Horarios Grid -->
        <div class="horarios-grid" *ngIf="!cargando && disponibilidades.length > 0">
          <div class="horario-card" *ngFor="let disponibilidad of disponibilidades">
            <div class="card-header">
              <div class="card-title">
                <i class="fas fa-calendar-check me-2"></i>
                Configuración #{{ disponibilidad.id }}
              </div>
              <div class="card-actions">
                <button class="action-btn edit-btn" (click)="editarDisponibilidad(disponibilidad)" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" (click)="eliminarDisponibilidad(disponibilidad)" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <div class="horarios-list">
                <div class="horario-item" *ngFor="let horario of disponibilidad.horarios">
                  <div class="day-badge">
                    <span class="day-name">{{ horario.dia }}</span>
                  </div>
                  <div class="time-range">
                    <span class="time-start">{{ horario.horaInicio | slice:0:5 }}</span>
                    <span class="time-separator">-</span>
                    <span class="time-end">{{ horario.horaFin | slice:0:5 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de Horarios -->
      <div class="form-section" *ngIf="mostrarFormulario">
        <div class="form-background"></div>
        <div class="form-container">
          <div class="form-header">
            <div class="form-title">
              <div class="title-icon">
                <i class="fas fa-plus-circle"></i>
              </div>
              <div class="title-content">
                <h2>{{ modoEdicion ? 'Editar' : 'Nueva' }} Disponibilidad</h2>
                <p class="form-subtitle">Configura tus horarios de atención</p>
              </div>
            </div>
            <button class="btn-close" (click)="cancelarFormulario()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="guardarDisponibilidad()" class="schedule-form">
            <!-- Plantillas Rápidas -->
            <div class="templates-section">
              <h3>
                <i class="fas fa-magic me-2"></i>
                Plantillas Rápidas
              </h3>
              <div class="templates-grid">
                <button type="button" class="template-card template-morning" (click)="aplicarPlantilla('manana')">
                  <div class="template-icon">
                    <i class="fas fa-sun"></i>
                  </div>
                  <div class="template-content">
                    <div class="template-name">Turno Mañana</div>
                    <div class="template-time">08:00 - 13:00</div>
                  </div>
                </button>

                <button type="button" class="template-card template-afternoon" (click)="aplicarPlantilla('tarde')">
                  <div class="template-icon">
                    <i class="fas fa-cloud-sun"></i>
                  </div>
                  <div class="template-content">
                    <div class="template-name">Turno Tarde</div>
                    <div class="template-time">14:00 - 19:00</div>
                  </div>
                </button>

                <button type="button" class="template-card template-full" (click)="aplicarPlantilla('completo')">
                  <div class="template-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="template-content">
                    <div class="template-name">Jornada Completa</div>
                    <div class="template-time">08:00 - 18:00</div>
                  </div>
                </button>

                <button type="button" class="template-card template-custom" (click)="aplicarPlantilla('personalizado')">
                  <div class="template-icon">
                    <i class="fas fa-cogs"></i>
                  </div>
                  <div class="template-content">
                    <div class="template-name">Personalizado</div>
                    <div class="template-time">Configurar</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Configuración de Horarios -->
            <div class="schedule-section">
              <div class="section-title-flex">
                <h3>
                  <i class="fas fa-calendar-alt me-2"></i>
                  Configuración de Horarios
                </h3>
                <button type="button" class="btn-add-time" (click)="agregarHorario()">
                  <i class="fas fa-plus me-1"></i>
                  Agregar Horario
                </button>
              </div>

              <div class="horarios-form-list">
                <div class="horario-form-item" *ngFor="let horario of horariosForm; let i = index">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Día</label>
                      <select class="form-select" [(ngModel)]="horariosForm[i].dia" name="dia{{i}}">
                        <option value="">Seleccionar día...</option>
                        <option *ngFor="let dia of diasSemana" [value]="dia.valor">{{ dia.nombre }}</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="form-label">Hora Inicio</label>
                      <input type="time" class="form-control" [(ngModel)]="horariosForm[i].horaInicio" name="horaInicio{{i}}">
                    </div>

                    <div class="form-group">
                      <label class="form-label">Hora Fin</label>
                      <input type="time" class="form-control" [(ngModel)]="horariosForm[i].horaFin" name="horaFin{{i}}">
                    </div>

                    <div class="form-actions">
                      <button type="button" class="btn-remove" (click)="eliminarHorario(i)" title="Eliminar horario">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="no-schedules" *ngIf="horariosForm.length === 0">
                  <div class="no-schedules-icon">
                    <i class="fas fa-info-circle"></i>
                  </div>
                  <p>Haga clic en "Agregar Horario" para configurar días y horarios de disponibilidad</p>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions-section">
              <button type="button" class="btn-cancel" (click)="cancelarFormulario()">
                <i class="fas fa-times me-2"></i>
                Cancelar
              </button>
              <button type="submit" class="btn-save" [disabled]="guardando || horariosForm.length === 0">
                <i class="fas fa-spinner fa-spin me-2" *ngIf="guardando"></i>
                <i class="fas fa-save me-2" *ngIf="!guardando"></i>
                {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="tips-section" *ngIf="!mostrarFormulario">
        <div class="tips-background"></div>
        <div class="tips-header">
          <div class="tips-icon">
            <i class="fas fa-lightbulb"></i>
          </div>
          <h3>Consejos para la gestión de horarios</h3>
        </div>
        
        <div class="tips-grid">
          <div class="tip-card tip-success">
            <div class="tip-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="tip-content">
              <h4>Buenas Prácticas</h4>
              <ul>
                <li>Mantén horarios consistentes por día</li>
                <li>Deja tiempo entre turnos para descanso</li>
                <li>Actualiza tus horarios con anticipación</li>
              </ul>
            </div>
          </div>

          <div class="tip-card tip-info">
            <div class="tip-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="tip-content">
              <h4>Información Importante</h4>
              <ul>
                <li>Los cambios afectan turnos futuros</li>
                <li>Se notificará a pacientes afectados</li>
                <li>Revisa conflictos antes de confirmar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .medico-horarios {
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
    .header-section {
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

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .header-icon {
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
    }

    .header-text h1 {
      color: #2c3e50;
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #2c3e50 0%, #667eea 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-subtitle {
      color: #6c757d;
      font-size: 1.1rem;
      margin: 0;
    }

    .btn-back {
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

    .btn-back:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(108, 117, 125, 0.4);
    }

    /* Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
      position: relative;
      z-index: 10;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 35px rgba(0,0,0,0.12);
    }

    .stat-icon {
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

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      line-height: 1;
      margin-bottom: 0.3rem;
    }

    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Horarios Section */
    .horarios-section {
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

    .btn-add-schedule {
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

    .btn-add-schedule:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
    }

    /* Loading State */
    .loading-container {
      text-align: center;
      padding: 3rem 2rem;
      position: relative;
      z-index: 2;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(102, 126, 234, 0.2);
      border-left: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
      margin: 0 0 1.5rem 0;
      max-width: 400px;
    }

    .btn-primary-action {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
    }

    /* Horarios Grid */
    .horarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    .horario-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .horario-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 35px rgba(0,0,0,0.12);
    }

    .card-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      background: rgba(102, 126, 234, 0.02);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }

    .edit-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .edit-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .delete-btn {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    .delete-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    }

    .card-body {
      padding: 1.5rem 2rem;
    }

    .horarios-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .horario-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .day-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .time-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .time-separator {
      color: #6c757d;
      font-size: 1.2rem;
    }

    /* Form Section */
    .form-section {
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

    .form-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-100px, -100px);
      pointer-events: none;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 2;
    }

    .form-title {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .form-title h2 {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
    }

    .form-subtitle {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0.3rem 0 0 0;
    }

    .btn-close {
      width: 40px;
      height: 40px;
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      background: #dc3545;
      color: white;
      transform: scale(1.1);
    }

    .schedule-form {
      position: relative;
      z-index: 2;
    }

    /* Templates Section */
    .templates-section {
      margin-bottom: 2.5rem;
    }

    .templates-section h3 {
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .template-card {
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(102, 126, 234, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
    }

    .template-card:hover {
      transform: translateY(-4px);
      border-color: rgba(102, 126, 234, 0.3);
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    }

    .template-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.3rem;
    }

    .template-morning .template-icon {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }

    .template-afternoon .template-icon {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .template-full .template-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .template-custom .template-icon {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    }

    .template-content {
      flex: 1;
    }

    .template-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 1rem;
      margin-bottom: 0.3rem;
    }

    .template-time {
      color: #6c757d;
      font-size: 0.9rem;
    }

    /* Schedule Section */
    .schedule-section {
      margin-bottom: 2.5rem;
    }

    .section-title-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .schedule-section h3 {
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .btn-add-time {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
      border: none;
      padding: 0.8rem 1.2rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .btn-add-time:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(67, 233, 123, 0.3);
    }

    .horarios-form-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .horario-form-item {
      background: rgba(102, 126, 234, 0.03);
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid rgba(102, 126, 234, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1.5fr auto;
      gap: 1rem;
      align-items: end;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      color: #495057;
      font-weight: 600;
      font-size: 0.9rem;
      margin: 0;
    }

    .form-select,
    .form-control {
      padding: 0.8rem 1rem;
      border: 2px solid rgba(102, 126, 234, 0.1);
      border-radius: 10px;
      background: white;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .form-select:focus,
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-actions {
      display: flex;
      align-items: center;
    }

    .btn-remove {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-remove:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    }

    .no-schedules {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
      background: rgba(102, 126, 234, 0.03);
      border-radius: 16px;
      border: 2px dashed rgba(102, 126, 234, 0.2);
    }

    .no-schedules-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #adb5bd;
    }

    /* Form Actions */
    .form-actions-section {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(0,0,0,0.05);
    }

    .btn-cancel {
      background: rgba(108, 117, 125, 0.1);
      color: #6c757d;
      border: 2px solid rgba(108, 117, 125, 0.2);
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-cancel:hover {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }

    .btn-save {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Tips Section */
    .tips-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.08),
        0 8px 20px rgba(0,0,0,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      z-index: 10;
      overflow: hidden;
    }

    .tips-background {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(50px, 50px);
      pointer-events: none;
    }

    .tips-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      position: relative;
      z-index: 2;
    }

    .tips-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.3rem;
      box-shadow: 0 8px 20px rgba(255, 193, 7, 0.3);
    }

    .tips-header h3 {
      color: #2c3e50;
      font-size: 1.4rem;
      font-weight: 600;
      margin: 0;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 2;
    }

    .tip-card {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 16px;
      padding: 1.5rem;
      border-left: 4px solid;
    }

    .tip-success {
      border-left-color: #28a745;
    }

    .tip-info {
      border-left-color: #17a2b8;
    }

    .tip-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .tip-success .tip-icon {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .tip-info .tip-icon {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    }

    .tip-content h4 {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }

    .tip-content ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tip-content li {
      color: #6c757d;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      padding-left: 1.5rem;
      position: relative;
    }

    .tip-content li::before {
      content: '•';
      color: #667eea;
      font-size: 1.2rem;
      position: absolute;
      left: 0;
      top: -2px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .medico-horarios {
        padding: 1rem 0.5rem;
      }

      .header-section,
      .horarios-section,
      .form-section,
      .tips-section {
        padding: 1.5rem 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .header-info {
        flex-direction: column;
        gap: 1rem;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .form-header {
        flex-direction: column;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .templates-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .horarios-grid {
        grid-template-columns: 1fr;
      }

      .tips-grid {
        grid-template-columns: 1fr;
      }

      .form-actions-section {
        flex-direction: column;
      }

      .section-title-flex {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class MedicoHorariosComponent implements OnInit {
  disponibilidades: DisponibilidadMedico[] = [];
  mostrarFormulario = false;
  modoEdicion = false;
  disponibilidadEditando: DisponibilidadMedico | null = null;
  cargando = false;
  guardando = false;

  horariosForm: { dia: string, horaInicio: string, horaFin: string }[] = [];

  // Particles for background animation
  particles: Array<{x: number, y: number}> = [];

  diasSemana = [
    { nombre: 'Lunes', valor: 'LUNES' },
    { nombre: 'Martes', valor: 'MARTES' },
    { nombre: 'Miércoles', valor: 'MIERCOLES' },
    { nombre: 'Jueves', valor: 'JUEVES' },
    { nombre: 'Viernes', valor: 'VIERNES' },
    { nombre: 'Sábado', valor: 'SABADO' },
    { nombre: 'Domingo', valor: 'DOMINGO' }
  ];

  constructor(
    private router: Router,
    private disponibilidadService: DisponibilidadMedicoService
  ) {
    this.initializeParticles();
  }

  ngOnInit() {
    this.cargarDisponibilidades();
  }

  cargarDisponibilidades() {
    this.cargando = true;
    const medicoId = this.getMedicoIdFromSession();

    this.disponibilidadService.byMedico(medicoId).subscribe({
      next: (response) => {
        this.disponibilidades = response.data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar disponibilidades:', error);
        this.cargando = false;
      }
    });
  }

  agregarHorario() {
    this.horariosForm.push({ dia: '', horaInicio: '08:00', horaFin: '17:00' });
  }

  eliminarHorario(index: number) {
    this.horariosForm.splice(index, 1);
  }

  aplicarPlantilla(tipo: string) {
    this.horariosForm.forEach(horario => {
      switch (tipo) {
        case 'manana':
          horario.horaInicio = '08:00';
          horario.horaFin = '13:00';
          break;
        case 'tarde':
          horario.horaInicio = '14:00';
          horario.horaFin = '19:00';
          break;
        case 'completo':
          horario.horaInicio = '08:00';
          horario.horaFin = '18:00';
          break;
      }
    });
  }

  guardarDisponibilidad() {
    const horarios = this.horariosForm.filter(h => h.dia && h.horaInicio && h.horaFin);
    
    if (horarios.length === 0) {
      alert('Debe configurar al menos un horario');
      return;
    }

    this.guardando = true;
    const staffMedicoId = this.getMedicoIdFromSession();

    if (this.modoEdicion && this.disponibilidadEditando) {
      // Actualizar disponibilidad existente
      const operacion = this.disponibilidadService.update(this.disponibilidadEditando.id!, {
        id: this.disponibilidadEditando.id!,
        staffMedicoId,
        horarios
      } as DisponibilidadMedico);

      operacion.subscribe({
        next: () => {
          this.guardando = false;
          this.cancelarFormulario();
          this.cargarDisponibilidades();
          alert('Horarios actualizados correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.guardando = false;
          alert('Error al actualizar los horarios');
        }
      });
    } else {
      // Crear nueva disponibilidad
      const operacion = this.disponibilidadService.create({
        id: 0,
        staffMedicoId,
        horarios
      } as DisponibilidadMedico);

      operacion.subscribe({
        next: () => {
          this.guardando = false;
          this.cancelarFormulario();
          this.cargarDisponibilidades();
          alert('Horarios guardados correctamente');
        },
        error: (error) => {
          console.error('Error al guardar:', error);
          this.guardando = false;
          alert('Error al guardar los horarios');
        }
      });
    }
  }

  editarDisponibilidad(disponibilidad: DisponibilidadMedico) {
    this.modoEdicion = true;
    this.disponibilidadEditando = disponibilidad;
    this.mostrarFormulario = true;

    // Debug: verificar qué días están llegando de la BD
    console.log('Disponibilidad a editar:', disponibilidad);
    console.log('Horarios:', disponibilidad.horarios);

    // Cargar datos para edición - asegurarnos de que el día se cargue correctamente
    this.horariosForm = disponibilidad.horarios?.map(horario => {
      console.log('Día del horario original:', horario.dia);
      const diaNormalizado = this.normalizarDia(horario.dia);
      console.log('Día normalizado:', diaNormalizado);
      return {
        dia: diaNormalizado, // Normalizar el día para que coincida con nuestros valores
        horaInicio: horario.horaInicio.slice(0, 5), // Formato HH:MM
        horaFin: horario.horaFin.slice(0, 5) // Formato HH:MM
      };
    }) || [];

    console.log('Formulario cargado:', this.horariosForm);

    // Si no hay horarios, agregar uno vacío por defecto
    if (this.horariosForm.length === 0) {
      this.agregarHorario();
    }
  }

  eliminarDisponibilidad(disponibilidad: DisponibilidadMedico) {
    if (confirm('¿Estás seguro de eliminar esta disponibilidad? Esta acción no se puede deshacer.')) {
      if (disponibilidad.id) {
        this.disponibilidadService.remove(disponibilidad.id!).subscribe({
          next: () => {
            this.cargarDisponibilidades();
            alert('Disponibilidad eliminada correctamente');
          },
          error: (error: any) => {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar la disponibilidad');
          }
        });
      }
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.disponibilidadEditando = null;
    this.horariosForm = [];
  }

  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
  }

  private getMedicoIdFromSession(): number {
    const medicoId = localStorage.getItem('medicoId');
    return medicoId ? parseInt(medicoId, 10) : 1;
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

  getTotalHorarios(): number {
    return this.disponibilidades.reduce((total, disponibilidad) => {
      return total + (disponibilidad.horarios?.length || 0);
    }, 0);
  }

  getDiasActivos(): number {
    const diasUnicos = new Set();
    this.disponibilidades.forEach(disponibilidad => {
      disponibilidad.horarios?.forEach(horario => {
        diasUnicos.add(horario.dia);
      });
    });
    return diasUnicos.size;
  }

  toggleFormulario() {
    if (this.disponibilidades.length > 0) {
      // Si hay disponibilidades, editar la primera (normalmente solo hay una)
      this.editarDisponibilidad(this.disponibilidades[0]);
    } else {
      // Si no hay disponibilidades, crear nueva
      this.mostrarFormulario = true;
      this.modoEdicion = false;
      this.horariosForm = [];
    }
  }

  private normalizarDia(dia: string): string {
    // Normalizar el día a mayúsculas y sin acentos para que coincida con nuestros valores
    const diaLimpio = dia.toUpperCase()
      .replace('É', 'E')
      .replace('Á', 'A')
      .replace('Í', 'I')
      .replace('Ó', 'O')
      .replace('Ú', 'U');
    
    // Mapear días conocidos
    const mapaDias: { [key: string]: string } = {
      'LUNES': 'LUNES',
      'MARTES': 'MARTES',
      'MIERCOLES': 'MIERCOLES',
      'MIÉRCOLES': 'MIERCOLES',
      'JUEVES': 'JUEVES',
      'VIERNES': 'VIERNES',
      'SABADO': 'SABADO',
      'SÁBADO': 'SABADO',
      'DOMINGO': 'DOMINGO'
    };

    return mapaDias[diaLimpio] || dia; // Si no encuentra el mapeo, devuelve el original
  }
}