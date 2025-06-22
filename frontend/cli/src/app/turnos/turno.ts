export interface Turno {
    // Campos básicos
    id?: number;
    fecha: string;                  // LocalDate como string
    horaInicio: string;             // LocalTime como string  
    horaFin: string;                // LocalTime como string
    estado: string;                 // "PROGRAMADO", "CONFIRMADO", "CANCELADO"
    
    // Campos de paciente
    pacienteId?: number;
    nombrePaciente?: string;
    apellidoPaciente?: string;
    
    // Campos de staff médico
    staffMedicoId: number;
    staffMedicoNombre?: string;
    staffMedicoApellido?: string;
    especialidadStaffMedico?: string;
    
    // Campos de centro y consultorio
    centroId?: number;
    nombreCentro?: string;
    consultorioId?: number;
    consultorioNombre?: string;
    
    // Campo para título personalizado
    titulo?: string;
    
    // Campos para manejo de SLOTS en la agenda
    esSlot?: boolean;               // true = slot generado, false/undefined = turno real
    ocupado?: boolean;              // true = slot ocupado por un turno, false = disponible
    
    // === CAMPOS DE AUDITORÍA ===
    ultimoUsuarioModificacion?: string;    // Usuario que realizó la última modificación
    fechaUltimaModificacion?: string;      // Fecha/hora de la última modificación como string
    motivoUltimaModificacion?: string;     // Motivo de la última modificación
    totalModificaciones?: number;          // Número total de modificaciones
}

// Interfaz para los filtros de búsqueda avanzada
export interface TurnoFilter {
    // Filtros básicos
    estado?: string;
    pacienteId?: number;
    nombrePaciente?: string;
    staffMedicoId?: number;
    nombreMedico?: string;
    especialidadId?: number;
    nombreEspecialidad?: string;
    centroAtencionId?: number;
    nombreCentro?: string;
    consultorioId?: number;
    centroId?: number; // Agregado para compatibilidad con backend y servicio de exportación
    
    // Filtros de fecha
    fechaDesde?: string;
    fechaHasta?: string;
    fechaExacta?: string;
    
    // Filtros de auditoría
    usuarioModificacion?: string;
    conModificaciones?: boolean;
    
    // Paginación y ordenamiento
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
    
    // Formato de exportación
    exportFormat?: string;  // CSV, PDF
}

// Interfaz para los logs de auditoría
export interface AuditLog {
    id?: number;
    turnoId: number;
    action: string;
    previousStatus?: string;
    newStatus?: string;
    reason?: string;
    performedBy: string;
    performedAt: string;
    oldValues?: any;
    newValues?: any;
}