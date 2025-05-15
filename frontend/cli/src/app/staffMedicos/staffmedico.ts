import { Especialidad } from '../especialidades/especialidad';
import { Medico } from '../medicos/medico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';

export interface StaffMedico {
    id: number;
    centro: CentroAtencion;
    medico: Medico;
    especialidad: Especialidad;
}