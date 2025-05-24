import { CentroAtencion } from '../centrosAtencion/centroAtencion';

export interface Consultorio {
  id?: number;
  numero: number;
  nombre: string;
  especialidad?: string;
  medicoAsignado?: string;
  telefono?: string;
  centroId?: number; // ID del centro enviado por el backend
  nombreCentro?: string; // Nombre del centro enviado por el backend
  centroAtencion?: CentroAtencion; // Objeto completo del centro (opcional)
}