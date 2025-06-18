export interface AuditLog {
  id: number;
  turnoId: number;
  action: AuditAction;
  performedBy: string;
  performedAt: Date;
  oldValues?: { [key: string]: any };
  newValues?: { [key: string]: any };
  reason?: string;
  affectedParties?: string[];
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  RESCHEDULE = 'RESCHEDULE',
  STATUS_CHANGE = 'STATUS_CHANGE'
}

export interface AuditFilter {
  dateFrom?: Date;
  dateTo?: Date;
  action?: AuditAction;
  performedBy?: string;
  turnoId?: number;
  pacienteId?: number;
  staffMedicoId?: number;
  centroId?: number;
  especialidadId?: number;
}

export interface AuditLogPageRequest {
  page: number;
  size: number;
  filter?: AuditFilter;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TurnoAuditInfo {
  turno: any;
  auditLogs: AuditLog[];
  conflictResolutions?: ConflictResolution[];
}

export interface ConflictResolution {
  id: number;
  turnoId: number;
  conflictType: ConflictType;
  description: string;
  resolvedBy: string;
  resolvedAt: Date;
  resolution: string;
  validatedBy?: string;
  validatedAt?: Date;
}

export enum ConflictType {
  SCHEDULING_CONFLICT = 'SCHEDULING_CONFLICT',
  DUPLICATE_APPOINTMENT = 'DUPLICATE_APPOINTMENT',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  INVALID_STATUS_CHANGE = 'INVALID_STATUS_CHANGE',
  DATA_INCONSISTENCY = 'DATA_INCONSISTENCY'
}
