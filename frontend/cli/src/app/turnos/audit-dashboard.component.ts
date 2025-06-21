import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnoService } from './turno.service';
import { AuditLog } from './turno';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-audit-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-dashboard.component.html',
  styleUrls: ['./audit-dashboard.component.css']
})
export class AuditDashboardComponent implements OnInit {
  
  // Datos del dashboard
  auditStatistics: any = {};
  recentLogs: AuditLog[] = [];
  loading: boolean = false;
  
  // Filtros para los logs recientes
  selectedAction: string = '';
  selectedUser: string = '';
  
  // Opciones para filtros
  availableActions: string[] = ['CREATED', 'STATUS_CHANGED', 'CANCELED', 'CONFIRMED', 'RESCHEDULED', 'DELETED'];
  
  constructor(
    private turnoService: TurnoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /** Carga todos los datos del dashboard */
  loadDashboardData(): void {
    this.loading = true;
    
    // Cargar estadísticas y logs en paralelo
    Promise.all([
      this.loadAuditStatistics(),
      this.loadRecentLogs()
    ]).finally(() => {
      this.loading = false;
    });
  }

  /** Carga estadísticas de auditoría */
  loadAuditStatistics(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Cargando estadísticas de auditoría...');
      this.turnoService.getAuditStatistics().subscribe({
        next: (response: DataPackage<any[]>) => {
          console.log('Respuesta de estadísticas:', response);
          if (response.status === 1) {
            this.auditStatistics = this.processStatistics(response.data);
            console.log('Estadísticas procesadas:', this.auditStatistics);
          } else {
            console.warn('Estado de respuesta no exitoso:', response.status);
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
          reject(error);
        }
      });
    });
  }

  /** Carga logs recientes */
  loadRecentLogs(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Cargando logs recientes...');
      this.turnoService.getRecentAuditLogs().subscribe({
        next: (response: DataPackage<AuditLog[]>) => {
          console.log('Respuesta de logs recientes:', response);
          if (response.status === 1) {
            this.recentLogs = response.data || [];
            console.log('Logs recientes procesados:', this.recentLogs);
          } else {
            console.warn('Estado de respuesta no exitoso:', response.status);
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar logs recientes:', error);
          reject(error);
        }
      });
    });
  }

  /** Procesa las estadísticas para mostrar */
  private processStatistics(data: any[]): any {
    const stats: any = {
      totalAcciones: 0,
      porAccion: {},
      porUsuario: {},
      resumen: {
        totalTurnos: 0,
        turnosModificados: 0,
        turnosCancelados: 0,
        turnosConfirmados: 0
      }
    };

    data.forEach(item => {
      if (Array.isArray(item) && item.length >= 2) {
        const key = item[0];
        const value = item[1];
        
        if (key.includes('ACTION_')) {
          stats.porAccion[key.replace('ACTION_', '')] = value;
          stats.totalAcciones += value;
        } else if (key.includes('USER_')) {
          stats.porUsuario[key.replace('USER_', '')] = value;
        }
      }
    });

    return stats;
  }

  /** Filtra los logs recientes */
  get filteredLogs(): AuditLog[] {
    return this.recentLogs.filter(log => {
      let matchesAction = !this.selectedAction || log.action === this.selectedAction;
      let matchesUser = !this.selectedUser || log.performedBy.toLowerCase().includes(this.selectedUser.toLowerCase());
      return matchesAction && matchesUser;
    });
  }

  /** Navega al detalle de un turno */
  goToTurnoDetail(turnoId: number): void {
    this.router.navigate(['/turnos', turnoId]);
  }

  /** Navega a la búsqueda avanzada */
  goToAdvancedSearch(): void {
    this.router.navigate(['/turnos/advanced-search']);
  }

  /** Refresca los datos del dashboard */
  refreshData(): void {
    this.loadDashboardData();
  }

  // === MÉTODOS AUXILIARES ===

  /** Formatea una fecha y hora para mostrar */
  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES');
  }

  /** Obtiene la clase CSS para el tipo de acción */
  getActionClass(action: string): string {
    const classes: any = {
      'CREATED': 'badge bg-info',
      'STATUS_CHANGED': 'badge bg-primary',
      'CANCELED': 'badge bg-danger',
      'CONFIRMED': 'badge bg-success',
      'RESCHEDULED': 'badge bg-warning',
      'DELETED': 'badge bg-dark'
    };
    return classes[action] || 'badge bg-secondary';
  }

  /** Obtiene el icono para el tipo de acción */
  getActionIcon(action: string): string {
    const icons: any = {
      'CREATED': 'fas fa-plus-circle',
      'STATUS_CHANGED': 'fas fa-edit',
      'CANCELED': 'fas fa-times-circle',
      'CONFIRMED': 'fas fa-check-circle',
      'RESCHEDULED': 'fas fa-calendar-alt',
      'DELETED': 'fas fa-trash'
    };
    return icons[action] || 'fas fa-question-circle';
  }

  /** Obtiene un array de las claves de un objeto */
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  /** Obtiene el porcentaje de una acción respecto al total */
  getActionPercentage(count: number): number {
    if (this.auditStatistics.totalAcciones === 0) return 0;
    return Math.round((count / this.auditStatistics.totalAcciones) * 100);
  }

  /** Obtiene la clase de color para las barras de progreso */
  getProgressBarClass(action: string): string {
    const classes: any = {
      'CREATED': 'bg-info',
      'STATUS_CHANGED': 'bg-primary',
      'CANCELED': 'bg-danger',
      'CONFIRMED': 'bg-success',
      'RESCHEDULED': 'bg-warning',
      'DELETED': 'bg-dark'
    };
    return classes[action] || 'bg-secondary';
  }
}
