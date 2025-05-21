import { Especialidad } from '../especialidades/especialidad';
import { Medico } from '../medicos/medico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { StaffMedico } from '../staffMedicos/staffMedico';


export interface DisponibilidadMedico {
    id: number;
    staffMedico: StaffMedico;
    diaSemana: string;         // Ej: "LUNES"
    horaInicio: string;        // Ej: "08:00"
    horaFin: string;           // Ej: "12:00"
    
}