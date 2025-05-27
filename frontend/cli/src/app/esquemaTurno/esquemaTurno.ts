import { StaffMedico } from '../staffMedicos/staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { Consultorio } from '../consultorios/consultorio';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';

export interface EsquemaTurno {
  id: number;
  intervalo: number;
  disponibilidadMedicoId: number;
  staffMedicoId: number;
  centroId: number;
  consultorioId?: number;
  consultorioNombre?: string;
  diasSemana?: string[]; // Opcional si se usa en otro contexto
  horarios: { dia: string; horaInicio: string; horaFin: string }[]; // Horarios específicos por día
  // Agregamos opcionalmente los objetos completos:
  disponibilidadMedico?: DisponibilidadMedico;
  staffMedico?: StaffMedico;
  centroAtencion?: CentroAtencion;
  consultorio?: Consultorio;
}