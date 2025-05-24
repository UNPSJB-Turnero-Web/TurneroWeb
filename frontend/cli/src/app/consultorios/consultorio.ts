import { CentroAtencion } from '../centrosAtencion/centroAtencion';

export interface Consultorio {
    id?: number;
    numero: number;
    nombre: string;
    especialidad?: string;
    medicoAsignado?: string;
    telefono?: string;
    centroAtencion: CentroAtencion; // Relación con Centro de Atención
}