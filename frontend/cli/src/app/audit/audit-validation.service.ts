import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DataPackage } from '../data.package';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ConflictDetection {
  hasConflicts: boolean;
  conflicts: TurnoConflict[];
}

export interface TurnoConflict {
  type: 'SCHEDULE_OVERLAP' | 'DOUBLE_BOOKING' | 'RESOURCE_UNAVAILABLE' | 'INVALID_TIME_SLOT';
  description: string;
  affectedTurnos: number[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedResolution?: string;
  ignored?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuditValidationService {

  constructor() {}

  // Simple validation method for single turno
  validateTurno(turno: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Validate required fields
    if (!turno.fecha) {
      result.errors.push({
        field: 'fecha',
        message: 'La fecha es obligatoria',
        code: 'REQUIRED_FIELD'
      });
      result.isValid = false;
    }

    if (!turno.horaInicio || !turno.horaFin) {
      result.errors.push({
        field: 'horario',
        message: 'Los horarios de inicio y fin son obligatorios',
        code: 'REQUIRED_FIELD'
      });
      result.isValid = false;
    }

    // Validate date is not in the past
    if (turno.fecha && new Date(turno.fecha) < new Date()) {
      result.errors.push({
        field: 'fecha',
        message: 'No se puede programar un turno en el pasado',
        code: 'PAST_DATE'
      });
      result.isValid = false;
    }

    // Validate time slot
    if (turno.horaInicio && turno.horaFin && !this.isValidTimeSlot(turno.horaInicio, turno.horaFin)) {
      result.errors.push({
        field: 'horario',
        message: 'El horario de fin debe ser posterior al horario de inicio',
        code: 'INVALID_TIME_SLOT'
      });
      result.isValid = false;
    }

    return result;
  }

  validateTurnoChanges(originalTurno: any, modifiedTurno: any): Observable<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Validar cambios de fecha
    if (originalTurno.fecha !== modifiedTurno.fecha) {
      const originalDate = new Date(originalTurno.fecha);
      const modifiedDate = new Date(modifiedTurno.fecha);
      const daysDiff = Math.abs((modifiedDate.getTime() - originalDate.getTime()) / (1000 * 3600 * 24));

      if (daysDiff > 30) {
        result.warnings.push({
          field: 'fecha',
          message: 'El cambio de fecha es superior a 30 días',
          severity: 'medium'
        });
      }

      if (modifiedDate < new Date()) {
        result.errors.push({
          field: 'fecha',
          message: 'No se puede programar un turno en el pasado',
          code: 'PAST_DATE'
        });
        result.isValid = false;
      }
    }

    // Validar cambios de horario
    if (originalTurno.horaInicio !== modifiedTurno.horaInicio || 
        originalTurno.horaFin !== modifiedTurno.horaFin) {
      result.suggestions.push('Se recomienda notificar al paciente sobre el cambio de horario');
      
      if (!this.isValidTimeSlot(modifiedTurno.horaInicio, modifiedTurno.horaFin)) {
        result.errors.push({
          field: 'horario',
          message: 'El horario seleccionado no es válido',
          code: 'INVALID_TIME_SLOT'
        });
        result.isValid = false;
      }
    }

    // Validar cambios de médico
    if (originalTurno.staffMedicoId !== modifiedTurno.staffMedicoId) {
      result.warnings.push({
        field: 'medico',
        message: 'Cambio de médico detectado',
        severity: 'high'
      });
      result.suggestions.push('Verificar disponibilidad del nuevo médico');
      result.suggestions.push('Confirmar que el paciente está de acuerdo con el cambio');
    }

    // Validar cambios de estado
    if (originalTurno.estado !== modifiedTurno.estado) {
      if (!this.isValidStateTransition(originalTurno.estado, modifiedTurno.estado)) {
        result.errors.push({
          field: 'estado',
          message: `Transición de estado no válida: ${originalTurno.estado} → ${modifiedTurno.estado}`,
          code: 'INVALID_STATE_TRANSITION'
        });
        result.isValid = false;
      }
    }

    return of(result);
  }

  detectConflicts(turno: any): ConflictDetection {
    const conflicts: TurnoConflict[] = [];

    // Simular detección de conflictos
    // En un sistema real, esto consultaría la base de datos

    // Conflicto de horario simulado
    if (turno.horaInicio === '09:00' && turno.horaFin === '09:30') {
      conflicts.push({
        type: 'SCHEDULE_OVERLAP',
        description: 'Conflicto de horario con otro turno del mismo médico',
        affectedTurnos: [turno.id, turno.id + 1],
        severity: 'high',
        suggestedResolution: 'Reprogramar uno de los turnos a otro horario disponible'
      });
    }

    // Doble reserva simulada
    if (turno.pacienteId && Math.random() < 0.1) { // 10% de probabilidad
      conflicts.push({
        type: 'DOUBLE_BOOKING',
        description: 'El paciente ya tiene otro turno programado el mismo día',
        affectedTurnos: [turno.id],
        severity: 'medium',
        suggestedResolution: 'Confirmar con el paciente cuál turno mantener'
      });
    }

    const result: ConflictDetection = {
      hasConflicts: conflicts.length > 0,
      conflicts
    };

    return result;
  }

  detectConflictsAsync(turno: any): Observable<ConflictDetection> {
    const conflicts: TurnoConflict[] = [];

    // Simular detección de conflictos
    // En un sistema real, esto consultaría la base de datos

    // Conflicto de horario simulado
    if (turno.horaInicio === '09:00' && turno.horaFin === '09:30') {
      conflicts.push({
        type: 'SCHEDULE_OVERLAP',
        description: 'Conflicto de horario con otro turno del mismo médico',
        affectedTurnos: [turno.id, turno.id + 1],
        severity: 'high',
        suggestedResolution: 'Reprogramar uno de los turnos a otro horario disponible'
      });
    }

    // Doble reserva simulada
    if (turno.pacienteId && Math.random() < 0.1) { // 10% de probabilidad
      conflicts.push({
        type: 'DOUBLE_BOOKING',
        description: 'El paciente ya tiene otro turno programado el mismo día',
        affectedTurnos: [turno.id],
        severity: 'medium',
        suggestedResolution: 'Confirmar con el paciente cuál turno mantener'
      });
    }

    const result: ConflictDetection = {
      hasConflicts: conflicts.length > 0,
      conflicts
    };

    return of(result);
  }

  validateBusinessRules(turno: any): Observable<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Regla: No más de 2 turnos por paciente por semana
    if (turno.pacienteId) {
      result.warnings.push({
        field: 'paciente',
        message: 'Verificar límite de turnos por semana para este paciente',
        severity: 'low'
      });
    }

    // Regla: Horarios de atención
    const hora = parseInt(turno.horaInicio?.split(':')[0] || '0');
    if (hora < 8 || hora > 18) {
      result.warnings.push({
        field: 'horario',
        message: 'Turno fuera del horario de atención habitual (8:00-18:00)',
        severity: 'medium'
      });
    }

    // Regla: Turnos de emergencia
    if (turno.esEmergencia) {
      result.suggestions.push('Turno marcado como emergencia - prioridad alta');
      result.suggestions.push('Verificar disponibilidad inmediata del médico');
    }

    // Regla: Obra social
    if (turno.obraSocialId) {
      result.suggestions.push('Verificar vigencia de la obra social del paciente');
    }

    return of(result);
  }

