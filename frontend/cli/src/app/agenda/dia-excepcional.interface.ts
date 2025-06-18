export interface DiaExcepcional {
  // Campos principales del backend (ConfiguracionExcepcionalDTO)
  id?: number;
  fecha: string;
  tipo: 'FERIADO' | 'ATENCION_ESPECIAL' | 'MANTENIMIENTO';
  descripcion?: string;
  horaInicio?: string;
  horaFin?: string;
  tiempoSanitizacion?: number;
  activo?: boolean;
  
  // Información del centro de atención (del backend)
  centroAtencionId?: number;
  centroAtencionNombre?: string;
  
  // Información del consultorio (del backend)
  consultorioId?: number;
  consultorioNombre?: string;
  
  // Información del esquema de turno (del backend)
  esquemaTurnoId?: number;
  esquemaTurnoDescripcion?: string;
  esquemaTurnoHoraInicio?: string;
  esquemaTurnoHoraFin?: string;
  esquemaTurnoDuracion?: number;
  
  // Información del médico (del backend)
  medicoNombre?: string;
  medicoApellido?: string;
  especialidadNombre?: string;

  // Campos adicionales para formularios del frontend
  descripcionExcepcion?: string; // Para compatibilidad con formulario
  duracionMinutos?: number; // Para procedimientos de atención especial
  tipoProcedimiento?: string; // Para categorizar procedimientos especiales
  
  // Propiedades de compatibilidad (aliases para retrocompatibilidad con frontend)
  apertura?: string;   // Alias de horaInicio para mostrar en tabla
  cierre?: string;     // Alias de horaFin para mostrar en tabla
  centroId?: number;   // Alias de centroAtencionId
  centroNombre?: string; // Alias de centroAtencionNombre
  especialidad?: string; // Alias de especialidadNombre
}