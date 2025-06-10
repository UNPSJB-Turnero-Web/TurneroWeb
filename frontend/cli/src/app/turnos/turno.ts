export interface Turno {
    // Campos básicos
    id?: number;
    fecha: string;                  // LocalDate como string
    horaInicio: string;             // LocalTime como string  
    horaFin: string;                // LocalTime como string
    estado: string;                 // "PENDIENTE", "CONFIRMADO", "CANCELADO"
    
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
    // Los colores se manejan en el frontend según el estado
}