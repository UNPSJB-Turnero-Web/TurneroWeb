import { CentroAtencion } from '../centrosAtencion/centroAtencion';

export interface Consultorio {
  id?: number;
  numero: number;
  nombre: string;
  especialidad?: string;
  medicoAsignado?: string;
  telefono?: string;
  centroId?: number; // ID del centro enviado por el backend
  nombreCentro?: string; // Nombre del centro enviado por el backend
  centroAtencion?: CentroAtencion; // Objeto completo del centro (opcional)
  
  // Nuevos campos para horarios de atención
  horaAperturaDefault?: string; // HH:mm
  horaCierreDefault?: string;   // HH:mm
  horariosSemanales?: HorarioConsultorio[];
}

export interface HorarioConsultorio {
  diaSemana: string; // LUNES, MARTES, etc.
  horaApertura?: string; // HH:mm
  horaCierre?: string;   // HH:mm
  activo: boolean; // Para días que no atiende
}