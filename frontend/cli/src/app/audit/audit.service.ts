import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AuditStatistics {
  turnosCreados: number;
  turnosConfirmados: number;
  turnosCancelados: number;
  turnosReagendados: number;
  turnosModificados: number;
  totalAcciones: number;
}

interface UserActivityStat {
  user: string;
  totalActions: number;
  actionBreakdown: { [action: string]: number };
}

interface DashboardStatistics extends AuditStatistics {
  actionStatistics: any[];
  userStatistics: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private baseUrl = 'rest/audit';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene estadísticas completas del dashboard
   */
  getDashboardStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }

  /**
   * Obtiene estadísticas de actividad por usuario
   */
  getUserActivityStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/activity`);
  }

  /**
   * Obtiene logs de auditoría de un usuario específico (médico)
   */
  getLogsByUser(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${username}`);
  }

  /**
   * Obtiene logs de auditoría por acción específica
   */
  getLogsByAction(action: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/action/${action}`);
  }

  /**
   * Obtiene logs de auditoría en un rango de fechas
   */
  getLogsByDateRange(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get(`${this.baseUrl}/date-range`, { params });
  }

  /**
   * Obtiene el historial de auditoría de un turno específico
   */
  getTurnoAuditHistory(turnoId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/turno/${turnoId}`);
  }

  /**
   * Obtiene estadísticas por acción
   */
  getActionStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/statistics`);
  }

  /**
   * Procesa los datos de auditoría para generar estadísticas de un médico específico
   */
  processMedicoStatistics(logs: any[], medicoUsername: string, period?: string): any {
    const filteredLogs = logs.filter(log => 
      log.performedBy === medicoUsername &&
      (period ? this.isInPeriod(log.performedAt, period) : true)
    );

    const stats = {
      turnosCreados: 0,
      turnosConfirmados: 0,
      turnosCancelados: 0,
      turnosReagendados: 0,
      turnosModificados: 0,
      pacientesAtendidos: new Set(),
      horasTrabajadas: 0,
      periodo: period || 'todos',
      totalAcciones: filteredLogs.length
    };

    filteredLogs.forEach(log => {
      switch (log.action) {
        case 'CREATE':
          stats.turnosCreados++;
          break;
        case 'STATUS_CHANGE':
          if (log.newStatus === 'CONFIRMADO' || log.newStatus === 'COMPLETO') {
            stats.turnosConfirmados++;
            // Estimar 45 minutos por turno confirmado/completado
            stats.horasTrabajadas += 0.75;
          } else if (log.newStatus === 'CANCELADO') {
            stats.turnosCancelados++;
          }
          stats.turnosModificados++;
          break;
        case 'RESCHEDULE':
          stats.turnosReagendados++;
          break;
      }

      // Contar pacientes únicos (si hay datos del turno)
      if (log.turno && log.turno.paciente) {
        stats.pacientesAtendidos.add(log.turno.paciente.id);
      }
    });

    return {
      ...stats,
      pacientesAtendidos: stats.pacientesAtendidos.size,
      tasaCancelacion: stats.turnosCreados > 0 ? 
        (stats.turnosCancelados / stats.turnosCreados * 100).toFixed(2) : 0
    };
  }

  /**
   * Verifica si una fecha está dentro del período especificado
   */
  private isInPeriod(dateTime: string, period: string): boolean {
    const logDate = new Date(dateTime);
    const now = new Date();
    
    switch (period) {
      case 'semana_actual':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
        return logDate >= startOfWeek && logDate <= endOfWeek;
      
      case 'mes_actual':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return logDate >= startOfMonth && logDate <= endOfMonth;
      
      case 'trimestre':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        return logDate >= startOfQuarter && logDate <= endOfQuarter;
      
      case 'ano_actual':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        return logDate >= startOfYear && logDate <= endOfYear;
      
      default:
        return true;
    }
  }

  /**
   * Genera datos de evolución temporal basados en logs de auditoría
   */
  generateEvolutionData(logs: any[], period: string): any[] {
    const groupedData = new Map();
    const now = new Date();
    
    logs.forEach(log => {
      const logDate = new Date(log.performedAt);
      let key: string;
      
      switch (period) {
        case 'semana_actual':
          key = logDate.toLocaleDateString('es-ES', { weekday: 'short' });
          break;
        case 'mes_actual':
          key = logDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
          break;
        case 'trimestre':
        case 'ano_actual':
          key = logDate.toLocaleDateString('es-ES', { month: 'short' });
          break;
        default:
          key = logDate.toLocaleDateString('es-ES');
      }
      
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          periodo: key,
          turnosRealizados: 0,
          turnosCancelados: 0,
          pacientesAtendidos: new Set(),
          horasTrabajadas: 0
        });
      }
      
      const dayData = groupedData.get(key);
      
      if (log.action === 'STATUS_CHANGE') {
        if (log.newStatus === 'CONFIRMADO' || log.newStatus === 'COMPLETO') {
          dayData.turnosRealizados++;
          dayData.horasTrabajadas += 0.75;
        } else if (log.newStatus === 'CANCELADO') {
          dayData.turnosCancelados++;
        }
      }
      
      if (log.turno && log.turno.paciente) {
        dayData.pacientesAtendidos.add(log.turno.paciente.id);
      }
    });
    
    // Convertir Set a número
    return Array.from(groupedData.values()).map(data => ({
      ...data,
      pacientesAtendidos: data.pacientesAtendidos.size
    }));
  }
}
