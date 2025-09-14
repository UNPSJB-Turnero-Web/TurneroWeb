import { Especialidad } from '../especialidades/especialidad'; // Import Especialidad

export interface Medico {
  id: number; 
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  matricula: string;
  especialidades: Especialidad[]; // Cambiado de especialidad singular a especialidades plural
  
  // Mantenemos especialidad para compatibilidad hacia atrás (deprecated)
  especialidad?: Especialidad; 
}