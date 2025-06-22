export interface Agenda {
  id: number;
  titulo: string;
  especialidadId: number;
  especialidadNombre: string;
  diaInicio: string; // ISO dd-MM-yyyy
  diaFin: string;    // ISO dd-MM-yyyy
  dias: Dia[];
  feriados?: string[]; // Fechas ISO dd-MM-yyyy
  diasExcepcionales?: DiaExcepcional[];
}

export interface Dia {
  fecha: string; // ISO dd-MM-yyyy
  diaSemana: string;
  apertura: string; // HH:mm
  cierre: string;   // HH:mm
  inhabilitado: boolean;
  motivoInhabilitacion: string;
  slots: Slot[];
}

export interface Slot {
  id?: number;
  fecha?: string; // ISO dd-MM-yyyy
  diaSemana?: string;
  horaInicio: string; // HH:mm
  horaFin: string;    // HH:mm
  inhabilitado?: boolean;
  motivoInhabilitacion?: string;
  esUrgencia?: boolean;
  motivo?: string;
  centroAtencionId?: number;
  centroAtencionNombre?: string;
  consultorioId?: number;
  consultorioNombre?: string;
  staffMedicoId?: number;
  staffMedicoNombre?: string;
}

export interface DiaExcepcional {
  fecha: string; // ISO dd-MM-yyyy
  descripcion: string;
  apertura: string; // HH:mm
  cierre: string;   // HH:mm
}