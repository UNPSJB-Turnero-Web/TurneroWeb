import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { AuthService } from '../inicio-sesion/auth.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-config-dashboard">
      <div class="particles-bg">
        <div class="particle" *ngFor="let p of particles; let i = index"
             [style.left.px]="p.x" [style.top.px]="p.y" [style.animation-delay.s]="i * 0.2"></div>
      </div>

      <div class="dashboard-header">
        <div class="header-glow"></div>
        <div class="welcome-section">
          <div class="welcome-content">
            <div class="welcome-icon">
              <i class="fas fa-cogs"></i>
            </div>
            <div class="welcome-text">
              <h1>Panel de Configuraciones del Sistema</h1>
              <p class="tagline">Gestiona las configuraciones de turnos y notificaciones</p>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn btn-danger btn-sm" (click)="logout()">
              <i class="fas fa-sign-out-alt me-2"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div class="config-section turnos">
        <div class="section-background"></div>
        <div class="section-title-container">
          <h2><i class="fas fa-calendar-alt me-3"></i>CONFIGURACIÓN DE TURNOS</h2>
        </div>
        <div class="config-grid row row-cols-1 row-cols-md-2 g-3">
          <div class="config-item col">
            <label class="form-label">Días mínimos para confirmar:</label>
            <input type="number" class="form-control" [(ngModel)]="configTurnos.dias_min_confirmacion" min="1" max="29"
                   (ngModelChange)="validateDiasMin()" [class.is-invalid]="diasMinError">
            <div *ngIf="diasMinError" class="invalid-feedback">
              Días mínimos debe ser al menos 1 y menor que días máximos ({{configTurnos.dias_max_no_confirm || 'no definido'}}).
            </div>
          </div>
          <div class="config-item col">
            <label class="form-label">Días máximos sin confirmar:</label>
            <input type="number" class="form-control" [(ngModel)]="configTurnos.dias_max_no_confirm" min="3" max="30"
                   (ngModelChange)="validateDiasMin()" [class.is-invalid]="diasMinError">
            <div *ngIf="diasMinError" class="invalid-feedback">
              Días máximos debe ser mayor que días mínimos ({{configTurnos.dias_min_confirmacion || 'no definido'}}).
            </div>
          </div>
          <div class="config-item col">
            <label class="form-label">Hora límite diaria:</label>
            <input type="time" class="form-control" [(ngModel)]="configTurnos.hora_corte_confirmacion">
          </div>
          <div class="config-item col form-check">
            <input type="checkbox" class="form-check-input" [(ngModel)]="configTurnos.habilitar_cancelacion_automatica" id="cancelAuto">
            <label class="form-check-label" for="cancelAuto">Cancelación automática habilitada</label>
          </div>
          <div class="config-item col form-check">
            <input type="checkbox" class="form-check-input" [(ngModel)]="configTurnos.habilitar_recordatorios" id="recordatorios">
            <label class="form-check-label" for="recordatorios">Recordatorios habilitados</label>
          </div>
          <div class="config-item col" *ngIf="configTurnos.habilitar_recordatorios">
            <label class="form-label">Días para recordatorio:</label>
            <input type="number" class="form-control" [(ngModel)]="configTurnos.dias_recordatorio_confirmacion" min="1" max="15">
          </div>
          <div class="config-item col" *ngIf="configTurnos.habilitar_recordatorios">
            <label class="form-label">Hora de envío de recordatorios:</label>
            <input type="time" class="form-control" [(ngModel)]="configTurnos.hora_envio_recordatorios">
          </div>
        </div>
      </div>

      <div class="config-section notificaciones">
        <div class="section-background"></div>
        <div class="section-title-container">
          <h2><i class="fas fa-bell me-3"></i>NOTIFICACIONES</h2>
        </div>
        <div class="config-grid row row-cols-1 row-cols-md-2 g-3">
          <div class="config-item col form-check">
            <input type="checkbox" class="form-check-input" [(ngModel)]="configNotif.habilitar_email" id="email">
            <label class="form-check-label" for="email">Email habilitado</label>
          </div>
        </div>
      </div>
      <div class="actions-footer mt-4">
        <button class="btn btn-save me-2" (click)="testClick($event)">
          <i class="fas fa-save me-2"></i>
          <span *ngIf="!isSaving">GUARDAR CAMBIOS</span>
          <span *ngIf="isSaving">Guardando...</span>
        </button>
        <button class="btn btn-reset" (click)="restaurarDefaults()" [disabled]="isResetting">
          <i class="fas fa-undo me-2"></i>
          <span *ngIf="!isResetting">RESTAURAR DEFAULTS</span>
          <span *ngIf="isResetting">Restaurando...</span>
        </button>
      </div>

      <div class="last-modification mt-3" *ngIf="ultimaModificacion">
        <p><i class="fas fa-history me-2"></i>Última modificación: {{ ultimaModificacion.fecha | date:'dd/MM/yyyy HH:mm' }} por {{ ultimaModificacion.usuario }}</p>
      </div>
      <div *ngIf="saveSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
         Cambios guardados exitosamente.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
      <div *ngIf="saveError" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ saveError }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    </div>
  `,
  styleUrls: ['./admin-config.component.css']
})
export class AdminConfigComponent implements OnInit {
  particles: { x: number; y: number }[] = Array(20).fill(0).map(() => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight
  }));

  configTurnos: any = {
    dias_min_confirmacion: null,
    dias_max_no_confirm: null,
    hora_corte_confirmacion: null,
    habilitar_cancelacion_automatica: false,
    habilitar_recordatorios: false,
    dias_recordatorio_confirmacion: null,
    hora_envio_recordatorios: null
  };
  configNotif: any = {
    habilitar_email: true,
    habilitar_sms: false,
    nombre_clinica: '',
    email_notificaciones: ''
  };
  ultimaModificacion: { fecha: string, usuario: string } | null = null;
  isSaving = false;
  isResetting = false;
  diasMinError = false;
  saveSuccess = false;
  saveError: string | null = null;
  originalConfigTurnos: any = {};

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarConfigs();
    this.cargarUltimaModificacion();
  }

  cargarConfigs() {
    this.configService.getResumenTurnos().subscribe({
      next: (res) => {
        console.log('Respuesta del backend (turnos):', res);
        this.configTurnos = {
          dias_min_confirmacion: res.dias_min_confirmacion ?? 2,
          dias_max_no_confirm: res.dias_max_no_confirm ?? 7,
          hora_corte_confirmacion: res.hora_corte_confirmacion ?? '00:00',
          habilitar_cancelacion_automatica: res.cancelacion_automatica_habilitada ?? false,
          habilitar_recordatorios: res.recordatorios_habilitados ?? false,
          dias_recordatorio_confirmacion: res.dias_recordatorio ?? 4,
          hora_envio_recordatorios: res.hora_envio_recordatorios ?? '09:00'
        };
        this.originalConfigTurnos = { ...this.configTurnos };
        console.log('configTurnos después de cargar:', this.configTurnos);
        this.validateDiasMin();
      },
      error: (err) => {
        console.error('Error al cargar configuraciones de turnos:', err);
        alert('Error al cargar configuraciones: ' + (err.error?.message || err.message));
      }
    });

    this.configService.getResumenNotificaciones().subscribe({
      next: (res) => {
        console.log('Respuesta del backend (notificaciones):', res);
        this.configNotif = {
          habilitar_email: res.email_habilitado ?? true,
          habilitar_sms: res.sms_habilitado ?? false,
          nombre_clinica: res.nombre_clinica ?? 'Clínica Médica',
          email_notificaciones: res.email_notificaciones ?? 'notificaciones@clinica.com'
        };
      },
      error: (err) => {
        console.error('Error al cargar configuraciones de notificaciones:', err);
        alert('Error al cargar configuraciones: ' + (err.error?.message || err.message));
      }
    });
  }

  cargarUltimaModificacion() {
    this.configService.getUltimaMod().subscribe({
      next: (res) => {
        if (res) {
          this.ultimaModificacion = {
            fecha: res.performedAt,
            usuario: res.performedBy
          };
        }
      },
      error: (err) => {
        this.saveError = `Error al cargar última modificación: ${err.error?.message || err.message}`;
        console.error('Error al cargar última modificación:', err);
      }
    });
  }

  validateDiasMin() {
    if (this.configTurnos.dias_min_confirmacion == null || this.configTurnos.dias_max_no_confirm == null) {
      this.diasMinError = false;
      console.log('Validación omitida: valores no cargados aún');
      return;
    }

    const diasMin = Number(this.configTurnos.dias_min_confirmacion);
    const diasMax = Number(this.configTurnos.dias_max_no_confirm);

    this.diasMinError = isNaN(diasMin) || isNaN(diasMax) ||
      diasMin < 1 ||
      diasMin >= diasMax;

    console.log(`Validación diasMinError: ${this.diasMinError}, dias_min_confirmacion: ${diasMin}, dias_max_no_confirm: ${diasMax}`);
  }

  testClick(event: MouseEvent) {
    console.log('Botón clicado:', event);
    this.guardarCambios();
  }

  guardarCambios() {
    console.log('guardarCambios() ejecutado');
    this.validateDiasMin();
    if (this.diasMinError) {
      console.log('No se puede guardar: diasMinError es true');
      this.saveError = 'Por favor, corrige los errores en los días de confirmación antes de guardar.';
      return;
    }

    this.isSaving = true;
    this.saveError = null;
    const updates = [
      ...Object.entries(this.configTurnos).map(([key, value]) => ({
        clave: `turnos.${key}`,
        valor: value,
        changed: JSON.stringify(this.originalConfigTurnos[key]) !== JSON.stringify(value)
      })),
      ...Object.entries(this.configNotif).map(([key, value]) => ({
        clave: `notificaciones.${key}`,
        valor: value,
        changed: true
      }))
    ].filter(update => update.valor !== undefined && update.valor !== null && update.changed);

    console.log('Cambios a enviar:', updates);

    if (updates.length === 0) {
      this.isSaving = false;
      this.saveError = 'No hay cambios para guardar.';
      return;
    }

    let completed = 0;
    updates.forEach(update => {
      const payload = { clave: update.clave, valor: update.valor }; // Excluir 'changed'
      console.log(`Enviando actualización para ${update.clave}: ${update.valor}`);
      this.configService.updateConfig(payload).subscribe({
        next: (response) => { // Ahora recibe string
          console.log(`Actualización exitosa para ${update.clave}: ${response}`);
          completed++;
          if (completed === updates.length) {
            this.isSaving = false;
            this.saveSuccess = true;
            this.originalConfigTurnos = { ...this.configTurnos };
            this.cargarUltimaModificacion();
            setTimeout(() => this.saveSuccess = false, 5000);
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.saveError = `Error al guardar ${update.clave}: ${err.error || err.message || 'Error desconocido'}`;
          console.error(`Error al guardar ${update.clave}:`, err);
        }
      });
    });
  }

  restaurarDefaults() {
    console.log('restaurarDefaults() ejecutado');
    this.isResetting = true;
    this.configService.resetDefaults().subscribe({
      next: () => {
        this.isResetting = false;
        alert('Configuraciones restauradas a valores por defecto.');
        this.cargarConfigs();
        this.cargarUltimaModificacion();
      },
      error: (err) => {
        this.isResetting = false;
        console.error('Error al restaurar defaults:', err);
        alert('Error al restaurar defaults: ' + (err.error?.message || err.message));
      }
    });
  }

  logout() {
    console.log('logout() ejecutado');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}