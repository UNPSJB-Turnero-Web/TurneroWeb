import { Especialidad } from '../especialidades/especialidad';
import { Medico } from '../medicos/medico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { StaffMedico } from '../staffMedicos/staffMedico';


export interface DisponibilidadMedico {
  id: number;
  staffMedicoId: number;
  especialidadId?: number; // Nueva propiedad para asociar la disponibilidad a una especialidad específica
  horarios: { dia: string; horaInicio: string; horaFin: string }[]; // Horarios específicos por día
  staffMedico?: StaffMedico; // Información del staff médico
  especialidad?: Especialidad; // Información de la especialidad asociada
}