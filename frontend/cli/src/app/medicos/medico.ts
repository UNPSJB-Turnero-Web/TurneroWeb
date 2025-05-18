import { Especialidad } from '../especialidades/especialidad'; // Import Especialidad

export interface Medico {
  id: number; 
  nombre: string;
  apellido: string;
  dni: string;
  matricula: string;
  especialidad: Especialidad;
}