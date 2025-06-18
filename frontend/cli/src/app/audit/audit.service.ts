import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private auditUrl = 'rest/audit';

  constructor(private http: HttpClient) {}

  getAllTurnosForAudit(): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: [],
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  getTurnosForAuditPaginated(page: number, size: number, filter?: any): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page - 1,
        size: size
      },
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  exportTurnosCSV(filter: any): Observable<Blob> {
    return new Observable(observer => {
      const blob = new Blob(['mock csv data'], { type: 'text/csv' });
      observer.next(blob);
      observer.complete();
    });
  }

  exportTurnosPDF(filter: any): Observable<Blob> {
    return new Observable(observer => {
      const blob = new Blob(['mock pdf data'], { type: 'application/pdf' });
      observer.next(blob);
      observer.complete();
    });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getTurnoAuditInfo(turnoId: number): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: {
        turno: {},
        auditLogs: [],
        conflictResolutions: []
      },
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  updateTurnoWithAudit(turnoId: number, turno: any, reason: string): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: turno,
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  confirmTurnoWithAudit(turnoId: number, reason: string): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: {},
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  cancelTurnoWithAudit(turnoId: number, reason: string): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: {},
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  notifyAffectedParties(turnoId: number, message: string): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: {},
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  resolveConflict(turnoId: number, resolution: any): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: {},
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  getAuditLogsPaginated(request: any): Observable<DataPackage<any>> {
    const mockData: DataPackage<any> = {
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: request.size
      },
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  exportAuditLogsCSV(filter: any): Observable<Blob> {
    return new Observable(observer => {
      const blob = new Blob(['mock csv data'], { type: 'text/csv' });
      observer.next(blob);
      observer.complete();
    });
  }

  exportAuditLogsPDF(filter: any): Observable<Blob> {
    return new Observable(observer => {
      const blob = new Blob(['mock pdf data'], { type: 'application/pdf' });
      observer.next(blob);
      observer.complete();
    });
  }

  // Métodos para estadísticas avanzadas
  getAuditStatistics(filter?: any): Observable<DataPackage<any>> {
    const mockStats = {
      totalTurnos: 156,
      programados: 42,
      confirmados: 78,
      reagendados: 23,
      cancelados: 13,
      totalAudits: 312,
      conflictsResolved: 8,
      todayTurnos: 12,
      weekTurnos: 89,
      auditsByDay: [
        { date: '2024-12-01', count: 15 },
        { date: '2024-12-02', count: 23 },
        { date: '2024-12-03', count: 18 },
        { date: '2024-12-04', count: 31 },
        { date: '2024-12-05', count: 27 }
      ],
      conflictTypes: [
        { type: 'SCHEDULING_CONFLICT', count: 3 },
        { type: 'DUPLICATE_APPOINTMENT', count: 2 },
        { type: 'RESOURCE_UNAVAILABLE', count: 2 },
        { type: 'DATA_INCONSISTENCY', count: 1 }
      ]
    };

    const mockData: DataPackage<any> = {
      data: mockStats,
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  // Métodos para manejo de conflictos
  detectConflicts(turnoId: number): Observable<DataPackage<any>> {
    const mockConflicts = [
      {
        id: 1,
        type: 'SCHEDULING_CONFLICT',
        description: 'Conflicto de horarios con otro turno',
        severity: 'HIGH',
        affectedTurnos: [turnoId, turnoId + 1]
      }
    ];

    const mockData: DataPackage<any> = {
      data: mockConflicts,
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }

  // Métodos para validación
  validateTurnoChanges(turnoId: number, changes: any): Observable<DataPackage<any>> {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: [
        'Se recomienda notificar al paciente sobre el cambio'
      ]
    };

    const mockData: DataPackage<any> = {
      data: validation,
      message: 'Success',
      status: 200
    };
    return of(mockData);
  }
}