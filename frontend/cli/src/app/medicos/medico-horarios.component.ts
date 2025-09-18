import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisponibilidadMedicoService } from '../disponibilidadMedicos/disponibilidadMedico.service';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';
import { MedicoService } from './medico.service';
import { Medico } from './medico';
import { Especialidad } from '../especialidades/especialidad';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';

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

      <!-- Selector de Centro de Atención -->
      <div class="center-selection-section" *ngIf="!mostrarFormulario">
        <div class="center-selection-background"></div>
        
        <!-- Estado de carga -->
        <div class="center-loading" *ngIf="cargando">
          <div class="loading-spinner-small">
            <div class="spinner"></div>
            <p>Cargando información del centro...</p>
          </div>
        </div>
        
        <!-- Contenido principal simplificado -->
        <div class="center-content" *ngIf="!cargando">
          <!-- Solo nombre del centro en la parte superior -->
          <div class="center-name-header">
            <h3>
              <i class="fas fa-building"></i>
              {{ getNombreCentroActual() }}
            </h3>
          </div>
          
          <!-- Selector para cambiar de centro (solo si hay múltiples centros) -->
          <div class="center-selector" *ngIf="getTotalCentrosDisponibles() > 1">
            <label>Cambiar a otro centro:</label>
            <select class="form-select" (change)="onCambiarCentro($event)">
              <option value="">Seleccionar centro...</option>
              <option 
                *ngFor="let centro of getCentrosUnicos()" 
                [value]="centro.nombre">
                {{ centro.nombre }}
              </option>
            </select>
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

       

        <!-- Horarios Grid - Agrupados por Especialidad -->
        <div class="especialidades-container" *ngIf="!cargando && getEspecialidadesDelCentroActual().length > 0">
          <div class="especialidad-section" *ngFor="let especialidad of getEspecialidadesDelCentroActual(); let i = index">
            <div class="especialidad-card">
              <div class="card-background"></div>
              <div class="card-glow"></div>
              
              <div class="especialidad-header">
                <div class="especialidad-info">
                  <div class="especialidad-icon" [class]="'icon-variant-' + (i % 4 + 1)">
                    <i class="fas fa-stethoscope"></i>
                    <div class="icon-pulse"></div>
                  </div>
                  <div class="especialidad-details">
                    <h3>{{ especialidad.nombre }}</h3>
                    <div class="status-badge" [class.status-configured]="especialidadTieneDisponibilidades(especialidad.id)" [class.status-pending]="!especialidadTieneDisponibilidades(especialidad.id)">
                      <i class="fas fa-check-circle" *ngIf="especialidadTieneDisponibilidades(especialidad.id)"></i>
                      <i class="fas fa-clock" *ngIf="!especialidadTieneDisponibilidades(especialidad.id)"></i>
                      <span>{{ especialidadTieneDisponibilidades(especialidad.id) ? 'Configurado' : 'Pendiente' }}</span>
                    </div>
                  </div>
                </div>
                <div class="especialidad-actions">
                  <button 
                    class="btn-configure" 
                    *ngIf="!especialidadTieneDisponibilidades(especialidad.id)"
                    (click)="nuevaDisponibilidadParaEspecialidad(especialidad.id)">
                    <i class="fas fa-plus me-2"></i>
                    <span>Configurar Horarios</span>
                    <div class="btn-shine"></div>
                  </button>
                  <div class="summary-stats" *ngIf="especialidadTieneDisponibilidades(especialidad.id)">
                    <div class="stat-item">
                      <i class="fas fa-calendar-week"></i>
                      <span>{{ getHorariosPorEspecialidad(especialidad.id).length }} configuraciones</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Disponibilidades para esta especialidad -->
              <div class="horarios-content" *ngIf="especialidadTieneDisponibilidades(especialidad.id)">
                <div class="horarios-grid">
                  <div class="horario-card" *ngFor="let disponibilidad of disponibilidadesPorEspecialidad[especialidad.id]">
                    <div class="card-header">
                      <div class="card-title">
                        <div class="title-icon">
                          <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="title-content">
                          <span class="title-main">Horarios de {{ especialidad.nombre }}</span>
                          <span class="title-sub">{{ disponibilidad.horarios.length }} días configurados</span>
                        </div>
                      </div>
                      <div class="card-actions">
                        <button class="action-btn edit-btn" (click)="editarDisponibilidad(disponibilidad)" title="Editar horarios">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" (click)="eliminarDisponibilidad(disponibilidad)" title="Eliminar configuración">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="card-body">
                      <div class="horarios-list">
                        <div class="horario-item" *ngFor="let horario of disponibilidad.horarios; let j = index">
                          <div class="day-badge" [class]="'day-' + (j % 7)">
                            <div class="day-icon">
                              <i class="fas fa-calendar-day"></i>
                            </div>
                            <span class="day-name">{{ horario.dia }}</span>
                          </div>
                          <div class="time-range">
                            <div class="time-block">
                              <i class="fas fa-clock time-icon"></i>
                              <span class="time-start">{{ horario.horaInicio | slice:0:5 }}</span>
                            </div>
                            <div class="time-separator">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                            <div class="time-block">
                              <i class="fas fa-clock time-icon"></i>
                              <span class="time-end">{{ horario.horaFin | slice:0:5 }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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

            <!-- Selección de Especialidad -->
            <div class="specialty-section">
              <h3>
                <i class="fas fa-stethoscope me-2"></i>
                Especialidad
              </h3>
              <div class="specialty-selection">
                <div class="form-group">
                  <label class="form-label">Seleccionar Especialidad *</label>
                  <select class="form-select specialty-select" [(ngModel)]="especialidadSeleccionada" name="especialidad" [disabled]="modoEdicion">
                    <option value="">Seleccionar especialidad...</option>
                    <option *ngFor="let especialidad of getEspecialidadesDelCentroActual()" [value]="especialidad.id">
                      {{ especialidad.nombre }}
                      <span *ngIf="especialidadTieneDisponibilidades(especialidad.id) && !modoEdicion" class="specialty-status">(Ya configurada)</span>
                    </option>
                  </select>
                  <div class="specialty-info" *ngIf="especialidadSeleccionada">
                    <div class="info-card">
                      <i class="fas fa-info-circle me-2"></i>
                      {{ modoEdicion ? 'Editando horarios para:' : 'Configurando horarios para:' }} <strong>{{ getNombreEspecialidad(especialidadSeleccionada) }}</strong>
                    </div>
                  </div>
                  <div class="specialty-warning" *ngIf="!especialidadSeleccionada">
                    <div class="warning-card">
                      <i class="fas fa-exclamation-triangle me-2"></i>
                      Debe seleccionar una especialidad antes de configurar horarios
                    </div>
                  </div>
                </div>
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

    /* Center Selection Section */
    .center-selection-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.08),
        0 8px 20px rgba(0,0,0,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      z-index: 10;
    }

    .center-selection-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
      border-radius: 24px;
      pointer-events: none;
    }

    .center-selection-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 2;
      margin-bottom: 1.5rem;
    }

    .center-icon {
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

    .center-info h3 {
      color: #2c3e50;
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .center-current {
      color: #495057;
      font-size: 1.1rem;
      margin: 0;
    }

    .specialty-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-left: 1rem;
    }

    .centers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .center-card {
      background: rgba(255, 255, 255, 0.8);
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .center-card:hover {
      border-color: rgba(102, 126, 234, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
    }

    .center-card.active {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
    }

    .center-card-content {
      flex: 1;
    }

    .center-name {
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .center-specialty {
      color: #667eea;
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.3rem;
    }

    .center-address {
      color: #6c757d;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .center-status {
      color: #28a745;
      font-size: 1.5rem;
    }

    /* Nuevos estilos para UI mejorada */
    .center-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .loading-spinner-small {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-spinner-small .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid rgba(102, 126, 234, 0.3);
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .current-center {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .center-main-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .center-name {
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .center-details {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-left: 0.5rem;
    }

    .center-address, .center-phone {
      color: #6c757d;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .no-center-selected {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      color: #dc3545;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .center-count {
      display: flex;
      align-items: center;
    }

    .count-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .centers-header {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .centers-header h4 {
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .centers-header p {
      color: #6c757d;
      font-size: 0.95rem;
      margin: 0;
    }

    .center-card-header {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      margin-bottom: 0.8rem;
    }

    .center-card-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .center-stats {
      display: flex;
      gap: 1rem;
    }

    .stat-item {
      color: #667eea;
      font-size: 0.85rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .single-center-message, .no-centers-message {
      margin-top: 1rem;
      text-align: center;
    }

    .info-card {
      background: rgba(23, 162, 184, 0.1);
      border: 1px solid rgba(23, 162, 184, 0.3);
      color: #17a2b8;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      font-weight: 500;
    }

    .warning-card {
      background: rgba(220, 53, 69, 0.05);
      border: 1px solid rgba(220, 53, 69, 0.2);
      color: #dc3545;
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .warning-content h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .warning-content p {
      margin: 0;
      font-size: 0.95rem;
      opacity: 0.8;
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

    /* Especialidades Container - Layout principal */
    .especialidades-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 1rem 0;
      animation: fadeInUp 0.8s ease-out;
    }

    .especialidad-section {
      position: relative;
      width: 100%;
    }

    /* Especialidad Card - Contenedor principal con glassmorphismo */
    .especialidad-card {
      position: relative;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(226, 232, 240, 0.5);
      border-radius: 24px;
      padding: 2rem;
      margin-bottom: 1.5rem;
   
      overflow: hidden;
    }

    .especialidad-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

   
    .especialidad-card:hover::before {
      opacity: 1;
    }

    /* Card Background Effects */
    .card-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 51, 234, 0.03) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

  

    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      right: -50%;
      bottom: -50%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.6s ease;
      z-index: -1;
    }

    /* Especialidad Header */
    .especialidad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
      background: white!important;
      box-shadow:none!important;
    }

    .especialidad-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Especialidad Icon */
    .especialidad-icon {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .icon-variant-1 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .icon-variant-2 {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .icon-variant-3 {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .icon-variant-4 {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .especialidad-icon:hover {
      transform: rotate(5deg) scale(1.1);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
    }

    .icon-pulse {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%) scale(0);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
    }

    .especialidad-details h3 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      background: #3f3f3f;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.5px;
    }

    /* Status Badge */
    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 0.5rem;
      transition: all 0.3s ease;
    }

    .status-configured {
      background: linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(56, 249, 215, 0.2) 100%);
      color: #22c55e;
      border: 1px solid rgba(67, 233, 123, 0.3);
    }

    .status-pending {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
      color: #f59e0b;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    /* Especialidad Actions */
    .especialidad-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-configure {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.875rem 1.5rem;
      border-radius: 16px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
      overflow: hidden;
    }

    .btn-configure::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .btn-configure:hover::before {
      left: 100%;
    }

    .btn-configure:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
    }

    .btn-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    /* Summary Stats */
    .summary-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(248, 250, 252, 0.8);
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      border: 1px solid rgba(226, 232, 240, 0.6);
    }

    .stat-item i {
      color: #3b82f6;
    }

    /* Horarios Content */
    .horarios-content {
      margin-top: 1.5rem;
      animation: slideDown 0.5s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInUp {
      from { 
        opacity: 0; 
        transform: translateY(30px);
      }
      to { 
        opacity: 1; 
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .especialidad-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .especialidad-info {
        width: 100%;
      }

      .especialidad-actions {
        width: 100%;
        justify-content: center;
      }

      .horarios-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .horario-item {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .time-range {
        justify-content: center;
      }

      .especialidad-card {
        padding: 1.5rem;
      }

      .card-header {
        padding: 1rem;
      }

      .card-body {
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .especialidad-icon {
        width: 48px;
        height: 48px;
        font-size: 20px;
      }

      .especialidad-details h3 {
        font-size: 1.4rem;
      }

      .btn-configure {
        padding: 0.75rem 1.25rem;
        font-size: 0.8rem;
      }

      .horario-card {
        border-radius: 16px;
      }

      .day-badge {
        min-width: 100px;
        font-size: 0.8rem;
      }
    }

    /* Horarios Grid - Layout mejorado */
    .horarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    /* Horario Card - Diseño glassmorphismo */
    .horario-card {
      position: relative;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(226, 232, 240, 0.4);
      border-radius: 20px;
      overflow: hidden;
     
    }


    
    .horario-card:hover::before {
      opacity: 1;
    }

    /* Card Header mejorado */
    .card-header {
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(139, 92, 246, 0.04) 100%);
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .title-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .title-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .title-main {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .title-sub {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
      transform: translate(-50%, -50%);
    }

    .action-btn:hover::before {
      width: 100%;
      height: 100%;
    }

    .edit-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .edit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .delete-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .delete-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }

    /* Card Body */
    .card-body {
      padding: 1.5rem;
    }

    .horarios-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Horario Item - Elemento individual mejorado */
    .horario-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%);
      border: 1px solid rgba(226, 232, 240, 0.4);
      border-radius: 16px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .horario-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 0 2px 2px 0;
    }

    .horario-item:hover {
      transform: translateX(4px);
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
      border-color: rgba(59, 130, 246, 0.2);
    }

    /* Day Badge mejorado */
    .day-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .day-0 { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; }
    .day-1 { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; }
    .day-2 { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; }
    .day-3 { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .day-4 { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
    .day-5 { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; }
    .day-6 { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }

    .day-icon {
      font-size: 14px;
      opacity: 0.9;
    }

    .day-name {
      font-weight: 600;
    }

    /* Time Range mejorado */
    .time-range {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #1f2937;
    }

    .time-block {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: rgba(248, 250, 252, 0.8);
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .time-icon {
      font-size: 12px;
      color: #3b82f6;
      opacity: 0.7;
    }

    .time-start, .time-end {
      font-family: 'Segoe UI', monospace;
      font-weight: 700;
    }

    .time-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 50%;
      color: white;
      font-size: 12px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

    /* Specialty Section */
    .specialty-section {
      margin-bottom: 2.5rem;
      padding: 2rem;
      background: rgba(102, 126, 234, 0.03);
      border-radius: 16px;
      border: 1px solid rgba(102, 126, 234, 0.1);
    }

    .specialty-section h3 {
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
    }

    .specialty-selection {
      max-width: 500px;
    }

    .specialty-select {
      font-size: 1rem;
      padding: 1rem;
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-radius: 12px;
      background: white;
      transition: all 0.3s ease;
    }

    .specialty-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .specialty-info {
      margin-top: 1rem;
    }

    .info-card {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(67, 233, 123, 0.2);
    }

    .specialty-warning {
      margin-top: 1rem;
    }

    .warning-card {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
    }

    .specialty-status {
      font-style: italic;
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

    /* Estilos para la interfaz simplificada */
    .center-name-header {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .center-name-header h3 {
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .center-name-header i {
      color: #3498db;
    }

    .specialties-in-center {
      margin-bottom: 1.5rem;
    }

    .specialties-in-center h5 {
      text-align: center;
      color: #34495e;
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .specialty-item {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.25rem;
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
      transition: all 0.3s ease;
    }

    .specialty-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
    }

    .no-specialties {
      text-align: center;
      color: #7f8c8d;
      font-style: italic;
      padding: 1rem;
      background: rgba(241, 196, 15, 0.1);
      border-radius: 8px;
      border-left: 4px solid #f1c40f;
    }

    .no-specialties i {
      margin-right: 0.5rem;
      color: #f39c12;
    }

    .center-selector {
      background: rgba(255, 255, 255, 0.9);
      padding: 1.5rem;
      border-radius: 12px;
      margin-top: 1.5rem;
      border: 1px solid #e0e6ed;
    }

    .center-selector label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2c3e50;
    }

    .center-selector .form-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #bdc3c7;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
      transition: border-color 0.3s ease;
    }

    .center-selector .form-select:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
  `]
})
export class MedicoHorariosComponent implements OnInit {
  disponibilidades: DisponibilidadMedico[] = []; // Disponibilidades del centro actual
  todasLasDisponibilidades: DisponibilidadMedico[] = []; // TODAS las disponibilidades del médico (para validación intercentros)
  mostrarFormulario = false;
  modoEdicion = false;
  disponibilidadEditando: DisponibilidadMedico | null = null;
  cargando = false;
  guardando = false;

  // Nuevas propiedades para especialidades
  medicoActual: Medico | null = null;
  especialidades: Especialidad[] = [];
  especialidadSeleccionada: number | null = null;
  disponibilidadesPorEspecialidad: { [especialidadId: number]: DisponibilidadMedico[] } = {};

  // Nuevas propiedades para múltiples centros de atención
  staffMedicos: any[] = []; // Lista de todos los StaffMedico del médico actual
  staffMedicoSeleccionado: any | null = null; // StaffMedico actual (centro + especialidad específicos)
  centroActual: any | null = null; // Centro de atención actual

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
    private disponibilidadService: DisponibilidadMedicoService,
    private medicoService: MedicoService,
    private staffMedicoService: StaffMedicoService,
  ) {
    this.initializeParticles();
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

  // Helper method to get or fetch staffMedicoId and store it in localStorage
  private getOrFetchStaffMedicoId(): Promise<number | null> {
    return new Promise((resolve) => {
      // First try to get staffMedicoId from localStorage
      const staffMedicoIdStr = localStorage.getItem('staffMedicoId');
      
      if (staffMedicoIdStr && staffMedicoIdStr !== 'null' && staffMedicoIdStr !== '0') {
        const staffMedicoId = parseInt(staffMedicoIdStr, 10);
        if (!isNaN(staffMedicoId) && staffMedicoId > 0) {
          console.log('✅ Found staffMedicoId in localStorage:', staffMedicoId);
          resolve(staffMedicoId);
          return;
        }
      }

      // If not in localStorage, fetch by medicoId
      const medicoId = this.getMedicoIdFromLocalStorage();
      if (!medicoId) {
        console.error('❌ No medicoId found to search for staffMedicoId');
        resolve(null);
        return;
      }

      console.log('🔍 Searching for StaffMedico by medicoId:', medicoId);
      
      this.staffMedicoService.all().subscribe({
        next: (response: any) => {
          const staffMedicos = response?.data || [];
          
          // Find all StaffMedicos that belong to this doctor
          const staffMedicosDelMedico = staffMedicos.filter((sm: any) => 
            sm.medico && sm.medico.id === medicoId
          );
          
          if (staffMedicosDelMedico.length > 0) {
            const staffMedicoId = staffMedicosDelMedico[0].id;
            console.log(`✅ Found ${staffMedicosDelMedico.length} StaffMedico records for doctor. Using first one:`, staffMedicoId);
            
            // Store in localStorage for future use
            localStorage.setItem('staffMedicoId', staffMedicoId.toString());
            resolve(staffMedicoId);
          } else {
            console.error('❌ No StaffMedico records found for medicoId:', medicoId);
            resolve(null);
          }
        },
        error: (error: any) => {
          console.error('❌ Error fetching StaffMedicos:', error);
          resolve(null);
        }
      });
    });
  }

  ngOnInit() {
    console.log('=== INICIANDO COMPONENTE MEDICO-HORARIOS ===');
    this.verificarConfiguracionSesion();
    
    // Validar y corregir localStorage
    this.validarYCorregirLocalStorage();
    
    // Pequeña pausa para que se vean los logs antes de continuar
    setTimeout(() => {
      this.cargarMedicoYEspecialidades();
    }, 100);
  }

  /**
   * Valida y corrige problemas comunes en localStorage
   */
  private validarYCorregirLocalStorage() {
    console.log('🔍 Validando localStorage en componente de horarios...');
    
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
      console.warn('⚠️ medicoId faltante o inválido en componente de horarios');
      
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
      console.warn('🚨 PROBLEMA en horarios: medicoId y staffMedicoId son iguales!', {
        medicoId: finalMedicoId,
        staffMedicoId: finalStaffMedicoId
      });
    }
    
    console.log('✅ Validación de localStorage completada en horarios');
  }

  verificarConfiguracionSesion() {
    console.log('=== VERIFICACIÓN DE SESIÓN DETALLADA ===');
    console.log('Todas las claves en localStorage:', Object.keys(localStorage));
    
    // Verificar cada key individualmente
    const keys = ['currentUser', 'staffMedicoId', 'userId', 'medicoId', 'id'];
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value);
      
      if (key === 'currentUser' && value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`${key} parsed:`, parsed);
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });
    
    // Verificar el resultado del getMedicoIdFromLocalStorage
    const medicoId = this.getMedicoIdFromLocalStorage();
    console.log('ID final detectado por getMedicoIdFromLocalStorage():', medicoId);
    
    console.log('=== FIN VERIFICACIÓN DETALLADA ===');
  }

  cargarMedicoYEspecialidades() {
    // Para cargar el médico usamos el ID del localStorage
    const medicoId = this.getMedicoIdFromLocalStorage();

    if (!medicoId) {
      console.error('Error: No se pudo obtener el ID del médico');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Intentando cargar médico con ID:', medicoId);

    // Cargar información del médico y sus especialidades
    this.medicoService.findById(medicoId).subscribe({
      next: (medico) => {
        console.log('Médico encontrado exitosamente:', medico);
        this.medicoActual = medico;
        this.especialidades = medico.especialidades || [];
        console.log('Especialidades cargadas:', this.especialidades);
        
        // Cargar todos los StaffMedicos del médico
        this.cargarStaffMedicos(medicoId);
      },
      error: (error) => {
        console.error('Error al cargar médico:', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
        console.error('Medico ID usado:', medicoId);
        
        if (error.status === 404) {
          console.error(`⚠️ Médico con ID ${medicoId} no encontrado en el servidor`);
          
          alert(`Error: No se encontró el médico con ID ${medicoId}. 
          
Posible problema de configuración. Verifique:
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
          alert(`Error al cargar información del médico: ${error.error?.message || error.message}`);
        }
      }
    });
  }

  // Nuevo método para cargar todos los StaffMedicos del médico
  cargarStaffMedicos(medicoId: number) {
    console.log('Cargando StaffMedicos para médico:', medicoId);
    
    this.staffMedicoService.getByMedicoId(medicoId).subscribe({
      next: (response) => {
        this.staffMedicos = response.data || [];
        console.log('StaffMedicos cargados - Cantidad:', this.staffMedicos.length);
        console.log('StaffMedicos cargados - Detalle:', this.staffMedicos);
        
        // Log específico de los centros de atención
        this.staffMedicos.forEach((staff, index) => {
          console.log(`Staff ${index}:`, {
            id: staff.id,
            centroAtencion: staff.centroAtencion,
            especialidad: staff.especialidad,
            tienecentro: !!staff.centroAtencion,
            nombrecentro: staff.centroAtencion?.nombre || 'SIN NOMBRE'
          });
        });
        
        // Seleccionar el StaffMedico actual basado en localStorage
        this.seleccionarStaffMedicoActual();
        
        // Solo cargar disponibilidades después de tener el contexto de StaffMedico
        this.cargarDisponibilidades();
      },
      error: (error) => {
        console.error('Error al cargar StaffMedicos:', error);
        alert('Error al cargar información de centros de atención');
        // Continuar con la lógica anterior si falla
        this.cargarDisponibilidades();
      }
    });
  }

  // Método para seleccionar el StaffMedico actual
  seleccionarStaffMedicoActual() {
    const staffMedicoIdStr = localStorage.getItem('staffMedicoId');
    
    if (staffMedicoIdStr && this.staffMedicos.length > 0) {
      const staffMedicoId = parseInt(staffMedicoIdStr, 10);
      
      // Buscar el StaffMedico específico
      this.staffMedicoSeleccionado = this.staffMedicos.find(sm => sm.id === staffMedicoId);
      
      if (this.staffMedicoSeleccionado) {
        console.log('StaffMedico seleccionado:', this.staffMedicoSeleccionado);
        this.centroActual = this.staffMedicoSeleccionado.centroAtencion;
        this.especialidadSeleccionada = this.staffMedicoSeleccionado.especialidad?.id;
      } else {
        console.warn('No se encontró StaffMedico con ID:', staffMedicoId);
        // Seleccionar el primer StaffMedico disponible
        this.staffMedicoSeleccionado = this.staffMedicos[0];
        this.centroActual = this.staffMedicoSeleccionado?.centroAtencion;
        this.especialidadSeleccionada = this.staffMedicoSeleccionado?.especialidad?.id;
        
        // Actualizar localStorage
        if (this.staffMedicoSeleccionado) {
          localStorage.setItem('staffMedicoId', this.staffMedicoSeleccionado.id.toString());
        }
      }
    } else if (this.staffMedicos.length > 0) {
      // Si no hay staffMedicoId en localStorage, seleccionar el primero
      this.staffMedicoSeleccionado = this.staffMedicos[0];
      this.centroActual = this.staffMedicoSeleccionado?.centroAtencion;
      this.especialidadSeleccionada = this.staffMedicoSeleccionado?.especialidad?.id;
      
      // Guardar en localStorage
      localStorage.setItem('staffMedicoId', this.staffMedicoSeleccionado.id.toString());
    }
    
    console.log('Contexto actual:', {
      staffMedico: this.staffMedicoSeleccionado,
      centro: this.centroActual,
      especialidad: this.especialidadSeleccionada
    });
  }

  // Método para cambiar el StaffMedico activo
  cambiarStaffMedico(nuevoStaffMedico: any) {
    console.log('Cambiando a StaffMedico:', nuevoStaffMedico);
    
    this.staffMedicoSeleccionado = nuevoStaffMedico;
    this.centroActual = nuevoStaffMedico?.centroAtencion;
    this.especialidadSeleccionada = nuevoStaffMedico?.especialidad?.id;
    
    // Actualizar localStorage
    localStorage.setItem('staffMedicoId', nuevoStaffMedico.id.toString());
    
    // Recargar disponibilidades para el nuevo contexto
    this.cargarDisponibilidades();
    
    console.log('Nuevo contexto:', {
      staffMedico: this.staffMedicoSeleccionado,
      centro: this.centroActual,
      especialidad: this.especialidadSeleccionada
    });
  }

  getHorariosPorEspecialidad(especialidadId: number): DisponibilidadMedico[] {
    return this.disponibilidadesPorEspecialidad[especialidadId] || [];
  }

  // Método para contar disponibilidades por StaffMedico
  getDisponibilidadesPorStaff(staffMedicoId: number): number {
    return this.todasLasDisponibilidades.filter(disp => disp.staffMedicoId === staffMedicoId).length;
  }



  // Obtener todas las especialidades del médico en el centro actual

  // Obtener el nombre del centro actual de forma segura
  getNombreCentroActual(): string {
    // Primero intentar desde centroActual
    if (this.centroActual?.nombre) {
      return this.centroActual.nombre;
    }
    
    // Luego intentar desde staffMedicoSeleccionado
    if (this.staffMedicoSeleccionado?.centroAtencion?.nombre) {
      return this.staffMedicoSeleccionado.centroAtencion.nombre;
    }
    
    // Si staffMedicoSeleccionado tiene un ID, buscar en el array de staffMedicos
    if (this.staffMedicoSeleccionado?.id && this.staffMedicos?.length > 0) {
      const staffActual = this.staffMedicos.find(sm => sm.id === this.staffMedicoSeleccionado!.id);
      if (staffActual?.centroAtencion?.nombre) {
        return staffActual.centroAtencion.nombre;
      }
    }
    
    // Como fallback, usar el primer staffMedico si existe
    if (this.staffMedicos?.length > 0 && this.staffMedicos[0]?.centroAtencion?.nombre) {
      return this.staffMedicos[0].centroAtencion.nombre;
    }
    
    return 'Centro no disponible';
  }

  // Obtener todas las especialidades del médico en el centro actual
  getEspecialidadesEnCentroActual(): string[] {
    if (!this.staffMedicoSeleccionado || !this.staffMedicos) {
      return [];
    }
    
    const centroId = this.staffMedicoSeleccionado.centroAtencion?.id;
    if (!centroId) return [];
    
    // Filtrar todos los StaffMedicos del mismo centro y devolver solo nombres de especialidades
    return this.staffMedicos
      .filter(sm => sm.centroAtencion?.id === centroId)
      .map(sm => sm.especialidad?.nombre)
      .filter(nombre => nombre); // Filtrar nombres nulos/undefined
  }

  // Obtener solo las especialidades que el médico tiene en el centro actual
  getEspecialidadesDelCentroActual(): Especialidad[] {
    if (!this.staffMedicoSeleccionado || !this.staffMedicos) {
      return [];
    }
    
    const centroId = this.staffMedicoSeleccionado.centroAtencion?.id;
    if (!centroId) return [];
    
    // Filtrar StaffMedicos del mismo centro y extraer las especialidades únicas
    const especialidadesDelCentro: Especialidad[] = [];
    const especialidadesIds = new Set<number>();
    
    this.staffMedicos
      .filter(sm => sm.centroAtencion?.id === centroId)
      .forEach(sm => {
        if (sm.especialidad && sm.especialidad.id && !especialidadesIds.has(sm.especialidad.id)) {
          especialidadesIds.add(sm.especialidad.id);
          especialidadesDelCentro.push(sm.especialidad);
        }
      });
    
    return especialidadesDelCentro;
  }

  // Método para obtener otros centros disponibles (excluyendo el actual)
  getOtrosCentros(): any[] {
    if (!this.staffMedicoSeleccionado) {
      return this.staffMedicos;
    }
    return this.staffMedicos.filter(staff => staff.id !== this.staffMedicoSeleccionado.id);
  }

  // Método para obtener el total de centros únicos disponibles
  getTotalCentrosDisponibles(): number {
    if (!this.staffMedicos || this.staffMedicos.length === 0) {
      return 0;
    }
    // Contar centros únicos por nombre
    const centrosUnicos = new Set(
      this.staffMedicos
        .map(staff => staff.centroAtencion?.nombre)
        .filter(nombre => nombre) // filtrar nulls/undefined
    );
    return centrosUnicos.size;
  }

  // Método para obtener centros únicos (sin repetir el actual)
  getCentrosUnicos(): any[] {
    if (!this.staffMedicos || this.staffMedicos.length === 0) {
      return [];
    }

    const centroActualNombre = this.staffMedicoSeleccionado?.centroAtencion?.nombre;
    const centrosMap = new Map();

    // Agrupar por nombre de centro, excluyendo el actual
    this.staffMedicos.forEach(staff => {
      const nombreCentro = staff.centroAtencion?.nombre;
      if (nombreCentro && nombreCentro !== centroActualNombre) {
        if (!centrosMap.has(nombreCentro)) {
          centrosMap.set(nombreCentro, {
            nombre: nombreCentro,
            staffMedicos: []
          });
        }
        centrosMap.get(nombreCentro).staffMedicos.push(staff);
      }
    });

    return Array.from(centrosMap.values());
  }

  // Método para cambiar a un centro específico (selecciona el primer StaffMedico de ese centro)
  cambiarACentro(nombreCentro: string): void {
    const staffDelCentro = this.staffMedicos.find(staff => 
      staff.centroAtencion?.nombre === nombreCentro
    );
    
    if (staffDelCentro) {
      this.cambiarStaffMedico(staffDelCentro);
    }
  }

  // Método para manejar el evento de cambio de centro
  onCambiarCentro(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const nombreCentro = target.value;
    
    if (nombreCentro) {
      this.cambiarACentro(nombreCentro);
    }
  }

  cargarDisponibilidades() {
    this.cargando = true;
    const medicoId = this.getMedicoIdFromLocalStorage();

    // Validar que tenemos un ID válido
    if (!medicoId) {
      console.error('Error: No se pudo obtener el ID del médico para cargar disponibilidades');
      this.cargando = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log('Cargando disponibilidades para médico ID:', medicoId);
    console.log('Contexto StaffMedico actual:', this.staffMedicoSeleccionado);

    this.disponibilidadService.byMedico(medicoId).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor (cargar):', response);
        const todasLasDisponibilidades = response.data || [];
        
        // Guardar TODAS las disponibilidades para validación intercentros
        this.todasLasDisponibilidades = todasLasDisponibilidades;
        console.log('Todas las disponibilidades del médico:', this.todasLasDisponibilidades);
        
        // Filtrar disponibilidades por el StaffMedico actual para mostrar en UI
        if (this.staffMedicoSeleccionado) {
          this.disponibilidades = todasLasDisponibilidades.filter(disp => 
            disp.staffMedicoId === this.staffMedicoSeleccionado.id
          );
          console.log('Disponibilidades filtradas para StaffMedico', this.staffMedicoSeleccionado.id, ':', this.disponibilidades);
        } else {
          // Si no hay StaffMedico seleccionado, mostrar todas
          this.disponibilidades = todasLasDisponibilidades;
          console.log('Mostrando todas las disponibilidades:', this.disponibilidades);
        }
        
        this.organizarDisponibilidadesPorEspecialidad();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar disponibilidades:', error);
        this.cargando = false;
        if (error.status === 404) {
          console.log('No se encontraron disponibilidades para el médico (normal para primera vez)');
          this.disponibilidades = [];
          this.organizarDisponibilidadesPorEspecialidad();
        } else if (error.status === 403) {
          alert('Error de permisos. Verifique que su sesión sea válida.');
          this.router.navigate(['/login']);
        } else {
          console.warn('Error al cargar disponibilidades:', error.message || error);
          this.disponibilidades = [];
          this.organizarDisponibilidadesPorEspecialidad();
        }
      }
    });
  }

  organizarDisponibilidadesPorEspecialidad() {
    this.disponibilidadesPorEspecialidad = {};
    
    // Separar disponibilidades con y sin especialidad
    const disponibilidadesSinEspecialidad: DisponibilidadMedico[] = [];
    
    // Organizar disponibilidades existentes por especialidad
    this.disponibilidades.forEach(disponibilidad => {
      const especialidadId = disponibilidad.especialidadId;
      if (especialidadId) {
        if (!this.disponibilidadesPorEspecialidad[especialidadId]) {
          this.disponibilidadesPorEspecialidad[especialidadId] = [];
        }
        this.disponibilidadesPorEspecialidad[especialidadId].push(disponibilidad);
      } else {
        // Disponibilidades del sistema anterior sin especialidad
        disponibilidadesSinEspecialidad.push(disponibilidad);
        console.warn('Disponibilidad sin especialidad encontrada:', disponibilidad);
      }
    });

    // Si hay disponibilidades sin especialidad y tenemos especialidades disponibles,
    // mostrar un mensaje informativo
    if (disponibilidadesSinEspecialidad.length > 0 && this.especialidades.length > 0) {
      console.log(`Se encontraron ${disponibilidadesSinEspecialidad.length} disponibilidades del sistema anterior sin especialidad asociada.`);
      
      // Para mantener compatibilidad, asignar a la primera especialidad si es posible
      // Esto es temporal hasta que el usuario las migre manualmente
      const primeraEspecialidad = this.especialidades[0];
      if (primeraEspecialidad) {
        console.log(`Asignando temporalmente a la especialidad: ${primeraEspecialidad.nombre}`);
        disponibilidadesSinEspecialidad.forEach(disp => {
          disp.especialidadId = primeraEspecialidad.id;
          disp.especialidad = primeraEspecialidad;
        });
        
        if (!this.disponibilidadesPorEspecialidad[primeraEspecialidad.id]) {
          this.disponibilidadesPorEspecialidad[primeraEspecialidad.id] = [];
        }
        this.disponibilidadesPorEspecialidad[primeraEspecialidad.id].push(...disponibilidadesSinEspecialidad);
      }
    }

    console.log('Disponibilidades organizadas por especialidad:', this.disponibilidadesPorEspecialidad);
  }

  // Método para validar conflictos de horarios entre especialidades
  validarConflictosHorarios(nuevosHorarios: { dia: string, horaInicio: string, horaFin: string }[], especialidadIdExcluir?: number): string[] {
    const conflictos: string[] = [];
    
    // NUEVA VALIDACIÓN: Verificar superposiciones dentro de los mismos horarios que se están configurando
    const conflictosInternos = this.validarSuperposicionesInternas(nuevosHorarios);
    if (conflictosInternos.length > 0) {
      conflictos.push('CONFLICTOS EN LA CONFIGURACIÓN ACTUAL:');
      conflictos.push(...conflictosInternos);
    }
    
    // Verificar conflictos con horarios existentes en el sistema
    const conflictosExternos = this.validarConflictosConHorariosExistentes(nuevosHorarios, especialidadIdExcluir);
    if (conflictosExternos.length > 0) {
      if (conflictos.length > 0) {
        conflictos.push(''); // Línea en blanco para separar
      }
      conflictos.push('CONFLICTOS CON HORARIOS EXISTENTES:');
      conflictos.push(...conflictosExternos);
    }
    
    return conflictos;
  }

  // NUEVA FUNCIÓN: Validar superposiciones dentro de los horarios que se están configurando
  private validarSuperposicionesInternas(horarios: { dia: string, horaInicio: string, horaFin: string }[]): string[] {
    const conflictos: string[] = [];
    
    // Agrupar horarios por día
    const horariosPorDia: { [dia: string]: { horaInicio: string, horaFin: string, indice: number }[] } = {};
    
    horarios.forEach((horario, indice) => {
      if (!horariosPorDia[horario.dia]) {
        horariosPorDia[horario.dia] = [];
      }
      horariosPorDia[horario.dia].push({
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        indice: indice + 1 // Índice para mostrar al usuario (empezando en 1)
      });
    });
    
    // Verificar superposiciones dentro de cada día
    Object.keys(horariosPorDia).forEach(dia => {
      const horariosDelDia = horariosPorDia[dia];
      
      for (let i = 0; i < horariosDelDia.length; i++) {
        for (let j = i + 1; j < horariosDelDia.length; j++) {
          const horario1 = horariosDelDia[i];
          const horario2 = horariosDelDia[j];
          
          if (this.horariosSeSolapan(horario1, horario2)) {
            conflictos.push(`${dia}: Horario ${horario1.indice} (${horario1.horaInicio}-${horario1.horaFin}) se superpone con Horario ${horario2.indice} (${horario2.horaInicio}-${horario2.horaFin})`);
          }
        }
      }
    });
    
    return conflictos;
  }

  // Validar conflictos con horarios existentes en TODOS los centros (intercentros)
  private validarConflictosConHorariosExistentes(nuevosHorarios: { dia: string, horaInicio: string, horaFin: string }[], especialidadIdExcluir?: number): string[] {
    const conflictos: string[] = [];
    
    // Revisar cada nuevo horario contra TODAS las disponibilidades del médico
    nuevosHorarios.forEach(nuevoHorario => {
      // Recorrer todas las disponibilidades del médico (en todos los centros)
      this.todasLasDisponibilidades.forEach(disponibilidad => {
        
        // En modo edición, excluir la disponibilidad que estamos editando
        if (this.modoEdicion && this.disponibilidadEditando && 
            disponibilidad.id === this.disponibilidadEditando.id) {
          return;
        }
        
        // Revisar todos los horarios de esta disponibilidad
        disponibilidad.horarios.forEach((horarioExistente: any) => {
          if (horarioExistente.dia === nuevoHorario.dia) {
            // Verificar si hay solapamiento de horarios
            if (this.horariosSeSolapan(nuevoHorario, horarioExistente)) {
              
              // Buscar información del centro y especialidad del horario conflictivo
              const staffMedicoConflictivo = this.staffMedicos.find(sm => sm.id === disponibilidad.staffMedicoId);
              const centroConflictivo = staffMedicoConflictivo?.centroAtencion?.nombre || `Centro ID ${disponibilidad.staffMedicoId}`;
              const especialidadConflictiva = staffMedicoConflictivo?.especialidad?.nombre || `Especialidad ID ${disponibilidad.especialidadId}`;
              
              // Verificar si el conflicto es en el mismo centro o en otro centro
              const esMismoCentro = this.staffMedicoSeleccionado && 
                                   staffMedicoConflictivo?.centroAtencion?.id === this.staffMedicoSeleccionado.centroAtencion?.id;
              
              if (esMismoCentro) {
                conflictos.push(`${nuevoHorario.dia}: ${nuevoHorario.horaInicio}-${nuevoHorario.horaFin} se superpone con horario existente en ${especialidadConflictiva} (${horarioExistente.horaInicio}-${horarioExistente.horaFin})`);
              } else {
                // CONFLICTO INTERCENTROS - Más crítico
                conflictos.push(`⚠️ CONFLICTO INTERCENTROS - ${nuevoHorario.dia}: ${nuevoHorario.horaInicio}-${nuevoHorario.horaFin} se superpone con horario en "${centroConflictivo}" - ${especialidadConflictiva} (${horarioExistente.horaInicio}-${horarioExistente.horaFin})`);
              }
            }
          }
        });
      });
    });
    
    return conflictos;
  }

  // Método auxiliar para verificar si dos horarios se solapan
  private horariosSeSolapan(horario1: { horaInicio: string, horaFin: string }, horario2: { horaInicio: string, horaFin: string }): boolean {
    const inicio1 = this.convertirHoraAMinutos(horario1.horaInicio);
    const fin1 = this.convertirHoraAMinutos(horario1.horaFin);
    const inicio2 = this.convertirHoraAMinutos(horario2.horaInicio);
    const fin2 = this.convertirHoraAMinutos(horario2.horaFin);
    
    // Los horarios se solapan si uno empieza antes de que termine el otro
    return (inicio1 < fin2) && (inicio2 < fin1);
  }

  // Convertir hora en formato HH:MM a minutos desde medianoche
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
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

  async guardarDisponibilidad() {
    const horarios = this.horariosForm.filter(h => h.dia && h.horaInicio && h.horaFin);
    
    if (horarios.length === 0) {
      alert('Debe configurar al menos un horario');
      return;
    }

    // Validar que se haya seleccionado una especialidad
    if (!this.especialidadSeleccionada) {
      alert('Debe seleccionar una especialidad');
      return;
    }

    // Validar conflictos de horarios
    const especialidadExcluir = this.modoEdicion ? this.disponibilidadEditando?.especialidadId : undefined;
    const conflictos = this.validarConflictosHorarios(horarios, especialidadExcluir);
    
    if (conflictos.length > 0) {
      // Separar tipos de conflictos
      const tieneConflictosInternos = conflictos.some(c => c.includes('CONFLICTOS EN LA CONFIGURACIÓN ACTUAL:'));
      const tieneConflictosIntercentros = conflictos.some(c => c.includes('⚠️ CONFLICTO INTERCENTROS'));
      
      if (tieneConflictosInternos) {
        // Los conflictos internos (superposiciones en el mismo formulario) NUNCA se permiten
        alert('ERROR: No se puede guardar la configuración debido a superposiciones de horarios:\n\n' + conflictos.join('\n') + '\n\nPor favor, corrija los conflictos antes de continuar.');
        return;
      } else if (tieneConflictosIntercentros) {
        // Los conflictos intercentros son MUY críticos - el médico no puede estar en dos lugares a la vez
        const mensaje = '🚨 CONFLICTOS CRÍTICOS DETECTADOS 🚨\n\nUn médico no puede atender en múltiples centros al mismo tiempo:\n\n' + 
                       conflictos.join('\n') + 
                       '\n\n⚠️ ADVERTENCIA: Estos conflictos pueden causar problemas serios en la programación de turnos.\n\n¿Está SEGURO que desea continuar?';
        if (!confirm(mensaje)) {
          return;
        }
      } else {
        // Conflictos menores (dentro del mismo centro)
        const mensaje = 'Se encontraron conflictos de horarios en el mismo centro:\n\n' + conflictos.join('\n') + '\n\n¿Desea continuar de todas formas?';
        if (!confirm(mensaje)) {
          return;
        }
      }
    }

    this.guardando = true;

    if (this.modoEdicion && this.disponibilidadEditando) {
      // Al actualizar, usar el staffMedicoId de la disponibilidad existente
      const staffMedicoIdExistente = this.disponibilidadEditando.staffMedicoId;
      
      console.log('Modo edición - usando staffMedicoId existente:', staffMedicoIdExistente);
      console.log('Horarios a guardar:', horarios);
      console.log('Especialidad seleccionada:', this.especialidadSeleccionada);

      // Asegurar que siempre tengamos una especialidad asociada
      const especialidadFinal = this.especialidadSeleccionada || 
                                this.disponibilidadEditando.especialidadId || 
                                (this.especialidades.length > 0 ? this.especialidades[0].id : null);

      if (!especialidadFinal) {
        alert('Error: Debe seleccionar una especialidad antes de guardar.');
        this.guardando = false;
        return;
      }

      const disponibilidadActualizada = {
        id: this.disponibilidadEditando.id!,
        staffMedicoId: staffMedicoIdExistente,
        especialidadId: especialidadFinal,
        horarios
      } as DisponibilidadMedico;

      console.log('Actualizando disponibilidad:', disponibilidadActualizada);

      this.disponibilidadService.update(this.disponibilidadEditando.id!, disponibilidadActualizada).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (actualizar):', response);
          this.guardando = false;
          this.cancelarFormulario();
          this.cargarDisponibilidades();
          alert('Horarios actualizados correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.guardando = false;
          if (error.status === 404) {
            alert('Error: No se encontró el médico. Verifique que su sesión sea válida.');
          } else {
            alert(`Error al actualizar los horarios: ${error.error?.status_text || error.message}`);
          }
        }
      });
    } else {
      // Al crear nueva disponibilidad, obtener o buscar el staffMedicoId
      const staffMedicoIdNum = await this.getOrFetchStaffMedicoId();

      if (!staffMedicoIdNum) {
        alert('Error: No se pudo obtener el ID del médico en el centro. Por favor, verifique su sesión o contacte al administrador.');
        this.guardando = false;
        this.router.navigate(['/login']);
        return;
      }

      // Validar que el ID sea consistente con disponibilidades existentes
      if (this.disponibilidades.length > 0) {
        const idExistente = this.disponibilidades[0].staffMedicoId;
        if (staffMedicoIdNum !== idExistente) {
          console.warn(`Inconsistencia de IDs detectada. Usando ID de disponibilidad existente: ${idExistente}`);
          const staffMedicoIdCorregido = idExistente;
          
          console.log('Modo creación - usando ID corregido:', staffMedicoIdCorregido);
          console.log('Horarios a guardar:', horarios);
          console.log('Especialidad seleccionada:', this.especialidadSeleccionada);

          const nuevaDisponibilidad = {
            id: 0,
            staffMedicoId: staffMedicoIdCorregido,
            especialidadId: this.especialidadSeleccionada,
            horarios
          } as DisponibilidadMedico;

          console.log('Creando nueva disponibilidad con ID corregido:', nuevaDisponibilidad);

          this.disponibilidadService.create(nuevaDisponibilidad).subscribe({
            next: (response) => {
              console.log('Respuesta del servidor (crear):', response);
              this.guardando = false;
              this.cancelarFormulario();
              this.cargarDisponibilidades();
              alert('Horarios guardados correctamente');
            },
            error: (error) => {
              console.error('Error al guardar disponibilidad:', error);
              console.error('Error completo:', JSON.stringify(error, null, 2));
              this.guardando = false;
              
              let errorMessage = 'Error desconocido al guardar los horarios';
              
              if (error.status === 404) {
                errorMessage = 'Error: No se encontró el médico. Verifique que su sesión sea válida.';
              } else if (error.status === 400) {
                // Error 400 podría ser el problema del StaffMedico
                if (error.error?.status_text?.includes('StaffMedico no encontrado')) {
                  errorMessage = `Error: El médico con ID ${staffMedicoIdCorregido} no existe en el sistema. Por favor, contacte al administrador o inicie sesión nuevamente.`;
                  console.error('StaffMedico no encontrado con ID corregido:', staffMedicoIdCorregido);
                  
                  // Limpiar localStorage y redirigir al login
                  localStorage.clear();
                  setTimeout(() => {
                    this.router.navigate(['/login']);
                  }, 3000);
                } else {
                  errorMessage = `Error de validación: ${error.error?.status_text || error.error?.message || 'Datos inválidos'}`;
                }
              } else if (error.status === 403) {
                errorMessage = 'Error de permisos. Verifique que su sesión sea válida.';
              } else {
                errorMessage = `Error al guardar los horarios: ${error.error?.status_text || error.error?.message || error.message}`;
              }
              
              alert(errorMessage);
            }
          });
          return;
        }
      }

      // Asegurar que tengamos una especialidad seleccionada
      if (!this.especialidadSeleccionada) {
        alert('Error: Debe seleccionar una especialidad antes de guardar.');
        this.guardando = false;
        return;
      }

      console.log('Modo creación - usando staffMedicoId del localStorage:', staffMedicoIdNum);
      console.log('Horarios a guardar:', horarios);
      console.log('Especialidad seleccionada:', this.especialidadSeleccionada);

      const nuevaDisponibilidad = {
        id: 0,
        staffMedicoId: staffMedicoIdNum,
        especialidadId: this.especialidadSeleccionada,
        horarios
      } as DisponibilidadMedico;

      console.log('Creando nueva disponibilidad:', nuevaDisponibilidad);

      this.disponibilidadService.create(nuevaDisponibilidad).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (crear):', response);
          this.guardando = false;
          this.cancelarFormulario();
          this.cargarDisponibilidades();
          alert('Horarios guardados correctamente');
        },
        error: (error) => {
          console.error('Error al guardar disponibilidad:', error);
          console.error('Error completo:', JSON.stringify(error, null, 2));
          this.guardando = false;
          
          let errorMessage = 'Error desconocido al guardar los horarios';
          
          if (error.status === 404) {
            errorMessage = 'Error: No se encontró el médico. Verifique que su sesión sea válida.';
          } else if (error.status === 400) {
            // Error 400 podría ser el problema del StaffMedico
            if (error.error?.status_text?.includes('StaffMedico no encontrado')) {
              errorMessage = `Error: El médico con ID ${staffMedicoIdNum} no existe en el sistema. Por favor, contacte al administrador o inicie sesión nuevamente.`;
              console.error('StaffMedico no encontrado con ID:', staffMedicoIdNum);
              
              // Limpiar localStorage y redirigir al login
              localStorage.clear();
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 3000);
            } else {
              errorMessage = `Error de validación: ${error.error?.status_text || error.error?.message || 'Datos inválidos'}`;
            }
          } else if (error.status === 403) {
            errorMessage = 'Error de permisos. Verifique que su sesión sea válida.';
          } else {
            errorMessage = `Error al guardar los horarios: ${error.error?.status_text || error.error?.message || error.message}`;
          }
          
          alert(errorMessage);
        }
      });
    }
  }

  editarDisponibilidad(disponibilidad: DisponibilidadMedico) {
    this.modoEdicion = true;
    this.disponibilidadEditando = disponibilidad;
    this.mostrarFormulario = true;
    
    // Asegurar que tenemos la especialidad asociada
    this.especialidadSeleccionada = disponibilidad.especialidadId || null;

    // Debug: verificar qué días están llegando de la BD
    console.log('Disponibilidad a editar:', disponibilidad);
    console.log('Horarios:', disponibilidad.horarios);
    console.log('Especialidad ID:', disponibilidad.especialidadId);

    // Si no tiene especialidadId, es una disponibilidad del sistema anterior
    if (!disponibilidad.especialidadId) {
      console.warn('Disponibilidad sin especialidadId detectada - sistema anterior');
      // Podríamos asignar la primera especialidad disponible o mostrar un selector
      if (this.especialidades.length > 0) {
        this.especialidadSeleccionada = this.especialidades[0].id;
        console.log('Asignando especialidad por defecto:', this.especialidades[0].nombre);
      }
    }

    // Cargar datos para edición - asegurarnos de que el día se cargue correctamente
    this.horariosForm = disponibilidad.horarios?.map((horario: any) => {
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
    this.especialidadSeleccionada = null;
  }

  volverAlDashboard() {
    this.router.navigate(['/medico-dashboard']);
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
      disponibilidad.horarios?.forEach((horario: any) => {
        diasUnicos.add(horario.dia);
      });
    });
    return diasUnicos.size;
  }

  // Obtener el nombre de una especialidad por ID
  getNombreEspecialidad(especialidadId: number): string {
    const especialidad = this.especialidades.find(e => e.id === especialidadId);
    return especialidad?.nombre || `Especialidad ID ${especialidadId}`;
  }

  // Verificar si una especialidad ya tiene disponibilidades configuradas
  especialidadTieneDisponibilidades(especialidadId: number): boolean {
    return !!this.disponibilidadesPorEspecialidad[especialidadId] && 
           this.disponibilidadesPorEspecialidad[especialidadId].length > 0;
  }

  // Obtener especialidades disponibles para configurar (que no tengan disponibilidades)
  getEspecialidadesDisponibles(): Especialidad[] {
    return this.especialidades.filter(especialidad => 
      !this.especialidadTieneDisponibilidades(especialidad.id)
    );
  }

  // Iniciar nuevo formulario para una especialidad específica
  nuevaDisponibilidadParaEspecialidad(especialidadId?: number) {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.horariosForm = [];
    this.especialidadSeleccionada = especialidadId || null;
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