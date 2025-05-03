import { Paciente } from "../pacientes/paciente";
import { Performance } from "./performance";
import { CentroAtencion } from '../centrosAtencion/centroAtencion';

export interface Agenda {
    id: number;
    date: Date;
    paciente: Paciente;
    performances: Performance[];
    centroAtencion: CentroAtencion;
}