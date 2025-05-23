import { Especialidad } from '../especialidades/especialidad';
import { Medico } from '../medicos/medico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { StaffMedico } from '../staffMedicos/staffMedico';


export interface DisponibilidadMedico {
  id: number;
  staffMedicoId: number;
  diaSemana: string[];
  horaInicio: string;
  horaFin: string;
  staffMedico?: any;

}