import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicoService } from './medico.service';
import { Medico } from './medico';

interface ConfiguracionNotificaciones {
  emailTurnos: boolean;
  emailCancelaciones: boolean;
  emailRecordatorios: boolean;
  smsNotificaciones: boolean;
}

interface CambioPassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-medico-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="perfil-container">
      <!-- Floating Particles Background -->
      <div class="particles-bg">
        <div class="particle" *ngFor="let p of particles; let i = index" [style.left.px]="p.x" [style.top.px]="p.y" [style.animation-delay.s]="i * 0.3"></div>
      </div>

      <!-- Header -->
      <div class="perfil-header">
        <div class="header-title">
          <div class="title-icon">
            <i class="fas fa-user-cog"></i>
          </div>
          <div class="title-content">
            <h1>Configuración de Perfil</h1>
            <p>Gestiona tu información personal y configuración de seguridad</p>
          </div>
          <button class="btn-back" (click)="volver()">
            <i class="fas fa-arrow-left"></i>
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="cargando" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando información del perfil...</p>
      </div>

      <!-- Main Content -->
      <div *ngIf="!cargando" class="perfil-content">
        <!-- Información Personal -->
        <div class="perfil-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-user"></i>
            </div>
            <div class="section-title">
              <h2>Información Personal</h2>
              <p>Datos básicos de tu perfil médico</p>
            </div>
          </div>
          
          <div class="section-content">
            
            <!-- Vista de Solo Lectura -->
            <div *ngIf="!editandoPerfil" class="info-grid">
              <div class="info-card">
                <label>Nombre Completo</label>
                <div class="info-value">
                  <i class="fas fa-user me-2"></i>
                  {{ medicoActual?.nombre || 'No disponible' }} {{ medicoActual?.apellido || '' }}
                </div>
              </div>
              
              <div class="info-card">
                <label>Matrícula Profesional</label>
                <div class="info-value">
                  <i class="fas fa-id-badge me-2"></i>
                  {{ medicoActual?.matricula || 'No disponible' }}
                </div>
              </div>
              
              <div class="info-card">
                <label>Especialidad(es)</label>
                <div class="info-value">
                  <i class="fas fa-stethoscope me-2"></i>
                  <span *ngIf="tieneEspecialidades(); else especialidadUnica">
                    <span *ngFor="let esp of getEspecialidades(); let last = last">
                      {{ esp.nombre }}<span *ngIf="!last">, </span>
                    </span>
                  </span>
                  <ng-template #especialidadUnica>
                    {{ medicoActual?.especialidad?.nombre || 'No especificada' }}
                  </ng-template>
                </div>
              </div>
              
              <div class="info-card">
                <label>DNI</label>
                <div class="info-value">
                  <i class="fas fa-id-card me-2"></i>
                  {{ medicoActual?.dni || 'No disponible' }}
                </div>
              </div>
              
              <div class="info-card">
                <label>Información de Contacto</label>
                <div class="info-value">
                  <i class="fas fa-info-circle me-2"></i>
                  Disponible en el sistema administrativo
                </div>
              </div>
            </div>
            
            <!-- Formulario de Edición -->
            <div *ngIf="editandoPerfil" class="edit-form">
              <form [formGroup]="perfilForm" (ngSubmit)="guardarPerfil()">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="nombre">Nombre <span class="required">*</span></label>
                    <input 
                      type="text" 
                      id="nombre" 
                      class="form-control"
                      formControlName="nombre"
                      placeholder="Ingrese su nombre"
                      [class.is-invalid]="perfilForm.get('nombre')?.touched && perfilForm.get('nombre')?.invalid"
                    >
                    <div *ngIf="perfilForm.get('nombre')?.touched && perfilForm.get('nombre')?.invalid" 
                         class="invalid-feedback">
                      <small *ngIf="perfilForm.get('nombre')?.errors?.['required']">El nombre es obligatorio</small>
                      <small *ngIf="perfilForm.get('nombre')?.errors?.['minlength']">Mínimo 2 caracteres</small>
                      <small *ngIf="perfilForm.get('nombre')?.errors?.['maxlength']">Máximo 50 caracteres</small>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="apellido">Apellido <span class="required">*</span></label>
                    <input 
                      type="text" 
                      id="apellido" 
                      class="form-control"
                      formControlName="apellido"
                      placeholder="Ingrese su apellido"
                      [class.is-invalid]="perfilForm.get('apellido')?.touched && perfilForm.get('apellido')?.invalid"
                    >
                    <div *ngIf="perfilForm.get('apellido')?.touched && perfilForm.get('apellido')?.invalid" 
                         class="invalid-feedback">
                      <small *ngIf="perfilForm.get('apellido')?.errors?.['required']">El apellido es obligatorio</small>
                      <small *ngIf="perfilForm.get('apellido')?.errors?.['minlength']">Mínimo 2 caracteres</small>
                      <small *ngIf="perfilForm.get('apellido')?.errors?.['maxlength']">Máximo 50 caracteres</small>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="dni">DNI <span class="required">*</span></label>
                    <input 
                      type="text" 
                      id="dni" 
                      class="form-control"
                      formControlName="dni"
                      [class.is-invalid]="perfilForm.get('dni')?.touched && perfilForm.get('dni')?.invalid"
                    >
                    <div *ngIf="perfilForm.get('dni')?.touched && perfilForm.get('dni')?.invalid" 
                         class="invalid-feedback">
                      <small *ngIf="perfilForm.get('dni')?.errors?.['required']">El DNI es obligatorio</small>
                      <small *ngIf="perfilForm.get('dni')?.errors?.['pattern']">Formato inválido (7-9 dígitos)</small>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="matricula">Matrícula <span class="required">*</span></label>
                    <input 
                      type="text" 
                      id="matricula" 
                      class="form-control"
                      formControlName="matricula"
                      [class.is-invalid]="perfilForm.get('matricula')?.touched && perfilForm.get('matricula')?.invalid"
                    >
                    <div *ngIf="perfilForm.get('matricula')?.touched && perfilForm.get('matricula')?.invalid" 
                         class="invalid-feedback">
                      <small *ngIf="perfilForm.get('matricula')?.errors?.['required']">La matrícula es obligatoria</small>
                      <small *ngIf="perfilForm.get('matricula')?.errors?.['minlength']">Mínimo 3 caracteres</small>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      class="form-control"
                      formControlName="email"
                      [class.is-invalid]="perfilForm.get('email')?.touched && perfilForm.get('email')?.invalid"
                    >
                    <div *ngIf="perfilForm.get('email')?.touched && perfilForm.get('email')?.invalid" 
                         class="invalid-feedback">
                      <small *ngIf="perfilForm.get('email')?.errors?.['email']">Email inválido</small>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="telefono">Teléfono</label>
                    <input 
                      type="text" 
                      id="telefono" 
                      class="form-control"
                      formControlName="telefono"
                      [class.is-invalid]="perfilForm.get('telefono')?.touched && perfilForm.get('telefono')?.invalid"
                    >
                    <div *ngIf="perfilForm.get('telefono')?.touched && perfilForm.get('telefono')?.invalid" 
                         class="invalid-feedback">
                      <small *ngIf="perfilForm.get('telefono')?.errors?.['pattern']">Formato inválido</small>
                    </div>
                  </div>
                </div>
              </form>
              
              <div class="edit-note">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Nota:</strong> Las especialidades se gestionan desde el panel administrativo
              </div>
            </div>
            
            <!-- Botones de Acción -->
            <div class="section-actions">
              <div *ngIf="!editandoPerfil">
                <button class="btn-secondary" (click)="editarPerfil()">
                  <i class="fas fa-edit me-2"></i>
                  Editar Información
                </button>
              </div>
              
              <div *ngIf="editandoPerfil" class="edit-actions">
                <button 
                  type="button" 
                  class="btn-primary" 
                  (click)="guardarPerfil()"
                  [disabled]="!perfilForm.valid || cargandoGuardado"
                >
                  <i *ngIf="!cargandoGuardado" class="fas fa-save me-2"></i>
                  <i *ngIf="cargandoGuardado" class="fas fa-spinner fa-spin me-2"></i>
                  {{ cargandoGuardado ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
                
                <button 
                  type="button" 
                  class="btn-secondary" 
                  (click)="cancelarEdicion()"
                  [disabled]="cargandoGuardado"
                >
                  <i class="fas fa-times me-2"></i>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
<div class="perfil-section">
          <div class="section-header">
            <div class="section-icon security">
              <i class="fas fa-key"></i>
            </div>
            <div class="section-title">
              <h2>Cambio de Contraseña</h2>
              <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
            </div>
          </div>
          
          <div class="section-content">
            <form [formGroup]="passwordForm" (ngSubmit)="cambiarPassword()">
              <div class="password-grid">
                <div class="password-field">
                  <label for="currentPassword">Contraseña Actual</label>
                  <div class="password-input-container">
                    <input 
                      id="currentPassword"
                      [type]="showCurrentPassword ? 'text' : 'password'"
                      formControlName="currentPassword"
                      class="form-control"
                      placeholder="Ingresa tu contraseña actual"
                      [class.is-invalid]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                    <button type="button" 
                            class="password-toggle"
                            (click)="toggleCurrentPasswordVisibility()">
                      <i [class]="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback" 
                       *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                    La contraseña actual es requerida
                  </div>
                </div>

                <div class="password-field">
                  <label for="newPassword">Nueva Contraseña</label>
                  <div class="password-input-container">
                    <input 
                      id="newPassword"
                      [type]="showNewPassword ? 'text' : 'password'"
                      formControlName="newPassword"
                      class="form-control"
                      placeholder="Ingresa tu nueva contraseña"
                      [class.is-invalid]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                    <button type="button" 
                            class="password-toggle"
                            (click)="toggleNewPasswordVisibility()">
                      <i [class]="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div class="password-strength" *ngIf="passwordForm.get('newPassword')?.value">
                    <div class="strength-bar">
                      <div class="strength-fill" 
                           [class]="'strength-' + getPasswordStrength(passwordForm.get('newPassword')?.value)"></div>
                    </div>
                    <small class="strength-text" 
                           [class]="'text-' + getPasswordStrength(passwordForm.get('newPassword')?.value)">
                      Fortaleza: {{ getPasswordStrengthText(passwordForm.get('newPassword')?.value) }}
                    </small>
                  </div>
                  <div class="invalid-feedback" 
                       *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                    <div *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                      La nueva contraseña es requerida
                    </div>
                    <div *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                      La contraseña debe tener al menos 8 caracteres
                    </div>
                    <div *ngIf="passwordForm.get('newPassword')?.hasError('pattern')">
                      La contraseña debe contener al menos una mayúscula, una minúscula y un número
                    </div>
                  </div>
                </div>

                <div class="password-field">
                  <label for="confirmPassword">Confirmar Nueva Contraseña</label>
                  <div class="password-input-container">
                    <input 
                      id="confirmPassword"
                      [type]="showConfirmPassword ? 'text' : 'password'"
                      formControlName="confirmPassword"
                      class="form-control"
                      placeholder="Confirma tu nueva contraseña"
                      [class.is-invalid]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched">
                    <button type="button" 
                            class="password-toggle"
                            (click)="toggleConfirmPasswordVisibility()">
                      <i [class]="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback" 
                       *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched">
                    <div *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                      Debes confirmar tu nueva contraseña
                    </div>
                    <div *ngIf="passwordForm.hasError('passwordMismatch') && !passwordForm.get('confirmPassword')?.hasError('required')">
                      Las contraseñas no coinciden
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="resetPasswordForm()">
                  <i class="fas fa-undo me-2"></i>
                  Limpiar
                </button>
                <button type="submit" 
                        class="btn-primary" 
                        [disabled]="passwordForm.invalid || cargandoCambioPassword">
                  <i class="fas fa-key me-2"></i>
                  <span *ngIf="!cargandoCambioPassword">Cambiar Contraseña</span>
                  <span *ngIf="cargandoCambioPassword">Cambiando...</span>
                </button>
              </div>
            </form>
          </div>
        </div>      
        <!-- Configuración de Notificaciones -->
        <div class="perfil-section">
          <div class="section-header">
            <div class="section-icon notifications">
              <i class="fas fa-bell"></i>
            </div>
            <div class="section-title">
              <h2>Notificaciones</h2>
              <p>Configura cómo quieres recibir las notificaciones</p>
            </div>
          </div>
          
          <div class="section-content">
            <div class="notifications-grid">
              <div class="notification-card">
                <div class="notification-info">
                  <div class="notification-icon">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="notification-details">
                    <h4>Nuevos Turnos</h4>
                    <p>Notificaciones cuando se asignen nuevos turnos</p>
                  </div>
                </div>
                <div class="notification-toggle">
                  <label class="switch">
                    <input type="checkbox" [(ngModel)]="configuracionNotificaciones.emailTurnos">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="notification-card">
                <div class="notification-info">
                  <div class="notification-icon">
                    <i class="fas fa-times-circle"></i>
                  </div>
                  <div class="notification-details">
                    <h4>Cancelaciones</h4>
                    <p>Avisos cuando se cancelen turnos programados</p>
                  </div>
                </div>
                <div class="notification-toggle">
                  <label class="switch">
                    <input type="checkbox" [(ngModel)]="configuracionNotificaciones.emailCancelaciones">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="notification-card">
                <div class="notification-info">
                  <div class="notification-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="notification-details">
                    <h4>Recordatorios</h4>
                    <p>Recordatorios de turnos próximos</p>
                  </div>
                </div>
                <div class="notification-toggle">
                  <label class="switch">
                    <input type="checkbox" [(ngModel)]="configuracionNotificaciones.emailRecordatorios">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="notification-card">
                <div class="notification-info">
                  <div class="notification-icon">
                    <i class="fas fa-sms"></i>
                  </div>
                  <div class="notification-details">
                    <h4>SMS</h4>
                    <p>Notificaciones por mensaje de texto</p>
                  </div>
                </div>
                <div class="notification-toggle">
                  <label class="switch">
                    <input type="checkbox" [(ngModel)]="configuracionNotificaciones.smsNotificaciones">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="section-actions">
              <button class="btn-primary" (click)="guardarConfiguracionNotificaciones()">
                <i class="fas fa-save me-2"></i>
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>

        <!-- Cambio de Contraseña -->
        
      </div>
    </div>
  `,
  styles: [`
    .perfil-container {
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
      width: 3px;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 8s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
      50% { transform: translateY(-30px) rotate(180deg); opacity: 0.3; }
    }

    /* Header */
    .perfil-header {
      margin-bottom: 2rem;
      position: relative;
      z-index: 10;
    }

    .header-title {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
    }

    .btn-back {
      background: rgba(102, 126, 234, 0.1);
      border: 2px solid rgba(102, 126, 234, 0.2);
      padding: 0.8rem 1.2rem;
      border-radius: 12px;
      color: #667eea;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: absolute;
      right: 2rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
    }

    .btn-back:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
      transform: translateY(-50%) translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .title-icon {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .title-content h1 {
      color: #2c3e50;
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #2c3e50 0%, #667eea 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .title-content p {
      color: #6c757d;
      margin: 0;
      font-size: 1.1rem;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
      backdrop-filter: blur(20px);
      text-align: center;
      position: relative;
      z-index: 10;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(102, 126, 234, 0.2);
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Main Content */
    .perfil-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: relative;
      z-index: 10;
    }

    .perfil-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.08);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .section-header {
      background: rgba(102, 126, 234, 0.02);
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .section-icon {
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

    .section-icon.security {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      box-shadow: 0 8px 20px rgba(250, 112, 154, 0.3);
    }

    .section-icon.notifications {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      box-shadow: 0 8px 20px rgba(67, 233, 123, 0.3);
    }

    .section-icon.privacy {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3);
    }

    .section-title h2 {
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.3rem 0;
    }

    .section-title p {
      color: #6c757d;
      margin: 0;
      font-size: 0.95rem;
    }

    .section-content {
      padding: 2rem;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .info-card {
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .info-card.full-width {
      grid-column: 1 / -1;
    }

    .info-card label {
      display: block;
      color: #6c757d;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
    }

    .info-value i {
      color: #667eea;
    }

    /* Security Cards */
    .security-card {
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;
    }

    .security-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .security-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;
      box-shadow: 0 8px 20px rgba(250, 112, 154, 0.3);
    }

    .security-content {
      flex: 1;
    }

    .security-content h4 {
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .security-content p {
      color: #6c757d;
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .security-tips {
      margin-top: 0.5rem;
    }

    .security-tips small {
      display: flex;
      align-items: center;
      color: #6c757d;
    }

    /* Buttons */
    .btn-primary, .btn-secondary, .btn-danger, .btn-warning {
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #ffffff;
      color: #374151;
      border: 2px solid #d1d5db;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .btn-secondary:hover {
      background: #f3f4f6;
      color: #1f2937;
      border-color: #9ca3af;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-danger {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 8px 20px rgba(220, 53, 69, 0.3);
    }

    .btn-danger:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(220, 53, 69, 0.4);
    }

    .btn-warning {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
      box-shadow: 0 8px 20px rgba(255, 193, 7, 0.3);
    }

    .btn-warning:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(255, 193, 7, 0.4);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .section-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(0,0,0,0.05);
    }

    /* Password Form Styles */
    .password-grid {
      display: grid;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .password-field {
      display: flex;
      flex-direction: column;
    }

    .password-field label {
      color: #2c3e50;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .password-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-control {
      width: 100%;
      padding: 0.8rem 1rem;
      border: 2px solid rgba(0,0,0,0.1);
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.8);
      color: #2c3e50;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      background: rgba(255, 255, 255, 0.95);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .password-toggle:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
    }

    .password-strength {
      margin-top: 0.5rem;
    }

    .strength-bar {
      width: 100%;
      height: 4px;
      background: rgba(0,0,0,0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .strength-weak {
      width: 33%;
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }

    .strength-medium {
      width: 66%;
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }

    .strength-strong {
      width: 100%;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .strength-text {
      font-size: 0.8rem;
      font-weight: 500;
      display: flex;
      align-items: center;
    }

    .text-weak {
      color: #dc3545;
    }

    .text-medium {
      color: #fd7e14;
    }

    .text-strong {
      color: #28a745;
    }

    /* Notifications */
    .notifications-grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .notification-card {
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .notification-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .notification-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-icon {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .notification-details h4 {
      color: #2c3e50;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.3rem 0;
    }

    .notification-details p {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0;
    }

    /* Toggle Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    /* Privacy Options */
    .privacy-options {
      display: grid;
      gap: 1.5rem;
    }

    .privacy-card {
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .privacy-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .privacy-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .privacy-content {
      flex: 1;
    }

    .privacy-content h4 {
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .privacy-content p {
      color: #6c757d;
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .perfil-container {
        padding: 1rem 0.5rem;
      }

      .header-title {
        padding: 1.5rem;
        text-align: center;
        flex-direction: column;
        gap: 1rem;
      }

      .btn-back {
        position: static;
        transform: none;
        align-self: center;
        margin-top: 1rem;
      }

      .btn-back:hover {
        transform: translateY(-2px);
      }

      .title-content h1 {
        font-size: 1.8rem;
      }

      .section-content {
        padding: 1.5rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .section-actions {
        flex-direction: column;
      }

      .notification-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .privacy-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
    }

    /* Edit Form Styles */
    .edit-form {
      padding: 2rem;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      margin-top: 1rem;
      position: relative;
      overflow: hidden;
    }

    .edit-form::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      position: relative;
    }

    .form-group label {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-group label::before {
      content: '';
      width: 3px;
      height: 3px;
      background: #3b82f6;
      border-radius: 50%;
    }

    .required {
      color: #dc2626;
      font-weight: bold;
    }

    .form-control {
      padding: 1rem 1.25rem;
      background: #ffffff;
      border: 2px solid #d1d5db;
      border-radius: 12px;
      color: #1f2937;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .form-control:hover {
      border-color: #9ca3af;
      background: #f9fafb;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 8px 24px rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }

    .form-control::placeholder {
      color: #9ca3af;
      font-style: italic;
    }

    .form-control.is-invalid {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
    }

    .form-control.is-invalid:focus {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
    }

    .invalid-feedback {
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: rgba(239, 68, 68, 0.05);
      border-radius: 6px;
      border-left: 3px solid #dc2626;
    }

    .invalid-feedback small {
      display: block;
      margin-bottom: 0.25rem;
    }

    .invalid-feedback small:last-child {
      margin-bottom: 0;
    }

    .edit-note {
      display: flex;
      align-items: center;
      padding: 1.25rem;
      background: rgba(59, 130, 246, 0.05);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      color: #1e40af;
      font-size: 0.9rem;
      margin-top: 1.5rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
    }

    .edit-note i {
      color: #60a5fa;
      font-size: 1.1rem;
      margin-right: 0.75rem;
    }

    .edit-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .edit-actions button {
      min-width: 140px;
      padding: 0.875rem 1.5rem;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .edit-actions button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .edit-actions button:hover::before {
      left: 100%;
    }

    .edit-actions .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border: none;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
    }

    .edit-actions .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    }

    .edit-actions .btn-secondary {
      background: #ffffff;
      border: 2px solid #d1d5db;
      color: #374151;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .edit-actions .btn-secondary:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
      color: #1f2937;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .edit-actions button:disabled {
      opacity: 0.6;
      transform: none !important;
      cursor: not-allowed;
      box-shadow: none !important;
    }

    .edit-actions .btn-secondary:disabled {
      background: #f3f4f6 !important;
      border-color: #d1d5db !important;
      color: #9ca3af !important;
    }
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .edit-form {
        padding: 1.5rem;
        margin-top: 0.5rem;
      }

      .edit-actions {
        flex-direction: column;
        gap: 1rem;
      }

      .edit-actions button {
        width: 100%;
        min-width: unset;
        padding: 1rem 1.5rem;
      }

      .form-control {
        padding: 0.875rem 1rem;
        font-size: 16px; /* Previene zoom en iOS */
      }

      .edit-note {
        padding: 1rem;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .edit-form {
        padding: 1rem;
        border-radius: 12px;
      }

      .form-grid {
        gap: 1.25rem;
      }

      .form-group label {
        font-size: 0.85rem;
      }

      .form-control {
        padding: 0.75rem;
      }

      .edit-actions {
        margin-top: 1.5rem;
        padding-top: 1rem;
      }
    }

    /* Animaciones adicionales */
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .edit-form {
      animation: slideInUp 0.4s ease-out;
    }

    .form-group {
      animation: slideInUp 0.4s ease-out;
      animation-fill-mode: both;
    }

    .form-group:nth-child(1) { animation-delay: 0.1s; }
    .form-group:nth-child(2) { animation-delay: 0.15s; }
    .form-group:nth-child(3) { animation-delay: 0.2s; }
    .form-group:nth-child(4) { animation-delay: 0.25s; }
    .form-group:nth-child(5) { animation-delay: 0.3s; }
    .form-group:nth-child(6) { animation-delay: 0.35s; }
  `]
})
export class MedicoPerfilComponent implements OnInit {
  medicoActual: Medico | null = null;
  cargando = true;
  
  // Profile editing properties
  editandoPerfil = false;
  perfilForm: FormGroup;
  cargandoGuardado = false;
  
  // Password form properties
  passwordForm: FormGroup;
  cargandoCambioPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  // Notifications
  configuracionNotificaciones: ConfiguracionNotificaciones = {
    emailTurnos: true,
    emailCancelaciones: true,
    emailRecordatorios: true,
    smsNotificaciones: false
  };
  
  // Particles for background animation
  particles: Array<{x: number, y: number}> = [];

  constructor(
    private router: Router,
    private medicoService: MedicoService,
    private formBuilder: FormBuilder
  ) {
    this.initializeParticles();
    this.passwordForm = this.initializePasswordForm();
    this.perfilForm = this.initializePerfilForm();
  }

  ngOnInit() {
    this.cargarDatosMedico();
    this.cargarConfiguracionNotificaciones();
  }

  private cargarDatosMedico() {
    const medicoId = this.getMedicoIdFromSession();
    
    if (!medicoId || medicoId === 0) {
      console.error('No se pudo obtener el ID del médico');
      this.router.navigate(['/login']);
      return;
    }
    
    this.medicoService.findById(medicoId).subscribe({
      next: (medico) => {
        this.medicoActual = medico;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del médico:', error);
        this.cargando = false;
        if (error.status === 404) {
          alert('No se encontraron los datos del médico. Verifique su sesión.');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private cargarConfiguracionNotificaciones() {
    // TODO: Implementar carga de configuración desde el backend
    // Por ahora usamos valores por defecto
    const configGuardada = localStorage.getItem('notificacionesMedico');
    if (configGuardada) {
      try {
        this.configuracionNotificaciones = JSON.parse(configGuardada);
      } catch (e) {
        console.error('Error al cargar configuración de notificaciones:', e);
      }
    }
  }

  // Notifications
  guardarConfiguracionNotificaciones() {
    // TODO: Implementar guardado en el backend
    localStorage.setItem('notificacionesMedico', JSON.stringify(this.configuracionNotificaciones));
    alert('Configuración de notificaciones guardada');
  }

  // Navigation and actions
  volver() {
    this.router.navigate(['/medico-dashboard']);
  }

  editarPerfil() {
    if (!this.medicoActual) {
      alert('Error: No hay datos del médico para editar');
      return;
    }
    
    // Llenar el formulario con los datos actuales
    this.perfilForm.patchValue({
      nombre: this.medicoActual.nombre || '',
      apellido: this.medicoActual.apellido || '',
      dni: this.medicoActual.dni || '',
      matricula: this.medicoActual.matricula || '',
      email: '', // Se obtendría del backend si está disponible
      telefono: '' // Se obtendría del backend si está disponible
    });
    
    // Activar modo edición
    this.editandoPerfil = true;
  }

  guardarPerfil() {
    if (!this.perfilForm.valid || this.cargandoGuardado) {
      return;
    }

    const medicoId = this.getMedicoIdFromSession();
    if (!medicoId || medicoId === 0) {
      alert('Error: No se pudo obtener la información del médico');
      return;
    }

    this.cargandoGuardado = true;

    // Preparar datos para el backend
    const datosActualizados = {
      id: medicoId,
      nombre: this.perfilForm.get('nombre')?.value,
      apellido: this.perfilForm.get('apellido')?.value,
      dni: this.perfilForm.get('dni')?.value,
      matricula: this.perfilForm.get('matricula')?.value,
      email: this.perfilForm.get('email')?.value,
      telefono: this.perfilForm.get('telefono')?.value,
      // Mantener las especialidades existentes
      especialidades: this.medicoActual?.especialidades || []
    };

    // Llamar al servicio para actualizar
    this.medicoService.update(medicoId, datosActualizados).subscribe({
      next: (response) => {
        console.log('Perfil actualizado:', response);
        
        // Actualizar el objeto medicoActual con los nuevos datos
        if (this.medicoActual) {
          this.medicoActual.nombre = datosActualizados.nombre;
          this.medicoActual.apellido = datosActualizados.apellido;
          this.medicoActual.dni = datosActualizados.dni;
          this.medicoActual.matricula = datosActualizados.matricula;
        }
        
        // Salir del modo edición
        this.editandoPerfil = false;
        this.cargandoGuardado = false;
        
        alert('Perfil actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.cargandoGuardado = false;
        
        let mensajeError = 'Error al actualizar el perfil';
        if (error?.error?.message) {
          mensajeError = error.error.message;
        } else if (typeof error?.error === 'string') {
          mensajeError = error.error;
        }
        
        alert(`Error: ${mensajeError}`);
      }
    });
  }

  cancelarEdicion() {
    // Confirmar cancelación si hay cambios sin guardar
    if (this.perfilForm.dirty) {
      const confirmar = confirm('¿Estás seguro de cancelar? Se perderán los cambios no guardados.');
      if (!confirmar) {
        return;
      }
    }
    
    // Salir del modo edición y resetear formulario
    this.editandoPerfil = false;
    this.perfilForm.reset();
    this.cargandoGuardado = false;
  }

  // Utility methods
  tieneEspecialidades(): boolean {
    return this.medicoActual?.especialidades != null && this.medicoActual.especialidades.length > 0;
  }

  getEspecialidades() {
    return this.medicoActual?.especialidades || [];
  }

  private getMedicoIdFromSession(): number {
    console.log('=== DEBUG getMedicoIdFromSession (Perfil) ===');
    
    // Recopilar datos del localStorage
    const datos = {
      staffMedicoId: localStorage.getItem('staffMedicoId'),
      medicoId: localStorage.getItem('medicoId'),
      userId: localStorage.getItem('userId'),
      id: localStorage.getItem('id'),
      currentUser: localStorage.getItem('currentUser')
    };
    
    console.log('Datos en localStorage:', datos);
    
    // Intentar obtener ID desde diferentes fuentes
    let id = 0;
    
    // ⚠️ IMPORTANTE: PRIMERO medicoId, NUNCA staffMedicoId para autenticación
    
    // 1. Intentar desde medicoId directo (CORRECTO)
    if (datos.medicoId && datos.medicoId !== 'null') {
      id = parseInt(datos.medicoId, 10);
      console.log('✅ ID obtenido desde medicoId:', id);
    }
    
    // 2. Intentar parsear currentUser JSON
    else if (datos.currentUser && datos.currentUser !== 'null') {
      try {
        const currentUser = JSON.parse(datos.currentUser);
        if (currentUser && currentUser.medicoId) {
          id = parseInt(currentUser.medicoId, 10);
          console.log('✅ ID obtenido desde currentUser.medicoId:', id);
        } else if (currentUser && currentUser.id && currentUser.id !== parseInt(datos.staffMedicoId || '0', 10)) {
          id = parseInt(currentUser.id, 10);
          console.log('✅ ID obtenido desde currentUser.id:', id);
        }
      } catch (e) {
        console.error('Error al parsear currentUser:', e);
      }
    }
    
    // 3. Como ÚLTIMO recurso, otros campos (PERO NO staffMedicoId para auth)
    else if (datos.userId && datos.userId !== 'null') {
      id = parseInt(datos.userId, 10);
      console.log('⚠️ ID obtenido desde userId (fallback):', id);
    }
    
    // NUNCA usar staffMedicoId para autenticación de médico
    if (id === parseInt(datos.staffMedicoId || '0', 10) && id !== 0) {
      console.error('🚨 ALERTA: Se detectó que medicoId === staffMedicoId. Esto puede causar errores!');
      console.error('MedicoId:', id, 'StaffMedicoId:', datos.staffMedicoId);
    }
    
    // Validar que el ID sea válido
    if (!id || isNaN(id) || id <= 0) {
      console.error('No se pudo obtener un ID válido del médico');
      return 0;
    }
    
    console.log('ID final obtenido:', id);
    console.log('=== FIN DEBUG ===');
    
    return id;
  }

  private initializeParticles() {
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      });
    }
  }

  // Password form initialization and validation
  private initializePasswordForm(): FormGroup {
    return this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Profile form initialization
  private initializePerfilForm(): FormGroup {
    return this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dni: ['', [
        Validators.required,
        Validators.pattern(/^\d{7,9}$/),
        Validators.minLength(7),
        Validators.maxLength(9)
      ]],
      matricula: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[\d\s\-\+\(\)]{7,15}$/)]]
    });
  }

  private passwordMatchValidator(control: AbstractControl): {[key: string]: boolean} | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
      return null;
    }
    
    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Password methods
  cambiarPassword() {
    if (this.passwordForm.valid && !this.cargandoCambioPassword) {
      this.cargandoCambioPassword = true;
      
      const passwordData: CambioPassword = this.passwordForm.value;
      const medicoId = this.getMedicoIdFromSession();
      
      if (!medicoId || medicoId === 0) {
        alert('Error: No se pudo obtener la información del médico');
        this.cargandoCambioPassword = false;
        return;
      }
      
      // TODO: Implementar servicio de cambio de contraseña
      // this.medicoService.cambiarPassword(medicoId, passwordData).subscribe({
      //   next: (response) => {
      //     alert('Contraseña cambiada exitosamente');
      //     this.resetPasswordForm();
      //     this.cargandoCambioPassword = false;
      //   },
      //   error: (error) => {
      //     console.error('Error al cambiar contraseña:', error);
      //     alert('Error al cambiar la contraseña. Verifique su contraseña actual.');
      //     this.cargandoCambioPassword = false;
      //   }
      // });
      
      // Simulación temporal
      setTimeout(() => {
        alert('Contraseña cambiada exitosamente (simulación)');
        this.resetPasswordForm();
        this.cargandoCambioPassword = false;
      }, 2000);
    }
  }

  resetPasswordForm() {
    this.passwordForm.reset();
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrength(password: string): string {
    if (!password) return 'weak';
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(password: string): string {
    const strength = this.getPasswordStrength(password);
    switch (strength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
      default: return 'Débil';
    }
  }
}
