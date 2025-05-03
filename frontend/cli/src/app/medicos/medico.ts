import { Especialidad } from '../especialidades/especialidad'; // Import Especialidad

export interface Medico {
    id: number;
    name: string; // Nombre
    apellido: string; // Apellido
    especialidad: Especialidad; // Relación con Especialidad
}