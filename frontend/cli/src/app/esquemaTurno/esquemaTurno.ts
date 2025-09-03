import { StaffMedico } from '../staffMedicos/staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { Consultorio } from '../consultorios/consultorio';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';

export interface EsquemaTurno {
  id: number;
  intervalo: number;
  disponibilidadMedicoId: number; // ID de la disponibilidad médica asociada
  staffMedicoId: number; // ID del staff médico
  centroId: number; // ID del centro de atención
  consultorioId?: number; // ID del consultorio (opcional)

  // Horarios del esquema de turno (definidos por el centro de atención)
  horarios: { dia: string; horaInicio: string; horaFin: string }[];

  // Horarios de disponibilidad del médico (definidos por el médico)
  horariosDisponibilidad?: { dia: string; horaInicio: string; horaFin: string }[];

  // Campos adicionales que vienen del backend
  nombreStaffMedico?: string; // Nombre completo del médico
  nombreCentro?: string; // Nombre del centro de atención
  nombreConsultorio?: string; // Nombre del consultorio

  // Relaciones opcionales
  disponibilidadMedico?: DisponibilidadMedico;
  staffMedico?: StaffMedico;
  centroAtencion?: CentroAtencion;
  consultorio?: Consultorio;
}