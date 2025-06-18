import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from './audit.service';
import { interval, Subscription } from 'rxjs';

interface AuditStats {
  totalTurnos: number;
  turnosHoy: number;
  turnosEstaSemana: number;
  turnosProximosDias: number;
  conflictosResueltos: number;
  conflictosPendientes: number;
  validacionesRealizadas: number;
  cambiosAuditados: number;
  usuariosActivos: number;
  alertasCriticas: number;
}

@Component({
  selector: 'app-audit-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audit-stats">
      <div class="stats-header">
        <h3>
          <i class="fas fa-chart-pie"></i>
          Estadísticas en Tiempo Real
        </h3>
        <div class="refresh-indicator" [class.active]="isRefreshing">
          <i class="fas fa-sync-alt"></i>
          Actualizando...
        </div>
      </div>

      <div class="stats-grid">
        <!-- Turnos Statistics -->
        <div class="stat-group">
          <h4>Gestión de Turnos</h4>
          <div class="stats-row">
            <div class="stat-item primary">
              <div class="stat-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.totalTurnos | number }}</span>
                <span class="stat-label">Total Turnos</span>
              </div>
            </div>
            
            <div class="stat-item success">
              <div class="stat-icon">
                <i class="fas fa-calendar-day"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.turnosHoy | number }}</span>
                <span class="stat-label">Hoy</span>
              </div>
            </div>
            
            <div class="stat-item info">
              <div class="stat-icon">
                <i class="fas fa-calendar-week"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.turnosEstaSemana | number }}</span>
                <span class="stat-label">Esta Semana</span>
              </div>
            </div>
            
            <div class="stat-item warning">
              <div class="stat-icon">
                <i class="fas fa-calendar-plus"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.turnosProximosDias | number }}</span>
                <span class="stat-label">Próximos 7 días</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Conflict Resolution -->
        <div class="stat-group">
          <h4>Resolución de Conflictos</h4>
          <div class="stats-row">
            <div class="stat-item success">
              <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.conflictosResueltos | number }}</span>
                <span class="stat-label">Resueltos</span>
              </div>
            </div>
            
            <div class="stat-item danger">
              <div class="stat-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.conflictosPendientes | number }}</span>
                <span class="stat-label">Pendientes</span>
              </div>
            </div>
            
            <div class="stat-item info">
              <div class="stat-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.validacionesRealizadas | number }}</span>
                <span class="stat-label">Validaciones</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Activity -->
        <div class="stat-group">
          <h4>Actividad de Auditoría</h4>
          <div class="stats-row">
            <div class="stat-item primary">
              <div class="stat-icon">
                <i class="fas fa-edit"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.cambiosAuditados | number }}</span>
                <span class="stat-label">Cambios Auditados</span>
              </div>
            </div>
            
            <div class="stat-item success">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.usuariosActivos | number }}</span>
                <span class="stat-label">Usuarios Activos</span>
              </div>
            </div>
            
            <div class="stat-item danger">
              <div class="stat-icon">
                <i class="fas fa-bell"></i>
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ stats.alertasCriticas | number }}</span>
                <span class="stat-label">Alertas Críticas</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="stat-group full-width">
          <h4>Métricas de Rendimiento</h4>
          <div class="performance-metrics">
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">Tasa de Resolución de Conflictos</span>
                <span class="metric-value">{{ getResolutionRate() }}%</span>
              </div>
              <div class="metric-bar">
                <div class="metric-fill" [style.width.%]="getResolutionRate()"></div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">Eficiencia de Validación</span>
                <span class="metric-value">{{ getValidationEfficiency() }}%</span>
              </div>
              <div class="metric-bar">
                <div class="metric-fill validation" [style.width.%]="getValidationEfficiency()"></div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">Nivel de Actividad del Sistema</span>
                <span class="metric-value">{{ getSystemActivity() }}%</span>
              </div>
              <div class="metric-bar">
                <div class="metric-fill activity" [style.width.%]="getSystemActivity()"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-stats {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8f9fa;
    }

    .stats-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .refresh-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .refresh-indicator.active {
      opacity: 1;
    }

    .refresh-indicator i {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .stats-grid {
      display: grid;
      gap: 2rem;
    }

    .stat-group {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 1.5rem;
      border-left: 4px solid #007bff;
    }

    .stat-group.full-width {
      grid-column: 1 / -1;
    }

    .stat-group h4 {
      margin: 0 0 1rem 0;
      color: #495057;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease;
    }

    .stat-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      flex-shrink: 0;
    }

    .stat-item.primary .stat-icon {
      background: linear-gradient(135deg, #007bff, #0056b3);
    }

    .stat-item.success .stat-icon {
      background: linear-gradient(135deg, #28a745, #1e7e34);
    }

    .stat-item.info .stat-icon {
      background: linear-gradient(135deg, #17a2b8, #117a8b);
    }

    .stat-item.warning .stat-icon {
      background: linear-gradient(135deg, #ffc107, #e0a800);
    }

    .stat-item.danger .stat-icon {
      background: linear-gradient(135deg, #dc3545, #c82333);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.25rem;
      font-weight: 500;
    }

    .performance-metrics {
      display: grid;
      gap: 1.5rem;
    }

    .metric-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .metric-title {
      font-weight: 600;
      color: #495057;
    }

    .metric-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .metric-bar {
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .metric-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      border-radius: 4px;
      transition: width 0.8s ease;
    }

    .metric-fill.validation {
      background: linear-gradient(90deg, #28a745, #1e7e34);
    }

    .metric-fill.activity {
      background: linear-gradient(90deg, #17a2b8, #117a8b);
    }

    @media (max-width: 768px) {
      .audit-stats {
        padding: 1rem;
      }

      .stats-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .stats-row {
        grid-template-columns: 1fr;
      }

      .stat-item {
        padding: 0.75rem;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
      }

      .stat-number {
        font-size: 1.5rem;
      }
    }
  `]
})
export class AuditStatsComponent implements OnInit, OnDestroy {
  stats: AuditStats = {
    totalTurnos: 0,
    turnosHoy: 0,
    turnosEstaSemana: 0,
    turnosProximosDias: 0,
    conflictosResueltos: 0,
    conflictosPendientes: 0,
    validacionesRealizadas: 0,
    cambiosAuditados: 0,
    usuariosActivos: 0,
    alertasCriticas: 0
  };

  isRefreshing = false;
  private refreshSubscription?: Subscription;

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadStats();
    
    // Auto-refresh every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadStats();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadStats(): void {
    this.isRefreshing = true;
    
    // Simulate API call with timeout
    setTimeout(() => {
      this.stats = {
        totalTurnos: Math.floor(Math.random() * 5000) + 2000,
        turnosHoy: Math.floor(Math.random() * 100) + 20,
        turnosEstaSemana: Math.floor(Math.random() * 500) + 150,
        turnosProximosDias: Math.floor(Math.random() * 300) + 80,
        conflictosResueltos: Math.floor(Math.random() * 50) + 10,
        conflictosPendientes: Math.floor(Math.random() * 15) + 2,
        validacionesRealizadas: Math.floor(Math.random() * 200) + 50,
        cambiosAuditados: Math.floor(Math.random() * 150) + 30,
        usuariosActivos: Math.floor(Math.random() * 25) + 5,
        alertasCriticas: Math.floor(Math.random() * 5)
      };
      this.isRefreshing = false;
    }, 1000);
  }

  getResolutionRate(): number {
    const total = this.stats.conflictosResueltos + this.stats.conflictosPendientes;
    if (total === 0) return 100;
    return Math.round((this.stats.conflictosResueltos / total) * 100);
  }

  getValidationEfficiency(): number {
    // Simulate validation efficiency based on successful validations
    return Math.min(95, Math.max(75, Math.round((this.stats.validacionesRealizadas / this.stats.cambiosAuditados) * 100)));
  }

  getSystemActivity(): number {
    // Calculate system activity based on various metrics
    const maxActivity = 100;
    const activity = (this.stats.usuariosActivos * 3) + (this.stats.turnosHoy * 0.5) + (this.stats.cambiosAuditados * 0.8);
    return Math.min(100, Math.round(activity));
  }
}
