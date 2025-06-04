export interface Turno {
    id: number;
    nombre: string;
    codigo: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado: string; // Ej: "pendiente", "confirmado", "cancelado"
    pacienteId: number;
    pacienteNombre: string;
    pacienteApellido: string;
    staffMedicoId: number;
    staffMedicoNombre: string;
    staffMedicoApellido: string;
    especialidadStaffMedicoId?: number; // Opcional, si aplica
    especialidadStaffMedicoNombre?: string; // Opcional, si aplica
    centroAtencionId: number;
    centroAtencionNombre: string;
    consultorioId?: number; // Opcional, si aplica
    esquemaTurnoId?: number; // ID del esquema de turno asociado
    motivoCancelacion?: string; // Opcional, si el turno fue cancelado      


}