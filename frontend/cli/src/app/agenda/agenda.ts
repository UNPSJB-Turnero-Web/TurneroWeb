export interface Agenda {
  id: number;
  especialidadId: number;
  especialidadNombre: string;
  diaInicio: string; // ISO yyyy-MM-dd
  diaFin: string;    // ISO yyyy-MM-dd
  dias: Dia[];
  feriados?: string[]; // Fechas ISO yyyy-MM-dd
  diasExcepcionales?: DiaExcepcional[];
}

export interface Dia {
  fecha: string; // ISO yyyy-MM-dd
  diaSemana: string;
  apertura: string; // HH:mm
  cierre: string;   // HH:mm
  inhabilitado: boolean;
  motivoInhabilitacion: string;
  slots: Slot[];
}

export interface Slot {
  id?: number;
  fecha?: string; // ISO yyyy-MM-dd
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
  fecha: string; // ISO yyyy-MM-dd
  descripcion: string;
  apertura: string; // HH:mm
  cierre: string;   // HH:mm
}