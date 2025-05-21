import { StaffMedico } from '../staffMedicos/staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { Consultorio } from '../consultorios/consultorio';

export interface EsquemaTurno {
    id: number;
    horaInicio: string; // "08:00"
    horaFin: string;    // "12:00"
    intervalo: number;  // minutos
    staffMedico: StaffMedico;
    diasSemana: string[]; // ["LUNES", "MIERCOLES"]
    disponibilidadMedicoId: number;
    centroAtencion?: CentroAtencion;
    consultorio: Consultorio;
}