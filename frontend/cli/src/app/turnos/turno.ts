import { Especialidad } from '../especialidades/especialidad';
import { Paciente } from '../pacientes/paciente';
import { Agenda } from '../agenda/agenda';

export interface Turno {
    id: number;
    code: string;
    name: string;
    especialidad: Especialidad;
    paciente: Paciente; // Relación con Paciente
    agenda: Agenda; // Relación con Agenda
    estado: string; // Ej: "pendiente", "confirmado", "cancelado"
}