  private isValidTimeSlot(inicio: string, fin: string): boolean {
    if (!inicio || !fin) return false;
    
    const inicioTime = this.timeToMinutes(inicio);
    const finTime = this.timeToMinutes(fin);
    
    // Validar que el fin sea después del inicio
    if (finTime <= inicioTime) return false;
    
    // Validar duración mínima (15 minutos)
    if (finTime - inicioTime < 15) return false;
    
    // Validar duración máxima (2 horas)
    if (finTime - inicioTime > 120) return false;
    
    return true;
  }

  private isValidStateTransition(fromState: string, toState: string): boolean {
    const validTransitions: { [key: string]: string[] } = {
      'PROGRAMADO': ['CONFIRMADO', 'CANCELADO', 'REAGENDADO'],
      'CONFIRMADO': ['PRESENTE', 'AUSENTE', 'CANCELADO', 'REAGENDADO'],
      'PRESENTE': ['COMPLETADO'],
      'AUSENTE': ['REAGENDADO', 'CANCELADO'],
      'REAGENDADO': ['PROGRAMADO', 'CONFIRMADO', 'CANCELADO'],
      'CANCELADO': ['REAGENDADO'],
      'COMPLETADO': []
    };

    const allowedStates = validTransitions[fromState] || [];
    return allowedStates.includes(toState);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Métodos para validaciones específicas de auditoría
  validateAuditPermissions(userId: string, action: string, turnoId: number): Observable<boolean> {
    // Simular validación de permisos
    // En un sistema real, esto consultaría los permisos del usuario
    
    const adminUsers = ['admin', 'supervisor'];
    const isAdmin = adminUsers.includes(userId);
    
    const readOnlyActions = ['VIEW', 'EXPORT'];
    const writeActions = ['UPDATE', 'DELETE', 'CREATE'];
    
    if (readOnlyActions.includes(action)) {
      return of(true); // Todos pueden ver
    }
    
    if (writeActions.includes(action)) {
      return of(isAdmin); // Solo admins pueden modificar
    }
    
    return of(false);
  }

  generateAuditRecommendations(turno: any, changes: any[]): string[] {
    const recommendations: string[] = [];

    if (changes.length > 3) {
      recommendations.push('Se detectaron múltiples cambios - considerar crear un nuevo turno');
    }

    if (changes.some(c => c.field === 'fecha')) {
      recommendations.push('Notificar al paciente sobre el cambio de fecha');
      recommendations.push('Enviar recordatorio 24 horas antes del nuevo turno');
    }

    if (changes.some(c => c.field === 'staffMedicoId')) {
      recommendations.push('Verificar que el nuevo médico tenga la especialidad requerida');
      recommendations.push('Actualizar el sistema de notificaciones médicas');
    }

    if (changes.some(c => c.field === 'estado' && c.newValue === 'CANCELADO')) {
      recommendations.push('Liberar el horario para otros pacientes');
      recommendations.push('Ofrecer turnos alternativos al paciente');
    }

    return recommendations;
  }
}
