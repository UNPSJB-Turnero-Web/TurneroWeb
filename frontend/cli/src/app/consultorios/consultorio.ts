import { CentroAtencion } from '../centrosAtencion/centroAtencion';

export interface Consultorio {
    id: number;
    numero: number;
    nombre: string;
    centroAtencion: CentroAtencion; // Relación con Centro de Atención
}