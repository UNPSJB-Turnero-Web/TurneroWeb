export interface StaffMedico {
  id: number;
  centroAtencionId?: number; // Agregado
  medicoId?: number;         // Agregado
  especialidadId?: number;
  centro?: {
    id: number;
    nombre: string;
    direccion?: string;
    localidad?: string;
    provincia?: string;
    telefono?: string;
    latitud?: number;
    longitud?: number;
  };
  medico?: {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    matricula: string;
    especialidades?: {
      id: number;
      nombre: string;
      descripcion?: string;
    }[];
    especialidad?: {
      id: number;
      nombre: string;
      descripcion?: string;
    };
  };
  especialidad?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  consultorio?: any;
  disponibilidad?: any[];
  porcentaje?: number;
}