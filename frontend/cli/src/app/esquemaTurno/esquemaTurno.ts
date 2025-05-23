import { StaffMedico } from '../staffMedicos/staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { Consultorio } from '../consultorios/consultorio';
import { DisponibilidadMedico } from '../disponibilidadMedicos/disponibilidadMedico';

export interface EsquemaTurno {
  id: number;
  horaInicio: string;
  horaFin: string;
  intervalo: number;
  diasSemana: string[];
  disponibilidadMedicoId: number;
  staffMedicoId: number;
  centroAtencion?: any;
  consultorio?: any;
  // Agregamos opcionalmente los objetos completos:
  disponibilidadMedico?: DisponibilidadMedico;
  staffMedico?: StaffMedico;
}